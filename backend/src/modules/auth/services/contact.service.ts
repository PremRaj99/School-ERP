import prisma from '@/core/db';
import type { ContactUsBody } from '@schoolerp/contracts';

export class ContactService {
  static async createContact(data: ContactUsBody) {
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
