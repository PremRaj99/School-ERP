import prisma from '@/core/db';
import { getCurrentSessionYear } from './getCurrentSessionYear';

type SubjectRow = { subjectCode: string; subjectName: string };

// A subject counts as assigned to a class if it has an explicit `ClassSubject` link or is
// scheduled in that class's timetable (see `AdminClassService.getClassSubjects`).
export const getGroupedSubject = async () => {
  const currentSessionString = getCurrentSessionYear();
  const rowSelect = {
    class: { select: { className: true } },
    subject: { select: { subjectCode: true, subjectName: true } },
  } as const;

  const [timeTableForCurrentSession, linksForCurrentSession, allSubjects] = await Promise.all([
    prisma.timeTable.findMany({
      where: { class: { session: currentSessionString } },
      select: rowSelect,
    }),
    prisma.classSubject.findMany({
      where: { class: { session: currentSessionString } },
      select: rowSelect,
    }),
    prisma.subject.findMany(),
  ]);

  // className -> subjectCode -> subject; the inner map dedupes a subject that appears in several
  // sections/periods of the same class.
  const classMap = new Map<string, Map<string, SubjectRow>>();
  for (const entry of [...linksForCurrentSession, ...timeTableForCurrentSession]) {
    const subjects = classMap.get(entry.class.className) ?? new Map<string, SubjectRow>();
    subjects.set(entry.subject.subjectCode, entry.subject);
    classMap.set(entry.class.className, subjects);
  }

  const assignedSubjectCodes = new Set(
    [...classMap.values()].flatMap((subjects) => [...subjects.keys()]),
  );

  return {
    assignedSubjects: [...classMap.entries()].map(([className, subjects]) => ({
      className,
      subjects: [...subjects.values()],
    })),
    unassignedSubjects: allSubjects
      .filter((subject) => !assignedSubjectCodes.has(subject.subjectCode))
      .map((s) => ({ subjectCode: s.subjectCode, subjectName: s.subjectName })),
  };
};
