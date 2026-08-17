# School ERP — Frontend Pages Plan

This document maps every planned/scaffolded frontend page to its form fields, inputs, and
the backend API it talks to. Generated from the actual backend implementation in
`backend/src` (routes, controllers, Zod schemas) and the Prisma schema (`backend/prisma/schema.prisma`),
cross-checked against the already-scaffolded pages in `frontend/src/modules/**/pages`.

## Conventions used throughout

- **Base URL**: `/api` (see `backend/src/app`), versioned by module: `/auth`, `/user`, `/admin/*`, `/student/*`, `/teacher/*`.
- **Auth**: JWT access/refresh tokens set as httpOnly cookies (`access_token`, `refresh_token`) on login; also returned in the JSON body. Every non-public route runs `verifyJWT`, then a role guard (`AdminOnly` / `StudentOnly` / `TeacherOnly`).
- **Roles**: `Admin`, `Teacher`, `Student`, `Finance` (defined in the `Role` enum but **no Finance module/routes exist yet** — see Gaps section).
- **Date formats** (enforced by Zod): `date` = `DD-MM-YYYY`, `month` = `MM-YYYY`, `session` = `YYYY-YYYY` (e.g. `2025-2026`), `classId`/`examId`/etc. = 24-char Mongo ObjectId.
- **Response envelope**: `{ status, message, data }` via `OkResponse` (200) / `CreatedResponse` (201) / `AcceptedResponse` (202).
- Fields marked **(opt)** are optional in the Zod schema; everything else is required.

---

## 1. Public / Auth Pages

### 1.1 Login — `frontend/.../auth/pages/LoginPage.tsx`
One shared login page for all roles (Admin/Teacher/Student); redirects to `/{role}/dashboard` after login.

| Field | Type | Validation |
|---|---|---|
| `username` | text | required |
| `password` | password | required |

**APIs**
- `POST /auth/login` — body `{ username, password }` → sets `access_token`/`refresh_token` cookies, returns tokens.
- `POST /user/refresh` — silent token refresh (body/cookie `refresh_token`).
- `POST /user/logout` — clears cookies.

### 1.2 Contact Us *(public marketing page — not yet scaffolded in frontend, API exists)*
| Field | Type | Validation |
|---|---|---|
| `name` | text | required |
| `email` | email | valid email |
| `mobile` | text | min 10 digits |
| `message` | textarea | required |

**API**: `POST /auth/contact` → stores a `Contact` record.

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

### 2.2 Students — `Students.tsx`
List + Create/Edit/Delete/View-detail student records (auto-creates linked login `User`).

**List/Detail table columns**: `studentId`, name, class/section/session, roll no, phone, admission date, username.

**Create / Edit form fields** (`CreateStudentSchema` / `UpdateStudentSchema` — update = all optional):
| Field | Type | Validation |
|---|---|---|
| `firstName` | text | min 2 chars |
| `lastName` | text (opt) | min 2 chars |
| `dob` | date picker | `DD-MM-YYYY` |
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
| `dateOfAdmission` | date picker | `DD-MM-YYYY` |
| `rollNo` | number | positive |
| `appId` | text (opt) | min 5 chars |
| `profilePhoto` | url (opt) | valid URL |

**APIs**
- `GET /admin/student` — list all students.
- `GET /admin/student/:studentId` — detail (by `studentId` or Mongo id).
- `POST /admin/student` — create (body above).
- `PUT /admin/student/:studentId` — update (partial body above).
- `DELETE /admin/student/:studentId` — delete.

### 2.3 Teachers — `Teachers.tsx`
List + Create/Edit/Delete/View-detail teacher records (auto-creates linked login `User`).

**Create / Edit form fields** (`CreateTeacherSchema` / `UpdateTeacherSchema`):
| Field | Type | Validation |
|---|---|---|
| `firstName` | text | min 2 |
| `lastName` | text (opt) | min 2 |
| `dob` | date picker | `DD-MM-YYYY` |
| `address` | textarea (opt) | min 10 |
| `phone` | text | 10-digit Indian mobile |
| `teacherAadhar` | text (opt) | 12 digits |
| `dateOfJoining` | date picker | `DD-MM-YYYY` |
| `about` | textarea (opt) | min 20 chars |
| `salaryPerMonth` | number | positive |
| `qualifications` | text | min 2 |
| `subjectsHandled` | multi-select/tag input | array, ≥1 item, each ≥2 chars |
| `profilePhoto` | url (opt) | valid URL |

**APIs**
- `GET /admin/teacher` — list.
- `GET /admin/teacher/:teacherId` — detail.
- `POST /admin/teacher` — create.
- `PUT /admin/teacher/:teacherId` — update (partial).
- `DELETE /admin/teacher/:teacherId` — delete.

### 2.4 Classes — `Classes.tsx`
List + Create/Delete class-sections (no update endpoint — classes are immutable once created).

