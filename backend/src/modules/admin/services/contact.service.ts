import prisma from '@/core/db';
import { NotFoundError } from '@/core/errors';

export class AdminContactService {
  static async getContacts() {
    return await prisma.contact.findMany();
  }

  static async getContactDetail(contactId: string) {
    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
    });

    if (!contact) {
      throw new NotFoundError();
    }
    return contact;
  }

  static async deleteContact(contactId: string) {
    try {
      await prisma.contact.delete({
        where: { id: contactId },
      });
    } catch (_e) {
      throw new NotFoundError();
    }
  }
}
