import prisma from '@/core/db';
import { DatabaseError, ForbiddenError, NotFoundError } from '@/core/errors';
import { teacherContract, type ClassAttendanceDetail } from '@schoolerp/contracts';
import { defineRoute } from '@/core/http/defineRoute';
import { resolveTeacherId } from '@/core/middlewares/auth.middleware';
import { getCurrentSessionYear } from '@/shared';
import { fromISODate, monthStartEndFromISO, toISODate } from '@/shared/helpers/isoDate';

const assertTeachesClass = async (teacherId: string, classId: string) => {
  const teachesClass = await prisma.timeTable.findFirst({
    where: { teacherId, classId },
    select: { id: true },
  });
  if (!teachesClass) {
    throw new ForbiddenError('You do not teach this class.');
  }
};

const loadClassAttendanceDetail = async (
  classAttendanceId: string,
): Promise<ClassAttendanceDetail> => {
  const classAttendance = await prisma.classAttendance.findUnique({
    where: { id: classAttendanceId },
    include: { class: { include: { students: true } } },
  });

  if (!classAttendance) {
    throw new NotFoundError('Class attendance record not found.');
  }

  const studentIds = classAttendance.class.students.map((s) => s.id);
  const studentAttendances = await prisma.studentAttendance.findMany({
    where: { studentId: { in: studentIds }, date: classAttendance.date },
  });

  const attendanceStatusMap = new Map<string, { status: string; id: string }>(
    studentAttendances.map((sa) => [sa.studentId, { status: sa.status, id: sa.id }]),
  );

  return {
    id: classAttendance.id,
    date: toISODate(classAttendance.date),
    className: classAttendance.class.className,
    section: classAttendance.class.section,
    isMarked: classAttendance.isMarked,
    students: classAttendance.class.students.map((student) => ({
      id: attendanceStatusMap.get(student.id)?.id,
      rollNo: student.rollNo,
      firstName: student.firstName,
      lastName: student.lastName,
      studentId: student.id,
      status: (attendanceStatusMap.get(student.id)?.status ??
        'Unmarked') as ClassAttendanceDetail['students'][number]['status'],
    })),
  };
};

export const getTeacherAttendance = defineRoute(
  teacherContract.myAttendance,
  async ({ query, req }) => {
    // Was `req.user?.id` — the User id, not the Teacher id, so this always matched zero rows
    // (ALIGNMENT_PLAN.md 2A/B2).
    const teacherId = await resolveTeacherId(req);
    const { endDate, startDate } = monthStartEndFromISO(query.month);

    const teacherAttendance = await prisma.teacherAttendance.findMany({
      where: { date: { gte: startDate, lt: endDate }, teacherId },
    });

    return teacherAttendance.map((t) => ({ date: toISODate(t.date), status: t.status }));
  },
);

export const getClassAttendance = defineRoute(
  teacherContract.classAttendanceList,
  async ({ query, req }) => {
    const teacherId = await resolveTeacherId(req);
    const { endDate, startDate } = monthStartEndFromISO(query.month);

    // Was unscoped — any teacher could see every class's attendance, not just classes they
    // actually teach (ALIGNMENT_PLAN.md 2A/A2).
    const taughtClasses = await prisma.timeTable.findMany({
      where: { teacherId },
      select: { classId: true },
      distinct: ['classId'],
    });
    const classIds = taughtClasses.map((t) => t.classId);

    const classAttendance = await prisma.classAttendance.findMany({
      where: { date: { gte: startDate, lt: endDate }, classId: { in: classIds } },
      include: { class: true },
    });

    return classAttendance.map((a) => ({
      id: a.id,
      date: toISODate(a.date),
      className: a.class.className,
      section: a.class.section,
      isMarked: a.isMarked,
    }));
  },
);

