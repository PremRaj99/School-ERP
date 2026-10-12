import prisma from '@/core/db';
import { ApiError, NotFoundError, ValidationError } from '@/core/errors';
import { storeExamData } from '../helpers';
import type {
  CreateExamBody,
  ExamDetail,
  ExamListQuery,
  ExamRecord,
  UpdateExamBody,
  UpdateExamScheduleBody,
} from '@schoolerp/contracts';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@schoolerp/contracts';
import { fromISODate, toISODate } from '@/shared/helpers/isoDate';

/** Date-sheet order: by date, then start time (untimed papers last on their day). */
const comparePapers = (
  a: { date: string; startTime: string | null },
  b: { date: string; startTime: string | null },
) => a.date.localeCompare(b.date) || (a.startTime ?? '99').localeCompare(b.startTime ?? '99');

interface PaginatedExams {
  data: ExamRecord[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

const toExamRecord = (exam: {
  id: string;
  title: string;
  dateFrom: Date;
  dateTo: Date | null;
  isResultDecleared: boolean;
  class: { className: string; section: string; session: string };
}): ExamRecord => ({
  id: exam.id,
  title: exam.title,
  className: exam.class.className,
  section: exam.class.section,
  session: exam.class.session,
  dateFrom: toISODate(exam.dateFrom),
  dateTo: exam.dateTo ? toISODate(exam.dateTo) : null,
  isResultDecleared: exam.isResultDecleared,
});

export class AdminExamService {
  static async getExams(query: ExamListQuery): Promise<PaginatedExams> {
    const page = query.page ?? DEFAULT_PAGE;
    const pageSize = query.pageSize ?? DEFAULT_PAGE_SIZE;
    const sortDir = query.sortDir ?? 'desc';

    const classFilter =
      query.session || query.className || query.section
        ? {
            class: {
              ...(query.session ? { session: query.session } : {}),
              ...(query.className ? { className: query.className } : {}),
              ...(query.section ? { section: query.section } : {}),
            },
          }
        : {};

    const where = {
      ...classFilter,
      ...(query.isResultDecleared !== undefined
        ? { isResultDecleared: query.isResultDecleared }
        : {}),
      ...(query.q ? { title: { contains: query.q, mode: 'insensitive' as const } } : {}),
    };

    const orderBy = query.sortBy === 'title' ? { title: sortDir } : { dateFrom: sortDir };

    const [exams, total] = await Promise.all([
      prisma.exam.findMany({
        where,
        select: {
          id: true,
          title: true,
          dateFrom: true,
          dateTo: true,
          isResultDecleared: true,
          class: { select: { className: true, section: true, session: true } },
        },
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.exam.count({ where }),
    ]);

    return {
      data: exams.map(toExamRecord),
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  }

  static async getExamById(examId: string): Promise<ExamDetail> {
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        class: { select: { className: true, section: true, session: true } },
        examSubjects: {
          include: {
            subject: { select: { subjectName: true, subjectCode: true } },
            teacher: { select: { teacherId: true, firstName: true, lastName: true } },
          },
        },
      },
    });

    if (!exam) {
      throw new NotFoundError();
    }

    return {
      ...toExamRecord(exam),
      subjects: exam.examSubjects
        .map((s) => ({
          examSubjectId: s.id,
          subjectId: s.subjectId,
          subjectName: s.subject.subjectName,
          subjectCode: s.subject.subjectCode,
          teacherId: s.teacher.teacherId,
          teacherFullName: `${s.teacher.firstName} ${s.teacher.lastName ?? ''}`.trim(),
          date: toISODate(s.date),
          startTime: s.startTime ?? null,
          endTime: s.endTime ?? null,
          fullMarks: s.fullMarks,
          isMarked: s.isMarked,
        }))
        .sort(comparePapers),
    };
  }

  /** Re-date / re-time papers on an existing exam's date sheet. */
  static async updateSchedule(examId: string, data: UpdateExamScheduleBody): Promise<ExamDetail> {
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      select: { dateFrom: true, dateTo: true, examSubjects: { select: { id: true } } },
    });
    if (!exam) {
      throw new NotFoundError();
    }

    const ownIds = new Set(exam.examSubjects.map((s) => s.id));
    const from = toISODate(exam.dateFrom);
    const to = exam.dateTo ? toISODate(exam.dateTo) : from;
    const issues = data.subjects.flatMap((row, i) => [
      ...(ownIds.has(row.examSubjectId)
        ? []
        : [{ path: `subjects.${i}.examSubjectId`, message: 'Not a paper of this exam.' }]),
      ...(row.date < from || row.date > to
        ? [{ path: `subjects.${i}.date`, message: `Must be between ${from} and ${to}.` }]
        : []),
    ]);
    if (issues.length) {
      throw new ValidationError('Some papers could not be scheduled.', issues);
    }

    await prisma.$transaction(
      data.subjects.map((row) =>
        prisma.examSubject.update({
          where: { id: row.examSubjectId },
          data: { date: fromISODate(row.date), startTime: row.startTime, endTime: row.endTime },
        }),
      ),
    );
    return AdminExamService.getExamById(examId);
  }

