import { z } from 'zod';
import { defineContract } from '../envelope';
import { ISODate, ObjectId, PageQuery, paginatedResponse } from '../primitives';
import { TargetRoleEnum } from '../enums';

export const NoticeRecord = z.object({
  id: ObjectId,
  title: z.string(),
  description: z.string().nullable(),
  fileUrl: z.string().nullable(),
  targetRole: TargetRoleEnum,
  date: ISODate,
  expiryDate: ISODate.nullable(),
});
export type NoticeRecord = z.infer<typeof NoticeRecord>;

/**
 * List rows omit `description`/`fileUrl` — matches what `getNotices()` selects. `expiryDate` is
 * included (unlike the other two) so the admin list page can filter/badge active-vs-expired
 * without an N+1 detail fetch per row (ALIGNMENT_PLAN.md Phase 5, added while wiring that filter).
 */
export const NoticeSummary = NoticeRecord.pick({
  id: true,
  title: true,
  date: true,
  targetRole: true,
  expiryDate: true,
});
export type NoticeSummary = z.infer<typeof NoticeSummary>;

export const CreateNoticeBody = z.object({
  title: z
    .string({ message: 'Title is required.' })
    .min(2, 'Title must be at least 2 characters long.'),
  description: z.string().min(50, 'Description has to be at least 50 characters long.').optional(),
  fileUrl: z.string().url('Please provide a valid URL for the file URL.').optional(),
  date: ISODate,
  targetRole: TargetRoleEnum,
  expiryDate: ISODate.optional(),
});
export type CreateNoticeBody = z.infer<typeof CreateNoticeBody>;

export const UpdateNoticeBody = CreateNoticeBody.partial();
export type UpdateNoticeBody = z.infer<typeof UpdateNoticeBody>;

export const DeleteNoticeResponse = z.object({ id: ObjectId });

export const NoticeListQuery = PageQuery.extend({
  targetRole: TargetRoleEnum.optional(),
  sortBy: z.enum(['date', 'expiryDate', 'title']).optional(),
});
export type NoticeListQuery = z.infer<typeof NoticeListQuery>;

export const adminNoticeContract = defineContract({
  list: {
    method: 'GET',
    path: '/admin/notice',
    query: NoticeListQuery,
    response: paginatedResponse(NoticeSummary),
  },
  detail: {
    method: 'GET',
    path: '/admin/notice/:noticeId',
    params: z.object({ noticeId: ObjectId }),
    response: NoticeRecord,
  },
  create: {
    method: 'POST',
    path: '/admin/notice',
    body: CreateNoticeBody,
    response: NoticeRecord,
    successStatus: 201,
  },
  update: {
    method: 'PUT',
    path: '/admin/notice/:noticeId',
    params: z.object({ noticeId: ObjectId }),
    body: UpdateNoticeBody,
    response: NoticeRecord,
    successStatus: 202,
  },
  remove: {
    method: 'DELETE',
    path: '/admin/notice/:noticeId',
    params: z.object({ noticeId: ObjectId }),
    response: DeleteNoticeResponse,
    successStatus: 202,
  },
} as const);