export const getClassAttendanceDetail = defineRoute(
  teacherContract.classAttendanceDetail,
  async ({ params, req }) => {
    const teacherId = await resolveTeacherId(req);

    const classAttendance = await prisma.classAttendance.findUnique({
      where: { id: params.classAttendanceId },
    });
    if (!classAttendance) {
      throw new NotFoundError('Class attendance record not found.');
    }

    // Same ownership gap as getClassAttendance — a teacher could otherwise view any class's
    // attendance roster by guessing/enumerating its id (ALIGNMENT_PLAN.md 2A/A2).
    const teachesClass = await prisma.timeTable.findFirst({
      where: { teacherId, classId: classAttendance.classId },
      select: { id: true },
    });
    if (!teachesClass) {
      throw new ForbiddenError('You do not teach this class.');
    }

    return loadClassAttendanceDetail(params.classAttendanceId);
  },
);

export const createClassAttendance = defineRoute(
  teacherContract.markClassAttendance,
  async ({ body, req }) => {
    const currentSession = getCurrentSessionYear();
    const teacherId = await resolveTeacherId(req);

    const classRecord = await prisma.class.findUnique({
      where: {
        className_section_session: {
          className: body.className,
          section: body.section,
          session: currentSession,
        },
      },
    });
    if (!classRecord) {
      throw new NotFoundError();
    }

    // Was missing entirely — any teacher could mark attendance for a class they don't teach
    // (ALIGNMENT_PLAN.md 2A/A3).
    const teachesClass = await prisma.timeTable.findFirst({
      where: { teacherId, classId: classRecord.id },
      select: { id: true },
    });
    if (!teachesClass) {
      throw new ForbiddenError('You do not teach this class.');
    }

    const date = fromISODate(body.date);
    let classAttendanceId = '';

    try {
      await prisma.$transaction(async (txn) => {
        const created = await txn.classAttendance.create({
          data: { date, isMarked: true, classId: classRecord.id },
        });
        classAttendanceId = created.id;

        await txn.studentAttendance.createMany({
          data: body.attendance.map((a) => ({ studentId: a.studentId, status: a.status, date })),
        });
      });
    } catch (e) {
      console.error(e);
      throw new DatabaseError();
    }

    return loadClassAttendanceDetail(classAttendanceId);
  },
);

export const getClassRoster = defineRoute(teacherContract.classRoster, async ({ query, req }) => {
  const currentSession = getCurrentSessionYear();
  const teacherId = await resolveTeacherId(req);

  const classRecord = await prisma.class.findUnique({
    where: {
      className_section_session: {
        className: query.className,
        section: query.section,
        session: currentSession,
      },
    },
    include: { students: { orderBy: { rollNo: 'asc' } } },
  });
  if (!classRecord) {
    throw new NotFoundError();
  }

  await assertTeachesClass(teacherId, classRecord.id);

  return classRecord.students.map((student) => ({
    rollNo: student.rollNo,
    firstName: student.firstName,
    lastName: student.lastName,
    studentId: student.id,
    status: 'Unmarked' as const,
  }));
});

export const updateClassAttendance = defineRoute(
  teacherContract.updateClassAttendance,
  async ({ params, body, req }) => {
    // Was `/class-attendance/classAttendanceId` (no `:`) in the route — this param never actually
    // matched a real id, so the route was unreachable for real traffic (ALIGNMENT_PLAN.md 2A/B6).
    const teacherId = await resolveTeacherId(req);

    const classAttendance = await prisma.classAttendance.findUnique({
      where: { id: params.classAttendanceId },
    });
    if (!classAttendance) {
      throw new NotFoundError();
    }

    // Was missing entirely — any teacher could edit any class's attendance rows by id
    // (ALIGNMENT_PLAN.md 2A/A4).
    const teachesClass = await prisma.timeTable.findFirst({
      where: { teacherId, classId: classAttendance.classId },
      select: { id: true },
    });
    if (!teachesClass) {
      throw new ForbiddenError('You do not teach this class.');
    }

    try {
      await prisma.$transaction(async (txn) => {
        await Promise.all(
          body.map((data) =>
            txn.studentAttendance.update({
              where: { id: data.id, studentId: data.studentId },
              data: { status: data.status },
            }),
          ),
        );
      });
    } catch (_e) {
      throw new DatabaseError();
    }

    return loadClassAttendanceDetail(params.classAttendanceId);
  },
);
