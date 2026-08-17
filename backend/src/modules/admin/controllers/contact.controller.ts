import { validateSchema } from '@/core/errors';
import { AcceptedResponse, asyncHandler, OkResponse } from '@/core/responses';
import { NextFunction, Request, Response } from 'express';
import { ObjectIdSchema } from '../types';
import { AdminContactService } from '../services/contact.service';

export const getContacts = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const data = await AdminContactService.getContacts();
    res.status(200).json(new OkResponse(data));
  },
);

export const getContactDetail = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const contactId = validateSchema(ObjectIdSchema, String(req.params.contactId));
    const data = await AdminContactService.getContactDetail(contactId);
    res.status(200).json(new OkResponse(data));
  },
);

export const deleteContact = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const contactId = validateSchema(ObjectIdSchema, String(req.params.contactId));
    await AdminContactService.deleteContact(contactId);
    res.status(202).json(new AcceptedResponse());
  },
);
