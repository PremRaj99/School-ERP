export interface Student {
  id?: string;
  _id?: string;
  studentId: string;
  serialNumber?: number;
  userId?: string;
  firstName: string;
  lastName?: string | null;
  dob?: string;
  address?: string | null;
  phone: string;
  fatherName?: string | null;
  motherName?: string | null;
  fatherOccupation?: string | null;
  motherOccupation?: string | null;
  motherAadhar?: string | null;
  studentAadhar?: string | null;
  fatherAadhar?: string | null;
  dateOfAdmission?: string;
  classId?: string;
  className?: string;
  section?: string;
  session?: string;
  rollNo: number;
  appId?: string | null;
  profilePhoto?: string;
  class?: {
    id?: string;
    className: string;
    section: string;
    session: string;
  };
}

export interface StudentPayload {
  firstName: string;
  lastName?: string;
  dob: string;
  address?: string;
  phone: string;
  fatherName?: string;
  motherName?: string;
  fatherOccupation?: string;
  motherOccupation?: string;
  studentAadhar?: string;
  fatherAadhar?: string;
  motherAadhar?: string;
  className: string;
  section: string;
  session: string;
  dateOfAdmission?: string;
  rollNo: number;
  appId?: string;
  profilePhoto?: string;
}

export interface Teacher {
  id?: string;
  _id?: string;
  teacherId: string;
  serialNumber?: number;
  userId?: string;
  firstName: string;
  lastName?: string | null;
  dob?: string;
  address?: string | null;
  phone: string;
  teacherAadhar?: string | null;
  dateOfJoining?: string;
  about?: string | null;
  profilePhoto?: string;
  qualifications: string;
  subjectHandled?: string[];
  subjectsHandled?: string[];
  salaryPerMonth: number;
}

export interface TeacherPayload {
  firstName: string;
  lastName?: string;
  dob: string;
  address?: string;
  phone: string;
  teacherAadhar?: string;
  dateOfJoining?: string;
  about?: string;
  profilePhoto?: string;
  qualifications: string;
  subjectHandled?: string[];
  subjectsHandled?: string[];
  salaryPerMonth: number;
}

export interface ClassItem {
  id?: string;
  _id?: string;
  className: string;
  section: string;
  session: string;
}

export interface CreateClassPayload {
  className: string;
  section: string;
  session: string;
}

export interface SubjectItem {
  id?: string;
  _id?: string;
  subjectName: string;
  subjectCode: string;
}

export interface CreateSubjectPayload {
  subjectName: string;
  subjectCode?: string;
}

export interface UpdateSubjectPayload {
  subjectName: string;
}

export interface ExamSubjectInfo {
  id?: string;
  _id?: string;
  subjectId?: string;
  subjectCode?: string;
  subjectName?: string;
  fullMarks: number;
  teacherId: string;
  date: string;
  isMarked?: boolean;
}

export interface ExamClassGroup {
  className: string;
  section: string;
  subjects?: ExamSubjectInfo[];
}

export interface Exam {
  id?: string;
  _id?: string;
  title: string;
  dateFrom: string;
  dateTo?: string | null;
  isResultDecleared: boolean;
  classId?: string;
  className?: string;
  section?: string;
  session?: string;
  exams?: ExamClassGroup[];
  examSubjects?: ExamSubjectInfo[];
}

export interface CreateExamPayload {
  title: string;
  dateFrom: string;
  dateTo?: string;
  className: string;
  section: string;
  session: string;
  subjects: Array<{
    subjectCode: string;
    fullMarks: number;
    teacherId: string;
    date: string;
  }>;
}

export interface ExamResult {
  id?: string;
  _id?: string;
  studentId: string;
  marksObtained: number;
  grade?: string;
  remark?: string | null;
}

export interface Notice {
  id?: string;
  _id?: string;
  title: string;
  description?: string | null;
  fileUrl?: string | null;
  targetRole: 'Student' | 'Teacher' | 'All';
  date: string;
  expiryDate?: string | null;
}

export interface CreateNoticePayload {
  title: string;
  description?: string;
  fileUrl?: string;
  targetRole: 'Student' | 'Teacher' | 'All';
  expiryDate?: string;
}

