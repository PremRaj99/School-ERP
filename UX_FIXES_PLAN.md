# UX Fixes & Feature Gaps Plan

Audit date: 2026-10-11. These are the same kinds of problems already fixed on Admin → Academic and
Admin → Student Attendance:
- a hardcoded session;
- a default that isn't the current session;
- one combined "Class-Section" picker;
- From/To dates where a month is what people mean;
- header buttons that don't belong to the active tab;
- blank screens instead of an empty grid.

Status markers: `[ ]` todo · `[~]` in progress · `[x]` done.

Progress notes (2026-10-11):
- A2 is partial. Options are newest-first and labelled "(Current)". The minimum year stays
  hardcoded, because fetching `/admin/class` would 403 for the Finance role.
- B2 done. The Finance page's session selector scopes both ledgers, the monthly-status views and
  the summary strip. Finance analytics used to sum salary, expenses and the category split across
  all time; they are now limited to the session too.
- B8 done. Teacher → Results now filters Session → Class → Section → Exam, and Analytics →
  Academics uses the shared filter bar. The teacher exam list now returns `session`.
- B11 done. `<SessionMonthPicker>` replaces every raw `<input type="month">`. It also fixes the
  UTC `toISOString()` "current month" being one month behind just after midnight on the 1st.
- B9 done. Analytics → Finance keeps the session at the top, and the Fee Defaulters list has its
  own Class/Section/Month filters, a total due, CSV export and a sticky header.
- B15 done. `<Table containerClassName>` with `<TableHeader sticky>` keeps headings visible.
  - Applied to: All Classes, Class Summary, the Daily Register (sticky header and first column),
    the Analytics heatmap, Chronic Absentees, Fee Defaulters and the marks-entry sheet.
  - Finance ledgers are paginated at 10 rows, so they were left as they are.
- B16 done. `<ExportButton>` adds CSV + Print to the three attendance views (the register exports
  P/A/L/H per day), fee defaulters, chronic absentees, the marksheet and the class list.
  - `DataTable` pages already had CSV.
  - The `@media print` rules hide the sidebar, header, filters and buttons, and expand scroll
    tables to print every row.
  - Known gap: Finance "Monthly Status" CSV exports only the current server page.
- C4 done. Each paper already had its own date; this adds optional `startTime`/`endTime`
  (`HH:MM`) on `ExamSubject`.
  - Paper dates must fall within the exam's dates, checked in the contract and in the date pickers.
  - Moving the exam's dates is blocked while any paper would end up outside them.
  - `PUT /admin/exam/:examId/schedule` plus an "Edit Date Sheet" dialog on Admin → Exam detail
    let you re-date and re-time papers.
  - Students see the date sheet on their upcoming exams, with past papers struck through and
    today's paper highlighted.
  - An exam that's already under way now counts as upcoming instead of past.
- C3 done. `Notice.classIds` is set from a class picker in Admin → Notices; empty means every
  class.
  - Students see only notices for their class, on the list, the detail view and the dashboard.
  - A Teacher-only notice ignores classes.
  - `shared/helpers/notice.ts` is now the single mapper for every notice response.
- C2 done. `backend/src/shared/helpers/holidays.ts` treats Sundays and calendar HOLIDAY events as
  non-working days:
  - Marking attendance on one returns a 400 that names the holiday. This covers teacher class
    attendance and admin faculty attendance; editing an existing record is still allowed.
  - Days marked earlier on a date that's now a holiday are left out of every attendance %.
  - The Daily Register shows these days as "H". The marking screens show a holiday state, and the
    personal attendance calendars tint holidays.
- C1 done. `prisma db push` ran on 2026-10-11, so the calendar now allows more than one event per day.

---

## Part A — Shared building blocks (do first; everything below reuses them)

