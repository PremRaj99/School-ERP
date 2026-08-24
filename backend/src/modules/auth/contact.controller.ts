import { authContract } from '@schoolerp/contracts';
import { defineRoute } from '@/core/http/defineRoute';
import { ContactService } from './services/contact.service';

export const submitContact = defineRoute(authContract.contact, async ({ body }) => {
  await ContactService.createContact(body);
  return null;
});
