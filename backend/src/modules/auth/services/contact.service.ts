import prisma from '@/core/db';
import { ContactUsInput } from '../types';

export class ContactService {
  static async createContact(data: ContactUsInput) {
    return await prisma.contact.create({
      data: {
        email: data.email,
        message: data.message,
        name: data.name,
        mobile: data.mobile,
      },
    });
  }
}