- [x] **A1. One session helper.**
  - `getCurrentSessionYear()` is copy-pasted into `Admin/pages/Academic.tsx` and
    `Admin/pages/StudentAttendance.tsx`. Analytics doesn't use it at all (see B1).
  - Move it into `lib/session.ts` alongside `sessionOfDate()`, `sessionMonths()` and `monthRange()`.
- [~] **A2. `useSessionOptions()` improvements.** File: `hooks/options/useAdminOptions.ts`.
  - Mark the current session as `"2026-2027 (Current)"`.
  - Return options newest-first.
  - Export `currentSession` so callers can default to it, instead of picking an array index.
  - Replace the hardcoded `minStartYear = 2023` with the oldest session among existing classes.
- [x] **A3. Session-aware class/section options.**
  - `useClassNameOptions()` and `useSectionOptions()` currently ignore session. Picking "Class 5"
    lists sections from every year.
  - Add an optional `session` argument.
  - Hide `isArchived` classes by default.
- [x] **A4. Proper class ordering.**
  - Class names sort as plain strings today, giving `1, 10, 11, 2, …, LKG, Nursery`.
  - Add a shared `compareClassName()` that sorts Nursery → LKG → UKG → 1 → 12, and use it in every
    class list and dropdown.
- [x] **A5. `<ClassFilterBar>` component.**
  - A reusable Session → Class → Section (→ Month) filter row:
    - session defaults to current;
    - changing session resets class and section;
    - changing class resets section;
    - the section is auto-picked when only one exists.
  - Optionally sync the filters to URL search params, so a refresh or a shared link keeps them.
  - The new Student Attendance page already has this logic inline. Extract it from there.

## Part B — Same UX issues found on other pages

### Wrong or hardcoded session
- [x] **B1. Analytics → Overview and Finance default to the wrong session.**
  - `AnalyticsOverviewTab.tsx:29` and `AnalyticsFinanceTab.tsx:45` do
    `useState(() => sessionOptions[1]?.value)`.
  - With options starting at 2023, index 1 is **2024-2025**, not the current **2026-2027**.
  - Fix: default to `currentSession` (A2).
- [x] **B2. Finance header badge is hardcoded.**
  - `Admin/pages/Finance.tsx:678` reads `Session 2025-2026`.
  - Fix: add a session selector (default current) that scopes the fee and salary tabs, and show
    the chosen session in the badge.
- [x] **B3. Bulk Import template hardcodes the example session.**
  - `BulkImportStudentsDialog.tsx:163` uses `'2025-2026'`.
  - Fix: use the current session instead.

### Combined or misordered selectors
- [x] **B4. Teacher → Class Attendance uses one combined picker.**
  - `Teacher/pages/Attendance.tsx:290` stores a single `"className|section"` key.
  - Split it into Class → Section, limited to the teacher's own classes from their timetable.
