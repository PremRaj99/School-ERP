import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing existing database...');
  await prisma.examResult.deleteMany();
  await prisma.examSubject.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.timeTable.deleteMany();
  await prisma.studentAttendance.deleteMany();
  await prisma.teacherAttendance.deleteMany();
  await prisma.feeBreakdown.deleteMany();
  await prisma.studentFee.deleteMany();
  await prisma.teacherSalary.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.student.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.classAttendance.deleteMany();
  await prisma.class.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.notice.deleteMany();
  await prisma.academicCalendar.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding database...');

  // Hashed passwords
  const adminPassword = await bcrypt.hash('admin123', 10);
  const teacher1Password = await bcrypt.hash('T101', 10);
  const teacher2Password = await bcrypt.hash('T102', 10);
  const student1Password = await bcrypt.hash('S101', 10);
  const student2Password = await bcrypt.hash('S102', 10);
  const student3Password = await bcrypt.hash('S103', 10);

  // 1. Create Users
  const adminUser = await prisma.user.create({
    data: {
      username: 'admin',
      password: adminPassword,
      role: 'Admin',
    },
  });

  const t1User = await prisma.user.create({
    data: {
      username: 'teacher1',
      password: teacher1Password,
      role: 'Teacher',
    },
  });

  const t2User = await prisma.user.create({
    data: {
      username: 'teacher2',
      password: teacher2Password,
      role: 'Teacher',
    },
  });

  const s1User = await prisma.user.create({
    data: {
      username: 'student1',
      password: student1Password,
      role: 'Student',
    },
  });

  const s2User = await prisma.user.create({
    data: {
      username: 'student2',
      password: student2Password,
      role: 'Student',
    },
  });

  const s3User = await prisma.user.create({
    data: {
      username: 'student3',
      password: student3Password,
      role: 'Student',
    },
  });

  // 2. Create Classes
  const class10A = await prisma.class.create({
    data: {
      className: 'Class 10',
      section: 'A',
      session: '2025-2026',
    },
  });

  const class9B = await prisma.class.create({
    data: {
      className: 'Class 9',
      section: 'B',
      session: '2025-2026',
    },
  });

  // 3. Create Subjects
  const math = await prisma.subject.create({
    data: {
      subjectName: 'Mathematics',
      subjectCode: 'MATH101',
    },
  });

  const science = await prisma.subject.create({
    data: {
      subjectName: 'Science',
      subjectCode: 'SCI101',
    },
  });

  const english = await prisma.subject.create({
    data: {
      subjectName: 'English',
      subjectCode: 'ENG101',
    },
  });

  // 4. Create Teachers
  const teacher1 = await prisma.teacher.create({
    data: {
      serialNumber: 1,
      teacherId: 'T101',
      userId: t1User.id,
      firstName: 'Emily',
      lastName: 'Watson',
      dob: new Date('1985-05-15'),
      address: '742 Evergreen Terrace, Springfield',
      phone: '9876543210',
      teacherAadhar: '123456789012',
      qualifications: 'M.Sc in Mathematics, B.Ed',
      subjectHandled: ['Mathematics'],
      salaryPerMonth: 6500,
    },
  });

  const teacher2 = await prisma.teacher.create({
    data: {
      serialNumber: 2,
      teacherId: 'T102',
      userId: t2User.id,
      firstName: 'Robert',
      lastName: 'Smith',
      dob: new Date('1990-08-20'),
      address: '10 Downing Street, London',
      phone: '9876543211',
      teacherAadhar: '123456789013',
      qualifications: 'Ph.D in Physics',
      subjectHandled: ['Science', 'English'],
      salaryPerMonth: 7000,
    },
  });

  // 5. Create Students
  const student1 = await prisma.student.create({
    data: {
      serialNumber: 1,
      studentId: 'S101',
      userId: s1User.id,
      firstName: 'Leo',
      lastName: 'Messi',
      dob: new Date('2010-06-24'),
      address: 'Rosario, Argentina',
      phone: '9876543212',
      classId: class10A.id,
      rollNo: 1,
    },
  });

  const student2 = await prisma.student.create({
    data: {
      serialNumber: 2,
      studentId: 'S102',
      userId: s2User.id,
      firstName: 'Cristiano',
      lastName: 'Ronaldo',
      dob: new Date('2010-02-05'),
      address: 'Funchal, Madeira, Portugal',
      phone: '9876543213',
      classId: class10A.id,
      rollNo: 2,
    },
  });

  const student3 = await prisma.student.create({
    data: {
      serialNumber: 3,
      studentId: 'S103',
      userId: s3User.id,
      firstName: 'Neymar',
      lastName: 'Jr',
      dob: new Date('2011-02-05'),
      address: 'Mogi das Cruzes, Brazil',
      phone: '9876543214',
      classId: class10A.id,
      rollNo: 3,
    },
  });

  // 6. Timetable
  await prisma.timeTable.createMany({
    data: [
      {
        classId: class10A.id,
        weekday: 'MON',
        period: 1,
        subjectId: math.id,
        teacherId: teacher1.id,
      },
      {
        classId: class10A.id,
        weekday: 'MON',
        period: 2,
        subjectId: science.id,
        teacherId: teacher2.id,
      },
      {
        classId: class10A.id,
        weekday: 'TUE',
        period: 1,
        subjectId: english.id,
        teacherId: teacher2.id,
      },
      {
        classId: class10A.id,
        weekday: 'WED',
        period: 3,
        subjectId: math.id,
        teacherId: teacher1.id,
      },
    ],
  });

  // 7. Notices
  await prisma.notice.createMany({
    data: [
      {
        title: 'Annual Sports Day Meet',
        description: 'Annual sports track event starts on next Friday. Everyone must participate.',
        targetRole: 'All',
      },
      {
        title: 'Faculty Meeting: Syllabus Review',
        description:
          'All teachers must attend the board syllabus review meeting in conference room A.',
        targetRole: 'Teacher',
      },
      {
        title: 'Mid-Term Results Declared',
        description: 'Students can now check their Mid-Term grades from the Exams tab.',
        targetRole: 'Student',
      },
    ],
  });

  // 8. Academic Calendar
  await prisma.academicCalendar.createMany({
    data: [
      { title: 'Summer Vacation Break', date: new Date('2026-06-01'), category: 'HOLIDAY' },
      { title: 'Independence Day Assembly', date: new Date('2026-08-15'), category: 'EVENT' },
      { title: 'Mid-Term Examinations Begin', date: new Date('2026-10-10'), category: 'EXAM' },
    ],
  });

  // 9. Teacher Attendance logs
  await prisma.teacherAttendance.createMany({
    data: [
      { teacherId: teacher1.id, date: new Date('2026-07-01'), status: 'Present' },
      { teacherId: teacher1.id, date: new Date('2026-07-02'), status: 'Present' },
      { teacherId: teacher1.id, date: new Date('2026-07-03'), status: 'Leave' },
      { teacherId: teacher2.id, date: new Date('2026-07-01'), status: 'Present' },
      { teacherId: teacher2.id, date: new Date('2026-07-02'), status: 'Absent' },
    ],
  });

  // 10. Class/Student Attendance logs
  const classAttendance1 = await prisma.classAttendance.create({
    data: { classId: class10A.id, date: new Date('2026-07-01'), isMarked: true },
  });

  const classAttendance2 = await prisma.classAttendance.create({
    data: { classId: class10A.id, date: new Date('2026-07-02'), isMarked: true },
  });

  await prisma.studentAttendance.createMany({
    data: [
      { studentId: student1.id, date: new Date('2026-07-01'), status: 'Present' },
      { studentId: student2.id, date: new Date('2026-07-01'), status: 'Present' },
      { studentId: student3.id, date: new Date('2026-07-01'), status: 'Absent' },
      { studentId: student1.id, date: new Date('2026-07-02'), status: 'Present' },
      { studentId: student2.id, date: new Date('2026-07-02'), status: 'Leave' },
      { studentId: student3.id, date: new Date('2026-07-02'), status: 'Present' },
    ],
  });

  // 11. Exams & Results setup
  const exam = await prisma.exam.create({
    data: {
      classId: class10A.id,
      title: 'First Mid-Term Exam',
      dateFrom: new Date('2026-07-10'),
      dateTo: new Date('2026-07-12'),
      isResultDecleared: true,
    },
  });

  const examMath = await prisma.examSubject.create({
    data: {
      examId: exam.id,
      subjectId: math.id,
      teacherId: teacher1.id,
      fullMarks: 100,
      date: new Date('2026-07-10'),
      isMarked: true,
    },
  });

  const examSci = await prisma.examSubject.create({
    data: {
      examId: exam.id,
      subjectId: science.id,
      teacherId: teacher2.id,
      fullMarks: 100,
      date: new Date('2026-07-11'),
      isMarked: true,
    },
  });

  await prisma.examResult.createMany({
    data: [
      {
        examSubjectId: examMath.id,
        studentId: student1.id,
        marksObtained: 95,
        grade: 'A+',
        remark: 'Outstanding mathematical skills!',
      },
      {
        examSubjectId: examMath.id,
        studentId: student2.id,
        marksObtained: 88,
        grade: 'A',
        remark: 'Very good',
      },
      {
        examSubjectId: examMath.id,
        studentId: student3.id,
        marksObtained: 72,
        grade: 'B',
        remark: 'Needs more practice',
      },
      {
        examSubjectId: examSci.id,
        studentId: student1.id,
        marksObtained: 89,
        grade: 'A',
        remark: 'Excellent analysis',
      },
      {
        examSubjectId: examSci.id,
        studentId: student2.id,
        marksObtained: 91,
        grade: 'A+',
        remark: 'Top class scientific experiment',
      },
      {
        examSubjectId: examSci.id,
        studentId: student3.id,
        marksObtained: 65,
        grade: 'C',
        remark: 'Study harder',
      },
    ],
  });

  // 12. Payroll / Teacher Salary slip transactions
  const txnSal1 = await prisma.transaction.create({
    data: {
      title: 'Monthly Salary Credit - July',
      finalAmount: 6500,
      status: 'Paid',
      category: 'Salary',
    },
  });

  const txnSal2 = await prisma.transaction.create({
    data: {
      title: 'Monthly Salary Credit - July',
      finalAmount: 7000,
      status: 'Paid',
      category: 'Salary',
    },
  });

  await prisma.teacherSalary.createMany({
    data: [
      { teacherId: teacher1.id, transactionId: txnSal1.id, month: new Date('2026-07-31') },
      { teacherId: teacher2.id, transactionId: txnSal2.id, month: new Date('2026-07-31') },
    ],
  });

  // 13. Fees / Student Fee transaction with breakdown
  const txnFee1 = await prisma.transaction.create({
    data: {
      title: 'Term Tuition Fee Receipts',
      finalAmount: 450,
      status: 'Paid',
      category: 'Fee',
    },
  });

  const txnFee2 = await prisma.transaction.create({
    data: {
      title: 'Term Tuition Fee Receipts',
      finalAmount: 450,
      status: 'Paid',
      category: 'Fee',
    },
  });

  const studentFee1 = await prisma.studentFee.create({
    data: {
      studentId: student1.id,
      transactionId: txnFee1.id,
      month: new Date('2026-07-01'),
    },
  });

  const studentFee2 = await prisma.studentFee.create({
    data: {
      studentId: student2.id,
      transactionId: txnFee2.id,
      month: new Date('2026-07-01'),
    },
  });

  await prisma.feeBreakdown.createMany({
    data: [
      { studentFeeId: studentFee1.id, feeType: 'Tuition Fee', amount: 350 },
      { studentFeeId: studentFee1.id, feeType: 'Library Card Fee', amount: 50 },
      { studentFeeId: studentFee1.id, feeType: 'Laboratory Access Fee', amount: 50 },
      { studentFeeId: studentFee2.id, feeType: 'Tuition Fee', amount: 350 },
      { studentFeeId: studentFee2.id, feeType: 'Library Card Fee', amount: 50 },
      { studentFeeId: studentFee2.id, feeType: 'Laboratory Access Fee', amount: 50 },
    ],
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
