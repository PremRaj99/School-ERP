import { Router } from 'express';
import { deleteContact, getContactDetail, getContacts } from '../controllers/contact.controller';

export const contactRouter = Router();

contactRouter.get('/', getContacts);
contactRouter.get('/:contactId', getContactDetail);
contactRouter.delete('/:contactId', deleteContact);
