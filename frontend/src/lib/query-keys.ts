/**
 * Central query-key factory — every `useQuery`/`useMutation({ queryKey/invalidateQueries })` call
 * should build its key from here instead of an inline string array. Keeps the keys a mutation
 * invalidates in sync with the keys a query registers under, and makes "what does this page
 * refetch" greppable from one file (ALIGNMENT_PLAN.md Phase 4).
 */
export const qk = {
  auth: {
    profile: () => ['auth', 'profile'] as const,
  },
  user: {
    profile: () => ['user', 'profile'] as const,
  },
  admin: {
    dashboard: () => ['admin', 'dashboard'] as const,
    // `query` is deliberately omittable rather than always-present-as-`undefined` — calling with
    // no args gives the bare `['admin', 'students']` prefix, which `invalidateQueries` needs to
    // match every specific page/filter variant cached under it. If it always included a trailing
    // `undefined`, invalidating after a mutation would only ever match the *exact* no-args query,
    // silently missing every paginated/filtered one actually on screen.
    students: (query?: Record<string, unknown>) =>
      query ? (['admin', 'students', query] as const) : (['admin', 'students'] as const),
    student: (studentId: string) => ['admin', 'students', 'detail', studentId] as const,
    teachers: (query?: Record<string, unknown>) =>
      query ? (['admin', 'teachers', query] as const) : (['admin', 'teachers'] as const),
    teacher: (teacherId: string) => ['admin', 'teachers', 'detail', teacherId] as const,
    classes: (query?: Record<string, unknown>) =>
      query ? (['admin', 'classes', query] as const) : (['admin', 'classes'] as const),
    subjects: () => ['admin', 'subjects'] as const,
    subjectsGrouped: () => ['admin', 'subjects', 'grouped'] as const,
    // Same omittable-query pattern as `students`/`teachers` above.
    exams: (query?: Record<string, unknown>) =>
      query ? (['admin', 'exams', query] as const) : (['admin', 'exams'] as const),
    exam: (examId: string) => ['admin', 'exams', 'detail', examId] as const,
    notices: (query?: Record<string, unknown>) =>
      query ? (['admin', 'notices', query] as const) : (['admin', 'notices'] as const),
    notice: (noticeId: string) => ['admin', 'notices', 'detail', noticeId] as const,
    timetable: () => ['admin', 'timetable'] as const,
    calendar: () => ['admin', 'calendar'] as const,
    contactMessages: (query?: Record<string, unknown>) =>
      query
        ? (['admin', 'contact-messages', query] as const)
        : (['admin', 'contact-messages'] as const),
    studentFees: (query?: Record<string, unknown>) =>
      query ? (['admin', 'student-fees', query] as const) : (['admin', 'student-fees'] as const),
    teacherSalaries: (query?: Record<string, unknown>) =>
      query
        ? (['admin', 'teacher-salaries', query] as const)
        : (['admin', 'teacher-salaries'] as const),
    transactions: (query?: Record<string, unknown>) =>
      query ? (['admin', 'transactions', query] as const) : (['admin', 'transactions'] as const),
    expenseCategories: () => ['admin', 'expense-categories'] as const,
    financeAuditLogs: (query?: Record<string, unknown>) =>
      query
        ? (['admin', 'finance-audit-logs', query] as const)
        : (['admin', 'finance-audit-logs'] as const),
    teacherAttendanceByDate: (date: string) =>
      ['admin', 'teacher-attendance', 'date', date] as const,
    teacherAttendanceByMonth: (teacherId: string, month: string) =>
      ['admin', 'teacher-attendance', 'teacher', teacherId, month] as const,
    analyticsOverview: (session?: string) => ['admin', 'analytics', 'overview', session] as const,
    analyticsAttendance: (from: string, to: string, className?: string, section?: string) =>
      ['admin', 'analytics', 'attendance', from, to, className, section] as const,
    analyticsAcademics: (examId: string) => ['admin', 'analytics', 'academics', examId] as const,
    analyticsFinance: (session?: string) => ['admin', 'analytics', 'finance', session] as const,
    analyticsStaff: (month: string) => ['admin', 'analytics', 'staff', month] as const,
    studentAttendanceReport: (classId: string, from: string, to: string) =>
      ['admin', 'student-attendance-report', classId, from, to] as const,
  },
  student: {
    profile: () => ['student', 'profile'] as const,
    dashboard: () => ['student', 'dashboard'] as const,
    analytics: () => ['student', 'analytics'] as const,
    attendance: (month: string) => ['student', 'attendance', month] as const,
    subjects: () => ['student', 'subjects'] as const,
    exams: () => ['student', 'exams'] as const,
    result: (examId: string) => ['student', 'result', examId] as const,
    notices: () => ['student', 'notices'] as const,
    notice: (noticeId: string) => ['student', 'notices', noticeId] as const,
    timetable: () => ['student', 'timetable'] as const,
    calendar: () => ['student', 'calendar'] as const,
    fees: (year: string) => ['student', 'fees', year] as const,
    fee: (feeId: string) => ['student', 'fees', 'detail', feeId] as const,
  },
  finance: {
    dashboard: () => ['finance', 'dashboard'] as const,
    fees: (query?: Record<string, unknown>) =>
      query ? (['finance', 'fees', query] as const) : (['finance', 'fees'] as const),
    fee: (feeId: string) => ['finance', 'fees', 'detail', feeId] as const,
    salaries: (query?: Record<string, unknown>) =>
      query ? (['finance', 'salaries', query] as const) : (['finance', 'salaries'] as const),
    salary: (salaryId: string) => ['finance', 'salaries', 'detail', salaryId] as const,
    expenses: (query?: Record<string, unknown>) =>
      query ? (['finance', 'expenses', query] as const) : (['finance', 'expenses'] as const),
    expenseCategories: () => ['finance', 'expense-categories'] as const,
    analytics: (session?: string) => ['finance', 'analytics', session] as const,
    studentDirectory: () => ['finance', 'student-directory'] as const,
    teacherDirectory: () => ['finance', 'teacher-directory'] as const,
  },
  teacher: {
    profile: () => ['teacher', 'profile'] as const,
    dashboard: () => ['teacher', 'dashboard'] as const,
    analytics: (session?: string) => ['teacher', 'analytics', session] as const,
    myAttendance: (month: string) => ['teacher', 'my-attendance', month] as const,
    classAttendanceList: (month: string) => ['teacher', 'class-attendance', month] as const,
    classAttendanceDetail: (classAttendanceId: string) =>
      ['teacher', 'class-attendance', 'detail', classAttendanceId] as const,
    classRoster: (className: string, section: string) =>
      ['teacher', 'class-roster', className, section] as const,
    timetable: () => ['teacher', 'timetable'] as const,
    calendar: () => ['teacher', 'calendar'] as const,
    exams: () => ['teacher', 'exams'] as const,
    examDetail: (examId: string) => ['teacher', 'exams', examId] as const,
    result: (examId: string, subjectId: string) =>
      ['teacher', 'result', examId, subjectId] as const,
    notices: () => ['teacher', 'notices'] as const,
    notice: (noticeId: string) => ['teacher', 'notices', noticeId] as const,
    salary: () => ['teacher', 'salary'] as const,
  },
} as const;
