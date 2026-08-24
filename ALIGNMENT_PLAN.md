# SchoolERP — End-to-End Type Safety & Frontend/Backend Alignment Plan

**Status:** Phase 0 decided (approved 2026-08-23). **Phases 1–11 complete** (2026-08-24) — see their
"— completed" sections below for what shipped and what was found along the way. Every backend
endpoint that's actually wired to a frontend page is now contract-backed, the frontend has real auth
guards/form kit/`<DataTable>`, every mock/sample array across the entire app (Admin, Teacher, and
Student portals) is gone, and every §3.3/§4 page has been redesigned onto the new kit, rewired to
real data, or newly built — the five highest-value Admin pages (Students, Teachers, Exams wizard,
Timetable builder, Finance), the five W-tier Admin pages (Classes, Subjects, Notices, Contact
messages, Dashboard), the brand-new `N` Admin detail routes (Student/Teacher/Class/Exam detail +
Settings), every Teacher/* and Student/* page (Phase 6), all 7 §2C/P2 analytics endpoints plus the 3
pages that consume them (Phases 7–8), 🔒P1 pagination/search/sort (Phase 9) on every list endpoint with
a real frontend consumer and a genuine scalability case, all of 🔒P3 (Phase 10) — exam/class/notice
edit, admin-triggered password reset, bulk CSV student import, the admin Student-attendance view, and
session promotion (which needed and got D5) — and now 🔒P4 (Phase 11): the Finance role built end to
end, plus a free-text expense-category feature (books, whiteboards, supplies, ...) neither Admin nor
Finance had before, wired into both portals' analytics. Every item from the original Part 0 diagnosis
and every backend proposal in Part 2 is now either shipped or a documented, deliberate exclusion —
there is no scoped-but-undone backend work left on this plan.
**Companion doc:** `PAGES_PLAN.md` (the page↔API map). This plan supersedes it where they disagree,
and Phase 1 regenerates `PAGES_PLAN.md` from the new contract layer.

**Ground rule you set:** the Prisma schema and the backend stay the source of truth. The frontend
bends to the backend, not the other way round. Backend changes are tagged 🔒 throughout; the ones
approved below are cleared to proceed, anything not listed still needs sign-off.

## Decisions (locked)

| Decision | Choice |
|---|---|
| Backend latitude | **All four tiers approved** — 2A bug fixes, 2B contract normalisation, 2C new endpoints, 2D schema changes |
| Type sharing | **`contracts/` workspace** — root `package.json` with npm workspaces, one Zod schema per operation used for server validation, client resolver, *and* response type |
| Date/month format | **ISO both ways** — `YYYY-MM-DD` / `YYYY-MM` on the wire; `DD-MM-YYYY` is display-only in the frontend |
| Rollout | **Foundations first, then role-by-role** — shared kit → Admin complete → Teacher → Student |

**Schema changes cleared under 2D:** D1 (`Teacher.subjectHandled` → `Subject` relation), D2
(`createdAt`/`updatedAt` on `Contact`/`Notice`/`Exam`), D3 (`Transaction.paidAt`), D4
(`AcademicCalendar` composite unique), D5 (`Student.status` + `Class.isArchived` — pushed in Phase 10
once the promotion flow needed it, see that section for the legacy-document caveats it turned up).
D6 is cosmetic and dropped. MongoDB has no `prisma migrate` step (schemaless, `db push` instead) — see
each phase's section for what actually got pushed/generated instead of a migration commit.

---

## Part 0 — Diagnosis: what is actually wrong

I read every backend route, controller, service and Zod schema, and every frontend page and service.
The problem is not "some pages are missing". There are five distinct failure classes, and they need
different fixes.

### 0.1 There is no shared contract — three copies of every type, none authoritative

| Layer | Where types live | Enforced? |
|---|---|---|
| DB | `backend/prisma/schema.prisma` | Yes (Prisma) |
| Backend request | `backend/src/modules/*/types/index.ts` (Zod) | Yes (`validateSchema`) |
| Backend **response** | *nowhere* — inline object literals in controllers | **No** |
| Frontend | `frontend/src/lib/types.ts` (hand-written interfaces) | **No** |

`frontend/src/lib/types.ts` is a hand-typed guess at what the backend returns. It has drifted, and
because it's hand-typed, TypeScript happily compiles code that reads fields the API never sends.
Symptoms visible right now:

- `Teacher` declares **both** `subjectHandled` and `subjectsHandled` — because nobody knew which one
  the API used. (Answer: the request schema uses `subjectsHandled`, the DB column and every response
  use `subjectHandled`.)
- Almost every interface has `id?: string; _id?: string;` — hedging against not knowing the shape.
- `AdminDashboardData` / `StudentDashboardData` / `TeacherDashboardData` end in `[key: string]: unknown`,
  which switches off type checking for the entire dashboard.
- `CreateExamPayload` (frontend) is a **flat** `{ className, section, subjects[] }`. The backend
  `CreateExamSchema` wants a **nested** `{ exams: [{ className, section, subjects[] }] }` and does not
  accept `teacherId` per subject at all (it derives the teacher from the timetable). The admin Exams
  page therefore cannot successfully create an exam.
- `UpdateTimetableSlotPayload` sends `session`; `UpdateTimeTableSchema` doesn't accept it.

### 0.2 The response envelope is mismatched, and mutations return nothing

Backend `ApiResponse` (`core/responses/ApiResponse.ts`) serialises as:

```jsonc
{ "statusCode": 200, "data": {...}, "message": "ok", "success": true }
```

Frontend `ApiResponse<T>` (`lib/api.ts`) declares:

```ts
{ status: number; message: string; data: T }   // `status` never exists on the wire
```

Worse: `CreatedResponse` and `AcceptedResponse` hard-code `data: null`. So **every POST/PUT/DELETE in
the entire API returns no data**, while the frontend services all declare `Promise<ApiResponse<Student>>`
etc. React Query can never do an optimistic/returned-entity cache update — every mutation must blind-refetch.

### 0.3 Date and ID conventions are inconsistent *within the backend itself*

This is the single biggest source of "the input or get data is inconsistent".

| Direction | Format | Example |
|---|---|---|
| Request (all Zod `dateSchema`) | `DD-MM-YYYY` | `15-08-2026` |
| Response — admin exam list | `YYYY-MM-DD` (manually sliced) | `2026-08-15` |
| Response — everything else | raw `Date` → ISO datetime | `2026-08-15T00:00:00.000Z` |
| Request (month) | `MM-YYYY` | `08-2026` |
| Response (month) | ISO datetime | `2026-08-01T00:00:00.000Z` |

So the frontend has to parse three formats and send back a fourth. Same story for IDs: `studentId`
is sometimes the business key `STU00000001` and sometimes the Mongo `_id`, **within the same feature**
— `GET /teacher/result/:examId/:subjectId` returns `marks[].studentId` as a Mongo id, while
`POST /admin/finance/student-fee` requires `STU########`.

### 0.4 Real backend bugs that make working pages impossible

These are not style issues — the endpoint is broken today.

| # | File | Bug | Effect |
|---|---|---|---|
| B1 | `modules/teacher/controllers/transaction.controller.ts:9` | `teacherId: req.user?.id` — `req.user.id` is the **User** id, not the Teacher row id | Teacher salary page always returns `[]` |
| B2 | `modules/teacher/controllers/attendance.controller.ts:25` | same substitution | Teacher's own attendance always `[]` |
| B3 | `modules/teacher/controllers/result.controller.ts:103` | same substitution inside the `examSubject.update` where-clause | **Submitting marks always fails** |
| B4 | `modules/student/controllers/transaction.controller.ts:13,45` | `studentId: req.user?.id` | Student fees page always `[]` |
| B5 | `modules/teacher/controllers/result.controller.ts:116` | `examResult.createMany` passes `subjectId`, which is not a field on `ExamResult` | Prisma throws → wrapped as `DatabaseError` |
| B6 | `modules/teacher/routes/attendance.route.ts:16` | `'/class-attendance/classAttendanceId'` — missing `:` | Update-class-attendance route is unreachable |
| B7 | `modules/teacher/routes/index.ts` | `academicRouter` is never mounted (the controllers exist) | Teachers have **no timetable and no calendar** |
| B8 | `modules/admin/services/timetable.service.ts:38` | `class.findFirst({ className, section })` with no `session` | Timetable edits land on an arbitrary session's class |
| B9 | `shared/helpers/storeExamData.ts:26` | auto-creates a missing class with hard-coded `session: '2025-2026'` | Silent bad data from 2026-04 onward |
| B10 | `modules/user/routes/index.ts:9` | `userRouter.use(verifyJWT)` sits in front of `POST /user/refresh` | Refresh requires a valid access token — i.e. it can never refresh an expired one. (`/auth/refresh` is the unguarded twin; the frontend interceptor already uses that one, so `PAGES_PLAN.md` §5 is wrong.) |
| B11 | `modules/teacher/services/teacher.service.ts:138+` | `markStudentAttendance` writes the raw `"DD-MM-YYYY"` string into a `DateTime` column | Dead code today (the controller has its own copy), but it's a landmine |
| B12 | `modules/teacher/controllers/exam.controller.ts` `getExamSubject` | returns `subjects[].id` = **ExamSubject** id, but `/teacher/result/:examId/:subjectId` expects a **Subject** id | Teacher can't navigate from exam → marks entry |

### 0.5 Authorization holes

| # | Where | Hole |
|---|---|---|
| A1 | `frontend/src/components/layout/route-wrappers.tsx` | **No auth check at all.** `AdminRouteWrapper` just renders `<AppLayout role="admin">`. Anyone can open `/admin/students`. There is no auth store, no `localStorage` user, nothing — `zustand` is in `package.json` and unused. |
| A2 | `modules/teacher/controllers/attendance.controller.ts` `getClassAttendance` | Returns **every class's** attendance, not the requesting teacher's |
| A3 | `createClassAttendance` | Never checks the teacher actually teaches that class |
| A4 | `updateClassAttendance` / `updateResult` | Update by row id with no ownership check |
| A5 | `modules/teacher/controllers/exam.controller.ts` `getExam` | Returns all exams for all classes |

### 0.6 The frontend is a mock-data prototype, not a client

