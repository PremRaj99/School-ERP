import prisma from '@/core/db';
import { NotFoundError, ValidationError } from '@/core/errors';
import { generateId, getDateString, getNewTeacherSerialNumber } from '../helpers';
import { CreateTeacherInput, UpdateTeacherInput } from '../types';
import bcrypt from 'bcrypt';

export class AdminTeacherService {
  static async getTeachers() {
    return await prisma.teacher.findMany({
      select: {
        id: true,
        teacherId: true,
        firstName: true,
        lastName: true,
        dob: true,
        address: true,
        phone: true,
        teacherAadhar: true,
        dateOfJoining: true,
        about: true,
        salaryPerMonth: true,
        qualifications: true,
        subjectHandled: true,
        profilePhoto: true,
        user: { select: { username: true } },
      },
    });
  }

  static async getTeacherById(teacherIdParam: string) {
    const teacher = await prisma.teacher.findFirst({
      where: {
        OR: [{ id: teacherIdParam }, { teacherId: teacherIdParam }],
      },
      select: {
        id: true,
        teacherId: true,
        firstName: true,
        lastName: true,
        dob: true,
        address: true,
        phone: true,
        teacherAadhar: true,
        dateOfJoining: true,
        about: true,
        salaryPerMonth: true,
        qualifications: true,
        subjectHandled: true,
        profilePhoto: true,
      },
    });

    if (!teacher) {
      throw new NotFoundError();
    }
    return teacher;
  }

  static async createTeacher(data: CreateTeacherInput) {
    const serialNumber = await getNewTeacherSerialNumber();
    const teacherId = generateId('Teacher', serialNumber);
    const hashPassword = await bcrypt.hash(teacherId, 10);

    try {
      await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            username: teacherId,
            password: hashPassword,
            role: 'Teacher',
          },
        });

        await tx.teacher.create({
          data: {
            serialNumber,
            teacherId,
            firstName: data.firstName,
            lastName: data.lastName,
            dob: getDateString(data.dob),
            address: data.address,
            phone: data.phone,
            teacherAadhar: data.teacherAadhar,
            dateOfJoining: getDateString(data.dateOfJoining),
            about: data.about,
            salaryPerMonth: data.salaryPerMonth,
            qualifications: data.qualifications,
            subjectHandled: data.subjectsHandled,
            profilePhoto: data.profilePhoto,
            userId: user.id,
          },
        });
      });
    } catch (e) {
      console.error(e);
      throw new ValidationError();
    }
  }

  static async updateTeacher(teacherIdParam: string, data: UpdateTeacherInput) {
    const teacher = await prisma.teacher.findFirst({
      where: {
        OR: [{ id: teacherIdParam }, { teacherId: teacherIdParam }],
      },
    });

    if (!teacher) {
      throw new NotFoundError();
    }

    try {
      await prisma.teacher.update({
        where: { id: teacher.id },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          dob: data.dob ? getDateString(data.dob) : undefined,
          address: data.address,
          phone: data.phone,
          teacherAadhar: data.teacherAadhar,
          dateOfJoining: data.dateOfJoining ? getDateString(data.dateOfJoining) : undefined,
          about: data.about,
          salaryPerMonth: data.salaryPerMonth,
          qualifications: data.qualifications,
          subjectHandled: data.subjectsHandled,
          profilePhoto: data.profilePhoto,
        },
      });
    } catch (e) {
      throw new ValidationError();
    }
  }

  static async deleteTeacher(teacherIdParam: string) {
    const teacher = await prisma.teacher.findFirst({
      where: {
        OR: [{ id: teacherIdParam }, { teacherId: teacherIdParam }],
      },
    });

    if (!teacher) {
      throw new NotFoundError();
    }

    try {
      await prisma.teacher.delete({
        where: { id: teacher.id },
      });
    } catch (e) {
      try {
        await prisma.user.delete({
          where: { id: teacher.userId },
        });
      } catch (err) {
        // ignore
      }
    }
  }
}
