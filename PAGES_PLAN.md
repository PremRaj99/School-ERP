# School ERP — Frontend Pages Plan

This document maps every planned/scaffolded frontend page to its form fields, inputs, and
the backend API it talks to. Generated from the actual backend implementation in
`backend/src` (routes, controllers, Zod schemas) and the Prisma schema (`backend/prisma/schema.prisma`),
cross-checked against the already-scaffolded pages in `frontend/src/modules/**/pages`.

## Conventions used throughout

- **Base URL**: `/api` (see `backend/src/app`), versioned by module: `/auth`, `/user`, `/admin/*`, `/student/*`, `/teacher/*`.
- **Auth**: JWT access/refresh tokens set as httpOnly cookies (`access_token`, `refresh_token`) on login; also returned in the JSON body. Every non-public route runs `verifyJWT`, then a role guard (`AdminOnly` / `StudentOnly` / `TeacherOnly`). `POST /user/refresh` and `POST /user/logout` are the two deliberate exceptions — they run in front of `verifyJWT` so a refresh call still works once the access token has expired.
- **Roles**: `Admin`, `Teacher`, `Student`, `Finance` (defined in the `Role` enum but **no Finance module/routes exist yet** — see Gaps section).
- **As of Phase 3 (ALIGNMENT_PLAN.md, 2026-08-23), every endpoint below is contract-backed** — request/response
  shapes are Zod schemas in `contracts/src/**` (`@schoolerp/contracts`), the same object the backend validates
  against and the frontend's `lib/api/typed-client.ts` builds requests from. **The 🔗 marker below is now the
  default, not the exception** — kept per-section for continuity with Phase 1 rather than re-marked everywhere.
  The one API-level exception is `POST /auth/signup` (no page calls it — see §1.2 note). Conventions on every
  contract-backed route: dates are ISO on the wire in both directions — `date` = `YYYY-MM-DD`, `month` =
  `YYYY-MM` (`DD-MM-YYYY` is display-only, done client-side). A create/update returns the affected resource,
  not `null`; a delete returns `{ studentId }` / `{ teacherId }` / `{ subjectCode }` / `{ id }` (whichever is
  that resource's identifier). Detail/update/delete routes take the resource's **business key** in the URL
  (`STU########`, `TCH########`, a subject code) — never a raw Mongo id. Errors carry `code` and, for a
  validation failure, `issues: [{ path, message }]`.
- Not every endpoint documented below is actually called by a page yet — most of the Student portal and half
  of the Teacher portal (§3, §4) are still static mock UI with zero backend calls (checked file-by-file in
  Phase 3 before touching anything: only Teacher Attendance and Results are wired). Wiring the rest up is
  Phase 6 work — this document describes the API, not which pages currently use it.
- Fields marked **(opt)** are optional in the Zod schema; everything else is required.
- **🔗** next to a page/section heading below means it's contract-backed (see above) — the field table
  reflects `contracts/src/**`, not a hand-typed guess.

---

## 1. Public / Auth Pages

### 1.1 Login — `frontend/.../auth/pages/LoginPage.tsx` 🔗
One shared login page for all roles (Admin/Teacher/Student); redirects to `/{role}/dashboard` after login.

| Field | Type | Validation |
|---|---|---|
| `username` | text | required |
| `password` | password | required |

**APIs**
- `POST /auth/login` — body `{ username, password }` → sets `access_token`/`refresh_token` cookies; response body `{ user: { username, role }, accessToken, refreshToken }`.
- `POST /user/refresh` — silent token refresh (body/cookie `refresh_token`); response `{ accessToken, refreshToken }`.
- `POST /user/logout` — clears cookies; response `null`.

### 1.2 Contact Us *(public marketing page — not yet scaffolded in frontend, API exists)* 🔗
| Field | Type | Validation |
|---|---|---|
| `name` | text | required |
| `email` | email | valid email |
| `mobile` | text | min 10 digits |
| `message` | textarea | required |

**API**: `POST /auth/contact` → stores a `Contact` record; response `null`.

> `POST /auth/signup` (`username`, `password`) also exists at the API level, but no page calls it directly — Admin's *Create Student/Teacher* forms create the linked `User` (with generated username/password) internally.

---

## 2. Admin Portal (`/admin/*`, role: `Admin`)

### 2.1 Dashboard — `Dashboard.tsx`
Summary counts and at-a-glance widgets, all served by a single aggregate call.

**API**: `GET /admin/dashboard` →
```
{
  counts: { students, teachers, classes, subjects },
  todayTeacherAttendance: { date, present, absent, leave, unmarked, total },
  upcomingExams: [{ id, title, className, section, dateFrom, dateTo }],   // next 5
  recentNotices: [{ id, title, date, targetRole }],                       // latest 5
  finance: {
    pendingStudentFees: { count, totalAmount },
    pendingTeacherSalaries: { count, totalAmount }
  }
}
```

### 2.2 Students — `Students.tsx` 🔗
List + Create/Delete/View-detail student records (auto-creates linked login `User`). **No edit form
wired in the UI yet** even though `PUT /admin/student/:studentId` exists and is contract-backed.

**List/Detail fields** (`StudentRecord`, identical shape for both — `contracts/src/admin/student.ts`):
`studentId`, `firstName`, `lastName`, `dob`, `address`, `phone`, `fatherName`, `motherName`,
`fatherOccupation`, `motherOccupation`, `studentAadhar`, `fatherAadhar`, `motherAadhar`, `className`,
`section`, `session`, `dateOfAdmission`, `rollNo`, `appId`, `profilePhoto`, `username`.

**Create / Edit form fields** (`CreateStudentBody` / `UpdateStudentBody` — update = all optional):
| Field | Type | Validation |
|---|---|---|
| `firstName` | text | min 2 chars |
| `lastName` | text (opt) | min 2 chars |
| `dob` | date picker | `YYYY-MM-DD` |
| `address` | textarea (opt) | min 10 chars |
| `phone` | text | 10-digit Indian mobile (`^[6-9]\d{9}$`) |
| `fatherName` | text (opt) | min 2 |
| `motherName` | text (opt) | min 2 |
| `fatherOccupation` | text (opt) | min 2 |
| `motherOccupation` | text (opt) | min 2 |
| `studentAadhar` | text (opt) | 12 digits |
| `fatherAadhar` | text (opt) | 12 digits |
| `motherAadhar` | text (opt) | 12 digits |
| `className` | select | 1–3 chars, e.g. "10" |
| `section` | select | single uppercase letter A–Z |
| `session` | select | `YYYY-YYYY`, end = start+1 |
| `dateOfAdmission` | date picker | `YYYY-MM-DD` |
| `rollNo` | number | positive integer |
| `appId` | text (opt) | min 5 chars |
| `profilePhoto` | url (opt) | valid URL |

**APIs**
- `GET /admin/student` — list all students → `StudentRecord[]`.
- `GET /admin/student/:studentId` — detail, **by business key only** (`STU########`) → `StudentRecord`.
- `POST /admin/student` — create (body above) → the created `StudentRecord`.
- `PUT /admin/student/:studentId` — update (partial body above) → the updated `StudentRecord`.
- `DELETE /admin/student/:studentId` — delete → `{ studentId }`.

### 2.3 Teachers — `Teachers.tsx` 🔗
List + Create/Delete/View-detail teacher records (auto-creates linked login `User`). Same edit-form gap
as Students.

**List/Detail fields** (`TeacherRecord`): `teacherId`, `firstName`, `lastName`, `dob`, `address`,
`phone`, `teacherAadhar`, `dateOfJoining`, `about`, `salaryPerMonth`, `qualifications`,
`subjectHandled`, `profilePhoto`, `username`.

**Create / Edit form fields** (`CreateTeacherBody` / `UpdateTeacherBody`):
| Field | Type | Validation |
|---|---|---|
| `firstName` | text | min 2 |
| `lastName` | text (opt) | min 2 |
| `dob` | date picker | `YYYY-MM-DD` |
| `address` | textarea (opt) | min 10 |
| `phone` | text | 10-digit Indian mobile |
| `teacherAadhar` | text (opt) | 12 digits |
| `dateOfJoining` | date picker | `YYYY-MM-DD` |
| `about` | textarea (opt) | min 20 chars |
| `salaryPerMonth` | number | positive |
| `qualifications` | text | min 2 |
| `subjectHandled` | multi-select/tag input | array, ≥1 item, each ≥2 chars — still free text, not validated against real `Subject` rows (ALIGNMENT_PLAN.md 2D/D1 would fix that; deferred to the Teachers-page rewrite) |
| `profilePhoto` | url (opt) | valid URL |

> Renamed from `subjectsHandled` (the old request field name — it never matched the DB column or any
> response, which is exactly the kind of drift `contracts/` exists to prevent) to `subjectHandled`.

**APIs**
- `GET /admin/teacher` — list → `TeacherRecord[]`.
- `GET /admin/teacher/:teacherId` — detail, by `TCH########` only → `TeacherRecord`.
- `POST /admin/teacher` — create → the created `TeacherRecord`.
- `PUT /admin/teacher/:teacherId` — update (partial) → the updated `TeacherRecord`.
- `DELETE /admin/teacher/:teacherId` — delete → `{ teacherId }`.

### 2.4 Classes — `Classes.tsx` 🔗
List + Create/Delete class-sections (no update endpoint — classes are immutable once created).

| Field | Type | Validation |
|---|---|---|
| `className` | select/text | 1–3 chars |
| `section` | select | single uppercase letter |
| `session` | select | `YYYY-YYYY` |

**APIs**
- `GET /admin/class` — list all classes → `ClassRecord[]` (`{ id, className, section, session }`).
- `POST /admin/class` — create `{ className, section, session }` → the created `ClassRecord`.
- `DELETE /admin/class/:classId` — delete → `{ id }`.

### 2.5 Subjects — `Subjects.tsx` 🔗
List + Create/Edit/Delete subjects; also a "subjects by class" grouped view.

| Field | Type | Validation |
|---|---|---|
| `subjectName` | text | min 2 chars |
| `subjectCode` | text (opt on create, auto-generated if omitted) | 3–10 chars |

**APIs**
- `GET /admin/subject` — list all subjects → `SubjectRecord[]` (`{ subjectCode, subjectName }`).
- `GET /admin/subject/get-all-class-subject` — subjects grouped per class (for timetable/exam pickers) → `{ assignedSubjects: [{ className, subjects }], unassignedSubjects }`.
- `POST /admin/subject` — create `{ subjectName, subjectCode? }` → the created `SubjectRecord`.
- `PUT /admin/subject/:subjectCode` — update `{ subjectName }` → the updated `SubjectRecord`. (Previously this also silently regenerated `subjectCode` from the new name, orphaning anything that had linked the old code — fixed as part of the Phase 1 rewrite; the code in the URL is now the code that comes back.)
- `DELETE /admin/subject/:subjectCode` — delete → `{ subjectCode }`.

### 2.6 Exams — `Exams.tsx`
List + Create/Delete exams; each exam bundles multiple classes, each with its own subject/date/full-marks schedule. Also where the admin **declares results** once teachers finish marking.

**Create form fields** (`CreateExamSchema` — typically a multi-step / repeatable-group form):
| Field | Type | Validation |
|---|---|---|
| `title` | text | min 3 chars |
| `dateFrom` | date picker | `DD-MM-YYYY` |
| `dateTo` | date picker | `DD-MM-YYYY` |
| `exams[]` — per class group: |
| &nbsp;&nbsp;`className` | select | 1–3 chars |
| &nbsp;&nbsp;`section` | select | single uppercase letter |
| &nbsp;&nbsp;`subjects[]` — per subject row: |
| &nbsp;&nbsp;&nbsp;&nbsp;`subjectCode` | select | existing subject code |
| &nbsp;&nbsp;&nbsp;&nbsp;`date` | date picker | `DD-MM-YYYY` |
| &nbsp;&nbsp;&nbsp;&nbsp;`fullMarks` | number | 0–100 |

**Declare result form** — single toggle/button per exam, enabled once every `ExamSubject.isMarked` is `true`:
| Field | Type | Validation |
|---|---|---|
| `isResultDecleared` | switch/button | boolean |

**APIs**
- `GET /admin/exam` — list exams (with class + result-declared status).
- `POST /admin/exam` — create (nested body above).
- `DELETE /admin/exam/:examId` — delete.
- `PUT /admin/exam/:examId/declare-result` — body `{ isResultDecleared: boolean }`. Server rejects `true` with a 400 if any subject in the exam is still unmarked. Setting `false` un-declares (for corrections).

### 2.7 Notices — `Notices.tsx`
List + Create/Delete/View-detail notices (targeted to Student/Teacher/All).

| Field | Type | Validation |
|---|---|---|
| `title` | text | min 2 chars |
| `description` | textarea (opt) | min 50 chars |
| `fileUrl` | url (opt) | valid URL (attachment link) |
| `date` | date picker | `DD-MM-YYYY` |
| `expiryDate` | date picker (opt) | `DD-MM-YYYY` |
| `targetRole` | select | `Student` \| `Teacher` \| `All` |

**APIs**
- `GET /admin/notice` — list.
- `GET /admin/notice/:noticeId` — detail.
- `POST /admin/notice` — create.
- `DELETE /admin/notice/:noticeId` — delete.

### 2.8 Academic — `Academic.tsx`
Combines **Timetable** management and the **Academic Calendar** (holidays/events/exams/other).

**Timetable sub-section**
| Field | Type | Validation |
|---|---|---|
| `className` | select | 1–3 chars |
| `section` | select | single uppercase letter |
| `weekday` | select | `MON`…`SAT` |
| `period` | number/select | 1–8 |
| `subjectCode` | select (opt) | existing subject |
| `teacherId` | select (opt) | format `TCH########` |

- `GET /admin/academic/time-table` — fetch full timetable grid.
- `PUT /admin/academic/time-table` — upsert one cell (body above; omit `subjectCode`/`teacherId` to clear the slot).

**Academic Calendar sub-section**
| Field | Type | Validation |
|---|---|---|
| `title` | text | min 2 chars |
| `date` | date picker | `DD-MM-YYYY` |
| `category` | select | `HOLIDAY` \| `EVENT` \| `EXAM` \| `OTHER` |

- `GET /admin/academic/calendar` (alias `GET /admin/academic`) — list entries.
- `POST /admin/academic/calendar` (alias `POST /admin/academic`) — create.
- `DELETE /admin/academic/calendar/:calendarId` (alias `DELETE /admin/academic/:calendarId`) — delete.

### 2.9 Finance *(new — no page scaffolded yet, API ready)*
Admin-only ledger covering student fee records, teacher salary records, and general (Utility/Infrastructure/Other) transactions. Recommended as three tabs on one "Finance" page.

**Tab A — Student Fees**
| Field | Type | Validation |
|---|---|---|
| `studentId` | select | format `STU########` |
| `month` | month picker | `MM-YYYY` |
| `title` | text (opt) | min 2 chars — defaults to `"<name> - Fee - <month>"` |
| `feeBreakdown[]` — per row `{ feeType, amount }` | text + number | `feeType` min 2 chars, `amount` positive |

- `GET /admin/finance/student-fee?studentId&className&section&session&month&status` — list, all filters optional.
- `GET /admin/finance/student-fee/:feeId` — detail with breakdown.
- `POST /admin/finance/student-fee` — create (`finalAmount` is computed server-side as the sum of `feeBreakdown`). Rejects duplicates for the same student+month.
- `PUT /admin/finance/student-fee/:feeId/status` — body `{ status: 'Paid' | 'Pending' | 'Failed' }`.
- `DELETE /admin/finance/student-fee/:feeId`.

**Tab B — Teacher Salary**
| Field | Type | Validation |
|---|---|---|
| `teacherId` | select | format `TCH########` |
| `month` | month picker | `MM-YYYY` |
| `amount` | number (opt) | positive — defaults to the teacher's `salaryPerMonth` |

- `GET /admin/finance/teacher-salary?teacherId&month&status`.
- `GET /admin/finance/teacher-salary/:salaryId`.
- `POST /admin/finance/teacher-salary` — create. Rejects duplicates for the same teacher+month.
- `PUT /admin/finance/teacher-salary/:salaryId/status` — body `{ status }`.
- `DELETE /admin/finance/teacher-salary/:salaryId`.

**Tab C — General Transactions** (Utility / Infrastructure / Other — *not* Fee/Salary, those are managed via the tabs above)
| Field | Type | Validation |
|---|---|---|
| `title` | text | min 2 chars |
| `finalAmount` | number | positive |
| `category` | select | `Utility` \| `Infrastructure` \| `Other` |
| `status` | select (opt) | `Paid` \| `Pending` \| `Failed`, defaults `Pending` |

- `GET /admin/finance/transaction?category&status`.
- `GET /admin/finance/transaction/:transactionId`.
- `POST /admin/finance/transaction` — create (400 if `category` is `Fee`/`Salary`, use the dedicated tabs).
- `PUT /admin/finance/transaction/:transactionId` — update title/amount/category/status.
- `DELETE /admin/finance/transaction/:transactionId` — 400 if the transaction is linked to a fee/salary record.

### 2.10 Contact Messages *(new — no page scaffolded yet, API ready)*
Admin-only inbox for messages submitted via the public Contact Us form (§1.2). Read + delete only — messages are created by the public endpoint, not by Admin.

**List/Detail fields**: `name`, `email`, `mobile`, `message`.

**APIs**
- `GET /admin/contact` — list all submitted messages.
- `GET /admin/contact/:contactId` — detail.
- `DELETE /admin/contact/:contactId` — delete (e.g. once handled).

### 2.11 Attendance — `Attendance.tsx`
**Teacher attendance** management by Admin (class-wise *student* attendance is marked by Teachers themselves — see §4.2).

| Field | Type | Validation |
|---|---|---|
| `date` (query, for fetch/mark) | date picker | `DD-MM-YYYY` |
| `month` (query, for history) | month picker | `MM-YYYY` |
| Mark form: array of rows `{ teacherId, status }` | select per teacher | `status` = `Present` \| `Absent` |
| Edit form: array of rows `{ id, teacherId, status }` | — | same, plus attendance record `id` |

**APIs**
- `GET /admin/attendance/teacher-attendance?date=DD-MM-YYYY` — all teachers' attendance for a day.
- `GET /admin/attendance/teacher-attendance/:teacherId?month=MM-YYYY` — one teacher's monthly history.
- `POST /admin/attendance/teacher-attendance?date=DD-MM-YYYY` — mark attendance for the day (array body).
- `PUT /admin/attendance/teacher-attendance` — bulk-update existing entries (array body with `id`).

---

## 3. Student Portal (`/student/*`, role: `Student`)

### 3.1 Dashboard — `Dashboard.tsx`
Landing overview, served by a single aggregate call.

**API**: `GET /student/dashboard` →
```
{
  profile: { studentId, firstName, lastName, rollNo, profilePhoto, className, section, session },
  attendanceThisMonth: { present, absent, leave, total },
  upcomingExams: [{ id, title, dateFrom, dateTo }],           // next 5 for own class
  recentNotices: [{ id, title, date, targetRole }],           // latest 5, Student/All
  pendingFees: { count, totalAmount }
}
```

### 3.2 Attendance — `Attendance.tsx`
Read-only monthly attendance view.
| Field | Type |
|---|---|
| `month` (query) | month picker, `MM-YYYY` |

**API**: `GET /student/attendance?month=MM-YYYY` — list of `{ date, status }` for the logged-in student.

### 3.3 Subjects — `Subjects.tsx`
Read-only list of subjects for the student's class.
**API**: `GET /student/subject/get-all-subject`.

### 3.4 Exams — `Exams.tsx`
List of exams for the student's class, plus per-exam declared result view.
| Field | Type |
|---|---|
| `examId` (route param, from list click) | select from list |

**APIs**
- `GET /student/exam` — list of exams for own class.
- `GET /student/result/:examId` — own result once `isResultDecleared = true` (marks per subject, grade, remark).

### 3.5 Notices — `Notice.tsx`
Read-only list + detail of notices targeted at `Student`/`All`.

**APIs**
- `GET /student/notice` — list.
- `GET /student/notice/:noticeId` — detail.

### 3.6 Academic — `Academic.tsx`
Read-only timetable + academic calendar for the student's class.

**APIs**
- `GET /student/academic/time-table`.
- `GET /student/academic/calendar`.

### 3.7 Fees — `Fees.tsx`
Fee/payment history and per-month breakdown.
| Field | Type |
|---|---|
| `year` (query filter) | select, `YYYY-YYYY` session |
| `feeId` (row click → detail) | — |

**APIs**
- `GET /student/transaction?year=YYYY-YYYY` — list of fee records (`month`, `finalAmount`, `isPaid`, `paidAt`). Used to always return `[]` regardless of actual fee records (ALIGNMENT_PLAN.md 2A/B4, fixed).
- `GET /student/transaction/:feeId` — detail incl. fee breakdown (`feeType`/`amount` lines), class info. Same fix applied here.

> No online-payment action exists yet — this is a **view-only** ledger.

### 3.8 Profile *(implicit — shown in layout header/sidebar, not a separate route today)*
- `GET /student/` — profile (name, class, roll no, photo, etc.).
- `GET /user/` — `{ username, role }`.
- `POST /user/change-password` — `{ oldPassword, newPassword }` (newPassword: 8–15 chars, upper+lower+digit+special char).

---

## 4. Teacher Portal (`/teacher/*`, role: `Teacher`)

### 4.1 Dashboard — `Dashboard.tsx`
Landing overview, served by a single aggregate call.

**API**: `GET /teacher/dashboard` →
```
{
  profile: { teacherId, firstName, lastName, subjectHandled, profilePhoto },
  attendanceThisMonth: { present, absent, leave, total },
  todaySchedule: [{ periodNumber, className, section, subjectCode, subjectName }],
  pendingResultEntries: [{ examSubjectId, examId, examTitle, className, section, subjectCode, subjectName, date }], // next 5 unmarked
  recentNotices: [{ id, title, date, targetRole }],           // latest 5, Teacher/All
  pendingSalary: { count, totalAmount }
}
```

### 4.x Academic *(new — no page scaffolded yet, API now reachable)*
Read-only timetable + academic calendar for the classes the teacher teaches — same shape as the Student
Academic page (§3.6). The routes always existed (`academic.route.ts`'s controllers) but `academicRouter`
was never mounted onto `/teacher`, so every request 404'd (ALIGNMENT_PLAN.md 2A/B7, fixed). No frontend
page calls these yet.

**APIs**
- `GET /teacher/academic/time-table` — the teacher's own weekly schedule.
- `GET /teacher/academic/calendar` — school-wide calendar entries.

### 4.2 Attendance — `Attendance.tsx`
Two responsibilities: viewing **own** attendance, and marking **class** (student) attendance for classes the teacher handles.

**Own attendance**
| Field | Type |
|---|---|
| `month` (query) | month picker `MM-YYYY` |

- `GET /teacher/attendance?month=MM-YYYY` — own monthly attendance.

**Class attendance (mark/view)**
| Field | Type | Validation |
|---|---|---|
| `month` (query, list view) | month picker | `MM-YYYY` |
| Create form: `date` | date picker | `DD-MM-YYYY` |
| Create form: `className` | select | 1–3 chars |
| Create form: `section` | select | single uppercase letter |
| Create form: `attendance[]` — per student row `{ studentId, status }` | select | `status` = `Present` \| `Absent` |
| Update form: `attendance[]` — per row `{ id, studentId, status }` | — | edits an already-marked day |

**APIs** — all four scoped to classes the teacher actually teaches (own `TimeTable` rows); a class the
teacher doesn't teach 403s rather than being listed/editable (ALIGNMENT_PLAN.md 2A/A2–A4, fixed — this
used to be unscoped).
- `GET /teacher/attendance/class-attendance?month=MM-YYYY` — list of marked days for the teacher's own classes.
- `GET /teacher/attendance/class-attendance/:classAttendanceId` — full roster + status for that day.
- `POST /teacher/attendance/class-attendance` — mark a new day (body above).
- `PUT /teacher/attendance/class-attendance/:classAttendanceId` — edit an existing day (the `:classAttendanceId` route param used to be a literal, unreachable string — ALIGNMENT_PLAN.md 2A/B6, fixed).

### 4.3 Exams — `Exams.tsx`
List of exams and the subjects/dates the teacher is responsible for marking. Every exam in the school is
visible to every teacher (not scoped to subjects the teacher actually teaches) — reviewed as part of
ALIGNMENT_PLAN.md 2A and kept as-is; it's the school's exam calendar, not per-class sensitive data.
**APIs**
- `GET /teacher/exam` — list of all exams.
- `GET /teacher/exam/:examId` — exam detail with its subjects (`isMarked` flag per subject). Each subject
  entry carries both `examSubjectId` and `subjectId` — use `subjectId` to link to §4.4 (used to only
  return `examSubjectId` as `id`, which is the wrong id for that link — ALIGNMENT_PLAN.md 2A/B12, fixed).

### 4.4 Results — `Results.tsx`
Enter/update marks for a subject the teacher owns within an exam. Both submit and edit now 403 if the
exam subject isn't assigned to the requesting teacher (ALIGNMENT_PLAN.md 2A/B3 fixed the ownership check
on submit — it compared against the wrong id and could never match; 2A/A4 added the same check to edit,
which had none before).
| Field | Type | Validation |
|---|---|---|
| `examId`, `subjectId` (route params) | select from Exams page — `subjectId` from §4.3's `subjects[].subjectId` | ObjectId |
| Create form: rows `{ studentId, marksObtained, remark? }` | number + text | marks ≥ 0 |
| Update form: rows `{ id, studentId, marksObtained, remark? }` | number + text | marks ≥ 0 |