| Field | Type | Validation |
|---|---|---|
| `className` | select/text | 1–3 chars |
| `section` | select | single uppercase letter |
| `session` | select | `YYYY-YYYY` |

**APIs**
- `GET /admin/class` — list all classes.
- `POST /admin/class` — create `{ className, section, session }`.
- `DELETE /admin/class/:classId` — delete.

### 2.5 Subjects — `Subjects.tsx`
List + Create/Edit/Delete subjects; also a "subjects by class" grouped view.

| Field | Type | Validation |
|---|---|---|
| `subjectName` | text | min 2 chars |
| `subjectCode` | text (opt on create, auto-generated if omitted) | 3–10 chars |

**APIs**
- `GET /admin/subject` — list all subjects.
- `GET /admin/subject/get-all-class-subject` — subjects grouped per class (for timetable/exam pickers).
- `POST /admin/subject` — create `{ subjectName, subjectCode? }`.
- `PUT /admin/subject/:subjectCode` — update `{ subjectName }`.
- `DELETE /admin/subject/:subjectCode` — delete.

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

### 2.10 Attendance — `Attendance.tsx`
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
- `GET /student/transaction?year=YYYY-YYYY` — list of fee records (`month`, `finalAmount`, `isPaid`, `paidAt`).
- `GET /student/transaction/:feeId` — detail incl. fee breakdown (`feeType`/`amount` lines), class info.

> No online-payment action exists yet — this is a **view-only** ledger (see Gaps).

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

**APIs**
- `GET /teacher/attendance/class-attendance?month=MM-YYYY` — list of marked days (per class).
- `GET /teacher/attendance/class-attendance/:classAttendanceId` — full roster + status for that day.
- `POST /teacher/attendance/class-attendance` — mark a new day (body above).
- `PUT /teacher/attendance/class-attendance/:classAttendanceId` — edit an existing day.

### 4.3 Exams — `Exams.tsx`
List of exams and the subjects/dates the teacher is responsible for marking.
**APIs**
- `GET /teacher/exam` — list of all exams.
- `GET /teacher/exam/:examId` — exam detail with its subjects (`isMarked` flag per subject).

### 4.4 Results — `Results.tsx`
Enter/update marks for a subject the teacher owns within an exam.
| Field | Type | Validation |
|---|---|---|
| `examId`, `subjectId` (route params) | select from Exams page | ObjectId |
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
**API**: `GET /teacher/transaction` — list of `{ month, amount, isPaid, paidAt }`.

### 4.7 Profile *(implicit)*
- `GET /teacher/` — profile.
- `GET /user/`, `POST /user/change-password` — same as student (shared `/user` module).

---

## 5. Shared / Cross-cutting

### Change Password *(modal/page in every portal's header, all roles)*
| Field | Type | Validation |
|---|---|---|
| `oldPassword` | password | min 8 chars |
| `newPassword` | password | 8–15 chars, needs upper, lower, digit, special char |

**API**: `POST /user/change-password`.

### Logout *(button, all roles)*
**API**: `POST /user/logout` (also `POST /auth/logout` alias).

### Session refresh *(silent, axios interceptor)*
**API**: `POST /user/refresh` (also `POST /auth/refresh` alias).

---

## 6. Known Gaps vs. current backend

1. ~~No Finance module~~ — **Done.** `Admin → Finance` API added: `/admin/finance/student-fee`, `/admin/finance/teacher-salary`, `/admin/finance/transaction` (§2.9). No frontend page built yet (backend-only per current scope) — `Students`/`Teacher` fee/salary views (§3.7, §4.6) now have real data to point at.
2. ~~No "declare result" action~~ — **Done.** `PUT /admin/exam/:examId/declare-result` added (§2.6), gated on all subjects being marked.
3. ~~No dashboard aggregate endpoints~~ — **Done.** `GET /admin/dashboard`, `GET /student/dashboard`, `GET /teacher/dashboard` added (§2.1, §3.1, §4.1).
4. **Dev-only Log Viewer** — `GET /log` (EJS-rendered, `NODE_ENV=development` only) with `page`, `limit`, `search` query params — an internal request-log inspector, not part of the end-user app; mentioned here for completeness since it's the "real-time log monitoring" feature from an earlier commit.
5. **Contact Us page** — `POST /auth/contact` is implemented backend-side but has no corresponding public frontend page yet (deferred — not selected for this round).
6. **No frontend for the three new backend features above** — routes/services/controllers exist and are typechecked, but no React pages/services were built (out of scope for this pass — "backend API only").
7. **Schema change needs a push** — `TeacherSalary` gained `@@unique([teacherId, month])` to stop duplicate salary rows for the same teacher/month. Run `npx prisma generate && npx prisma db push` against your Mongo instance to apply it before using the finance endpoints.
