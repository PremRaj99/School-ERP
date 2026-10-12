import prisma from '@/core/db';
import type { NoticeClass, NoticeRecord, NoticeSummary } from '@schoolerp/contracts';
import { toISODate } from './isoDate';

/**
 * One place that turns `Notice` rows into contract shapes, so every list (admin, teacher,
 * student, dashboards) resolves `classIds` to `{ id, className, section }` the same way.
 */

type TargetRole = 'Student' | 'Teacher' | 'All';

interface NoticeSummaryRow {
  id: string;
  title: string;
  date: Date;
  targetRole: TargetRole;
  // Older documents predate the field; treat missing as "every class".
  classIds?: string[] | null;
  expiryDate: Date | null;
}

interface NoticeRow extends NoticeSummaryRow {
  description: string | null;
  fileUrl: string | null;
}

export const NOTICE_SUMMARY_SELECT = {
  id: true,
  title: true,
  date: true,
  targetRole: true,
  classIds: true,
  expiryDate: true,
} as const;

/** Class id -> `{ id, className, section }` for every class any of `notices` targets. */
async function loadClasses(notices: NoticeSummaryRow[]): Promise<Map<string, NoticeClass>> {
  const ids = [...new Set(notices.flatMap((n) => n.classIds ?? []))];
  if (ids.length === 0) return new Map();
  const classes = await prisma.class.findMany({
    where: { id: { in: ids } },
    select: { id: true, className: true, section: true },
  });
  return new Map(classes.map((c) => [c.id, c]));
}

const classesOf = (notice: NoticeSummaryRow, classMap: Map<string, NoticeClass>) =>
  (notice.classIds ?? []).flatMap((id) => {
    const cls = classMap.get(id);
    return cls ? [cls] : [];
  });

export async function toNoticeSummaries(notices: NoticeSummaryRow[]): Promise<NoticeSummary[]> {
  const classMap = await loadClasses(notices);
  return notices.map((n) => ({
    id: n.id,
    title: n.title,
    date: toISODate(n.date),
    targetRole: n.targetRole,
    classes: classesOf(n, classMap),
    expiryDate: n.expiryDate ? toISODate(n.expiryDate) : null,
  }));
}

export async function toNoticeRecord(notice: NoticeRow): Promise<NoticeRecord> {
  const classMap = await loadClasses([notice]);
  return {
    id: notice.id,
    title: notice.title,
    description: notice.description,
    fileUrl: notice.fileUrl,
    targetRole: notice.targetRole,
    classes: classesOf(notice, classMap),
    date: toISODate(notice.date),
    expiryDate: notice.expiryDate ? toISODate(notice.expiryDate) : null,
  };
}

/** Whether a student in `classId` should see `notice` (an untargeted notice reaches everyone). */
export const reachesClass = (notice: { classIds?: string[] | null }, classId: string | null) =>
  !notice.classIds?.length || (classId !== null && notice.classIds.includes(classId));