**APIs**
- `GET /teacher/result/:examId/:subjectId` — current roster with existing marks (or blank rows if unmarked).
- `POST /teacher/result/:examId/:subjectId` — submit marks for all students (auto-computes `grade`, flips `isMarked`).
- `PUT /teacher/result/:examId/:subjectId` — edit previously submitted marks.

### 4.5 Notices — `Notice.tsx`
Read-only list + detail of notices targeted at `Teacher`/`All`.
**APIs**: `GET /teacher/notice`, `GET /teacher/notice/:noticeId`.

### 4.6 Salary — `Salary.tsx`
Read-only salary/payment history.
**API**: `GET /teacher/transaction` — list of `{ month, amount, isPaid, paidAt }`. Used to always return
`[]` regardless of actual salary records (ALIGNMENT_PLAN.md 2A/B1, fixed).

### 4.7 Profile *(implicit)*
- `GET /teacher/` — profile.
- `GET /user/`, `POST /user/change-password` — same as student (shared `/user` module).

---

## 5. Shared / Cross-cutting

### Change Password *(modal/page in every portal's header, all roles)* 🔗
| Field | Type | Validation |
|---|---|---|
| `oldPassword` | password | min 8 chars |
| `newPassword` | password | 8–15 chars, needs upper, lower, digit, special char |

**API**: `POST /user/change-password` → `null`.

### Logout *(button, all roles)* 🔗
**API**: `POST /user/logout` (also `POST /auth/logout` alias) → `null`. Runs in front of `verifyJWT` —
works even with an already-expired access token.

### Session refresh *(silent, axios interceptor)* 🔗
**API**: `POST /user/refresh` (also `POST /auth/refresh` alias) → `{ accessToken, refreshToken }`. Also
runs in front of `verifyJWT`, for the same reason — this is specifically the call that fires *because*
the access token expired, so it can't require a valid one.