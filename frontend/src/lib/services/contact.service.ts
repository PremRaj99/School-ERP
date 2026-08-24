import { authContract, type ContactUsBody } from '@schoolerp/contracts';
import { api } from '../api/typed-client';

export const contactService = {
  submitContact: (body: ContactUsBody) => api(authContract.contact, { body }),
};
