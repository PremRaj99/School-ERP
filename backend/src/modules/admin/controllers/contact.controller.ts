import { adminContactContract } from '@schoolerp/contracts';
import { defineRoute } from '@/core/http/defineRoute';
import { AdminContactService } from '../services/contact.service';

export const getContacts = defineRoute(adminContactContract.list, async ({ query }) => {
  return AdminContactService.getContacts(query);
});

export const getContactDetail = defineRoute(adminContactContract.detail, async ({ params }) => {
  return AdminContactService.getContactDetail(params.contactId);
});

export const deleteContact = defineRoute(adminContactContract.remove, async ({ params }) => {
  return AdminContactService.deleteContact(params.contactId);
});
