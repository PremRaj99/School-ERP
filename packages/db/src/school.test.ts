const { PrismaClient, Role, TxnCategory, TxnStatus, WeekDay, AttendanceStatus } = require('@prisma/client');

// Initialize Prisma Client
const prisma = new PrismaClient();

describe('School Management System Schema', () => {

    // Before running tests, clean up the database to ensure a fresh start
    beforeAll(async () => {
        // A more robust cleanup would delete in an order that respects relations,
        // but for this test, we'll focus on the models we're creating.
        await prisma.examResult.deleteMany({});
        await prisma.examSubject.deleteMany({});
        await prisma.exam.deleteMany({});
        await prisma.student.deleteMany({});
        await prisma.teacher.deleteMany({});
        await prisma.user.deleteMany({});
        await prisma.subject.deleteMany({});
        await prisma.class.deleteMany({});
    });

    // Disconnect from the database after all tests are done
    afterAll(async () => {
        await prisma.$disconnect();
    });

    // Main workflow test
    it.skip('should create a full school workflow: Class -> User -> Student -> Teacher -> Exam -> Result', async () => {
        // 1. Create a Class
        const newClass = await prisma.class.create({
            data: {
                className: '10',
                section: 'A',
                session: '2025-2026',
            },
        });
        expect(newClass).toBeDefined();
        expect(newClass.className).toBe('10');

        // 2. Create a Student User and the Student profile
        const studentUser = await prisma.user.create({
            data: {
                username: 'student.john',
                password: 'hashed_password_123', // In a real app, this would be properly hashed
                role: Role.Student,
            },
        });

        const newStudent = await prisma.student.create({
            data: {
                studentId: 'S-10A-01',
                userId: studentUser.id,
                firstName: 'John',
                lastName: 'Doe',
                dob: new Date('2010-05-15T00:00:00.000Z'),
                phone: '1234567890',
                classId: newClass.id,
                rollNo: 1,
            },
        });
        expect(newStudent).toBeDefined();
        expect(newStudent.studentId).toBe('S-10A-01');

        // 3. Create a Teacher User and the Teacher profile
        const teacherUser = await prisma.user.create({
            data: {
                username: 'teacher.jane',
                password: 'hashed_password_456',
                role: Role.Teacher,
            },
        });

        const newTeacher = await prisma.teacher.create({
            data: {
                teacherId: 'T-MATH-01',
                userId: teacherUser.id,
                firstName: 'Jane',
                lastName: 'Smith',
                dob: new Date('1990-08-20T00:00:00.000Z'),
                phone: '0987654321',
                salaryPerMonth: 50000,
                qualifications: ['M.Sc. Mathematics'],
                subjectHandled: ['Mathematics']
            },
        });
        expect(newTeacher).toBeDefined();

        // 4. Create a Subject
        const newSubject = await prisma.subject.create({
            data: {
                subjectName: 'Mathematics',
                subjectCode: 'MATH101',
            }
        });
        expect(newSubject).toBeDefined();

        // 5. Create an Exam, link it to the Class and Subject
        const newExam = await prisma.exam.create({
            data: {
                classId: newClass.id,
                title: 'Mid-Term Exam',
                dateFrom: new Date('2025-09-10T00:00:00.000Z'),
                isResultDecleared: false,
            }
        });

        const newExamSubject = await prisma.examSubject.create({
            data: {
                examId: newExam.id,
                subjectId: newSubject.id,
                teacherId: newTeacher.id,
                fullMarks: 100,
                date: new Date('2025-09-12T00:00:00.000Z'),
            }
        });

        // 6. Create an Exam Result for the Student
        const newExamResult = await prisma.examResult.create({
            data: {
                examSubjectId: newExamSubject.id,
                studentId: newStudent.id,
                marksObtained: 85,
                grade: 'A',
                remark: 'Excellent'
            }
        });
        expect(newExamResult).toBeDefined();
        expect(newExamResult.marksObtained).toBe(85);

        // 7. Verification: Fetch the student and verify all relations
        const fetchedStudent = await prisma.student.findUnique({
            where: { id: newStudent.id },
            include: {
                user: true,
                class: true,
                examResults: {
                    include: {
                        examSubject: {
                            include: {
                                exam: true,
                                teacher: true,
                                subject: true,
                            }
                        }
                    }
                }
            }
        });

        expect(fetchedStudent?.user.username).toBe('student.john');
        expect(fetchedStudent?.class.className).toBe('10');
        expect(fetchedStudent?.examResults[0].marksObtained).toBe(85);
        expect(fetchedStudent?.examResults[0].examSubject.teacher.firstName).toBe('Jane');
        expect(fetchedStudent?.examResults[0].examSubject.subject.subjectName).toBe('Mathematics');
        expect(fetchedStudent?.examResults[0].examSubject.exam.title).toBe('Mid-Term Exam');
    });

    it.skip('should cascade delete a student and their results when their user is deleted', async () => {
        // Setup: Create the necessary entities again for this isolated test
        const classForDelete = await prisma.class.create({
            data: { className: '9', section: 'B', session: '2025-2026' }
        });
        const userForDelete = await prisma.user.create({
            data: { username: 'student.delete', password: 'pwd', role: Role.Student }
        });
        const studentForDelete = await prisma.student.create({
            data: {
                studentId: 'S-09B-10',
                userId: userForDelete.id,
                firstName: 'Test',
                lastName: 'Delete',
                dob: new Date(),
                phone: '5555555',
                classId: classForDelete.id,
                rollNo: 10,
            }
        });

        // Verify creation
        expect(studentForDelete).toBeDefined();

        // Action: Delete the user. The relation `User -> Student` has `onDelete: Cascade`.
        await prisma.user.delete({
            where: { id: userForDelete.id }
        });

        // Verification: Check if the user and the associated student are deleted
        const findDeletedUser = await prisma.user.findUnique({ where: { id: userForDelete.id } });
        const findDeletedStudent = await prisma.student.findUnique({ where: { id: studentForDelete.id } });

        expect(findDeletedUser).toBeNull();
        expect(findDeletedStudent).toBeNull(); // This should be null because of the cascade
    });
});