- [x] **B5. Admin → Students filter order and default.**
  - The filters are Class → Section → Session, and session defaults to "All".
  - Reorder to Session → Class → Section with session defaulting to current (keep an "All
    sessions" option).
  - Make the class list depend on the chosen session.
- [x] **B6. Admin → Classes has no session filter.**
  - Every year's classes show in one list.
  - Add a session selector (default current) and an "Show archived" toggle.
  - **Bug:** `studentCountByClass` is keyed by `className-section` with no session. Students from
    last year's 5-A are counted in this year's 5-A, and this also affects the delete-guard count.
    Key it by `classId` instead.
- [x] **B7. Admin → Exams has only free-text search.**
  - Add Session → Class → Section filters (an exam already belongs to a class, and the class has a
    session).
  - The header badge counts filtered schedules. Label it accordingly.
- [x] **B8. Teacher → Results and Admin → Analytics → Academics exam pickers.**
  - Both are one long "Title — Class X-Y" list across all years.
  - Add a session filter (default current), then class → exam.
- [x] **B9. Analytics → Fee defaulters and dues lists.**
  - These show `className-section` text with no filter.
  - Add the shared filter bar (A5).

### From/To where a month is meant
- [x] **B10. Analytics → Attendance still uses From/To dates.**
  - `AnalyticsAttendanceTab.tsx:56-57`.
  - Switch to Session → Month (default current month), with an optional "Whole session" choice.
- [x] **B11. Month pickers aren't bounded to a session.**
  - Affected: Student → Attendance, Teacher → My Attendance, Analytics → Staff, Teacher detail
    salary month.
  - They use a raw `<input type="month">` that allows any month.
  - Use a session-scoped month dropdown (April–March), like Student Attendance, so users can't
    pick months outside the academic year.

### Tabs, empty states, consistency
- [x] **B12. Finance header "Collect Fee" button shows on every tab.**
  - It appears on the Teacher Salary, Expenses and Activity Log tabs too.
  - Make the Finance tabs controlled, and show the action matching each tab: Collect Fee / Pay
    Honorarium / Add Expense / none.
- [x] **B13. Subjects "Add Subject" button.**
  - On the "By Class" tab this should be "Assign Subject to Class", or hidden.
- [x] **B14. Student and Teacher timetable pages.**
  - Apply the same "default blank grid" fix done for Admin → Timetable, so an empty day/period
    shows as a free slot rather than "No timetable".
- [x] **B15. Tables are hard to compare.**
  - Use sticky headers and a sticky first column for wide tables: Finance ledgers, the Analytics
    heatmap, and Results entry. This is already done in the Daily Register.
- [x] **B16. Export buttons.**
  - Add CSV/Excel/PDF export, plus print-friendly CSS, to:
    - the attendance views (all three tabs);
    - fee dues;
    - results;
    - the class list.
  - Schools print these constantly.

## Part C — Data-model issues that block good UX

- [x] **C1. Only one calendar event per day.**
  - `AcademicCalendar.date` is `@unique` in `schema.prisma`.
  - Two events on the same day (for example "Holiday" plus "PTM") fail to save.
  - Drop the unique constraint.
  - Optionally add `endDate` (multi-day holidays and exam weeks) and `description`.
- [x] **C2. Holidays aren't connected to attendance.**
  - Calendar `HOLIDAY` days and Sundays should show as "H" in the Daily Register.
  - They should also be blocked from attendance marking.
  - They should be excluded from "working days" when calculating attendance %.
- [x] **C3. Notices have no class/section targeting.**
  - `Notice` only has `targetRole`.
  - Add optional `classIds[]` so a notice can go to "Class 8 only".
- [x] **C4. No exam per-subject timetable.**
  - Exams have only `dateFrom`/`dateTo`.
  - Add a per-subject date and time (date sheet), and show it to students.

---

## Part D — Features worth adding (common School ERP gaps)

Roughly in priority order for an Indian K-12 school.

### High value / builds on what exists
1. **[x] Report cards (PDF).** — done: `GET /admin/exam/:examId/report-cards` + `GET /student/report-card/:examId`
   (shared `backend/src/shared/helpers/reportCard.ts`), admin page `/admin/exams/:examId/report-cards`
   (print all / one, tabulation CSV), student result page now shows the same card. Class-teacher remarks are a
   blank line on the printout until D10 (class teacher) exists.
   - Term-wise marksheet per student, generated from `ExamResult`.
   - Grade scale, rank in class, attendance %, class-teacher remarks, principal signature.
   - Bulk-print for a whole class.
2. **[~] Fee receipts and reminders.**
   - [x] Printable/PDF receipt with a receipt number on every collection. Done: marking a fee Paid asks
     for the payment mode (+ UPI id / cheque no.) and assigns `RCT/<FY>/<serial>` from a `Counter`
     collection (`backend/src/shared/helpers/receiptNo.ts`), kept if the fee is ever un-paid and re-paid.
     Shared `components/finance/FeeReceipt.tsx` (breakdown, amount in words) on the admin ledger, Monthly
     Status, Finance-role fees page and the student's Fees page. Needs `npx prisma db push` (Counter's
     unique index). Fees paid before this show `OLD/<id>` instead of a number.
   - [x] Due-date and late-fine rules. Done: `FeeSettings` (due day; no fine / flat / per-day with cap) edited
     from Finance → "Fee Rules" (Admin only; Finance role can read). Every fee list shows the due date or
     "Overdue · +₹X fine"; Record Payment pre-fills the fine (editable / waivable) and saves it as a
     "Late Fine" breakdown line, so it's on the receipt. Shared maths in `contracts/src/admin/feeSettings.ts`.
   - Concessions and scholarships (sibling or staff-ward discount).
   - A defaulters list with SMS/WhatsApp/email reminders.
