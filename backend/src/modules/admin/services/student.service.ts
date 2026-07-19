import prisma from "@/core/db";
import { NotFoundError, ValidationError } from "@/core/errors";
import { generateId, getDateString, getNewStudentSerialNumber } from "../helpers";
import { CreateStudentInput, UpdateStudentInput } from "../types";
import bcrypt from "bcrypt";

export class AdminStudentService {
  static async getStudents() {
    const students = await prisma.student.findMany({
      select: {
        id: true,
        studentId: true,
        firstName: true,
        lastName: true,
        dob: true,
        address: true,
        phone: true,
        fatherName: true,
        motherName: true,
        fatherOccupation: true,
        motherOccupation: true,
        studentAadhar: true,
        fatherAadhar: true,
        motherAadhar: true,
        class: {
          select: {
            className: true,
            section: true,
            session: true,
          },
        },
        dateOfAdmission: true,
        rollNo: true,
        appId: true,
        profilePhoto: true,
      },
    });

    return students.map(student => ({
      id: student.id,
      studentId: student.studentId,
      firstName: student.firstName,
      lastName: student.lastName,
      dob: student.dob,
      address: student.address,
      phone: student.phone,
      fatherName: student.fatherName,
      motherName: student.motherName,
      fatherOccupation: student.fatherOccupation,
      motherOccupation: student.motherOccupation,
      studentAadhar: student.studentAadhar,
      fatherAadhar: student.fatherAadhar,
      motherAadhar: student.motherAadhar,
      className: student.class?.className,
      section: student.class?.section,
      session: student.class?.session,
      dateOfAdmission: student.dateOfAdmission,
      rollNo: student.rollNo,
      appId: student.appId,
      profilePhoto: student.profilePhoto,
    }));
  }

  static async getStudentById(studentIdParam: string) {
    const student = await prisma.student.findFirst({
      where: {
        OR: [
          { id: studentIdParam },
          { studentId: studentIdParam },
        ],
      },
      select: {
        id: true,
        studentId: true,
        firstName: true,
        lastName: true,
        dob: true,
        address: true,
        phone: true,
        fatherName: true,
        motherName: true,
        fatherOccupation: true,
        motherOccupation: true,
        studentAadhar: true,
        fatherAadhar: true,
        motherAadhar: true,
        class: {
          select: {
            className: true,
            section: true,
            session: true,
          },
        },
        dateOfAdmission: true,
        rollNo: true,
        appId: true,
        profilePhoto: true,
      },
    });

    if (!student) {
      throw new NotFoundError();
    }

    return {
      id: student.id,
      studentId: student.studentId,
      firstName: student.firstName,
      lastName: student.lastName,
      dob: student.dob,
      address: student.address,
      phone: student.phone,
      fatherName: student.fatherName,
      motherName: student.motherName,
      fatherOccupation: student.fatherOccupation,
      motherOccupation: student.motherOccupation,
      studentAadhar: student.studentAadhar,
      fatherAadhar: student.fatherAadhar,
      motherAadhar: student.motherAadhar,
      className: student.class?.className,
      section: student.class?.section,
      session: student.class?.session,
      dateOfAdmission: student.dateOfAdmission,
      rollNo: student.rollNo,
      appId: student.appId,
      profilePhoto: student.profilePhoto,
    };
  }

  static async createStudent(data: CreateStudentInput) {
    const className = await prisma.class.findUnique({
      where: {
        className_section_session: {
          className: data.className,
          section: data.section,
          session: data.session,
        },
      },
    });

    if (!className) {
      throw new NotFoundError();
    }

    const serialNumber = await getNewStudentSerialNumber();
    const studentId = generateId("Student", serialNumber);
    const hashPassword = await bcrypt.hash(studentId, 10);

    try {
      await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            username: studentId,
            password: hashPassword,
            role: "Student",
          },
        });

        await tx.student.create({
          data: {
            serialNumber,
            studentId,
            firstName: data.firstName,
            lastName: data.lastName,
            dob: getDateString(data.dob),
            address: data.address,
            phone: data.phone,
            fatherName: data.fatherName,
            motherName: data.motherName,
            fatherOccupation: data.fatherOccupation,
            motherOccupation: data.motherOccupation,
            studentAadhar: data.studentAadhar,
            fatherAadhar: data.fatherAadhar,
            motherAadhar: data.motherAadhar,
            dateOfAdmission: getDateString(data.dateOfAdmission),
            rollNo: data.rollNo,
            appId: data.appId,
            profilePhoto: data.profilePhoto,
            classId: className.id,
            userId: user.id,
          },
        });
      });
    } catch (e) {
      console.error(e);
      throw new ValidationError();
    }
  }

  static async updateStudent(studentIdParam: string, data: UpdateStudentInput) {
    const student = await prisma.student.findFirst({
      where: {
        OR: [
          { id: studentIdParam },
          { studentId: studentIdParam },
        ],
      },
    });

    if (!student) {
      throw new NotFoundError();
    }

    let classId = student.classId;
    if (data.className && data.section && data.session) {
      const classRecord = await prisma.class.findUnique({
        where: {
          className_section_session: {
            className: data.className,
            section: data.section,
            session: data.session,
          },
        },
      });

      if (!classRecord) {
        throw new NotFoundError();
      }
      classId = classRecord.id;
    }

    try {
      await prisma.student.update({
        where: { id: student.id },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          dob: data.dob ? getDateString(data.dob) : undefined,
          address: data.address,
          phone: data.phone,
          fatherName: data.fatherName,
          motherName: data.motherName,
          fatherOccupation: data.fatherOccupation,
          motherOccupation: data.motherOccupation,
          studentAadhar: data.studentAadhar,
          fatherAadhar: data.fatherAadhar,
          motherAadhar: data.motherAadhar,
          dateOfAdmission: data.dateOfAdmission ? getDateString(data.dateOfAdmission) : undefined,
          rollNo: data.rollNo,
          appId: data.appId,
          profilePhoto: data.profilePhoto,
          classId,
        },
      });
    } catch (e) {
      throw new ValidationError();
    }
  }

  static async deleteStudent(studentIdParam: string) {
    const student = await prisma.student.findFirst({
      where: {
        OR: [
          { id: studentIdParam },
          { studentId: studentIdParam },
        ],
      },
    });

    if (!student) {
      throw new NotFoundError();
    }

    try {
      await prisma.user.delete({
        where: { id: student.userId },
      });
    } catch (e) {
      try {
        await prisma.student.delete({
          where: { id: student.id },
        });
      } catch (err) {
        // ignore
      }
    }
  }
}