| Symptom | Count |
|---|---|
| Pages that fall back to hard-coded sample data when the API returns empty | **15 of 30** |
| Pages using `react-hook-form` | **0** |
| Pages using a Zod resolver | **0** (`zod` isn't even a frontend dependency) |
| Pages using the shadcn `<Select>` | **0** |
| Pages using a raw `<select>` | 4 |
| Pages with client-side validation of any kind | 0 |

`Students.tsx` is representative: 5 fake students, form state in one `useState<StudentPayload>` blob,
`className`/`section`/`session`/`dob`/`dateOfAdmission` all free-text `<Input>` with placeholder
defaults like `'10'`, `'A'`, `'2025-2026'`, `'01-01-2010'`. A typo in `session` produces a 400 the user
can't interpret. There is no edit flow at all despite `PUT /admin/student/:studentId` existing.

The mock fallbacks are the reason the app *looks* finished: when a request 401s or the shape mismatches,
the page silently renders fake rows instead of an error.

### 0.7 Missing pages / flows

**Missing entirely:** every Analytics page (0 exist, and 0 backend endpoints exist to feed them);
Admin Student/Teacher detail routes (detail is a `<Sheet>` with no URL); Admin Exam detail + per-subject
marking status; a real Timetable **grid builder** (current Academic page can't address a cell);
Class roster page; Teacher "My Classes"; Teacher Timetable (blocked by B7); Student Result detail page;
Admin Users/accounts view.

**Missing backend capability the ERP model needs** (see Part 2D): no pagination/search/sort on any list
endpoint; no session promotion / roll-over flow; no bulk student import; no attendance for a date range;
no `Finance` role module despite the enum; no exam update (create + delete only); no class update.

---

## Part 1 — The fix: one contract layer, three consumers

Everything else in this plan hangs off this. **One Zod schema per API operation, defining both the
request and the response**, living in a package that backend and frontend both import.

```
SchoolERP/
├── package.json                 ← NEW: npm workspaces root
├── contracts/                   ← NEW package: @schoolerp/contracts
│   ├── src/
│   │   ├── primitives.ts        ← ISODate, ISOMonth, Session, StudentId, TeacherId, ObjectId…
│   │   ├── enums.ts             ← mirrors prisma enums exactly, ONE definition
│   │   ├── envelope.ts          ← ApiSuccess<T> / ApiError, one definition
│   │   ├── admin/{student,teacher,class,subject,exam,notice,academic,attendance,finance,analytics}.ts
│   │   ├── student/*.ts
│   │   ├── teacher/*.ts
│   │   ├── auth.ts  user.ts
│   │   └── index.ts             ← exports `contracts` registry + all inferred types
├── backend/
└── frontend/
```

### 1.1 What a contract looks like

```ts
// contracts/src/admin/student.ts
export const AdminStudentListItem = z.object({
  id: ObjectId,
  studentId: StudentId,              // "STU00000001"
  firstName: z.string(),
  lastName: z.string().nullable(),
  className: ClassName,
  section: Section,
  session: Session,
  rollNo: z.number().int(),
  phone: Phone,
  dateOfAdmission: ISODate,          // "2026-04-01" — ONE format, always
  username: z.string(),
  profilePhoto: z.string().url(),
});

export const adminStudentContract = {
  list:   { method: 'GET',    path: '/admin/student',             query: AdminStudentListQuery, response: Paginated(AdminStudentListItem) },
  detail: { method: 'GET',    path: '/admin/student/:studentId',  params: z.object({ studentId: StudentId }), response: AdminStudentDetail },
  create: { method: 'POST',   path: '/admin/student',             body: CreateStudentBody,      response: AdminStudentDetail },
  update: { method: 'PUT',    path: '/admin/student/:studentId',  body: UpdateStudentBody,      response: AdminStudentDetail },
  remove: { method: 'DELETE', path: '/admin/student/:studentId',  response: z.object({ id: ObjectId }) },
} as const satisfies ContractGroup;
```

### 1.2 How each side consumes it

**Backend** — a thin `defineRoute` wrapper replaces the current hand-rolled controller boilerplate:

```ts
// the response type is now CHECKED, which it is not today
export const getStudents = defineRoute(adminStudentContract.list, async ({ query }) => {
  const rows = await AdminStudentService.getStudents(query);
  return rows;                       // ← return type must satisfy the response schema or tsc fails
});
```

In dev/test the wrapper also **parses** the outgoing payload against the response schema and throws,
so a service that silently drifts from the contract fails loudly instead of shipping.

**Frontend, data layer** — one generated, fully typed client. No hand-written service methods:

```ts
export const useAdminStudents = (query: AdminStudentListQuery) =>
  useQuery({
    queryKey: qk.admin.students(query),
    queryFn: () => api(adminStudentContract.list, { query }),   // returns AdminStudentListItem[]
  });
```

**Frontend, forms** — the same schema is the resolver:

```ts
const form = useForm<CreateStudentBody>({
  resolver: zodResolver(CreateStudentBody),   // identical rules to the server, zero drift
  defaultValues: emptyStudent,
});
```

That is what "end-to-end type safety" means here: **change `schema.prisma` → regenerate → the contract
fails to compile → the backend service fails to compile → the frontend page fails to compile.** One
change, four compile errors, zero runtime surprises.

### 1.3 Deliberate non-goals

- **Not tRPC.** It would replace the REST surface, break the `test/` package and Swagger, and you said
  rely on the backend as-is. The contract layer gives ~90% of tRPC's safety on top of plain Express.
- **Not OpenAPI codegen.** Generating types *from* Swagger means Swagger becomes the source of truth,
  and the current `swagger/` folders are hand-written and already stale. Instead we invert it: Phase 1
  **generates** `/api/docs` from the contracts (`zod-to-openapi`), so Swagger can never be stale again.

---

## Part 2 — Backend proposals 🔒 (nothing here happens without your approval)

Grouped by blast radius. **2A is safe; 2B breaks the current wire format; 2C is additive; 2D touches Prisma.**

### 2A — Bug fixes, contract-preserving (recommend: yes, all of them)

Fixes B1–B12 and A2–A5 from Part 0. Zero API-shape change; these endpoints simply start working.

- **B1–B4 (`req.user.id` misuse):** add `resolveStudent(req)` / `resolveTeacher(req)` helpers in
  `core/middlewares` that look up the profile row once and hang it on `req.profile`, then replace all
  five call sites. This also fixes A2–A5 for free, because ownership checks become one-liners.
- **B5:** drop the stray `subjectId` from `examResult.createMany`.
- **B6:** `:classAttendanceId`.
- **B7:** mount `academicRouter` in `modules/teacher/routes/index.ts`.
- **B8/B9:** thread `session` through timetable + exam creation; default to `getCurrentSessionYear()`
  instead of the hard-coded `'2025-2026'`, and **never auto-create a class** — return 404 and let the
  admin create it explicitly.
- **B10:** move `refresh` (and `logout`) out from behind `verifyJWT` in `modules/user/routes/index.ts`.
- **B11:** delete the dead `TeacherService.markStudentAttendance` / `updateStudentAttendance` (the
  controller has its own working copies).
- **B12:** `getExamSubject` returns both `examSubjectId` and `subjectId`.
- Also: delete `core/response/` (the unused singular duplicate), and the dead
  `modules/{student,teacher}/routes/{student,teacher}.route.ts` profile routers.

**Cost:** ~1 day. **Risk:** low — the `test/` suite covers these paths and will confirm.

### 2B — Contract normalisation (recommend: yes — this is the actual answer to "inconsistent")

Breaking wire changes. They're what stop the drift from coming back.

| # | Change | Rationale |
|---|---|---|
| N1 | **All dates on the wire are ISO-8601 date-only `YYYY-MM-DD`; all months are `YYYY-MM`.** Both directions. Display formatting (`DD-MM-YYYY`) becomes purely a frontend concern. | Kills the 3-formats-out/1-format-in problem at the root. ISO sorts lexicographically, is unambiguous, and `<input type="date">` speaks it natively. |
| N2 | **Mutations return the affected resource.** `CreatedResponse(data)`, `AcceptedResponse(data)`, and `DELETE` returns `{ id }`. | React Query can update the cache directly; the UI stops flickering through a refetch. |
| N3 | **One envelope, everywhere:** `{ success, statusCode, message, data }`, with errors as `{ success:false, statusCode, message, code, issues? }` where `issues` is the flattened Zod error. | The frontend can map field errors straight back onto the form. Right now a 400 is an opaque string. |
| N4 | **Business keys on the wire, Mongo ids never.** `studentId` always means `STU########`, `teacherId` always `TCH########`, and entity refs are `id` only where a business key doesn't exist (Class, Exam, Notice…). | Removes the "which id is this?" guessing that forced `id?`/`_id?` into every frontend type. |
| N5 | **`Teacher.subjectsHandled` request field renamed to `subjectHandled`** to match the DB column and every response. | One name, not two. |
| N6 | List endpoints return `{ items, total, page, pageSize }` (see 2C-P1). | Uniform table wiring. |

If you'd rather not break the wire: N1 can be inverted (**everything** becomes `DD-MM-YYYY` on output
too). Less good — but consistency matters more than which format wins, and I'll take either.

### 2C — Additive: new endpoints (recommend: pagination + analytics; the rest is your call)

**P1 — Pagination/search/sort on every list.** `?page&pageSize&q&sortBy&sortDir` plus per-resource
filters (students: `className`, `section`, `session`; exams: `classId`, `isResultDecleared`; notices:
`targetRole`; …). Today `GET /admin/student` returns every student in the school in one array.

**P2 — Analytics endpoints.** Nothing exists today; every Analytics page below needs one of these.
All are read-only aggregates, no schema change:

| Endpoint | Feeds |
|---|---|
| `GET /admin/analytics/overview?session` | KPI strip, enrolment trend, gender/class distribution |
| `GET /admin/analytics/attendance?from&to&classId[]` | daily attendance %, per-class heatmap, chronic-absentee list |
| `GET /admin/analytics/academics?examId&classId[]` | grade distribution, subject-wise averages, pass %, top/bottom performers |
| `GET /admin/analytics/finance?session&from&to` | collected vs pending by month, category split, defaulter list, salary burn |
| `GET /admin/analytics/staff?month` | teacher attendance %, workload (periods/week), marking-completion % |
| `GET /teacher/analytics?classId&session` | own attendance, class attendance trend, per-subject class average, marking backlog |
| `GET /student/analytics?session` | attendance trend, marks-per-subject across exams, class-rank/percentile, fee history |

**P3 — Missing CRUD to close the ERP model** (each independently approvable):
`PUT /admin/exam/:examId` (edit an exam), `PUT /admin/class/:classId`,
`PUT /admin/notice/:noticeId`, `POST /admin/student/bulk` (CSV import),
`POST /admin/academic/promote` (session roll-over: promote a class's students into next session),
`GET /admin/attendance/student?from&to&classId` (admin view of student attendance — admins currently
can't see it at all), `POST /admin/student/:studentId/reset-password`.

**P4 — Finance role module.** The `Finance` enum member has no routes, so a Finance user can log in
and reach nothing. Either build `modules/finance` (a scoped subset of `/admin/finance` + analytics), or
drop the enum member. My recommendation: **build it** — it's ~60% reuse of the admin finance services.

### 2D — Prisma schema changes (recommend: only D1 and D2; the rest are optional)

You said the schema should stay as-is, so these are flagged separately and I'd default to **not**
doing them unless you say otherwise.

| # | Change | Why |
|---|---|---|
| D1 | `Teacher.subjectHandled String[]` → relation to `Subject` | It's free text today, so the "subjects handled" multi-select can't be validated against real subjects, and a typo silently creates a phantom subject. This is the single blocker for the multi-select UI you asked for. |
| D2 | Add `createdAt`/`updatedAt` to `Contact`, `Notice`, `Exam` | `ContactMessages.tsx` already displays `createdAt`; `Contact` has no such column, so it renders blank. |
| D3 | `Transaction.paidAt DateTime?` | Student/Teacher fee pages show "paidAt" but are given `createdAt` — the *creation* date, not the payment date. Currently a lie in the UI. |
| D4 | `AcademicCalendar.date @unique` → `@@unique([date, title])` | Today the school can have only **one** calendar entry per date, ever. |
| D5 | `Student.status` enum (`Active`/`TransferredOut`/`Graduated`) + `Class.isArchived` | Needed for session promotion (P3) — otherwise promoting means deleting. |
| D6 | `Exam.session` denormalised, or drop `Exam.dateTo` nullability | Minor consistency. |

---

## Part 3 — Frontend rebuild

Rebuilt page-by-page against the contracts. The house style below is **mandatory and opinionated** —
every page follows it, so the app stops feeling like 30 different prototypes.

### 3.1 Foundations (built once, before any page)

1. **`zod` added to frontend deps** (pinned to the backend's `zod@3` — a v3/v4 split would break shared schemas).
2. **Auth store** (`stores/auth.store.ts`, zustand + persist): `{ user, role, status }`, hydrated from
   `GET /user` on boot. Fixes A1.
3. **Real route guards**: `<RequireAuth role="Admin">` in the route wrappers — redirect to
   `/auth/login?next=…` when unauthenticated, to `/{role}/dashboard` on role mismatch.
4. **`lib/api/client.ts`**: contract-driven `api()` function; the 401-refresh interceptor kept but
   pointed at the correct route, plus a hard logout on refresh failure.
5. **Query-key factory** (`lib/query-keys.ts`) — no more stringly-typed `['adminStudents']`.
6. **Delete every mock/sample array** (15 files). Replaced by three explicit states, always: `<Skeleton>`
   while loading, `<Empty>` with a primary CTA when empty, `<ErrorState>` with a retry when failed.
7. **Shared form kit** (`components/form/`): `<FormField>`, `<TextField>`, `<NumberField>`,
   `<SelectField>`, `<MultiSelectField>`, `<ComboboxField>`, `<DateField>`, `<MonthField>`,
   `<SessionField>`, `<CurrencyField>` — all `react-hook-form`-controlled, all rendering server
   `issues[]` back onto the right field.
8. **Domain option hooks** (`hooks/options/`): `useClassOptions`, `useSectionOptions(className)`,
   `useSessionOptions`, `useSubjectOptions`, `useTeacherOptions`, `useStudentOptions(classId)` — cached
   via React Query, so every select everywhere is fed from live backend data.
9. **`<DataTable>`**: server-side pagination/sort/search, multi-select filter chips, column visibility,
   row selection + bulk actions, CSV export. Every list page uses it — no more bespoke `<Table>` per page.

### 3.2 The select-first input policy

You asked for selects and multi-selects wherever possible. This is the binding rule — **a free-text
input is only allowed for a field whose value set is genuinely unbounded** (names, addresses, remarks).

| Field | Control | Options source |
|---|---|---|
| `className` | Select | distinct from `GET /admin/class` |
| `section` | Select, **filtered by chosen `className`** | `GET /admin/class` |
| `session` | Select | generated `YYYY-YYYY`, current ±2, current preselected |
| `subjectCode` | Combobox (searchable) | `GET /admin/subject` |
| `subjectHandled` (teacher) | **Multi-select** w/ chips | `GET /admin/subject` — needs 🔒D1 to validate |
| `teacherId` | Combobox, shows `name · TCH…` | `GET /admin/teacher` |
| `studentId` | Combobox, scoped to selected class, shows `roll · name` | `GET /admin/student?classId` |
| `weekday` | ToggleGroup (MON–SAT) | enum |
| `period` | Select 1–8 | enum |
| `targetRole` | Select | enum |
| `category` (calendar) | Select w/ colour dot | enum |
| `category` (txn) | Select — Fee/Salary **disabled** with a tooltip pointing at the right tab | enum |
| `status` (txn) | Select w/ status badge | enum |
| `attendance status` | **ToggleGroup per row** (P/A/L) + "mark all present" header action | enum |
| `date` | `<DateField>` — Calendar popover, ISO in / `DD-MM-YYYY` displayed | — |
| `month` | `<MonthField>` — month grid picker | — |
| `feeType` | Combobox **with free-text create** (Tuition/Transport/Exam/Lab/Library seeded) | seeded list |
| `marksObtained` | NumberField clamped to `0…fullMarks`, with live grade preview | contract |
| `phone` / `aadhar` | masked text input | — |
| every list filter | **Multi-select** chips (class, section, status, category, role) | as above |

Two rules that follow from this: **selects cascade** (picking class 10 narrows sections to those that
exist, then narrows students to that roster), and **every list page's filters are multi-select**, not
single — filtering fees to "Pending *and* Failed" is a normal thing to want.

### 3.3 Page-by-page work

Legend: **N** = new page, **R** = rewrite, **W** = rewire to contract + form kit.

#### Admin (`/admin/*`)

| Page | | Work |
|---|---|---|
| Dashboard | W | Kill the `[key: string]: unknown` type; wire the 6 real widgets from `GET /admin/dashboard`; every KPI card links to its filtered list view |
| **Analytics** | **N** | New — see §4 |
| Students | R | `<DataTable>` + server pagination/search; multi-select class/section/session filters; create **and edit** via one Sheet form (edit is missing today); bulk select → bulk delete/export; row → detail route |
| Student detail | **N** | `/admin/students/:studentId` — profile, class history, attendance summary, exam results, fee ledger, account actions |
| Teachers | R | Same treatment; **`subjectHandled` becomes a multi-select** (the headline fix); salary shown as currency |
| Teacher detail | **N** | `/admin/teachers/:teacherId` — profile, timetable, attendance, exam-marking status, salary ledger |
| Classes | W | Create form → 3 selects; list shows live student count; delete blocked with a clear reason when the class has students |
| Class detail | **N** | `/admin/classes/:classId` — roster, timetable, attendance %, exam summary |
| Subjects | W | List + create/edit; the grouped `get-all-class-subject` view becomes a proper "assigned vs unassigned" two-panel layout |
| Exams | R | **The nested-payload fix.** Multi-step wizard: (1) title + date range, (2) add class groups via cascading selects, (3) per-group subject rows (subject combobox + date + full marks), (4) review. Matches `CreateExamSchema` exactly |
| Exam detail | **N** | `/admin/exams/:examId` — per-subject marking progress, teacher assigned, and the declare-result action gated on all-marked (with the reason shown when disabled) |
| Notices | W | Rich form; targetRole select; expiry; list filtered by role + active/expired |
| Academic | R | Split into two tabs. **Timetable becomes a real grid builder**: class selector → 6×8 grid, click a cell → subject + teacher comboboxes, with teacher double-booking detected client-side. Calendar tab → month view + list |
| Finance | R | Three tabs already correct in structure; rewrite forms (student combobox, month picker, dynamic fee-breakdown rows with a live total), multi-select status/category filters, status change as an inline select |
| Attendance | R | Teacher attendance: date picker → roster with per-row ToggleGroup + "all present"; switches between mark (POST) and edit (PUT) based on whether the day is already marked; monthly history per teacher |
| **Student attendance** | **N** | Needs 🔒P3 — admin currently has no view of student attendance at all |
| Contact messages | W | Inbox list/detail/delete; `createdAt` needs 🔒D2 |
| Settings/Profile | **N** | Change password, session switcher, theme |

#### Teacher (`/teacher/*`)

| Page | | Work |
|---|---|---|
| Dashboard | W | Wire the 6 real widgets; "pending result entries" deep-link into the marks page |
| **Analytics** | **N** | See §4 |
| **Timetable** | **N** | Blocked on 🔒B7 — weekly grid + today highlighted |
| Attendance | R | Two tabs: *My attendance* (month picker + calendar heatmap) and *Class attendance* (class select → date → roster ToggleGroup, mark/edit) |
| **My Classes** | **N** | Classes derived from the teacher's timetable, each linking to roster + attendance + marks |
| Exams | W | List scoped to the teacher's subjects; per-exam subject list with `isMarked` badges |
| Results | R | Roster marks-entry grid, keyboard-navigable, clamped to `fullMarks`, live grade + class-average preview, save-all with dirty tracking; correctly uses `subjectId` (🔒B12) |
| Notices | W | List + detail |
| Salary | W | Blocked on 🔒B1 — monthly ledger + YTD summary |
| Profile | W | Read-only profile + change password |

#### Student (`/student/*`)

| Page | | Work |
|---|---|---|
| Dashboard | W | Wire the 5 real widgets |
| **Analytics** | **N** | See §4 |
| Attendance | W | Month picker + calendar heatmap + streaks; month is currently a required query param the page doesn't always send |
| Subjects | W | Subject cards with teacher + weekly period count |
| Exams | W | Upcoming vs past; per-exam schedule; result CTA appears only when `isResultDecleared` |
| **Result detail** | **N** | `/student/exams/:examId/result` — marksheet, per-subject grades, total/percentage, printable |
| Academic | W | Timetable grid + calendar |
| Fees | W | Blocked on 🔒B4 — session filter, fee list, breakdown detail, paid/pending summary |
| Profile | W | Profile + change password |

---

## Part 4 — Analytics pages

One Analytics page per role, each backed by a single aggregate endpoint from 🔒P2. Every chart is
filter-driven (multi-select class/section/subject/status + a date-range or session picker) and every
chart drills through to the underlying filtered list.

**Admin → `/admin/analytics`**, tabbed:

| Tab | Charts |
|---|---|
| Overview | KPI strip (students, teachers, classes, subjects, collection %, attendance %); enrolment trend by session (line); students per class (stacked bar by section); admissions per month (bar) |
| Attendance | School-wide daily attendance % (line, date range); per-class attendance heatmap (weekday × class); present/absent/leave split (donut); chronic-absentee table (<75%) |
| Academics | Grade distribution per exam (stacked bar); subject-wise class average (grouped bar); pass/fail % (donut); top & bottom 10 performers; exam-marking completion (progress) |
| Finance | Collected vs pending per month (grouped bar); category split (donut); cumulative collection (area); defaulters table; salary burn vs fee collection (dual line) |
| Staff | Teacher attendance % leaderboard (bar); workload — periods/week per teacher (bar); marking-completion % (progress list); subject coverage gaps |

**Teacher → `/teacher/analytics`**: own attendance trend; class attendance trend per class taught;
per-subject class average across exams (line); grade distribution for the last exam (bar); marking
backlog (progress); students needing attention (low attendance ∩ low marks).

**Student → `/student/analytics`**: attendance trend by month (line + target band at 75%); marks per
subject across exams (multi-line); latest-exam subject breakdown (radar); grade history; percentile /
class rank trend; fee payment history (bar, paid vs pending).

**Implementation note:** `recharts` is already a dependency. Charts get built against one shared theme
token set + one accessible categorical palette, defined once, so every chart in the app reads as one
system rather than 20 individually-styled graphs.

---

## Part 5 — Sequencing

Each phase ends green (`typecheck` + `lint` + the `test/` integration suite) and is independently useful.

| Phase | Scope | Depends on | Est. |
|---|---|---|---|
| **0** | **Your decisions** on 2A / 2B / 2C / 2D + the contract approach | — | you |
| **1** | Workspaces root + `contracts/` package; primitives, enums, envelope; contracts for auth + user + admin.student/teacher/class/subject as the pilot; `defineRoute` + typed client; regenerate `PAGES_PLAN.md` and `/api/docs` from contracts | 0 | 2–3 d |
| **2** | 🔒2A bug fixes + auth/ownership hardening; `test/` suite extended to cover B1–B12 | 0, 1 | 1–2 d |
| **3** | 🔒2B contract normalisation across all backend modules; contracts filled in for every remaining endpoint | 2 | 2–3 d |
| **4** | Frontend foundations §3.1 — auth store, guards, typed client, form kit, option hooks, `<DataTable>`, **delete all mock data** | 3 | 2–3 d |
| **5** | Admin pages §3.3 (highest value: Students, Teachers, Exams wizard, Timetable builder, Finance) | 4 | 4–5 d |
| **6** | Teacher + Student pages §3.3 | 4 | 3–4 d |
| **7** | 🔒P1 pagination end-to-end + `<DataTable>` server mode | 3, 5 | 1–2 d |
| **8** | 🔒P2 analytics endpoints + the three Analytics pages §4 | 3 | 3–4 d |
| **9** | 🔒P3/P4/2D extras — promotion flow, bulk import, Finance role module — *only the ones you approve* | 8 | scoped later |

**Phase 1 + 2 alone** would already make the teacher salary, teacher attendance, student fees, and
marks-submission features work for the first time. If you want the fastest path to "it works", stop
after Phase 4 and evaluate.

---

## Phase 1 — completed (2026-08-23)

**Shipped:**
- Root `package.json` (npm workspaces: `backend`, `frontend`, `contracts`) — `npm install` at repo root
  links `@schoolerp/contracts` into both. Old per-workspace `backend/package-lock.json` /
  `frontend/package-lock.json` removed (superseded by the one root lockfile).
- `contracts/` package: `primitives.ts` (ISO date/month + business-key/id/phone/aadhar schemas),
  `enums.ts` (mirrors every Prisma enum once), `envelope.ts` (`RouteDef`, `defineContract`, the
  `Infer*<R>` helpers), and full request+response contracts for `auth` (login, contact),
  `user` (profile, changePassword, logout, refresh), and `admin.{class,subject,student,teacher}`
  (list/detail/create/update/remove). Builds to `dist/` via `tsc`; `npm run dev -w contracts` watches.
- Backend: `core/http/defineRoute.ts` (validates params/query/body against a contract, then the
  handler's return value against the contract's response schema before sending — a response that
  drifts from its contract now 500s and logs the full Zod issue list instead of shipping silently).
  All ten pilot controllers (class/subject/student/teacher × their operations, login, contact,
  profile, changePassword, logout, refresh) rewritten onto it. `ApiError`/`errorHandlerMiddleware`
  extended with `code` and flattened `issues` — additive, every non-migrated route gets this for
  free. `CreatedResponse`/`AcceptedResponse` can now carry a body (still default to `null`, so no
  non-migrated call site changed behavior).
- Frontend: `lib/api/typed-client.ts` (`api(route, opts)`), `lib/date.ts` (ISO ↔ `DD-MM-YYYY`
  display-only conversion), `zod` added as a direct dependency. `admin.service.ts` and
  `auth.service.ts`'s pilot methods rewired onto the typed client; `Students.tsx`, `Teachers.tsx`,
  `Classes.tsx`, `Subjects.tsx`, `LoginPage.tsx`, `ChangePasswordPage.tsx` updated to match (kept
  their existing UI/mock-fallback behavior — that redesign is Phase 4/5, this phase only had to keep
  them compiling and functionally correct against the new contract shapes).
- Pulled forward from Phase 2 since the same files were already being rewritten: **B10** (`/user/refresh`
  and `/user/logout` no longer sit behind `verifyJWT` — a refresh call needs to work precisely when the
  access token has already expired, which is the one case the old ordering broke).
- Incidental fixes found while rewriting the pilot services: `updateSubject` no longer regenerates
  `subjectCode` from the new `subjectName` (silently orphaning the code every caller keyed off of);
  `getStudentById` used to select `username` inconsistently with the list endpoint; `POST /auth/login`
  never actually sent the `user` field its own response type promised.
- `backend/eslint.config.ts` → `eslint.config.mjs` (needed `jiti` to load as `.ts`, which broke once
  `eslint` got hoisted to the workspace root and could no longer reach the copy of `jiti` nested in
  `backend/node_modules`; the file had no TS-specific syntax, so `.mjs` was a like-for-like rename).
  `contracts/eslint.config.js` → `.mjs` for the same class of issue (a Node ESM-detection warning, not
  a hard failure, but the same fix). CLAUDE.md updated throughout for all of the above.

**Verified:** `npm run typecheck` (root, all three workspaces), `eslint .` and `prettier --check .` in
each of `contracts`/`backend`/`frontend` — all clean. Booted the real backend (`bun --watch
src/index.ts`) against the project's actual dev database and exercised it read-only: `/health-check`,
an unauthenticated `GET /admin/class` (401 in the new envelope), a malformed login body (400 with a
field-level `issues` entry), a login with an unknown user (404), and — using the project's seeded admin
credentials — a real login plus `GET /admin/subject` (200, correct shape). **Not run**: the `test/`
integration suite, and no create/update/delete was exercised against the live database — both would
write to the project's real (shared, Atlas-hosted, not a disposable local instance) dev data, which
wasn't asked for.

**Not done in this phase** (both explicitly deferred, not forgotten): regenerating `/api/docs` from
`contracts/` (the pilot's hand-written `swagger/admin.swagger.ts` entries are untouched and still
accurate for these routes, just not contract-generated); and updating `test/`'s pilot suites
(`admin-route/admin.test.ts`'s teacher/student/subject/class blocks, `authorization-route`) to the new
envelope/ISO-date/business-key-only shapes — those are live-HTTP tests with real assertions I can't
verify without running them against the shared dev database, so editing them without being able to
confirm they pass felt like manufacturing false confidence rather than progress. Both are reasonable
Phase 3 work, once the wire-format change is being made everywhere at once anyway.

**Found, not fixed (needs your call before anyone touches it, since fixing it means writing to the
live dev database):** `GET /admin/class`, `/admin/student`, and `/admin/teacher` currently 500 against
the project's actual seeded data. `prisma/seed.ts` creates records that never went through the API's own
validation (it calls Prisma directly) and so don't conform to rules that already existed before this
phase: `className: "Class 10"` (the schema caps `className` at 3 characters — always has), `studentId:
"S101"` / `teacherId: "T101"` (need to match `STU########` / `TCH########` — always did). The list
endpoints never validated their own output before Phase 1, so this mismatch was invisible; `defineRoute`
now catches it, correctly, as a contract violation. `GET /admin/subject` is unaffected and returns real
data correctly. Fix is straightforward — update `prisma/seed.ts` to emit conforming values — but applying
it means re-running `npm run seed`, which rewrites the shared dev database; not doing that without you
saying so.

## Phase 2 — completed (2026-08-23)

Every bug in Part 0.4/0.5's B1–B12 and A2–A5 tables fixed, except A5 (see below) — one bug list, worked
through in full, all in `backend/` (no contract/frontend changes this phase).

**Fixed:**
- **B1–B4** (`req.user.id` used where a Teacher/Student profile id was needed): `core/middlewares/
  auth.middleware.ts` gained `resolveTeacherId(req)` / `resolveStudentId(req)` — one lookup, one place —
  and all five call sites (teacher salary, teacher own attendance, submit-marks ownership check, student
  fee list, student fee detail) now use them instead of `req.user?.id`.
- **B5**: `examResult.createMany` no longer passes a stray `subjectId` (not a field on `ExamResult`) that
  made every marks submission throw and get swallowed as a generic 502.
- **B6**: `/class-attendance/classAttendanceId` → `/class-attendance/:classAttendanceId` — the route was
  unreachable for real ids.
- **B7**: `academicRouter` mounted under `/teacher/academic` — teachers had no way to reach their own
  timetable or the academic calendar despite the controllers existing.
- **B8/B9**: `AdminTimetableService.updateTimeTable` and `storeExamData` (exam creation) now look up the
  class scoped to `getCurrentSessionYear()` instead of an unscoped `findFirst`; `storeExamData` no longer
  auto-creates a missing class with a hard-coded `session: '2025-2026'` — it 404s with a message telling
  the admin to create the class first. `AdminExamService.createExam`'s catch block was rewritten to
  re-throw an `ApiError` as-is instead of flattening every failure into a generic `ValidationError`, so
  this 404 (and `storeExamData`'s other two specific errors — unknown subject code, subject with no
  teacher assigned) now reach the client with their real status and message.
- **B10**: done in Phase 1 (noted there; listed again here only for the record).
- **B11**: deleted `TeacherService.markStudentAttendance` / `updateStudentAttendance` — confirmed unused
  dead code whose date handling was actively wrong (wrote the raw `DD-MM-YYYY` request string into a
  `DateTime` column); the controller's working versions already cover this.
- **B12**: `GET /teacher/exam/:examId` now returns both `examSubjectId` (the `ExamSubject` row) and
  `subjectId` (the `Subject` row) per subject — only the former existed before, but
  `/teacher/result/:examId/:subjectId` needs the latter, so a teacher had no correct id to link the
  marks-entry page with.
- **A2**: `getClassAttendance` and `getClassAttendanceDetail` now scope to classes the requesting teacher
  actually teaches (via their `TimeTable` rows) instead of returning/allowing every class in the school.
- **A3**: `createClassAttendance` now 403s if the teacher doesn't teach the class being marked.
- **A4**: `updateClassAttendance` (via the now-working `:classAttendanceId` param) and `updateResult` both
  gained the same ownership check `createClassAttendance`/`createResult` already had (once B3 fixed what
  that check was actually comparing).

**Also removed** (the plan's 2A cleanup list, confirmed unreferenced anywhere before deleting): the dead
`core/response/` singular duplicate of `core/responses/`, its two dependents `core/middlewares/isAuth.ts`
and `verifyAdmin.ts` (also unreferenced, and only existed to support `core/response/`), and the dead
`modules/{student,teacher}/routes/{student,teacher}.route.ts` profile routers (their one route is already
registered directly in each module's `routes/index.ts`).

**Reconsidered, not fixed:** A5 (`GET /teacher/exam` returns every exam for every class, not just the
teacher's own). On reflection this isn't an authorization hole the way A2–A4 were — it's the school's exam
calendar, not per-student or per-class sensitive data, and showing staff the full exam schedule is
normal for a school system. Left as-is; flag if you disagree and want it scoped down.

**Verified:** `npm run typecheck`, `eslint .`, `prettier --check .` in `backend` — all clean (only the four
pre-existing `prisma/seed.ts` unused-var warnings, unrelated to this phase). Booted the real backend again
and re-ran the read-only smoke test from Phase 1, plus logged in as the seeded `teacher1`/`T101` and
`student1`/`S101` accounts and exercised, read-only: teacher's own attendance, teacher salary (B1 —
previously always `[]`, now returns the real seeded payment), teacher timetable and calendar (B7 —
previously 404, now both return real data), the exam list and an exam detail (confirming `subjectId` now
appears per B12), and the student's own fee list (B4 — previously always `[]`, now returns the real
seeded fee). No mutation was exercised against the live database (marking attendance, submitting marks,
editing a timetable slot) — those needed a create/update/delete on shared dev data, which wasn't asked
for; the fixes were verified by code review plus the read-side checks above instead.

## Phase 3 — completed (2026-08-23)

Every remaining backend module normalized onto contracts (2B), backend-first then frontend — the
scope grew from "the modules with pilot precedent" to genuinely every endpoint still in active use,
once it became clear how much of the frontend was still hand-typed against the old envelope.

**Backend — contracts added and wired for every remaining resource:**
admin `notice`, `academicCalendar`, `timetable`, `contact`, `teacherAttendance`, `finance`
(studentFee/teacherSalary/transaction), `exam`, and `dashboard`; the full `student` and `teacher`
contract groups (profile, dashboard, attendance — own and class, academic, exams, results, notices,
salary/fees). Every one of these controllers/services was rewritten the same way as the Phase 1
pilot: ISO dates in and out, mutations return the affected resource(s), business keys instead of
Mongo ids where one exists, response shape checked against the contract before it's sent.

**Notable fixes and normalizations along the way (not on the original bug list, found while
rewriting these specific endpoints):**
- `updateTimeTable` now looks up and returns the actual resulting slot instead of nothing.
- `storeExamData`'s three specific failure cases (missing class, unknown subject code, subject with
  no teacher assigned) now reach the client with their real status and message — `createExam`'s
  catch block used to flatten all of them into a generic 400.
- Teacher's own salary view (`GET /teacher/transaction`) renamed `amount`/`isPaid` to
  `finalAmount`/`status` — one vocabulary for "how much" and "what state" across every finance
  record in the app (admin's student-fee, teacher-salary, and general-ledger views already used
  this naming; only the teacher's own view didn't).
- Every `month` field was already being parsed with a helper built for the *old* `MM-YYYY` format;
  reusing it unchanged against the new `YYYY-MM` strings would have silently swapped month and year.
  Caught before it shipped — added `monthStartEndFromISO`/`fromISOMonth`/`toISOMonth` and re-pointed
  every call site (teacher's own attendance, class attendance, student attendance, admin teacher
  attendance-by-month) at the ISO-aware versions.
- `PAGES_PLAN.md` used to say omitting `subjectCode`/`teacherId` clears a timetable slot — checked
  against the schema and that was never true (both fields are non-nullable on `TimeTable`); the doc
  now says what actually happens (a no-op, or a 404 asking for both fields on a new slot).

**Dead code removed** (confirmed zero remaining references before deleting, in this order — each
removal made the next one dead): every module's old `types/index.ts` (admin, student, teacher),
`backend/src/types/`, `backend/src/shared/types.ts` (the entire old `DD-MM-YYYY` primitive layer),
and `getDateString.ts`. Two unrelated build-tool fixes surfaced along the way and got fixed in
place: `backend/eslint.config.ts` → `.mjs` (ESLint 9's TS-config loader needs `jiti`, which stopped
resolving once workspaces hoisted `eslint` to the root — same class of issue as Phase 1's
`contracts/eslint.config.js` fix, just discovered here), and `timeTableFormattedData`'s `weekday`
field was typed as a bare `string` instead of the `WeekDay` union, which only became a compile error
once a contract actually pinned the response shape down.

**Frontend — rewired to match, scoped to what was actually calling the API.** Before touching pages,
checked which ones were real: of the 15 Student/Teacher pages, only `Teacher/Attendance.tsx` and
`Teacher/Results.tsx` called a service at all — everything else under `Student/*` and most of
`Teacher/*` is pure static mock UI with no backend call to break, so they're untouched (wiring them
up for the first time is Phase 6, not this phase). Rewired: `admin.service.ts` (every remaining
method), `student.service.ts` and `teacher.service.ts` (full rewrites onto their contract groups),
`contact.service.ts`; pages `Admin/{Notices,ContactMessages,Dashboard,Exams,Finance,Academic}.tsx`,
`Contact/ContactPage.tsx`, `Teacher/{Attendance,Results}.tsx`.

**The Exams.tsx headline fix, actually fixed:** the create-exam form built a *flat* payload
(`{title, dateFrom, dateTo, className, section, session, subjects[]}`) against a backend that has
always wanted a *nested* one (`{title, dateFrom, dateTo, exams: [{className, section, subjects[]}]}`)
— this endpoint could never have succeeded from the UI. The form now builds the nested shape on
submit. It's still a single class-group, fixed-subjects form under the hood (a real multi-class,
multi-subject-row builder is Phase 5 UI work) — this phase fixed the wire shape, not the form's
functional scope.

**Other frontend findings fixed in place, not deferred, because they were directly in the files
already being rewritten:** the notice-create form was missing its required `date` field entirely
(pre-existing — submitting a notice always 400'd); the student fee-history query treated `year` as
optional client-side when the backend always required it; several cards displayed
`description`/`expiryDate`/`createdAt`/subject-breakdown fields that the list endpoints never
actually returned (always silently `undefined` before, now typed as absent — removed the dead
display rather than leave a lie in the type).

**Dead frontend code removed** (same confirm-zero-references-first approach): `frontend/src/lib/types.ts`
in its entirety (all 26 remaining exports had zero consumers once every service was migrated) and the
unused `ApiResponse<T>` interface in `lib/api.ts` (described the old, now-nonexistent envelope shape).

**Verified:** `npm run typecheck` and `eslint .` clean in all three workspaces; **full production
builds succeeded** for both `backend` (`prisma generate && tsc`) and `frontend` (`tsc -b && vite
build`) — not just typecheck, the actual build pipeline each one runs in CI/deploy. Re-ran the
Phase 1/2 live read-only smoke tests against the real dev database, plus every newly-migrated GET
endpoint reachable from a wired frontend page: admin notice/calendar/exam-list/finance-list/contact/
teacher-attendance-by-date, teacher notice/salary, student subject/notice/attendance. No mutation
was exercised against the shared database in this phase either.

## Phase 4 — completed (2026-08-23)

**Auth store + route guards (Part 0.5/A1, the security hole the old wrappers had):** new
`stores/auth.store.ts` (zustand + persist, `user`-only) hydrated once on boot from
`shared/common/provider/provider.tsx`. `components/layout/route-wrappers.tsx` rewritten —
`RequireRole({role, layoutRole})` backs `AdminRouteWrapper`/`TeacherRouteWrapper`/
`StudentRouteWrapper`, and a new `RequireAnyAuth` guards the shared `/auth/change-password` route.
These previously rendered their layout unconditionally with zero auth/role check. `LoginPage.tsx`
rewritten onto the store (`setUser`, `next`-aware redirect after login) and the "Instant Demo
Bypass" button removed — it was already broken (wrong hardcoded password) and would just have
bounced straight back to login once guards were real. `ChangePasswordPage.tsx` and
`app-layout.tsx`'s logout now both clear the store so a password change or logout actually ends the
session instead of leaving stale `user` state around.

**Typed-client scaffolding:** `lib/query-keys.ts` — a single `qk` factory (`auth`/`admin`/`student`/
`teacher` namespaces) replacing every inline stringly-typed `['adminStudents']`-style query key still
left over from Phase 3's page-by-page rewrites, so a mutation's `invalidateQueries` key can never
drift from the query's own key again.

**Form kit** (`components/form/`): `FieldShell` (wraps `Field`/`FieldLabel`/`FieldContent`/
`FieldDescription`/`FieldError`), `TextField`/`NumberField`/`DateField`/`MonthField`/`SelectField`
(the last built on `NativeSelect`, not the base-ui `Select` composition — plain `<select>` proved more
reliable here), `MultiSelectField` (Popover+Command checkable list with removable badge chips), and
`SessionField` (pre-bound to the session-option hook below). Paired with `hooks/options/
useAdminOptions.ts` — `useClassNameOptions`/`useSectionOptions`/`useSessionOptions`/
`useSubjectOptions`/`useTeacherOptions`/`useStudentOptions`, each backed by a real `useQuery` so every
`<select>` in the admin portal can be fed from what the backend actually has instead of a hand-typed
`<option>` list (Part 3.2's "select over free text"). This is the reusable kit Phase 5's page
redesigns build forms from — no page was switched onto it yet, that's Phase 5 scope.

**`<DataTable>`** (`components/data-table/`): search, sortable headers, column-visibility dropdown,
optional row-selection + bulk-actions bar, CSV export (`csv.ts`, client-side Blob download), loading
skeleton, empty state, pagination — the one table every list page should use instead of a bespoke
`<Table>` (Part 3.1), client-side pagination for now since the backend doesn't paginate yet (2C/P1
swaps this to server mode later, same props). Hit a real dependency-version trap along the way:
`npm install @tanstack/react-table` resolved to `^9.1.2`, which turned out to be a from-scratch API
redesign (`createCoreRowModel`, features-based generics) with no relation to the stable, universally-
documented v8 API (`useReactTable`, `getCoreRowModel`) — pinned to `^8.21.3` instead of chasing the
unfamiliar v9 surface. Not adopted into any page yet — that's Phase 5.

**Every mock/sample array deleted (11 files, not the originally-estimated 15 — four of that estimate
turned out to already be gone from earlier phases' rewrites)** and replaced with the three explicit
states everywhere: `<Skeleton>` while loading, `<Empty>` (with a primary CTA where one made sense)
when the real query returns nothing, and the new `ErrorState` (`components/data-table/ErrorState.tsx`)
with a retry when the query fails. Fixed: `Admin/{Classes,Subjects,Students,Teachers,Exams,Notices,
ContactMessages}.tsx` (straightforward — each already had a real query, just with an `apiX?.length ?
apiX : sampleX` fallback masking loading/error states behind fake rows) and `Admin/Finance.tsx` (same
pattern for both student-fees and teacher-salaries, plus the summary cards and the payment-receipt
modal were showing fabricated totals/breakdowns unrelated to the real records — now computed from the
actual list, and the receipt shows only the fields `StudentFeeRecord` actually has).

Two pages needed more than deletion because the mock wasn't standing in for a real query — it was the
only content on the page, for a feature that was never wired at all:
- **`Admin/Attendance.tsx`** was showing static class-wise *student* roll-call numbers — the wrong
  data model entirely per `PAGES_PLAN.md` §2.11 (this admin page is teacher attendance; student
  attendance is marked by teachers themselves). Rebuilt against `adminTeacherAttendanceContract`
  (`getTeacherAttendanceDate`/`markTeacherAttendance`, both already in `admin.service.ts`) — a real
  per-teacher Present/Absent roll call for a selected date, upserted on save.
- **`Admin/Academic.tsx`**'s calendar tab already queried real data; its timetable-matrix tab was 100%
  hardcoded with no query at all. Rebuilt against `adminTimetableContract.get` (`ClassSchedule[]`) —
  a real per-class-section weekly grid driven by whatever timetable data exists, class-section picker
  populated from the response instead of a fixed five-option list. Read-only; an interactive slot
  editor is Phase 5's "Timetable builder" line.
- **`Teacher/pages/Salary.tsx`** was pure static mock with an invented Basic/HRA/DA/deductions
  breakdown that doesn't exist anywhere in the data model. Rewired onto `teacherService.
  getSalaryTransactions()` (`MySalaryRecord[]`: `month`/`finalAmount`/`status`/`paidAt`) — this was
  the fourth page Phase 3 had already confirmed as wired-and-working (`/teacher/transaction` used to
  always return `[]`, fixed in Phase 2/B1); Phase 4 just removed the mock fallback UI sitting in
  front of it. The payslip modal now shows the real single amount instead of a fabricated allowance
  breakdown.

**One real (non-mock) bug fixed in passing:** `Admin/Finance.tsx`'s "Disburse" button for a pending
teacher salary was a toast-only no-op — it never called `adminService.updateTeacherSalaryStatus`,
which already existed. Wired it up; discovered while removing the fake success toast that was
sitting next to genuinely fabricated data.

**Verified:** `npx tsc -b --force` and `npx eslint .` clean (zero errors; one pre-existing advisory
warning on `<DataTable>`'s `useReactTable()` call, which the React Compiler correctly can't memoize
since the library's own return value isn't stable across renders — expected, not a bug) and a full
`npm run build` (`tsc -b && vite build`) succeeded. No backend changes this phase; no database writes.

**Still open for Phase 5+:** no page has adopted `<DataTable>` or the new form kit yet (Students,
Teachers, Exams wizard, Timetable builder, Finance redesigns are Phase 5); `Admin/Academic.tsx`'s
timetable tab is read-only until the builder lands; `Admin/Finance.tsx`'s "Collect" action on a
pending fee still reopens the create-fee dialog rather than a dedicated "mark paid" flow — unchanged
from before this phase, flagged here as a Phase 5 candidate.

**Found again, unchanged from Phase 1:** the same stale-seed-data 500s (`GET /admin/class`,
`/admin/student`, `/admin/teacher`, and now also `/admin/exam`, `/admin/academic/time-table`,
`/admin/finance/student-fee`, `/admin/finance/teacher-salary` — anywhere `className`,
`studentId`, or `teacherId` from the seeded data flows through a response contract). Same root
cause as before (`prisma/seed.ts` bypasses validation, always did), same fix (edit and re-run the
seed script), same reason it's not done without you saying so (re-seeding writes to the shared
Atlas database).

## Phase 5 — partially completed (2026-08-23)

The five pages §3.3 explicitly called "highest value" — Students, Teachers, Exams wizard, Timetable
builder, Finance — are redesigned onto the Phase 4 kit. The remaining Phase 5 scope (Classes,
Subjects, Notices, Contact messages, Dashboard, and every brand-new **N** detail page/route) is not
done yet; see "Still open" below. No backend changes this pass; no database writes.

**Students (`R`):** `<DataTable>` (search/sort/column-visibility/CSV export/pagination) replaces the
hand-rolled `<Table>`; row selection + a bulk-actions bar (Export Selected / Delete Selected, the
latter via `Promise.allSettled` so a partial failure doesn't hide the rest); three
`MultiSelectFilter` toolbar filters (class/section/session, options derived from the live list, not
guessed); and the missing **edit** capability — one `react-hook-form` + `zodResolver(CreateStudentBody)`
Sheet now serves both create and edit (`PUT /admin/student/:studentId` was already contract-backed
from Phase 1, just never wired to a UI). Cascading class→section selects via `useSectionOptions
(watchedClassName)`. The digital-ID-card detail Sheet is unchanged in spirit, gained an "Edit Record"
button. One real fix needed for the form kit to work here at all: several `CreateStudentBody` fields
are `Aadhar`-regex-validated-when-present (`studentAadhar`, `fatherAadhar`, …) — an empty string isn't
a valid "absent", only `undefined` is, so a `sanitize()` pass converts `''` → `undefined` for every
optional string field before submit (same pattern applied in Teachers).

**Teachers (`R`):** Same `<DataTable>` + edit-Sheet treatment. `subjectHandled` — the plan's headline
item ("becomes a multi-select") — hit a real blocker: `TeacherRecord.subjectHandled` is still a bare
`string[]` on the wire (2D/D1, "`Teacher.subjectHandled` → `Subject` relation", was approved at
Phase 0 but is a live-database schema migration with an unclear backfill story for existing
free-text values — out of scope to run silently mid-page-rewrite, flagged below for an explicit
go-ahead). Built `<TagsField>` (`components/form/TagsField.tsx`) instead — a real chip-based
multi-*value* editor (type, Enter/comma to commit, × or Backspace to remove) that's a genuine upgrade
over the old single comma-separated `<Input>`, without pretending the values are validated against
real `Subject` rows until D1 actually lands. Salary now renders as currency (`NumberField
currency`) in the create/edit form and `₹X,XXX` everywhere it's displayed (unchanged display-side,
now backed by a real form field instead of a raw number input). Added a proper profile detail Sheet
— `selectedTeacher` was previously set on "View Profile" click but never rendered anywhere, a dead
half-built feature; it now shows qualifications, subjects, salary, phone, join date, and bio.

**Exams wizard (`R`, "the headline fix"):** New `ExamWizardSheet.tsx` — 4-step wizard (Details → Class
Groups → Subjects → Review) replacing the old single-class-group Dialog, built with a top-level
`useFieldArray` for `exams[]` and a per-group nested `useFieldArray` (in a small `ExamGroupSubjects`
subcomponent, since nested field arrays need their own hook call) for each group's `subjects[]` —
matches `CreateExamBody`'s `{title, dateFrom, dateTo, exams: [{className, section, subjects[]}]}`
shape exactly, one `POST /admin/exam` creates every group in the wizard in one call. Cascading
class→section selects to add a group, with a client-side duplicate-group guard; per-step "Next" is
disabled until that step's minimum content exists (title ≥3 chars + both dates; ≥1 class group; every
group has ≥1 subject). Subject picker uses `<SelectField>` (native `<select>`) rather than the
`components/ui/combobox.tsx` primitive the plan's prose suggested — consistent with the codebase's
established preference for `NativeSelect` over the base-ui `Select`/`Combobox` composition
(Phase 4 CLAUDE.md note: "chosen over the more complex base-ui `Select` composition for reliability").

**Timetable builder (`R`):** `Admin/Academic.tsx`'s timetable tab, read-only since Phase 4, is now a
real builder. Grid is a fixed 8-period × 6-day matrix (matching `UpdateTimeTableBody`'s `period.max(8)`)
instead of only the periods a class happens to already have filled in, so empty periods are clickable
too. Clicking any cell opens a small editor Dialog (subject `<select>` + teacher `<select>`, both from
`useSubjectOptions`/`useTeacherOptions`) that calls `adminService.updateTimetableSlot` (`PUT
/admin/academic/time-table`, contract-backed since Phase 3, previously unused by any page). Client-side
double-booking detection per the plan's exact wording: before saving, scans every *other* class's
schedule at the same weekday+period for the selected teacher and shows an inline amber warning with
the conflicting class-section if found — not a hard block (the button relabels to "Save Anyway"),
since this is early detection, not a server-enforced constraint.

**Finance (`R`):** Both tabs' status columns are now an inline `<select>` (Paid/Pending/Failed)
wired to `updateStudentFeeStatus`/`updateTeacherSalaryStatus` — replacing the old "Collect Fee" button
that reopened the create-fee dialog with a pre-filled `studentId` (flagged as a bug in Phase 4's notes:
"still reopens the create-fee dialog rather than a dedicated 'mark paid' flow") and the "Disburse"
button (already fixed in Phase 4 to actually call the API, now folded into the same inline-select
pattern the plan asked for). Added a `MultiSelectFilter` status filter to both tabs. Rewrote "Collect
Student Fee" onto `react-hook-form` + `zodResolver(CreateStudentFeeBody)`: student picked via
`<SelectField>` from `useStudentOptions()` (a `<select>`, not the "combobox" the plan's prose
suggested — same NativeSelect-over-Combobox rationale as the exam wizard) instead of typing a raw
`studentId`; month via `<MonthField>`; and a `useFieldArray`-backed dynamic fee-breakdown row list
(add/remove rows, min 1) with a live total recomputed from `watch('feeBreakdown')` — replacing the
old fixed three-row Tuition/Exam/Lab form, which could never represent a fee with a different
breakdown shape.

**New shared pieces added along the way:** `components/data-table/MultiSelectFilter.tsx` (the
checkable Popover+Command filter, same visual language as `<MultiSelectField>` but bound to plain
`useState` for page-level toolbar filters rather than a form field) and `components/form/TagsField.tsx`
(described above under Teachers).

**Verified:** `npx tsc -b --force` and `npx eslint .` clean across the whole frontend (zero errors;
the same class of advisory-only "can't memoize this library's return value" warnings as Phase 4, now
also on every new page's `watch()`/`useForm()` call — expected, not a bug) and a full `npm run build`
succeeded.

### Phase 5 batch 2 — W-tier pages (2026-08-23)

The remaining W-tier pages from §3.3 are done: Classes, Subjects, Notices, Contact messages,
Dashboard. One backend change this batch (see below), asked-and-approved before making it, per the
standing instruction — everything else is frontend-only.

**Classes (`W`):** create form is now 3 real selects — Grade (1–12, since a brand-new class name
can't be picked from `useClassNameOptions()`, which only lists classes that already exist), Section
(A–F), and `<SessionField>` — replacing 3 free-text `<Input>`s. Cards show a real enrolled-student
count (cross-referenced from `adminService.getStudents()` against `className`+`section`, client-side
— there's no dedicated count endpoint) instead of the hardcoded "40 Enrolled" on every card. Delete
is blocked with the enrolled count shown inline when a class has students, rather than deleting (and
presumably 500ing or orphaning records) blind.

**Subjects (`W`):** new "Assigned by Class" tab alongside the existing list, built on
`adminSubjectContract.groupedByClass` (`GET /admin/subject/get-all-class-subject`, contract-backed
since Phase 1 but never called by any page) — a real two-panel layout, one panel listing each class's
assigned subjects as badges, the other listing subjects assigned to no class at all. Also removed a
fabricated "4.0 Credits" stat on every subject card that doesn't correspond to any field
`SubjectRecord` actually has (pre-existing, not caught by Phase 4's mock-array sweep since it wasn't
a `sample*` array — a hardcoded literal sitting inside otherwise-real card markup).

**Notices (`W`):** rewired onto `react-hook-form` + `zodResolver(CreateNoticeBody)` (dropped the
`useState` form object). Added the active/expired filter the plan asked for, plus an Active/Expired
badge on every card — both required a backend change, see below.

**Contact messages (`W`):** was list-plus-reply-modal only, with **no delete** despite
`adminService.deleteContactMessage` already existing and going unused. Rewired into a real inbox:
click a card to open a detail Sheet (full message + reply compose + delete), replacing the
reply-only modal. `createdAt` (🔒D2) is still not present — messages have no sort/timestamp field,
unchanged from Phase 4's note, still deferred.

**Dashboard (`W`):** the "kill the loosely-typed dashboard" item turned out to already be done —
`AdminDashboard` has been a fully-typed contract response since Phase 1, no `[key: string]: unknown`
anywhere in the current codebase. What *was* real: three of the dashboard's charts
(`attendanceTrendData`, `financialTrendData`, `classDistributionData`) were 100%-fabricated inline
arrays with no backing query, and the "Notice Bulletin" card's three items were hardcoded text, not
`recentNotices`. All of it deleted. Replaced with only what `GET /admin/dashboard` actually returns:
4 KPI count cards (students/teachers/classes/subjects, each linking to its list page, as the plan
asked), a real today's-teacher-attendance donut (present/absent/leave/unmarked — genuine single-point
data, not a fabricated weekly trend a trend-only endpoint doesn't exist for), a finance snapshot
(pending fees/salaries, real totals), a real upcoming-exams list, and the real `recentNotices` list.
No fake trend charts were reconstructed from nothing — the plan's "every KPI card links to its
filtered list view" was already true for the 4 original cards and now extends to all four widget
sections (attendance → `/admin/attendance`, finance → `/admin/finance`, exams → `/admin/exams`,
notices → `/admin/notices`). Caught a real Tailwind bug while rewriting the KPI cards: they'd been
using template-literal class names (`` `bg-${color}-500/10` ``) — Tailwind's JIT compiler can't see
those at build time, so every card's icon tile and CTA color would silently render unstyled in
production. Fixed with a static `KPI_STYLES` lookup object instead.

**One small backend change, asked and approved before making it:** `GET /admin/notice` (and the
identical `recentNotices` selects inside the admin/student/teacher dashboard endpoints) deliberately
omitted `expiryDate` from the list response — needed for the Notices page's active/expired filter.
Confirmed with you first since it's a backend change (`AskUserQuestion`, "Add expiryDate to the list"
chosen). Purely additive: `contracts/src/admin/notice.ts`'s `NoticeSummary` now picks `expiryDate`
too, and five Prisma `select`s (`admin/notice.service.ts`, `admin/dashboard.service.ts`,
`student/student.service.ts` ×2, `teacher/teacher.service.ts` ×2) widened to include the column,
which already existed on `Notice` — no schema migration, no data backfill, no live-database write.
Verified: `npm run build -w contracts`, backend `npx tsc --noEmit` and full `npm run build` (prisma
generate + tsc), both clean.

**Verified (batch 2):** `npx tsc -b --force` and `npx eslint .` clean across the frontend (zero
errors, same advisory-only warnings as before), full `npm run build` succeeded for both `frontend`
and `backend`.

### Phase 5 batch 3 — the brand-new `N` detail routes + Admin Settings (2026-08-24)

The last unbuilt slice of §3.3's Admin work: routes that don't rewrite an existing page but add a
genuinely new one, each cross-referencing data that was previously scattered across two or three list
pages rather than just re-showing what the list already had.

- **`/admin/students/:studentId`** (`StudentDetail.tsx`) — the digital-ID-card view relocated out of
  `Students.tsx`'s old quick-view `Sheet` (deleted, superseded by this route) plus a **fee payment
  history** table (`adminService.getStudentFees({ studentId })`, server-side filtered — the query
  param already existed on `StudentFeeListQuery`, just unused by any page). Edit/Delete act directly
  on the real record fetched via `adminStudentContract.detail` (`GET /admin/student/:studentId`,
  already existed, wasn't wired to a page). "Edit" navigates back to `/admin/students?edit=<id>`,
  which now auto-opens that student's edit sheet once the list loads.
- **`/admin/teachers/:teacherId`** (`TeacherDetail.tsx`) — same treatment, plus two data sections no
  page showed before: a **monthly attendance view** (`adminTeacherAttendanceContract.getByMonth`,
  existed, unused — a month picker feeding present/absent/leave counts and a per-day table) and a
  **salary disbursement history** (`adminTeacherSalaryContract.list` filtered by `teacherId`, same
  pattern as the fee history above).
- **`/admin/classes/:classId`** (`ClassDetail.tsx`) — combines three already-fetched lists that no
  page had put in one place: the class **roster** (students filtered client-side by
  className+section, row click jumps to that student's detail page), **assigned subjects**
  (`adminSubjectContract.groupedByClass`, the same endpoint `Subjects.tsx`'s "Assigned by Class" tab
  uses), and a **read-only weekly timetable** (`adminTimetableContract.get`, filtered to this
  section — editing still happens on `Academic.tsx`, linked from here). `Classes.tsx`'s cards are now
  clickable (with a dedicated "View" button) instead of only offering Remove.
- **`/admin/exams/:examId`** (`ExamDetail.tsx`) — needed one small 🔒 backend addition, confirmed via
  `AskUserQuestion` before building it ("Add the endpoint" chosen): `GET /admin/exam/:examId`,
  mirroring the Teacher module's existing `GET /teacher/exam/:examId` pattern exactly. New contract
  op `adminExamContract.detail` (`ExamDetail` = `ExamRecord` + `subjects[]`, each with
  `teacherId`/`teacherFullName` since — unlike the teacher-facing version — admin needs to see who's
  assigned, not just their own subjects), new `AdminExamService.getExamById` (same Prisma
  `examSubjects` include as the teacher service's `getExamSubject`), new controller + route. Purely
  additive/read-only: no schema change, no migration, no write path. The page shows per-subject
  marking status and lets admin publish/unpublish results and delete the exam from one place;
  `Exams.tsx`'s cards are now clickable through to it (buttons inside stop propagation so
  Publish/Delete still work from the list).
- **`/admin/settings`** (`Settings.tsx`, new) — Admin never had a profile/account page at all. Built
  on `GET /user` (`userContract.profile`, already existed, unused by any admin page) showing the
  real username/role, plus entry points to the already-existing change-password route and logout.
  Surfaced two places: a new "Account Settings" sidebar item, and the top-right user dropdown, which
  was showing **fabricated** `{role}@school.edu` / "{role} Account" text — replaced with the real
  `GET /user` result app-wide (same query now backs the sidebar footer's username too). Also added a
  role-aware "My Profile" dropdown item (`/admin/settings`, `/teacher/profile`, `/student/profile`)
  above "Change Password", where Teacher/Student portals already had a profile route to point to.

One shared frontend fix along the way: the deep-link edit pattern (`?edit=<id>` opening that record's
edit sheet on `Students.tsx`/`Teachers.tsx`) needed its `useEffect` to defer its `setState` calls into
a `queueMicrotask` — calling them synchronously in the effect body tripped the React Compiler lint's
`set-state-in-effect` rule (cascading-render risk). Caught by `eslint` treating it as an error on
`Teachers.tsx`; `Students.tsx`'s otherwise-identical effect didn't surface it only because that
component's Compiler analysis already bails out over its unrelated `watch()` call — fixed the same
way in both for consistency, not just where the lint happened to catch it.

**Backend change, asked and approved before making it:** see the Exam Detail bullet above —
`contracts/src/admin/exam.ts` (new `AdminExamSubject`/`ExamDetail` schemas + `detail` operation),
`backend/src/modules/admin/services/exam.service.ts` (`getExamById`), `controllers/exam.controller.ts`
(`getExamDetail`), `routes/exam.route.ts` (`GET /:examId`). No other backend changes this batch.

**Verified (batch 3):** `npm run build -w contracts`; backend `npx tsc --noEmit` and full
`npm run build` (prisma generate + tsc); frontend `npx tsc -b --force` and `npx eslint .` (zero
errors, same 4 pre-existing advisory-only `watch()`/`useReactTable()` warnings); frontend
`npm run build` (vite production build succeeded).

**Still open for the rest of Phase 5:**
- Admin Student-attendance view is still blocked on 🔒P3 (scope not yet chosen — see the deferred
  list below).
- **2D/D1 decision needed before `subjectHandled` can become a real multi-select:** `<TagsField>` is
  a solid interim (free-text chips, not "add a random string that silently becomes a phantom
  subject" via one long comma string), but turning it into a `<MultiSelectField>` validated against
  real `Subject` rows needs the `Teacher.subjectHandled` → `Subject` relation schema change — approved
  in principle at Phase 0, but a schema migration with an unclear backfill for existing free-text
  values against the live shared Atlas database is exactly the kind of mutating operation that needs
  its own explicit go-ahead, not just the general Phase 0 approval, before it's actually run.
- Contact messages' `createdAt` (🔒D2) still not exposed — no sort-by-recency on the inbox.
- Teacher + Student portal pages (§3.3, Phase 6 scope) are untouched.

## Phase 6 — in progress: Teacher portal complete (2026-08-23/24)

**Finding that kicked this phase off:** `CLAUDE.md` claimed `Teacher/Attendance.tsx` and
`Teacher/Results.tsx` were wired back in Phase 3. Both were actually 100% mock — hardcoded
8-row rosters, hardcoded exam/class/subject `<option>` lists, and a "Save" button that POSTed the
same fabricated roster regardless of what was selected. `Teacher/Dashboard.tsx` and
`Teacher/Exams.tsx` were the same (fabricated "Prof. Meenakshi Sundaram" identity, fabricated room
numbers and period times with no such fields in the data model). Only `Teacher/Salary.tsx` (Phase 4)
was genuinely wired. `CLAUDE.md` has been corrected — see its "Not every page..." bullet, which now
also warns against trusting a future "wired" claim in that file without checking the page itself.

**Every `Teacher/*` page is now wired to real data, no mock arrays left:**
- **Dashboard** (W) — `GET /teacher/dashboard` (already existed, unused): today's schedule, this
  month's attendance %, pending result-entry count, pending salary, recent notices. Dropped every
  fabricated field the mock had no backing for (room numbers, period clock-times — `TimeTable` only
  stores a period *number*, not a time range).
- **Attendance** (R) — two tabs, per §3.3's spec:
  - *My Attendance*: month picker + a real day-by-day calendar heatmap off `GET /teacher/attendance`
    (already existed, unused).
  - *Class Attendance*: class/section select (derived from the teacher's own timetable — only classes
    they actually teach), date picker, Present/Absent roster toggle, "Mark All Present". Switches
    between create (`POST`) and edit (`PUT`) automatically based on whether `classAttendanceList` has
    a record for that class+date already. **Needed one new backend endpoint, asked and approved
    first** — see below.
- **Timetable** (**N**, new page/route `/teacher/timetable`) — was blocked on 🔒B7 in the original
  plan, but B7 was already fixed back in Phase 2 (`academicRouter` mounted), so this was actually
  unblocked; nobody had built the page yet. Weekly grid (periods × weekdays, today's column
  highlighted) off `GET /teacher/academic/time-table` (already existed, unused). Folded **My Classes**
  (**N**) into this page rather than a separate near-empty route — a card per class-section the
  teacher teaches (derived from the same timetable data), each linking straight into a pre-filled
  Class Attendance (`?class=<key>`) or the Exams list.
- **Exams** (W) — real list off `GET /teacher/exam`, each card linking into Results with `?examId=`
  preselected. Found and fixed a real scoping bug along the way — see below.
- **Results** (R) — the marks-entry grid. Exam/subject selectors (URL-deep-linkable via
  `?examId=&subjectId=`, so Dashboard's "pending result entries" and Exams' cards can jump straight
  in), roster grid with Enter-to-next-row, marks clamped to `fullMarks`, live grade/class-average/
  passing-rate preview (mirrors `backend/src/shared/helpers/getGrade.ts`'s exact thresholds
  client-side for the preview only — the server recomputes the real grade on save). Automatically
  submits via `POST` the first time a subject is marked and `PUT` on every edit after, keyed off
  `ResultSheet.isMarked`.
- **Notices** (W) — real list + detail off `GET /teacher/notice` / `GET /teacher/notice/:noticeId`
  (already existed, unused), with the same active/expired badge pattern as Admin's Notices page.
- **Profile** (W) — real read-only profile off `GET /teacher` (already existed, unused: username,
  qualifications, subjects, salary, DOB, address, Aadhar), plus a link to the existing
  change-password route.
- **Salary** — already wired in Phase 4, untouched this phase.

**Backend change, asked and approved before making it:** marking a class's attendance for a day that
has no `ClassAttendance` record yet needs the class roster, but nothing returned one — the existing
`classAttendanceDetail` only works once a record already exists. Added
`GET /teacher/attendance/roster?className&section` (new contract op `teacherContract.classRoster`,
reusing the existing `ClassAttendanceStudentRow` schema with every student `'Unmarked'`), a new
`getClassRoster` controller with the same teach-this-class ownership check every sibling attendance
route already has, and the route. Purely additive/read-only — no schema change, no migration.

**Notable bugs fixed along the way (contract-preserving, same 2A-tier as Phase 2's B2/B3/A2/A3/A4 —
blanket-approved, not a fresh ask):**
- `GET /teacher/exam` (list) and `GET /teacher/exam/:examId` (detail) were completely unscoped —
  every teacher saw every exam in the school, including class-groups and subjects that weren't
  theirs, contradicting §3.3's own spec ("List scoped to the teacher's subjects"). Now: the list only
  returns exams with at least one subject assigned to the calling teacher, and the detail's
  `subjects[]` only includes that teacher's own subjects for that exam (not the whole class's).
- `GET /teacher/result/:examId/:subjectId` had no ownership check at all — any teacher could read
  another teacher's subject marks by guessing/enumerating ids. `PUT` already guarded this; `GET` now
  does too (`ForbiddenError` if the exam-subject isn't assigned to the calling teacher).

**Verified:** `npm run build -w contracts`; backend `npx tsc --noEmit` and full `npm run build`
(prisma generate + tsc); frontend `npx tsc -b --force` and `npx eslint .` (zero errors, same 4
pre-existing advisory-only warnings); frontend `npm run build` (vite production build succeeded).

### Phase 6 — Student portal complete (2026-08-24)

Same audit-and-rebuild pass as the Teacher portal: every `Student/*` page was still 100% mock (a
fabricated "Aryan Sharma" identity, invented room numbers and period times, subject-wise attendance
percentages that don't correspond to any real data — attendance is recorded per-day, not per-subject
period). Unlike the Teacher portal, no backend bugs were found here — every controller was already
correctly scoped via `resolveStudentId`/`userId`, so **this batch is frontend-only, no backend
changes**.

**Every `Student/*` page is now wired to real data:**
- **Dashboard** (W) — `GET /student/dashboard` (already existed, unused): this month's attendance %,
  upcoming exams, pending fees, recent notices.
- **Attendance** (W→ in practice a rewrite) — the mock's whole premise (subject-wise attendance
  breakdown) doesn't match the data model at all (attendance is per-day, not per-subject-period), so
  this became a month picker + calendar heatmap + a real "current streak" counter, off
  `GET /student/attendance` (already existed, unused) — same visual pattern as the Teacher portal's
  My Attendance tab.
- **Subjects** (W) — real subject list off `GET /student/subject/get-all-subject`, cross-referenced
  against the student's own timetable (`GET /student/academic/time-table`, both already existed,
  unused) to show each subject's actual teacher and weekly period count — the mock had invented
  "4.0 Credits" and syllabus topic lists with no backing field.
- **Exams** (W) — upcoming vs. past off `GET /student/exam`, each past+declared exam linking into the
  new Result Detail page.
- **Result detail** (**N**, new page/route `/student/exams/:examId/result`) — real per-subject
  marksheet off `GET /student/result/:examId` (already existed, unused), aggregate score/percentage
  computed from the real subject rows, genuinely functional `window.print()` button (replacing the
  mock's fake "Sending to printer..." toast).
- **Academic** (W) — same weekly-grid treatment as the Teacher portal's Timetable page (off
  `GET /student/academic/time-table`), plus a real Calendar tab off `GET /student/academic/calendar`
  (both already existed, unused).
- **Fees** (W) — was blocked on 🔒B4 in the original plan, but B4 was already fixed in Phase 2
  (`resolveStudentId`); nobody had built the real page yet. Session/year select, real pending/paid
  summary cards, and a receipt detail Sheet with the real `feeBreakdown[]` off
  `GET /student/transaction` / `GET /student/transaction/:feeId` (both already existed, unused).
- **Profile** (W) — real digital ID card + personal/guardian details off `GET /student` (already
  existed, unused), plus a link to the existing change-password route. Dropped the mock's fabricated
  blood-group field — there's no such column on `Student`.

**Verified:** frontend `npx tsc -b --force` and `npx eslint .` (zero errors, same 4 pre-existing
advisory-only warnings); frontend `npm run build` (vite production build succeeded). No backend or
contracts changes this batch, so no backend rebuild was needed.

**Phase 6 is now complete** — every Teacher and Student portal page calls real data. What's left of
the original §3.3 table is genuinely out of scope for Phase 6:
- **Analytics pages** (one per role, §4) need 🔒P2's aggregate endpoints, which don't exist yet — out
  of scope until that's built (Phase 8 per the original sequencing).
- The admin Student-attendance view (Phase 5, blocked on 🔒P3 scope) is still open.

## Phase 7 — Analytics backend: all 7 🔒P2 endpoints (2026-08-24)

You picked P2 (Analytics) as the next priority over P3 (CRUD gaps), P1 (pagination), and P4 (Finance
module) when asked. This batch is the backend half only — all 7 aggregate endpoints from §2C/P2,
contract-backed, read-only, no schema changes. The 3 frontend Analytics pages that consume them are
the next batch.

**One correction to the plan's own P2 table before building:** "gender/class distribution" for the
Overview KPI strip — `Student` has no `gender` column, so that's dropped; Overview does class
distribution only (`studentsByClass`).

- **`GET /admin/analytics/overview?session`** — KPI strip (student/teacher/class/subject counts,
  fee collection rate, this-month attendance rate), enrollment by session, students per class,
  admissions per month (from `Student.dateOfAdmission`).
- **`GET /admin/analytics/attendance?from&to&className&section`** — daily attendance %, a
  class × weekday heatmap, present/absent/leave split, and a chronic-absentee list (<75% in range).
  Filters by `className`/`section` rather than a `classId` query param, matching every other
  admin list-filter convention in the app (`StudentFeeListQuery` etc.) instead of introducing a new
  one.
- **`GET /admin/analytics/academics?examId`** — grade distribution, per-subject class average,
  pass rate, top/bottom 10 performers, marking-completion %, all computed from `ExamResult`/
  `ExamSubject` for one exam.
- **`GET /admin/analytics/finance?session`** — collected vs. pending per month, category split
  (`TxnCategory`), cumulative collection, a defaulters list, and salary-burn-vs-fee-collection —
  the Fee side scoped to the session's classes, the Salary side left unscoped (`Teacher` isn't
  session-versioned the way `Student`/`Class` are).
- **`GET /admin/analytics/staff?month`** — teacher attendance leaderboard, workload (periods/week
  from `TimeTable`), marking-completion % per teacher, and subject-coverage gaps (subjects with zero
  `TimeTable` entries anywhere).
- **`GET /teacher/analytics?session`** — own attendance trend, attendance trend per class taught,
  a per-subject-per-exam class-average series (feeds a multi-line chart), the most recent marked
  exam's grade distribution, and a marking-backlog count.
- **`GET /student/analytics`** — attendance trend, marks per subject across every *declared* exam
  (undeclared results are filtered out — they shouldn't leak into a student's own analytics before
  the admin publishes them), the latest declared exam's per-subject breakdown, a grade-history
  series, a class-rank trend (computed by summing `ExamResult` per classmate per exam and finding
  this student's position), and fee payment history. **No `session` query param** — a `Student` row
  is tied to exactly one current `Class` with no historical multi-session tracking (session
  promotion/D5 doesn't exist), so there's nothing meaningful to filter by; documented inline in the
  contract rather than accepting and silently ignoring the parameter.

All five Admin endpoints live in one new `AdminAnalyticsService` (`modules/admin/services/
analytics.service.ts`) + `analytics.controller.ts` + `analytics.route.ts`, mounted at
`/admin/analytics`. Teacher's and Student's each added one `getAnalytics` method to the existing
`TeacherService`/`StudentService` (matching how those two modules already keep one service file per
role rather than Admin's more split-out-by-resource layout) plus one new controller export and route
line each.

**Verified beyond the usual build/typecheck/lint:** ran the backend live (`bun --watch src/index.ts`)
against the real dev database and hit all 7 endpoints with real login tokens for admin/teacher1/
student1. `overview`, `finance`, `teacher/analytics`, and `student/analytics` returned genuinely
correct 200s with real computed numbers (e.g. student1's rank trend, grade history, and fee history
all matched the seeded data by hand-check). `attendance` and `staff` 500'd — confirmed via
`logs/error.log` as `ZodError`s from response validation, **not** a bug in the new query logic: both
return a `studentId`/`teacherId` field, and this specific database's seed data predates the
`STU########`/`TCH########` format (documented in `CLAUDE.md` since Phase 1 — this is the same
pre-existing issue that already 500s `GET /admin/student`, `/admin/teacher`, etc.). `academics`
wasn't live-tested — no valid `examId` was reachable without hitting that same pre-existing issue
elsewhere first — but it shares the identical pattern (a business-key field in the response) so it's
expected to behave the same way once `prisma/seed.ts` is eventually fixed and re-run. `CLAUDE.md`'s
list of affected endpoints has been updated accordingly.

**Still open for the rest of Phase 8 (renumbered from the original sequencing — this batch absorbed
what was going to be "Phase 8"):** the 3 frontend Analytics pages (`/admin/analytics` — 5 tabs,
`/teacher/analytics`, `/student/analytics`) that actually consume these 7 endpoints with `recharts`
charts. Nothing is wired to a page yet.

## Phase 8 — Analytics frontend: 3 pages, 7 endpoints wired (2026-08-24)

The other half of Phase 7 — every one of the 7 new analytics endpoints now has a real page.
`recharts` was already a dependency and `Admin/pages/Dashboard.tsx` already used it directly
(`ResponsiveContainer`/`Pie`/`Cell`/raw inline tooltip style, not the heavier shadcn `ChartContainer`
wrapper in `components/ui/chart.tsx`) — every new chart follows that same lighter pattern for
consistency. Per Part 4's "Implementation note," added one shared theme file, `lib/charts.ts`:
`CHART_COLORS` (the categorical palette), `chartTooltipStyle`, and consistent grade/attendance-status/
transaction-status color maps — every chart in this batch imports from there instead of picking its
own colors.

- **`/admin/analytics`** (5 tabs, one component file per tab — `AnalyticsOverviewTab.tsx` /
  `AnalyticsAttendanceTab.tsx` / `AnalyticsAcademicsTab.tsx` / `AnalyticsFinanceTab.tsx` /
  `AnalyticsStaffTab.tsx` — composed by `Analytics.tsx`, matching the existing flat `Admin/pages/`
  layout rather than introducing a subfolder):
  - **Overview**: session-scoped KPI strip (6 cards, each linking to its list page), enrollment-by-
    session bar, students-per-class stacked bar (stacked by section), admissions-per-month bar.
  - **Attendance**: date-range + class picker, daily attendance % line, a class × weekday heatmap
    (recharts has no native heatmap primitive, so this is a plain color-graded table — green→amber→
    red by `presentPct`, matching the calendar-heatmap color logic already used on the Teacher/
    Student attendance pages), a present/absent/leave donut, and a chronic-absentee table (each row
    linking to that student's detail page).
  - **Academics**: exam picker, grade-distribution bar (colored by the shared `GRADE_COLORS` map),
    subject-average bar, pass-rate donut, a marking-completion progress bar, and top/bottom-10
    performer tables (each row linking to the student detail page).
  - **Finance**: session picker, collected-vs-pending grouped bar, category-split donut, a cumulative-
    collection area chart, a defaulters table, and salary-burn-vs-fee-collection dual line.
  - **Staff**: month picker, an attendance leaderboard (horizontal bar), a workload bar (periods/week),
    a marking-completion progress list per teacher (each row linking to that teacher's detail page),
    and a subject-coverage-gaps badge list.
- **`/teacher/analytics`**: own-attendance line, a per-class-taught attendance multi-line (one series
  per class-section, pivoted client-side from the flat API rows), a per-subject class-average
  multi-line across exams, the last marked exam's grade-distribution bar, and a marking-backlog
  progress bar.
- **`/student/analytics`**: attendance trend line with a dashed reference line at the 75% minimum,
  marks-per-subject multi-line across exams, the latest declared exam's subject breakdown as a radar
  chart, a class-rank trend line (converted from raw rank to a percentile — `(classSize - rank + 1) /
  classSize`, so "higher is better" reads the same direction as every other chart on the page), and a
  paid-vs-pending fee-history grouped bar.

**Not built — flagged rather than faked:** the plan's Teacher Analytics bullet also lists "students
needing attention (low attendance ∩ low marks)." `TeacherAnalytics` doesn't carry per-student marks
alongside per-student attendance in a joinable shape, so building this would mean a backend contract
change, not just a frontend one — left out rather than approximating it with fabricated or
misleading data. Would need its own go-ahead if you want it.

Navigation: added an "Analytics" entry to the Overview section of all three sidebars
(`app-layout.tsx`), and `qk`/each `*.service.ts` got the corresponding query keys and one method per
new endpoint.

**Verified:** frontend `npx tsc -b --force` and `npx eslint .` — zero errors, same 4 pre-existing
advisory-only warnings (none new, despite five new chart-heavy pages). Full `npm run build` (vite
production build) succeeded, including the new `Radar`/`Area` chart types pulled in from `recharts`
for the first time. Not separately live-browser-tested (no headless browser in this environment) —
correctness leans on the same contract types the backend was already live-verified against in Phase 7,
plus every chart following the one already-proven pattern from `Admin/pages/Dashboard.tsx`.

**This closes out §4 (Analytics) and the original P2 backlog item you picked.** What's left across the
whole plan: the admin Student-attendance view (Phase 5, blocked on 🔒P3 — scope not yet chosen), and
P1/P3/P4 (pagination, CRUD gaps, Finance module) — all deferred in favor of P2 when asked, still open
whenever you want to pick one up.

## Phase 9 — Pagination (P1): Students and Teachers, `<DataTable>` server mode (2026-08-24)

You picked P1 next. The original plan's P1 line reads "pagination/search/sort on every list" —
that's ~10 list endpoints (Students, Teachers, Classes, Subjects, Exams, Notices, Contact,
StudentFee, TeacherSalary, Transaction). Doing all of them in one pass risked the same thing every
other phase avoided by batching: rushed, unverified work across too much surface area at once. This
batch builds the *pattern* once, end to end — contracts, backend, `<DataTable>`, and every affected
caller — and proves it out on the two highest-traffic lists (Students, Teachers). Rolling the same
pattern onto the remaining ~8 endpoints from here is mechanical, not open design work.

**Shared foundation (`contracts/src/primitives.ts`):**
- `PageQuery` — `{ page, pageSize, q, sortDir }`, all optional. `page`/`pageSize` use
  `z.coerce.number()` (query params arrive over HTTP as strings; every other primitive in this file
  validates a string as a string, this is the first one that parses into a different output type).
  Deliberately **not** `.default(...)` — Zod's `.default()` makes the *output* type non-optional, so
  `z.infer` (what `InferQuery<R>` uses for the frontend's param type) would force every caller to
  pass `page`/`pageSize` on every call. Each service applies `query.page ?? DEFAULT_PAGE` itself
  instead — the same pattern already used for every other optional query param in this codebase.
- `paginatedResponse(item)` — wraps `item` in `{ data, page, pageSize, total, totalPages }`. Every
  resource extends `PageQuery` with its own filters and a `sortBy: z.enum([...])` narrowed to that
  resource's actual sortable columns (not an open string — sorting by an arbitrary field isn't safe
  to expose without an index review per field).

**Students** (`StudentListQuery` extends `PageQuery` with `className`/`section`/`session` filters,
`sortBy: rollNo | firstName | dateOfAdmission | studentId`) **and Teachers** (`TeacherListQuery`,
`sortBy: firstName | dateOfJoining | salaryPerMonth | teacherId`): `GET /admin/student` and
`GET /admin/teacher` now both return the paginated envelope instead of the whole table. Backend
`where`/`orderBy`/`skip`/`take` + a parallel `count` in each service; `q` searches
firstName/lastName/id via Mongo's `contains`/`mode: 'insensitive'`.

**This is a breaking wire change to those two endpoints** — every consumer needed updating, not just
`Students.tsx`/`Teachers.tsx`:
- **`<DataTable>`** (`components/data-table/DataTable.tsx`) gained an optional `manual` prop
  (`ManualDataTableState`: pageIndex/pageSize/pageCount/totalRows + onPageChange, search +
  onSearchChange, sorting + onSortingChange). Omit it and a page behaves exactly as before
  (client-side search/sort/paginate the full array) — every other `<DataTable>` caller is
  unaffected. Pass it and the table hands control to the caller (`manualPagination`/`manualSorting`
  on the underlying `useReactTable`), which is what `Students.tsx`/`Teachers.tsx` now do. The
  empty-state check and the "N rows" footer label both switch on whether `manual` is set, since in
  manual mode an empty *current page* doesn't mean zero total rows (e.g. a stale page number after a
  filter change) the way it does in client mode.
- **`useStudentOptions`/`useTeacherOptions`** (`hooks/options/useAdminOptions.ts`) — every dropdown
  built on these (student/teacher pickers in Finance, the Exam wizard, etc.) needs the *whole* list,
  not one page. Both now request `pageSize: MAX_PAGE_SIZE` (100) and unwrap `.data`. Fine at this
  school's actual scale; revisit if either roster ever exceeds 100.
- **`Classes.tsx`** (cross-class student counts) and **`Admin/Attendance.tsx`** (teacher roll-call
  roster) needed the same `pageSize: MAX_PAGE_SIZE` treatment — both need every row across every
  class/every teacher, not a page of it.
- **`ClassDetail.tsx`**'s roster fetch got better, not just fixed — it used to pull every student in
  the school and filter to one class-section client-side; now it passes `className`/`section`
  straight through to the list endpoint's new server-side filter, only enabled once the class record
  itself has resolved.
- **The `?edit=<id>` deep-link** on both list pages (opens the edit sheet from the Detail page's
  "Edit Record" button) used to find the target record by searching the loaded list client-side —
  no longer reliable once that list is one page of results. Now fetches the target directly by id
  (`adminService.getStudentById`/`getTeacherById`) regardless of what page/filter the list is
  currently showing.
- **`qk.admin.students`/`qk.admin.teachers`** needed a real fix, not just a signature change: calling
  with no args now returns the bare `['admin', 'students']` prefix instead of
  `['admin', 'students', undefined]`. The trailing `undefined` would have made every
  `invalidateQueries({ queryKey: qk.admin.students() })` after a create/update/delete match *only*
  the exact no-args query — silently missing every paginated/filtered variant actually on screen.
  This was latent in the query-key factory the moment a resource got a real filter object; Students/
  Teachers are just the first two to hit it.
- New shared **`useDebouncedValue`** hook (`hooks/useDebouncedValue.ts`, 300ms) — the search box
  stays bound to the raw keystroke value for instant feedback; only the debounced value drives the
  query key/queryFn, so typing doesn't fire a request per keystroke.
- Sorting only applies to columns backed by a real, indexed field — `SORT_FIELD_BY_COLUMN_ID` maps
  each sortable column id to the backend's enum; composite/derived columns (the "Class & Sec" badge,
  phone, session, qualifications, subjects) get `enableSorting: false` rather than silently no-op
  sorting client-side against data the browser doesn't have (only the current page).
- The three class/section/session filters on Students went from `<MultiSelectFilter>` (multi-value)
  to plain single-value `<select>`s — the backend filter (and the plan's own P1 spec) is one value
  per field, not a set. A real UX narrowing versus the old client-side version, called out here
  rather than left implicit.

**Verified:** contracts + backend + frontend all typecheck clean; `eslint .` clean (same 4
pre-existing advisory warnings, no new ones); frontend production build succeeds. Backend live-tested
against the real dev database with real pagination/search/sort query strings — confirmed via
`logs/error.log` that the Prisma query layer (filters, `mode: 'insensitive'` search, `skip`/`take`,
`orderBy`, `count`) executes cleanly; the 500s that come back are the *exact same* pre-existing
stale-seed-ID issue already documented in `CLAUDE.md` (`GET /admin/student`/`GET /admin/teacher` were
already on that list before this phase touched them), confirmed by querying the database directly
(`studentId: "S101"`, not `STU########`) rather than assumed.

**Still open — the other ~8 list endpoints.** Classes, Subjects, Exams, Notices, Contact messages,
StudentFee, TeacherSalary, and Transaction all still return their whole table in one response. The
pattern above (contract: extend `PageQuery` + `paginatedResponse`; service: `where`/`orderBy`/
`skip`/`take` + `count`; page: `<DataTable manual={...}>` + a debounced search + a
`SORT_FIELD_BY_COLUMN_ID` map) is now proven twice over — the remaining rollout is mechanical.

### Phase 9 batch 2 — Exams, Notices, Contact messages, StudentFee, TeacherSalary (2026-08-24)

Paginated the backend for 5 more resources. **Classes and Subjects were deliberately left alone** —
both are bounded, slow-growing structural/config data (a school has dozens of class-sections and
subjects, not thousands, ever), not the kind of list "returns the whole table in one response" is
actually a scalability risk for. **Transaction (the general ledger) was also left alone** — no
frontend page calls `adminService.getTransactions` at all yet (confirmed by grep), so paginating its
backend now would be speculative work with zero current benefit.

**Backend, all 5 following the exact pattern from batch 1** (`PageQuery` extended with resource
filters + a narrowed `sortBy` enum, `paginatedResponse`, service `where`/`orderBy`/`skip`/`take` +
`count`): Exam, Notice, Contact, StudentFee, TeacherSalary. One correction caught before it became a
bug: `ExamListQuery.isResultDecleared` was first written as `z.coerce.boolean()` — `Boolean("false")`
evaluates to `true` in JS, so coercing a query string that way would make `?isResultDecleared=false`
filter for *declared* exams, backwards from what it says. Replaced with
`z.enum(['true','false']).transform(v => v === 'true')`, which parses the two literal strings a query
param can actually be instead of coercing.

**Frontend — two different treatments, not a blanket DataTable conversion:**
- **Finance.tsx** (StudentFee + TeacherSalary tabs) — converted to `<DataTable manual>`, the same
  real conversion Students/Teachers got in batch 1. This is the one remaining list with genuine
  unbounded-growth risk (fee/salary transactions accumulate monthly, indefinitely). Converting it
  surfaced a real design problem worth calling out: the 3 summary cards (fee realization, payroll
  disbursed, pending dues) used to sum the loaded array client-side — once that array is one page of
  10, summing it silently under-counts. Fixed by sourcing the summary strip from
  `GET /admin/analytics/finance` instead (already computes these exact totals correctly via real
  backend aggregation, from Phase 7) rather than trying to make a paginated list serve double duty as
  an aggregate. The status filter (`MultiSelectFilter`, multi-value) became a single-value `<select>`
  for the same reason as Students' class/section/session filters in batch 1 — the backend filter (and
  the plan's own P1 spec) takes one value per field.
- **Exams.tsx, Notices.tsx, ContactMessages.tsx** — card grids with client-side search, not
  `<DataTable>`. Rather than force pagination UI onto lists this small, each just requests
  `pageSize: MAX_PAGE_SIZE` (100) and keeps its existing card-grid UX exactly as it was — the backend
  is protected either way, and building pagination controls for a school's ~dozen exams or notices
  would be complexity with no user-facing benefit. `AnalyticsAcademicsTab.tsx`'s exam picker dropdown
  got the same treatment (needs every exam to choose from, not one page).
- **StudentDetail.tsx / TeacherDetail.tsx** — their fee/salary history cross-references also moved to
  `pageSize: MAX_PAGE_SIZE` (one person's history is inherently small — at most ~12 records/year).
- **Query-key factory** (`qk.admin.exams`/`notices`/`contactMessages`/`studentFees`/
  `teacherSalaries`/`transactions`) all got the same omittable-query-means-bare-prefix fix from batch
  1, so `invalidateQueries()` with no args actually matches every paginated/filtered variant cached
  under each. Also disambiguated `qk.admin.exam(id)`/`notice(id)` (the single-record detail key) from
  `qk.admin.exams(query)`/`notices(query)` (the list key) with an explicit `'detail'` segment, matching
  the pattern `students`/`student` and `teachers`/`teacher` already used — they shared a 2-element
  prefix before this without it, which worked by accident (different value types at the 3rd position)
  rather than by design.

**Verified:** contracts + backend + frontend all typecheck clean; `eslint .` clean (same 4
pre-existing advisory warnings, none new); frontend production build succeeds. Backend live-tested
against the real database: `GET /admin/notice` and `GET /admin/contact` (with real
pagination/search query strings) came back 200 with correct data; `GET /admin/exam`,
`GET /admin/finance/student-fee`, and `GET /admin/finance/teacher-salary` 500'd — confirmed via
`logs/error.log` as the same pre-existing stale-seed-ID/className issue already documented in
`CLAUDE.md` (all three were already on that list before this batch touched them), not a bug in the
new query logic.

**Phase 9 is now effectively complete** for every list endpoint with a real frontend consumer and a
real scalability case. What's left of the original P1 backlog item (Classes, Subjects, Transaction)
is deliberately out of scope per the reasoning above, not an oversight.

## Phase 10 — P3: the remaining CRUD gaps, all seven items (2026-08-24)

You picked all seven P3 items in one go (exam/class/notice edit, bulk CSV import, admin
student-attendance view, password reset, session promotion) plus approved D5 for the last one.

**Contracts.** `UpdateExamBody` (title/dates only — see its doc comment for why class/section/
subjects stay fixed after creation: restructuring risks orphaning `ExamResult` rows once marking has
started), `UpdateClassBody`, `UpdateNoticeBody` — all thin `PartialType`-style extensions of their
`Create*Body`, `update` ops added to `adminExamContract`/`adminClassContract`/`adminNoticeContract`.
`ResetStudentPasswordResponse`/`ResetTeacherPasswordResponse` (`{username, temporaryPassword}`) and a
`resetPassword` op on both `adminStudentContract`/`adminTeacherContract` — a generated password shown
once to the admin, not an email flow (no email/SMS integration exists in this codebase). New file
`contracts/src/admin/studentAttendance.ts` (`adminStudentAttendanceContract.report`) — a per-class
attendance-percentage summary over a date range, not a day-by-day marking grid (marking stays the
teacher's job). New file `contracts/src/admin/promotion.ts` (`adminPromotionContract.promote`).
`BulkImportStudentsBody` is deliberately `z.array(z.unknown())`, not `z.array(CreateStudentBody)` —
`defineRoute` validates the whole body before the handler runs, so a schema-level array-of-strict-
objects would 400 the entire request on row 12's typo before the service's per-row try/catch ever saw
rows 1–11; validating each row as `CreateStudentBody` (via `.safeParse`) had to move into
`AdminStudentService.bulkImportStudents` itself for partial success to actually work. Caught and fixed
before it shipped, via a live curl test that surfaced the whole-body 400 the naive version produced.

**D5.** Added `Student.status` (`Active`/`TransferredOut`/`Graduated`, default `Active`) and
`Class.isArchived` (default `false`) to `schema.prisma`, `npx prisma db push` (no-op for MongoDB — no
migration step, schemaless) + `npx prisma generate` (hit the known transient Windows `EPERM` file-lock
issue on `query_engine-windows.dll.node`, worked around by killing the stray `bun` process still
holding port 5000 from an earlier test run, then generate succeeded clean).

**The MongoDB legacy-document trap (found live-testing, not in the plan going in).** `@default(false)`
in the Prisma schema only applies at document *creation* through the client — it does not, and cannot,
retroactively add the field to documents that already existed in Mongo (schemaless database, no
migration step to backfill). A first-pass `where: { isArchived: false }` / `where: { status: 'Active' }`
filter therefore silently matched *zero* pre-existing documents — confirmed by querying via
`prisma.class.findRaw` and comparing against the typed client, which shows this codebase's existing
seed classes/students genuinely have no `isArchived`/`status` key in their Mongo documents at all.
Fixed two ways, applied together: (1) query filters use `{ notIn: [...] }` / `{ not: true }` instead of
strict equality — Mongo's `$nin`/`$ne` treat a missing field the same as "not equal to the excluded
value," which is exactly the semantics a pre-D5 document should have (new shared constant
`ACTIVE_STUDENT_STATUS_FILTER` in `backend/src/shared/helpers/activeStudentFilter.ts`, reused by
`AdminStudentService`, `AdminPromotionService`, and `AdminStudentAttendanceService`); (2) every response
mapper falls back (`?? 'Active'` / `?? false`) since Prisma returns `undefined`, not the schema default,
for a field genuinely absent from the underlying document, and the response contract requires a real
value. Additionally ran a one-time backfill (asked and got confirmation first, since it's a write
against the live shared DB) setting the literal default values on the small number of legacy documents
this database actually has (2 classes, 3 students) — belt-and-suspenders with the filter fix, not a
replacement for it, since a *third* untouched legacy document could still show up later via some other
path.

**The `Student.appId` sparse-index bug (found live-testing bulk import, unrelated to this phase's
scope, fixed with permission).** `appId` is optional-and-unique on `Student`, but the MongoDB unique
index Prisma had created for it was never marked `sparse`, so *any* two students that both omit `appId`
collide on create — not a new bug, and not specific to bulk import (the one-at-a-time admission form
has the identical failure mode, it just rarely gets two `appId`-less submissions in a row). Asked before
touching it since it's outside P3's approved scope; fixed via `$runCommandRaw` `dropIndexes` +
`createIndexes` with `sparse: true` — metadata-only, no documents touched.

**Backend services**, one per resource, same shape throughout (validate → mutate → return the updated
record, or the specific response shape for password reset / bulk import / promote):
`AdminExamService.updateExam`, `AdminClassService.updateClass` (also handles the
`className`/`section`/`session` unique-constraint P2002 case distinctly from not-found), `AdminNoticeService.updateNotice`,
`AdminStudentService.resetPassword` / `.bulkImportStudents`, `AdminTeacherService.resetPassword`, new
`AdminStudentAttendanceService.getReport` (per-student present/absent/leave counts + percentage over a
class + date range, denominator is `ClassAttendance.isMarked` days actually marked, not the full
calendar span), new `AdminPromotionService.promote` (find-or-create the target class, move every active
student into it except `graduatingStudentIds` who get `status: 'Graduated'` instead and are left behind
with their history intact, archive the source class once nothing active remains in it — partial failure
on a target roll-number collision is per-student, not atomic, same reasoning as bulk import). New shared
helper `backend/src/shared/helpers/temporaryPassword.ts` (`generateTemporaryPassword` — `crypto.randomInt`,
not `Math.random`, since this becomes a real login credential; excludes visually-ambiguous characters).

**Live-tested end to end against the real database** (not just typecheck) — logged in as admin,
created throwaway test data (a class, two students, a teacher), exercised every new endpoint, then
deleted all of it afterward: notice edit (200, reverted), class create/edit (200, `isArchived: false`
on a fresh doc), bulk import with a deliberately mixed valid/invalid payload (first pass 400'd the
whole request — the `BulkImportStudentsBody` fix above — second pass correctly reported 1 success + the
`appId` collision as a per-row failure, third pass after the sparse-index fix succeeded clean),
password reset for both a student and a throwaway teacher, the attendance report against a class with
zero marked days (correctly all-zero, not an error), and promotion (1 promoted, 1 graduated, source
class auto-archived, target class auto-created, verified the default class-list view correctly excludes
the now-archived source and the default student-list view correctly excludes the graduated student).
Exam edit and the class-list-with-`includeArchived=true` path both 500'd on the exact same pre-existing
stale-seed `className`/`studentId`-format issue already documented in `CLAUDE.md` — confirmed via
`logs/error.log`'s `ZodError` stack, not a new bug; the exam-edit write itself still went through
underneath the 500 (verified directly, then reverted), consistent with how `defineRoute` already
behaves for any mutation whose response schema doesn't fit stale data.

**Frontend.** Exams/Classes/Notices each got an inline edit dialog (reusing the existing create-form
components) triggered from a new "Edit" action next to Delete. `StudentDetail.tsx`/`TeacherDetail.tsx`
got a "Reset Password" button wired to a new shared `ResetPasswordDialog.tsx` — shows the generated
password exactly once with a copy button, since there's nowhere else it's ever displayed again.
`Students.tsx` got a "Bulk Import" button opening a new `BulkImportStudentsDialog.tsx` — CSV parsing is
a small hand-written `parseCsv` (new export in `components/data-table/csv.ts`, the inverse of the
existing `downloadCsv` escaping) rather than a new dependency, includes a "Download CSV Template"
button, and reports per-row success/failure after import. `ClassDetail.tsx` got a "Promote Class"
button opening a dialog with target class/section/session fields and a per-student "graduate instead"
checkbox list, sourced from the same roster query the page already had. New page
`Admin/pages/StudentAttendance.tsx` (class picker + date range → the percentage-summary table),
routed at `/admin/attendance/student`, with nav entries added in both the sidebar
(`components/layout/app-layout.tsx`, existing "Attendance" renamed to "Teacher Attendance" for
clarity, new "Student Attendance" added alongside it) and the command palette
(`components/layout/command-menu.tsx`). `ClassRecord`/`StudentRecord` both gained their new D5 field
in the TypeScript types automatically via the contract; `Classes.tsx`'s default list call is
unaffected (still excludes archived by omitting `includeArchived`, matching the backend default).

Verified: `npm run build -w contracts` clean, backend `npx tsc --noEmit` + `eslint` clean on every
touched file, frontend `npx tsc -b --force` + `eslint` clean on every touched/new file (same one
pre-existing advisory-only `react-hooks/incompatible-library` warning on `Students.tsx`'s
`react-hook-form` `watch()` call as before, no new warnings), and a full `npm run build` production
build succeeds.

**Phase 10 closes out P3 in full.**

## Phase 11 — P4: the Finance role module, plus free-text expense categories (2026-08-24)

You asked to build the Finance role module and, in the same request, to be able to log arbitrary
expenses (books, whiteboards, ...) "by typing a category into a box" rather than picking from a
fixed list — scoped via two follow-up questions: Finance gets full CRUD parity with Admin's finance
capabilities (not a read-only view), and the expense category is free text with autocomplete
suggestions from what's already been used, not a new fixed enum value.

**The Finance module is not a parallel implementation.** Every `/finance/*` operation is served by
the *exact same* backend services `/admin/finance/*` already used —
`AdminStudentFeeService`, `AdminTeacherSalaryService`, `AdminTransactionService`,
`AdminAnalyticsService.getFinance`, plus `AdminStudentService.getStudents` /
`AdminTeacherService.getTeachers` for a read-only student/teacher directory (Finance needs to pick
*who* a fee/salary is for; managing their profiles stays Admin-only). New `backend/src/modules/finance/`
(controllers/routes only — no new service logic except the dashboard, see below) mounted at
`/finance` behind a new `FinanceOnly` middleware (`core/middlewares/auth.middleware.ts`, mirrors
`AdminOnly`/`TeacherOnly`/`StudentOnly`). New `contracts/src/finance/index.ts` re-exports the exact
same Zod schemas from `admin/finance.ts` / `admin/analytics.ts` under new `/finance/*` paths, so the
two surfaces can't drift out of sync by construction. One genuinely new service:
`FinanceDashboardService` (its own file, not reusing `AdminDashboardService` — that pulls a lot of
non-finance data a Finance user has no use for; scoped to just pending fees/salaries, this month's
collected/spent, and recent activity).

**The expense-category feature (D: additive, no new enum value).** `Transaction.category` stays the
existing 5-value `TxnCategory` enum unchanged — Fee/Salary remain system-assigned-only, exactly as
`AdminTransactionService` already enforced. Added one nullable field, `Transaction.expenseCategory
String?` (pushed via `db push`, additive, no legacy-document trap this time since it's nullable with
no filter ever run strictly against it — every read goes through a `?? null` fallback the same way
D5's fields did, for the same "legacy Mongo document lacks the key entirely" reason). A "log an
expense" submission sets `category: 'Other'` and `expenseCategory` to whatever the user typed;
`GET .../expense-categories` (`AdminTransactionService.getExpenseCategories`, a `distinct` query)
feeds an HTML `<datalist>`-backed `<input>` so the category field is simultaneously a suggestion
list of every label used before *and* a free-text box for a brand new one — no combobox library
needed for that, plain semantic HTML did it. Both `AdminFinanceAnalytics` (shared by
`/admin/analytics/finance` and `/finance/analytics`) and `FinanceDashboard` gained
`expenseBreakdown`/`monthlyExpenses`/`totalExpenses` (or `expensesThisMonth` for the dashboard) —
"complete analytics" per your ask meant the new expense data needed to actually show up in the
existing finance analytics, not just be creatable.

**Shared frontend component, not duplicated.** `components/finance/ExpenseManager.tsx` — the
category `<datalist>` combobox, the log/edit form, the delete flow, all written once and used from
both **Admin Finance.tsx's new "Expenses" tab** and the **Finance module's own Expenses page**, via a
small adapter prop (`list`/`create`/`update`/`remove`/`categories` + two query keys) rather than
importing `adminService`/`financeService` directly — the two mount points hit different API base
paths but are otherwise identical UI. `Admin/pages/AnalyticsFinanceTab.tsx` also got the new expense
breakdown + monthly-spend charts, so an Admin user (not just a dedicated Finance login) gets the same
"complete analytics" without needing to switch accounts. New Finance portal pages: `Dashboard.tsx`,
`Fees.tsx`, `Salaries.tsx`, `Expenses.tsx`, `Analytics.tsx` (the last three of these follow the same
DataTable/status-editor/dialog patterns already established for Admin's Finance page — `Analytics.tsx`
is a near-duplicate of `AnalyticsFinanceTab.tsx` by necessity, not oversight: same
`AdminFinanceAnalytics` shape, but a different service/base-path and no cross-portal navigation to
`/admin/students/:id`, which a Finance user can't reach). New `FinanceRouteWrapper`
(`route-wrappers.tsx`), a `finance` layout role in `AppLayout` with its own nav section and amber
theming, `roleHomePath('Finance')` now resolves to `/finance/dashboard` instead of `/`, and
`LoginPage.tsx`'s role-switcher tabs gained a fourth "Finance" option (the tabs were cosmetic even
before this — the login form never actually gated by role, so Finance login already worked without
this, but the tab rounds out the portal as a first-class option rather than a hidden one).

**Two real bugs found live-testing, both fixed, neither part of the original P4 scope:**
- `AdminTeacherService.deleteTeacher` deleted the `Teacher` row first and only fell back to deleting
  the linked `User` if that failed — backwards, since `User` is the parent side of the relation
  (`onDelete: Cascade` runs User→Teacher, not the reverse). A successful teacher delete therefore
  left an orphaned `User` row permanently squatting on that `teacherId` as its `username`, so any
  future teacher assigned the same generated id by `getNewTeacherSerialNumber()` would 500 on
  `User_username_key`. Found because that's exactly what happened to a teacher created for testing
  earlier in this same phase. Fixed to delete `User` first, matching
  `AdminStudentService.deleteStudent`'s already-correct order; the orphan this bug had already
  created was cleaned up directly.
- (Carried over context, not new this phase, but relevant: `Student.appId`'s sparse-index fix from
  Phase 10 is what made the analogous bug not reproduce for students.)

**Verified**: `npm run build -w contracts` clean; backend `tsc --noEmit` + `eslint` clean on every
touched/new file; frontend `tsc -b --force` + `eslint` clean (same one pre-existing advisory
`react-hooks/incompatible-library` warning as every prior phase, no new ones); full `npm run build`
production build succeeds. Live-tested end to end against the real database with a dedicated
`Finance`-role test user (created and deleted directly, no signup flow exists for that role): logged
in, hit `/finance/dashboard`, logged two expenses with brand-new typed categories ("Books",
"Whiteboard") and confirmed both `GET .../expense-categories` and the analytics `expenseBreakdown`
picked them up correctly, collected a fee and processed a salary end to end (including the
teacher-delete bug and fix above, discovered in the middle of this), confirmed role isolation both
directions (`Finance` token → 403 on `/admin/dashboard`; `Admin` token → 403 on `/finance/dashboard`),
and confirmed `/finance/student` hits the same pre-existing stale-seed-studentId `ZodError` already
documented in `CLAUDE.md` (not a new bug — same endpoint logic as `/admin/student`, same underlying
data). All test data deleted afterward.

**Phase 11 closes out P4.** Every backend proposal in this plan (Part 2, 🔒A/B/C/D) is now done.

## Still open (deferred, not blocking)

Nothing from the original Part 0 diagnosis or Part 2 backend proposals remains scoped-but-undone.
What's left is entirely outside what this plan ever covered:

1. **`test/`.** The integration suite hits a live backend with no mocking. Phases 2–3 changed the wire
   format, and Phases 9–11 changed several response shapes further (`{data,...}` pagination envelopes,
   the new `status`/`isArchived`/`expenseCategory` fields, the whole `/finance/*` surface) — the suite
   was never updated to match, so it's likely stale against the current contracts. Worth deciding
   whether it stays HTTP-integration-only (and gets rewritten against the contracts) or gains unit
   coverage for the services instead.
2. **Swagger docs for `modules/finance`.** `swagger.ts` explicitly imports each module's `swagger/`
   folder rather than auto-discovering them — `finance` doesn't have one yet, so its endpoints don't
   show up at `/api/docs`. Doesn't affect runtime behavior (nothing reads it at startup), just API
   documentation coverage.