export interface TimeTableSlot {
  id?: string;
  _id?: string;
  weekday: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | string;
  period: number;
  subjectCode?: string;
  subjectName?: string;
  subjectId?: string;
  teacherId?: string;
  className?: string;
  section?: string;
}

export interface UpdateTimetableSlotPayload {
  className: string;
  section: string;
  session: string;
  weekday: string;
  period: number;
  subjectCode: string;
  teacherId: string;
}

export interface CalendarEvent {
  id?: string;
  _id?: string;
  title: string;
  date: string;
  category: 'HOLIDAY' | 'EVENT' | 'EXAM' | 'OTHER' | string;
}

export interface CreateCalendarEventPayload {
  title: string;
  date: string;
  category: string;
}

export interface FeeBreakdownItem {
  id?: string;
  feeType: string;
  amount: number;
}

export interface StudentFee {
  id?: string;
  _id?: string;
  studentId: string;
  transactionId?: string;
  month: string;
  finalAmount?: number;
  amount?: number;
  status?: string;
  isPaid?: boolean;
  paidAt?: string | null;
  feeBreakdown?: FeeBreakdownItem[];
}

export interface TeacherSalary {
  id?: string;
  _id?: string;
  teacherId: string;
  transactionId?: string;
  month: string;
  amount?: number;
  finalAmount?: number;
  status?: string;
  isPaid?: boolean;
  paidAt?: string | null;
}

export interface Transaction {
  id?: string;
  _id?: string;
  title: string;
  finalAmount: number;
  status: 'Paid' | 'Pending' | 'Failed' | string;
  category: 'Utility' | 'Infrastructure' | 'Fee' | 'Salary' | 'Other' | string;
  createdAt: string;
}

export interface CreateStudentFeePayload {
  studentId: string;
  month: string;
  feeBreakdown: Array<{ feeType: string; amount: number }>;
}

export interface CreateTeacherSalaryPayload {
  teacherId: string;
  month: string;
  amount: number;
}

export interface CreateTransactionPayload {
  title: string;
  finalAmount: number;
  status: string;
  category: string;
}

export interface AttendanceRecord {
  id?: string;
  _id?: string;
  date: string;
  status: 'Present' | 'Absent' | 'Leave' | string;
  studentId?: string;
  teacherId?: string;
}

export interface ClassAttendanceDetail {
  id?: string;
  _id?: string;
  classId?: string;
  className?: string;
  section?: string;
  date: string;
  isMarked?: boolean;
  attendance?: Array<{
    id?: string;
    studentId: string;
    status: 'Present' | 'Absent' | 'Leave' | string;
  }>;
}

export interface ContactMessage {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  mobile: string;
  message: string;
  createdAt?: string;
}

export interface AdminDashboardData {
  counts?: {
    students?: number;
    teachers?: number;
    classes?: number;
    [key: string]: unknown;
  };
  finance?: {
    pendingStudentFees?: {
      count?: number;
      totalAmount?: number;
    };
    pendingTeacherSalaries?: {
      count?: number;
      totalAmount?: number;
    };
  };
  [key: string]: unknown;
}

export interface StudentDashboardData {
  profile?: {
    firstName?: string;
    lastName?: string;
    className?: string;
    section?: string;
    rollNo?: number;
    [key: string]: unknown;
  };
  attendanceThisMonth?: {
    present?: number;
    absent?: number;
    leave?: number;
    total?: number;
  };
  upcomingExams?: unknown[];
  pendingFees?: {
    totalAmount?: number;
    count?: number;
  };
  [key: string]: unknown;
}

export interface TeacherDashboardData {
  profile?: {
    firstName?: string;
    lastName?: string;
    teacherId?: string;
    [key: string]: unknown;
  };
  attendanceThisMonth?: {
    present?: number;
    absent?: number;
    leave?: number;
    total?: number;
  };
  pendingResultEntries?: unknown[];
  todaySchedule?: unknown[];
  pendingSalary?: {
    count?: number;
    totalAmount?: number;
  };
  [key: string]: unknown;
}
