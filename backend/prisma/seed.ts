import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Deterministic helpers
// ---------------------------------------------------------------------------

/** Deterministic 0..1 pseudo-random value from any number of integer seeds — same seed always
 * produces the same value, so re-running this script always produces the same dataset. */
function rand(...seeds: number[]): number {
  let h = 2166136261;
  for (const s of seeds) {
    h ^= s;
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
}

function pad(n: number, width = 8): string {
  return String(n).padStart(width, '0');
}

const D = (iso: string) => new Date(`${iso}T00:00:00.000Z`);
const MONTH = (iso: string) => new Date(`${iso}-01T00:00:00.000Z`);

/** All Mon-Sat calendar dates in [start, end] inclusive (school week — no Sunday). */
function schoolDays(start: string, end: string): Date[] {
  const days: Date[] = [];
  const cur = D(start);
  const stop = D(end);
  while (cur <= stop) {
    if (cur.getUTCDay() !== 0) days.push(new Date(cur));
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return days;
}

const WEEKDAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] as const;

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
  await prisma.contact.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding database...');

  // =========================================================================
  // 1. Admin
  // =========================================================================
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.create({
    data: { username: 'admin', password: adminPassword, role: 'Admin' },
  });

  // =========================================================================
  // 2. Classes — 6 active (current session) + 1 archived (prior session, already
  //    promoted out) so the promotion flow, archived-class filters, and cross-session
  //    analytics all have something to show.
  // =========================================================================
  const CURRENT_SESSION = '2026-2027'; // matches getCurrentSessionYear() as of 2026-08-24
  const PRIOR_SESSION = '2025-2026';

  const classDefs = [
    { className: '8', section: 'A', session: CURRENT_SESSION, isArchived: false },
    { className: '8', section: 'B', session: CURRENT_SESSION, isArchived: false }, // kept small — promotion-flow test
    { className: '9', section: 'A', session: CURRENT_SESSION, isArchived: false },
    { className: '9', section: 'B', session: CURRENT_SESSION, isArchived: false },
    { className: '10', section: 'A', session: CURRENT_SESSION, isArchived: false },
    { className: '10', section: 'B', session: CURRENT_SESSION, isArchived: false },
    { className: '9', section: 'A', session: PRIOR_SESSION, isArchived: true },
  ];
  const classes: Record<string, Awaited<ReturnType<typeof prisma.class.create>>> = {};
  for (const def of classDefs) {
    const cls = await prisma.class.create({ data: def });
    classes[`${def.className}${def.section}-${def.session}`] = cls;
  }
  const c8A = classes[`8A-${CURRENT_SESSION}`]!;
  const c8B = classes[`8B-${CURRENT_SESSION}`]!;
  const c9A = classes[`9A-${CURRENT_SESSION}`]!;
  const c9B = classes[`9B-${CURRENT_SESSION}`]!;
  const c10A = classes[`10A-${CURRENT_SESSION}`]!;
  const c10B = classes[`10B-${CURRENT_SESSION}`]!;
  const archived9A = classes[`9A-${PRIOR_SESSION}`]!;
  const activeClasses = [c8A, c8B, c9A, c9B, c10A, c10B];

  // =========================================================================
  // 3. Subjects — 6 taught, 1 ("Art") left completely unassigned to exercise
  //    the staff-analytics "subject coverage gap" report.
  // =========================================================================
  const subjectDefs = [
    { subjectName: 'Mathematics', subjectCode: 'MATH101' },
    { subjectName: 'Science', subjectCode: 'SCI101' },
    { subjectName: 'English', subjectCode: 'ENG101' },
    { subjectName: 'Hindi', subjectCode: 'HIN101' },
    { subjectName: 'Social Science', subjectCode: 'SST101' },
    { subjectName: 'Computer Science', subjectCode: 'CS101' },
    { subjectName: 'Art', subjectCode: 'ART101' },
  ];
  const subjects: Record<string, Awaited<ReturnType<typeof prisma.subject.create>>> = {};
  for (const def of subjectDefs) {
    subjects[def.subjectCode] = await prisma.subject.create({ data: def });
  }
  const math = subjects.MATH101!;
  const science = subjects.SCI101!;
  const english = subjects.ENG101!;
  const hindi = subjects.HIN101!;
  const sst = subjects.SST101!;
  const cs = subjects.CS101!;
  // Art (subjects.ART101) intentionally never assigned to a teacher or timetable slot.

  // =========================================================================
  // 4. Teachers — 8 total. T1-T5 each teach one core subject across every class.
  //    Computer Science is split between T6 (junior classes) and T8 (senior classes)
  //    to give workload analytics some variety. T7 ("Art") has zero periods/week —
  //    exercises the zero-workload edge case.
  // =========================================================================
  const teacherDefs = [
    {
      firstName: 'Emily',
      lastName: 'Watson',
      dob: '1985-05-15',
      gender: 'Female' as const,
      phone: '9800000001',
      aadhar: '900000000001',
      qualifications: 'M.Sc in Mathematics, B.Ed',
      subjectHandled: ['Mathematics'],
      salaryPerMonth: 45000,
      dateOfJoining: '2018-06-01',
      about:
        'Mathematics faculty with over a decade of experience teaching middle and senior school students, specializing in algebra and geometry.',
      subject: math,
    },
    {
      firstName: 'Robert',
      lastName: 'Smith',
      dob: '1990-08-20',
      gender: 'Male' as const,
      phone: '9800000002',
      aadhar: '900000000002',
      qualifications: 'Ph.D in Physics',
      subjectHandled: ['Science'],
      salaryPerMonth: 52000,
      dateOfJoining: '2019-07-15',
      about:
        'Science faculty focused on making physics and chemistry concepts approachable through lab demonstrations.',
      subject: science,
    },
    {
      firstName: 'Alice',
      lastName: 'Johnson',
      dob: '1988-02-11',
      gender: 'Female' as const,
      phone: '9800000003',
      aadhar: '900000000003',
      qualifications: 'M.A in English Literature, B.Ed',
      subjectHandled: ['English'],
      salaryPerMonth: 41000,
      dateOfJoining: '2020-04-10',
      about: 'English faculty with a passion for creative writing and public speaking clubs.',
      subject: english,
    },
    {
      firstName: 'Raj',
      lastName: 'Sharma',
      dob: '1982-11-30',
      gender: 'Male' as const,
      phone: '9800000004',
      aadhar: '900000000004',
      qualifications: 'M.A in Hindi Literature',
      subjectHandled: ['Hindi'],
      salaryPerMonth: 39000,
      dateOfJoining: '2016-06-01',
      about: 'Senior Hindi faculty and coordinator for the annual literary festival.',
      subject: hindi,
    },
    {
      firstName: 'Priya',
      lastName: 'Nair',
      dob: '1991-09-05',
      gender: 'Female' as const,
      phone: '9800000005',
      aadhar: '900000000005',
      qualifications: 'M.A in History, B.Ed',
      subjectHandled: ['Social Science'],
      salaryPerMonth: 40000,
      dateOfJoining: '2021-01-20',
      about: 'Social Science faculty covering history, civics, and geography for grades 8-10.',
      subject: sst,
    },
    {
      firstName: 'David',
      lastName: 'Lee',
      dob: '1993-03-18',
      gender: 'Male' as const,
      phone: '9800000006',
      aadhar: '900000000006',
      qualifications: 'B.Tech in Computer Science, M.Ed',
      subjectHandled: ['Computer Science'],
      salaryPerMonth: 48000,
      dateOfJoining: '2022-08-01',
      about: 'Computer Science faculty for junior grades, focused on programming fundamentals.',
      subject: cs,
    },
    {
      firstName: 'Maria',
      lastName: 'Garcia',
      dob: '1995-12-02',
      gender: 'Other' as const, // diversity coverage for the third enum value
      phone: '9800000007',
      aadhar: '900000000007',
      qualifications: 'B.F.A in Fine Arts',
      subjectHandled: ['Art'],
      salaryPerMonth: 32000,
      dateOfJoining: '2025-06-01',
      about:
        'Newly-joined Art faculty; the timetable has not yet been updated to include Art periods.',
      subject: null, // deliberately no timetable assignment — zero workload / coverage gap
    },
    {
      firstName: 'Michael',
      lastName: 'Brown',
      dob: '1987-07-22',
      gender: 'Male' as const,
      phone: '9800000008',
      aadhar: '900000000008',
      qualifications: 'M.Tech in Computer Science',
      subjectHandled: ['Computer Science'],
      salaryPerMonth: 50000,
      dateOfJoining: '2017-05-15',
      about: 'Computer Science faculty for senior grades, also mentors the robotics club.',
      subject: cs,
    },
  ];

  const teachers: Array<
    Awaited<ReturnType<typeof prisma.teacher.create>> & { subject: typeof math | null }
  > = [];
  for (let i = 0; i < teacherDefs.length; i++) {
    const def = teacherDefs[i]!;
    const serialNumber = i + 1;
    const teacherId = `TCH${pad(serialNumber)}`;
    const hashPassword = await bcrypt.hash(teacherId, 10);

    const user = await prisma.user.create({
      data: { username: teacherId, password: hashPassword, role: 'Teacher' },
    });

    const teacher = await prisma.teacher.create({
      data: {
        serialNumber,
        teacherId,
        userId: user.id,
        firstName: def.firstName,
        lastName: def.lastName,
        dob: D(def.dob),
        gender: def.gender,
        address: `${100 + i} Faculty Housing, School Campus, City ${i + 1}`,
        phone: def.phone,
        teacherAadhar: def.aadhar,
        dateOfJoining: D(def.dateOfJoining),
        about: def.about,
        qualifications: def.qualifications,
        subjectHandled: def.subjectHandled,
        salaryPerMonth: def.salaryPerMonth,
      },
    });
    teachers.push({ ...teacher, subject: def.subject });
  }
  const [tMath, tScience, tEnglish, tHindi, tSst, tCsJunior, tArt, tCsSenior] = teachers;

  // =========================================================================
  // 5. Students — spread across the 6 active classes (26 students) plus 2 in the
  //    archived class (one Graduated, one TransferredOut) to exercise status filters
  //    and cross-session history.
  // =========================================================================
  const firstNames = [
    'Leo',
    'Cristiano',
    'Neymar',
    'Kylian',
    'Erling',
    'Kevin',
    'Mohamed',
    'Virgil',
    'Luka',
    'Sadio',
    'Harry',
    'Sergio',
    'Bruno',
    'Vinicius',
    'Jude',
    'Phil',
    'Pedri',
    'Gavi',
    'Rodrygo',
    'Jamal',
    'Federico',
    'Marcus',
    'Riyad',
    'Ilkay',
    'Joshua',
    'Trent',
    'Declan',
    'Bukayo',
  ];
  const lastNames = [
    'Messi',
    'Ronaldo',
    'Jr',
    'Mbappe',
    'Haaland',
    'De Bruyne',
    'Salah',
    'van Dijk',
    'Modric',
    'Mane',
    'Kane',
    'Ramos',
    'Fernandes',
    'Junior',
    'Bellingham',
    'Foden',
    'Gonzalez',
    'Fernandez',
    'Silva',
    'Musiala',
    'Chiesa',
    'Rashford',
    'Mahrez',
    'Gundogan',
    'Kimmich',
    'Alexander-Arnold',
    'Rice',
    'Saka',
  ];

  // Cycle admissions across several months of the current session for a meaningful
  // admissions-by-month chart.
  const admissionDates = [
    '2026-04-05',
    '2026-04-18',
    '2026-05-02',
    '2026-05-20',
    '2026-06-03',
    '2026-06-15',
    '2026-07-01',
    '2026-07-10',
  ];

  type ClassGroup = { cls: (typeof activeClasses)[number]; count: number; ageYears: number };
  const classGroups: ClassGroup[] = [
    { cls: c8A, count: 4, ageYears: 13 },
    { cls: c8B, count: 2, ageYears: 13 },
    { cls: c9A, count: 5, ageYears: 14 },
    { cls: c9B, count: 4, ageYears: 14 },
    { cls: c10A, count: 6, ageYears: 15 },
    { cls: c10B, count: 5, ageYears: 15 },
  ];

  let studentSerial = 1;
  let nameIdx = 0;
  // studentsByClassId[classId] -> array of { student, index } for attendance/exam generation
  const studentsByClass = new Map<
    string,
    Array<{ student: Awaited<ReturnType<typeof prisma.student.create>>; idx: number }>
  >();

  for (const group of classGroups) {
    const rows: Array<{ student: Awaited<ReturnType<typeof prisma.student.create>>; idx: number }> =
      [];
    for (let rollNo = 1; rollNo <= group.count; rollNo++) {
      const firstName = firstNames[nameIdx % firstNames.length]!;
      const lastName = lastNames[nameIdx % lastNames.length]!;
      const studentId = `STU${pad(studentSerial)}`;
      const hashPassword = await bcrypt.hash(studentId, 10);

      const user = await prisma.user.create({
        data: { username: studentId, password: hashPassword, role: 'Student' },
      });

      const birthYear = 2026 - group.ageYears;
      const dob = D(
        `${birthYear}-${pad((nameIdx % 12) + 1, 2)}-${pad(((nameIdx * 3) % 27) + 1, 2)}`,
      );

      const student = await prisma.student.create({
        data: {
          serialNumber: studentSerial,
          studentId,
          userId: user.id,
          firstName,
          lastName,
          dob,
          gender: (['Male', 'Female', 'Other'] as const)[nameIdx % 3],
          address: `${rollNo * 12} Green Park Colony, Sector ${rollNo}, Springfield`,
          phone: `98${pad(10000000 + studentSerial, 8)}`,
          fatherName: `${lastName} Sr.`,
          motherName: `Mrs. ${lastName}`,
          fatherOccupation: nameIdx % 2 === 0 ? 'Engineer' : 'Business Owner',
          motherOccupation: nameIdx % 3 === 0 ? 'Doctor' : 'Homemaker',
          studentAadhar: `80000000${pad(studentSerial, 4)}`,
          fatherAadhar: `81000000${pad(studentSerial, 4)}`,
          motherAadhar: `82000000${pad(studentSerial, 4)}`,
          dateOfAdmission: D(admissionDates[nameIdx % admissionDates.length]!),
          classId: group.cls.id,
          rollNo,
          appId: `APP${pad(studentSerial, 5)}`,
          status: 'Active',
        },
      });

      rows.push({ student, idx: nameIdx });
      studentSerial++;
      nameIdx++;
    }
    studentsByClass.set(group.cls.id, rows);
  }
  const activeStudentRows = [...studentsByClass.values()].flat();

  // Two students left behind in the archived class — one graduated out, one transferred out —
  // so status filters and historical (non-current-session) records have real data behind them.
  const graduatedUser = await prisma.user.create({
    data: {
      username: `STU${pad(studentSerial)}`,
      password: await bcrypt.hash(`STU${pad(studentSerial)}`, 10),
      role: 'Student',
    },
  });
  const graduatedStudent = await prisma.student.create({
    data: {
      serialNumber: studentSerial,
      studentId: `STU${pad(studentSerial)}`,
      userId: graduatedUser.id,
      firstName: 'Xavi',
      lastName: 'Hernandez',
      dob: D('2011-03-14'),
      gender: 'Male',
      address: '55 Old Campus Road, Springfield',
      phone: '9899999901',
      studentAadhar: '890000000001',
      dateOfAdmission: D('2025-04-10'),
      classId: archived9A.id,
      rollNo: 1,
      appId: `APP${pad(studentSerial, 5)}`,
      status: 'Graduated',
    },
  });
  studentSerial++;

  const transferredUser = await prisma.user.create({
    data: {
      username: `STU${pad(studentSerial)}`,
      password: await bcrypt.hash(`STU${pad(studentSerial)}`, 10),
      role: 'Student',
    },
  });
  const transferredStudent = await prisma.student.create({
    data: {
      serialNumber: studentSerial,
      studentId: `STU${pad(studentSerial)}`,
      userId: transferredUser.id,
      firstName: 'Andres',
      lastName: 'Iniesta',
      dob: D('2011-05-11'),
      gender: 'Male',
      address: '56 Old Campus Road, Springfield',
      phone: '9899999902',
      studentAadhar: '890000000002',
      dateOfAdmission: D('2025-04-10'),
      classId: archived9A.id,
      rollNo: 2,
      appId: `APP${pad(studentSerial, 5)}`,
      status: 'TransferredOut',
    },
  });
  studentSerial++;

  // =========================================================================
  // 6. Timetable — periods 1-4, Mon-Sat, for every active class. Subject order
  //    rotates per weekday so every class sees all 6 taught subjects across the
  //    week. CS periods route to the junior (T6) or senior (T8) CS teacher.
  // =========================================================================
  const coreSubjectsFor = (cls: (typeof activeClasses)[number]) => {
    const csTeacher = cls === c10A || cls === c10B ? tCsSenior! : tCsJunior!;
    return [
      { subject: math, teacher: tMath! },
      { subject: science, teacher: tScience! },
      { subject: english, teacher: tEnglish! },
      { subject: hindi, teacher: tHindi! },
      { subject: sst, teacher: tSst! },
      { subject: cs, teacher: csTeacher },
    ];
  };

  const timetableRows: Array<{
    classId: string;
    weekday: (typeof WEEKDAYS)[number];
    period: number;
    subjectId: string;
    teacherId: string;
  }> = [];

  for (const cls of activeClasses) {
    const rotation = coreSubjectsFor(cls);
    WEEKDAYS.forEach((weekday, dayIdx) => {
      for (let period = 1; period <= 4; period++) {
        const slot = rotation[(dayIdx + period) % rotation.length]!;
        timetableRows.push({
          classId: cls.id,
          weekday,
          period,
          subjectId: slot.subject.id,
          teacherId: slot.teacher.id,
        });
      }
    });
  }
  await prisma.timeTable.createMany({ data: timetableRows });

  // =========================================================================
  // 7. Notices — mix of targetRole and expired/active expiry dates.
  // =========================================================================
  await prisma.notice.createMany({
    data: [
      {
        title: 'Annual Sports Day Meet',
        description:
          'The annual sports track and field event begins next Friday at the main ground. All students and staff are expected to participate or volunteer.',
        targetRole: 'All',
        date: D('2026-08-01'),
        expiryDate: D('2026-09-15'),
      },
      {
        title: 'Faculty Meeting: Syllabus Review',
        description:
          'All teachers must attend the board syllabus review meeting in conference room A at 4 PM sharp. Bring your subject planners.',
        targetRole: 'Teacher',
        date: D('2026-08-10'),
        expiryDate: D('2026-08-20'),
      },
      {
        title: 'Mid-Term Results Declared',
        description:
          'Students can now check their First Term examination grades from the Exams tab. Contact your class teacher for any discrepancies.',
        targetRole: 'Student',
        date: D('2026-07-18'),
        expiryDate: D('2026-08-01'),
      },
      {
        title: 'Fee Payment Deadline Reminder',
        description:
          'This is a reminder that the tuition fee for this term is due by the end of the month. Late payments may incur a penalty as per school policy.',
        targetRole: 'Student',
        date: D('2026-08-20'),
        expiryDate: D('2026-09-05'),
      },
      {
        title: 'Staff Development Workshop',
        description:
          'A professional development workshop on differentiated instruction will be held for all teaching staff in the auditorium.',
        targetRole: 'Teacher',
        date: D('2026-09-01'),
        expiryDate: D('2026-09-10'),
      },
      {
        title: 'School Reopens After Summer Break',
        description:
          'We are pleased to welcome everyone back after the summer break. Regular classes resume as per the published timetable starting Monday.',
        targetRole: 'All',
        date: D('2026-06-25'),
        fileUrl: 'https://example.com/notices/reopening-circular.pdf',
        expiryDate: D('2026-07-05'),
      },
    ],
  });

  // =========================================================================
  // 8. Academic calendar — spans HOLIDAY/EVENT/EXAM/OTHER, past and future.
  // =========================================================================
  await prisma.academicCalendar.createMany({
    data: [
      { title: 'Summer Vacation Ends', date: D('2026-06-01'), category: 'HOLIDAY' },
      { title: 'Independence Day Assembly', date: D('2026-08-15'), category: 'EVENT' },
      { title: 'First Term Examinations', date: D('2026-07-10'), category: 'EXAM' },
      { title: 'Mid-Term Examinations Begin', date: D('2026-09-10'), category: 'EXAM' },
      { title: 'Annual Sports Day', date: D('2026-09-20'), category: 'EVENT' },
      { title: 'Gandhi Jayanti Holiday', date: D('2026-10-02'), category: 'HOLIDAY' },
      { title: 'Parent-Teacher Meeting', date: D('2026-09-05'), category: 'OTHER' },
      { title: 'Winter Vacation Begins', date: D('2026-12-20'), category: 'HOLIDAY' },
    ],
  });

  // =========================================================================
  // 9. Contact messages
  // =========================================================================
  await prisma.contact.createMany({
    data: [
      {
        name: 'Sunita Rao',
        email: 'sunita.rao@example.com',
        mobile: '9811122233',
        message: 'Hi, I would like to know the admission process for grade 6 next session.',
      },
      {
        name: 'Vikram Patel',
        email: 'vikram.patel@example.com',
        mobile: '9822233344',
        message: 'Could someone share the bus route details for the Westside area?',
      },
      {
        name: 'Anita Desai',
        email: 'anita.desai@example.com',
        mobile: '9833344455',
        message: 'My daughter has a food allergy — who should I speak to about the canteen menu?',
      },
      {
        name: 'Rahul Verma',
        email: 'rahul.verma@example.com',
        mobile: '9844455566',
        message: 'Requesting a duplicate copy of my son’s transfer certificate.',
      },
      {
        name: 'Fatima Khan',
        email: 'fatima.khan@example.com',
        mobile: '9855566677',
        message: 'Interested in scheduling a campus tour before applying for admission.',
      },
    ],
  });

  // =========================================================================
  // 10. Teacher attendance — Mon-Sat, 2026-07-27 through today (2026-08-24).
  //     T-Art (low profile, recently joined) skews worse than the rest for
  //     leaderboard variety.
  // =========================================================================
  const attendanceDays = schoolDays('2026-07-27', '2026-08-24');

  const teacherAttendanceRows: Array<{
    teacherId: string;
    date: Date;
    status: 'Present' | 'Absent' | 'Leave';
  }> = [];
  teachers.forEach((teacher, tIdx) => {
    const absentRate = teacher.teacherId === tArt!.teacherId ? 0.25 : 0.06;
    const leaveRate = 0.05;
    attendanceDays.forEach((date, dIdx) => {
      const r = rand(tIdx, dIdx, 11);
      const status: 'Present' | 'Absent' | 'Leave' =
        r < absentRate ? 'Absent' : r < absentRate + leaveRate ? 'Leave' : 'Present';
      teacherAttendanceRows.push({ teacherId: teacher.id, date, status });
    });
  });
  await prisma.teacherAttendance.createMany({ data: teacherAttendanceRows });

  // =========================================================================
  // 11. Class + student attendance — same date range, every active class.
  //     Two students per larger class are seeded as chronic absentees (<75%)
  //     to exercise the chronic-absentee report.
  // =========================================================================
  const classAttendanceRows: Array<{ classId: string; date: Date; isMarked: boolean }> = [];
  const studentAttendanceRows: Array<{
    studentId: string;
    date: Date;
    status: 'Present' | 'Absent' | 'Leave';
  }> = [];

  const chronicAbsenteeStudentIds = new Set(
    [activeStudentRows[2], activeStudentRows[10]].filter(Boolean).map((r) => r!.student.id),
  );

  for (const cls of activeClasses) {
    const rows = studentsByClass.get(cls.id) ?? [];
    attendanceDays.forEach((date, dIdx) => {
      classAttendanceRows.push({ classId: cls.id, date, isMarked: true });
      for (const { student, idx } of rows) {
        const isChronic = chronicAbsenteeStudentIds.has(student.id);
        const absentRate = isChronic ? 0.35 : 0.08;
        const leaveRate = isChronic ? 0.08 : 0.06;
        const r = rand(idx, dIdx, 23);
        const status: 'Present' | 'Absent' | 'Leave' =
          r < absentRate ? 'Absent' : r < absentRate + leaveRate ? 'Leave' : 'Present';
        studentAttendanceRows.push({ studentId: student.id, date, status });
      }
    });
  }
  await prisma.classAttendance.createMany({ data: classAttendanceRows });
  await prisma.studentAttendance.createMany({ data: studentAttendanceRows });

  // =========================================================================
  // 12. Exams
  //     - "First Term Examination": one Exam per active class, fully marked with
  //       results, EXCEPT Hindi in class 8-B is deliberately left unmarked with no
  //       results — exercises the "marking incomplete" / pending-marking states.
  //     - "Mid Term Examination": one Exam per active class, upcoming, nothing
  //       marked yet — exercises the dashboard's upcoming-exams widget and the
  //       "not yet declared" state.
  // =========================================================================
  for (const cls of activeClasses) {
    const rotation = coreSubjectsFor(cls); // 6 subjects incl. class's CS teacher
    const rows = studentsByClass.get(cls.id) ?? [];

    const exam = await prisma.exam.create({
      data: {
        classId: cls.id,
        title: 'First Term Examination',
        dateFrom: D('2026-07-10'),
        dateTo: D('2026-07-15'),
        isResultDecleared: true,
      },
    });

    const firstTermDates = [
      '2026-07-10',
      '2026-07-11',
      '2026-07-12',
      '2026-07-13',
      '2026-07-14',
      '2026-07-15',
    ];
    for (let sIdx = 0; sIdx < rotation.length; sIdx++) {
      const { subject, teacher } = rotation[sIdx]!;
      const skipMarking = cls === c8B && subject === hindi;
      const examSubject = await prisma.examSubject.create({
        data: {
          examId: exam.id,
          subjectId: subject.id,
          teacherId: teacher.id,
          fullMarks: 100,
          date: D(firstTermDates[sIdx % firstTermDates.length]!),
          isMarked: !skipMarking,
        },
      });

      if (!skipMarking) {
        const resultRows = rows.map(({ student, idx }) => {
          const pct = 20 + Math.floor(rand(idx, sIdx, 31) * 80); // 20-99%
          const marksObtained = pct;
          const grade =
            pct >= 90
              ? 'A+'
              : pct >= 80
                ? 'A'
                : pct >= 70
                  ? 'B+'
                  : pct >= 60
                    ? 'B'
                    : pct >= 50
                      ? 'C'
                      : pct >= 33
                        ? 'D'
                        : 'F';
          return {
            examSubjectId: examSubject.id,
            studentId: student.id,
            marksObtained,
            grade,
            remark:
              grade === 'A+' || grade === 'A'
                ? 'Excellent performance'
                : grade === 'F'
                  ? 'Needs significant improvement'
                  : 'Good effort, room to improve',
          };
        });
        if (resultRows.length > 0) {
          await prisma.examResult.createMany({ data: resultRows });
        }
      }
    }

    // Upcoming, undeclared exam — nothing marked, no results.
    const upcomingExam = await prisma.exam.create({
      data: {
        classId: cls.id,
        title: 'Mid Term Examination',
        dateFrom: D('2026-09-10'),
        dateTo: D('2026-09-15'),
        isResultDecleared: false,
      },
    });
    const midTermDates = ['2026-09-10', '2026-09-12', '2026-09-14'];
    const upcomingSubjects = rotation.slice(0, 3);
    for (let sIdx = 0; sIdx < upcomingSubjects.length; sIdx++) {
      const { subject, teacher } = upcomingSubjects[sIdx]!;
      await prisma.examSubject.create({
        data: {
          examId: upcomingExam.id,
          subjectId: subject.id,
          teacherId: teacher.id,
          fullMarks: 100,
          date: D(midTermDates[sIdx]!),
          isMarked: false,
        },
      });
    }
  }

  // =========================================================================
  // 13. Finance — student fees + teacher salaries across 3 months
  //     (June, July, August 2026), general ledger expenses across the same span.
  // =========================================================================
  const feeMonths = ['2026-06', '2026-07', '2026-08'];
  const feeItemsFor = (base: number) => [
    { feeType: 'Tuition Fee', amount: base },
    { feeType: 'Library Fee', amount: 50 },
    { feeType: 'Laboratory Fee', amount: 60 },
  ];

  for (const { student, idx } of activeStudentRows) {
    for (let m = 0; m < feeMonths.length; m++) {
      const month = feeMonths[m]!;
      // Deterministic status spread: mostly Paid, some Pending, an occasional Failed.
      const r = rand(idx, m, 41);
      const status: 'Paid' | 'Pending' | 'Failed' =
        r < 0.75 ? 'Paid' : r < 0.93 ? 'Pending' : 'Failed';
      const tuition = 300 + (idx % 4) * 25;
      const breakdown = feeItemsFor(tuition);
      const finalAmount = breakdown.reduce((sum, item) => sum + item.amount, 0);

      const txn = await prisma.transaction.create({
        data: {
          title: `Tuition Fee Receipt - ${month}`,
          finalAmount,
          status,
          category: 'Fee',
          createdAt: MONTH(month),
        },
      });
      const studentFee = await prisma.studentFee.create({
        data: { studentId: student.id, transactionId: txn.id, month: MONTH(month) },
      });
      await prisma.feeBreakdown.createMany({
        data: breakdown.map((item) => ({ ...item, studentFeeId: studentFee.id })),
      });
    }
  }

  const salaryMonths = ['2026-06', '2026-07', '2026-08'];
  for (let tIdx = 0; tIdx < teachers.length; tIdx++) {
    const teacher = teachers[tIdx]!;
    for (let m = 0; m < salaryMonths.length; m++) {
      const month = salaryMonths[m]!;
      const r = rand(tIdx, m, 53);
      const status: 'Paid' | 'Pending' | 'Failed' =
        r < 0.85 ? 'Paid' : r < 0.97 ? 'Pending' : 'Failed';
      const txn = await prisma.transaction.create({
        data: {
          title: `Monthly Salary Credit - ${month}`,
          finalAmount: teacher.salaryPerMonth,
          status,
          category: 'Salary',
          createdAt: MONTH(month),
        },
      });
      await prisma.teacherSalary.create({
        data: { teacherId: teacher.id, transactionId: txn.id, month: MONTH(month) },
      });
    }
  }

  // General ledger expenses — Utility / Infrastructure / Other (with free-text
  // expenseCategory), spread across the same three months.
  const expenseDefs: Array<{
    title: string;
    amount: number;
    category: 'Utility' | 'Infrastructure' | 'Other';
    expenseCategory: string | null;
    month: string;
    status: 'Paid' | 'Pending' | 'Failed';
  }> = [
    {
      title: 'Electricity Bill',
      amount: 18000,
      category: 'Utility',
      expenseCategory: null,
      month: '2026-06',
      status: 'Paid',
    },
    {
      title: 'Water Supply Bill',
      amount: 4500,
      category: 'Utility',
      expenseCategory: null,
      month: '2026-06',
      status: 'Paid',
    },
    {
      title: 'Internet & Phone Bill',
      amount: 6200,
      category: 'Utility',
      expenseCategory: null,
      month: '2026-07',
      status: 'Paid',
    },
    {
      title: 'Electricity Bill',
      amount: 19500,
      category: 'Utility',
      expenseCategory: null,
      month: '2026-07',
      status: 'Pending',
    },
    {
      title: 'Classroom Furniture Repair',
      amount: 12000,
      category: 'Infrastructure',
      expenseCategory: null,
      month: '2026-06',
      status: 'Paid',
    },
    {
      title: 'Playground Maintenance',
      amount: 8500,
      category: 'Infrastructure',
      expenseCategory: null,
      month: '2026-07',
      status: 'Paid',
    },
    {
      title: 'Science Lab Equipment',
      amount: 25000,
      category: 'Infrastructure',
      expenseCategory: null,
      month: '2026-08',
      status: 'Pending',
    },
    {
      title: 'Library Books Purchase',
      amount: 15000,
      category: 'Other',
      expenseCategory: 'Books',
      month: '2026-06',
      status: 'Paid',
    },
    {
      title: 'Sports Kit Restock',
      amount: 9800,
      category: 'Other',
      expenseCategory: 'Sports Kit',
      month: '2026-07',
      status: 'Paid',
    },
    {
      title: 'Classroom Whiteboards',
      amount: 7200,
      category: 'Other',
      expenseCategory: 'Whiteboards',
      month: '2026-08',
      status: 'Paid',
    },
    {
      title: 'Annual Day Decorations',
      amount: 5400,
      category: 'Other',
      expenseCategory: 'Events',
      month: '2026-08',
      status: 'Pending',
    },
  ];
  for (const e of expenseDefs) {
    await prisma.transaction.create({
      data: {
        title: e.title,
        finalAmount: e.amount,
        status: e.status,
        category: e.category,
        expenseCategory: e.expenseCategory,
        createdAt: MONTH(e.month),
      },
    });
  }

  console.log('Database seeded successfully!');
  console.log(`  Classes: ${classDefs.length} (${activeClasses.length} active, 1 archived)`);
  console.log(`  Subjects: ${subjectDefs.length} (1 unassigned: Art)`);
  console.log(`  Teachers: ${teachers.length}`);
  console.log(
    `  Students: ${activeStudentRows.length} active + 2 historical (1 Graduated, 1 TransferredOut)`,
  );
  console.log(`  Timetable slots: ${timetableRows.length}`);
  console.log(
    `  Attendance days marked: ${attendanceDays.length} (Mon-Sat, 2026-07-27..2026-08-24)`,
  );
  console.log(
    '  Logins: admin/admin123, teacher TCH00000001../<teacherId>, student STU00000001../<studentId>',
  );
  console.log('  (Every teacher/student password equals their own generated ID.)');
  console.log(
    `  (Graduated: ${graduatedStudent.studentId}, TransferredOut: ${transferredStudent.studentId})`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
