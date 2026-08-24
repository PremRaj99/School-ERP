import { z } from 'zod';
import { defineContract } from '../envelope';
import { ObjectId, PageQuery, paginatedResponse } from '../primitives';

export const ContactRecord = z.object({
  id: ObjectId,
  name: z.string(),
  email: z.string(),
  mobile: z.string(),
  message: z.string(),
});
export type ContactRecord = z.infer<typeof ContactRecord>;

export const DeleteContactResponse = z.object({ id: ObjectId });

// No `sortBy` — `Contact` has no `createdAt` yet (🔒D2), so there's no chronological field to sort
// by; the default (insertion/`_id` order) is already roughly chronological.
export const ContactListQuery = PageQuery.extend({});
export type ContactListQuery = z.infer<typeof ContactListQuery>;

export const adminContactContract = defineContract({
  list: {
    method: 'GET',
    path: '/admin/contact',
    query: ContactListQuery,
    response: paginatedResponse(ContactRecord),
  },
  detail: {
    method: 'GET',
    path: '/admin/contact/:contactId',
    params: z.object({ contactId: ObjectId }),
    response: ContactRecord,
  },
  remove: {
    method: 'DELETE',
    path: '/admin/contact/:contactId',
    params: z.object({ contactId: ObjectId }),
    response: DeleteContactResponse,
    successStatus: 202,
  },
} as const);