  static async createExam(data: CreateExamBody): Promise<ExamRecord[]> {
    try {
      return await storeExamData(data);
    } catch (error) {
      // Was a blanket `throw new ValidationError()` — swallowed storeExamData's specific errors
      // (missing class, unknown subject code, subject with no teacher assigned) into a generic
      // 400 "bad request" with no explanation of which of those it was.
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ValidationError(error instanceof Error ? error.message : undefined);
    }
  }

  static async updateExam(examId: string, data: UpdateExamBody): Promise<ExamRecord> {
    // Moving the exam window mustn't strand papers already scheduled outside it.
    if (data.dateFrom !== undefined || data.dateTo !== undefined) {
      const exam = await prisma.exam.findUnique({
        where: { id: examId },
        select: { dateFrom: true, dateTo: true, examSubjects: { select: { date: true } } },
      });
      if (!exam) {
        throw new NotFoundError();
      }
      const from = data.dateFrom ?? toISODate(exam.dateFrom);
      const to = data.dateTo ?? (exam.dateTo ? toISODate(exam.dateTo) : from);
      if (to < from) {
        throw new ValidationError('End date must be on or after the start date.');
      }
      const outside = exam.examSubjects.filter((s) => {
        const d = toISODate(s.date);
        return d < from || d > to;
      });
      if (outside.length) {
        throw new ValidationError(
          `${outside.length} paper(s) are scheduled outside ${from} – ${to}. Move them on the date sheet first.`,
        );
      }
    }
    try {
      const updated = await prisma.exam.update({
        where: { id: examId },
        data: {
          ...(data.title !== undefined ? { title: data.title } : {}),
          ...(data.dateFrom !== undefined ? { dateFrom: fromISODate(data.dateFrom) } : {}),
          ...(data.dateTo !== undefined ? { dateTo: fromISODate(data.dateTo) } : {}),
        },
        select: {
          id: true,
          title: true,
          dateFrom: true,
          dateTo: true,
          isResultDecleared: true,
          class: { select: { className: true, section: true, session: true } },
        },
      });
      return toExamRecord(updated);
    } catch (_e) {
      throw new NotFoundError();
    }
  }

  static async deleteExam(examId: string): Promise<{ id: string }> {
    try {
      await prisma.exam.delete({ where: { id: examId } });
    } catch (_e) {
      throw new NotFoundError();
    }
    return { id: examId };
  }

  static async setResultDeclaration(
    examId: string,
    isResultDecleared: boolean,
  ): Promise<ExamRecord> {
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        class: { select: { className: true, section: true, session: true } },
        examSubjects: { select: { isMarked: true } },
      },
    });

    if (!exam) {
      throw new NotFoundError();
    }

    if (isResultDecleared) {
      const hasUnmarkedSubject = exam.examSubjects.some((subject) => !subject.isMarked);
      if (exam.examSubjects.length === 0 || hasUnmarkedSubject) {
        throw new ValidationError(
          'All subjects for this exam must be marked before the result can be declared.',
        );
      }
    }

    const updated = await prisma.exam.update({
      where: { id: examId },
      data: { isResultDecleared },
      select: {
        id: true,
        title: true,
        dateFrom: true,
        dateTo: true,
        isResultDecleared: true,
        class: { select: { className: true, section: true, session: true } },
      },
    });

    return toExamRecord(updated);
  }
}