3. **Online fee payment.**
   - Use Razorpay or PhonePe; `.env.example` already has PhonePe placeholders.
   - Webhook → `Transaction` + receipt.
4. **Parent role/portal.**
   - One parent login linked to multiple children (siblings).
   - Shows attendance, fees, results, notices and the homework diary.
   - Today, only the student account sees any of this.
5. **Absence notifications.**
   - When attendance is marked, auto-notify parents of absent students by SMS, WhatsApp or push.
6. **Leave requests.**
   - Student or parent applies → class teacher approves → attendance auto-marked `Leave`.
   - The same flow for teacher leave → admin approves.
7. **Homework / assignments.**
   - Teacher posts per class and subject, with an attachment and due date.
   - Students see it and submit.
   - The teacher marks it done or reviewed.
8. **Promotion / new-session rollover wizard.**
   - At the end of a session:
     - create next session's classes;
     - promote students in bulk, with fail/detain exceptions;
     - carry over fee structures.
   - Promotion exists per class (`ClassDetail.tsx`). A whole-school wizard is missing.
9. **Fee structure templates.**
   - Define fees per class per session (tuition, transport, exam, …).
   - Auto-generate monthly `StudentFee` rows, instead of entering each one.
10. **Class teacher assignment.**
    - Mark one teacher as class teacher of a class.
    - That teacher owns attendance, remarks and report-card sign-off.

### Medium value
11. **Admissions / enquiry pipeline.** Enquiry → application → admitted → creates the Student record.
12. **Transfer / Leaving Certificate (TC)**, bonafide and character certificates, generated from
    student data.
13. **Student ID cards** (printable, with photo and QR code).
14. **Substitution / teacher absence.**
    - When a teacher is absent, show their periods today.
    - Assign free teachers, using timetable conflict detection, which already exists.
15. **Audit log beyond finance.**
    - `FinanceAuditLog` exists.
    - Extend logging to student edits, mark changes after publish, and attendance edits.
16. **[x] Role-based route guards in the frontend.** — already done: `RequireRole` in
    `components/layout/route-wrappers.tsx` redirects logged-out users to login and wrong roles to their home.
    - CLAUDE.md notes that `*RouteWrapper` doesn't check auth or role.
    - This is a security/UX gap: a student can open `/admin/...` URLs and only gets API errors.
17. **Dashboard "today" widgets.**
    - Classes not yet marked for attendance today.
    - Today's absentees count.
    - Fees collected today.
    - Upcoming events this week.
    - Birthdays.

### Optional modules
- Transport: routes, stops, vehicle, transport fee.
- Library: books, issue/return, fines.
- Hostel.
- Inventory.
- Payroll with PF/ESI, and payslip PDF.
- Timetable auto-generator.
- Online exams/quizzes.
- Mobile app / PWA for parents.

---

## Suggested order
1. Part A (shared helpers): small, unblocks everything.
2. Quick bug fixes:
   - B1 (wrong default session);
   - B2/B3 (hardcoded sessions);
   - B6 (student count across sessions);
   - C1 (one event per day).
3. B4–B13: apply the filter bar and tab-scoped actions page by page.
4. C2 (holidays in attendance), then D1 report cards, D2 fee receipts, and D16 route guards.
5. Pick from Part D based on what the school asks for most (usually the parent portal plus
   notifications).
