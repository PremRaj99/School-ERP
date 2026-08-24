import prisma from '@/core/db';
import { NotFoundError } from '@/core/errors';
import type { ContactListQuery, ContactRecord } from '@schoolerp/contracts';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@schoolerp/contracts';

interface PaginatedContacts {
  data: ContactRecord[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export class AdminContactService {
  static async getContacts(query: ContactListQuery): Promise<PaginatedContacts> {
    const page = query.page ?? DEFAULT_PAGE;
    const pageSize = query.pageSize ?? DEFAULT_PAGE_SIZE;

    const where = query.q
      ? {
          OR: [
            { name: { contains: query.q, mode: 'insensitive' as const } },
            { email: { contains: query.q, mode: 'insensitive' as const } },
            { message: { contains: query.q, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({ where, skip: (page - 1) * pageSize, take: pageSize }),
      prisma.contact.count({ where }),
    ]);

    return {
      data: contacts,
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  }

  static async getContactDetail(contactId: string): Promise<ContactRecord> {
    const contact = await prisma.contact.findUnique({ where: { id: contactId } });
    if (!contact) {
      throw new NotFoundError();
    }
    return contact;
  }

  static async deleteContact(contactId: string): Promise<{ id: string }> {
    try {
      await prisma.contact.delete({ where: { id: contactId } });
    } catch (_e) {
      throw new NotFoundError();
    }
    return { id: contactId };
  }
}
