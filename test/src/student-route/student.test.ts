import { mockTeacher } from "../admin-route/admin.test";
import { axios } from "../axios";

const adminSignupLoginToken = async () => {
    let token = "";
    const date = new Date()
    const newUser = {
        username: "testuser" + date.toISOString() + Math.random(),
        password: "TestPass123!"
    };

    await axios.post("/auth/signup", newUser)

    const res = await axios.post("/auth/login", newUser)

    token = `bearer ${res.data.data.accessToken}`;
    return token
}

const createStudent = async (token: string) => {
    await axios.post("/admin/class", {
        className: "10",
        section: "A",
        session: "2025-2026"
    }, {
        headers: { Authorization: token }
    });

    let createdStudentData = {
        firstName: "John",
        lastName: "Doe",
        dob: "15-05-2010",
        address: "123 Main St",
        phone: "9876543210",
        fatherName: "Richard Doe",
        motherName: "Jane Doe",
        fatherOccupation: "Engineer",
        motherOccupation: "Doctor",
        studentAadhar: "111122223333",
        fatherAadhar: "444455556666",
        dateOfAdmission: "01-04-2023",
        rollNo: 15,
        profilePhoto: "http://example.com/photo.jpg",
        className: "10",
        section: "A",
        session: "2025-2026",
        appId: "someAppId123" + Math.random().toString().slice(2, 8)
    };

    await axios.post("/admin/student", createdStudentData, {
        headers: { Authorization: token }
    });

    const studentsRes = await axios.get("/admin/student", {
        headers: { Authorization: token }
    });
    const lastStudent = studentsRes.data?.data?.[studentsRes.data.data.length - 1];
    return lastStudent?.studentId || "STU00000001";
}

const studentLoginToken = async (username = "STU00000001", password = "STU00000001") => {
    let token = "";
    const newUser = {
        username,
        password
    };

    const res = await axios.post("/auth/login", newUser)

    token = `bearer ${res.data?.data?.accessToken}`;
    return token
}

describe("Student/attendance route", () => {
    let adminToken = "";
    let studentToken = ""
    beforeAll(async () => {
        adminToken = await adminSignupLoginToken()
        const stuId = await createStudent(adminToken)
        studentToken = await studentLoginToken(stuId, stuId)
    })

    test("Get Attendance should return 200 with data for a valid month query", async () => {
        const response = await axios.get("/student/attendance?month=04-2025", {
            headers: { Authorization: studentToken }
        });

        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(Array.isArray(response.data.data)).toBe(true);
    });

    test("Get Attendance should return 400 if the month query is not valid", async () => {
        const res = await axios.get("/student/attendance?month=invalid-date", {
            headers: { Authorization: studentToken }
        });
        expect(res.status).toBe(400);

    });
})

describe("Student/subject route", () => {
    let adminToken = ""
    let studentToken = ""
    beforeAll(async () => {
        adminToken = await adminSignupLoginToken()
        const stuId = await createStudent(adminToken)
        studentToken = await studentLoginToken(stuId, stuId)
    })
    test("Get Subject return 200", async() => {
        const res = await axios.get("/student/subject/get-all-subject", {headers: {Authorization: studentToken}})

        expect(res.status).toBe(200)
    })
})

describe("Student/exam route", () => {
    let adminToken = ""
    let studentToken = ""

    type ExamSubject = {
        subjectCode: string;
        date: string;
        fullMarks: number;
    };

    let validExamData = {
        title: "Final Term Examination 2025",
        dateFrom: "20-08-2025",
        dateTo: "05-09-2025",
        exams: [
            {
                className: "10",
                section: "A",
                subjects: [] as ExamSubject[]
            }
        ]
    };

    beforeAll(async () => {
        adminToken = await adminSignupLoginToken()
        const stuId = await createStudent(adminToken)
        studentToken = await studentLoginToken(stuId, stuId)

        await axios.post("/admin/exam", validExamData, {
            headers: {
                Authorization: adminToken
            }
        });
    })

    test("Get Exam return 200", async () => {
        const response = await axios.get("/student/exam", {
            headers: {
                Authorization: studentToken
            }
        });

        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(Array.isArray(response.data.data)).toBe(true);

        if (response.data.data.length > 0) {
            const exam = response.data.data[0];
            expect(exam).toHaveProperty('id');
            expect(exam).toHaveProperty('title');
            expect(exam).toHaveProperty('dateFrom');
            expect(exam).toHaveProperty('dateTo');
            expect(exam).toHaveProperty('isResultDecleared');
        }
    })
})

describe("Student/academic route", () => {
    let adminToken = "";
    let studentToken = ""
    let subjectCode = "";
    let teacherId = "";
    beforeAll(async () => {
        adminToken = await adminSignupLoginToken()
        const stuId = await createStudent(adminToken)
        studentToken = await studentLoginToken(stuId, stuId)

        await axios.post("/admin/subject", {
            className: '10',
            section: "A",
            subjectName: "English"
        }, {
            headers: { Authorization: adminToken }
        })

        const subjectRes = await axios.get("/admin/subject/get-all-class-subject", {
            headers: { Authorization: adminToken }
        });

        subjectCode = subjectRes.data.data?.unassignedSubjects?.[0]?.subjectCode || "ENG101"

        await axios.post("/admin/teacher", mockTeacher, { headers: { Authorization: adminToken } });

        const teacherRes = await axios.get("/admin/teacher", { headers: { Authorization: adminToken } });
        teacherId = teacherRes.data.data[0].teacherId;

        await axios.put("/admin/academic/time-table", {
            className: "10",
            section: "A",
            weekday: "MON",
            period: 1,
            subjectCode: subjectCode,
            teacherId: teacherId
        }, { headers: { Authorization: adminToken } });

        await axios.post("/admin/academic/calendar", {
            date: "25-12-2025",
            title: "Christmas Day",
            category: "HOLIDAY"
        }, { headers: { Authorization: adminToken } });
    })

    test("Get Time Table return 200", async () => {
        const response = await axios.get("/student/academic/time-table", { headers: { Authorization: studentToken } })

        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(Array.isArray(response.data.data)).toBe(true);
    })

    test("Get Academic Calendar return 200", async () => {
        const response = await axios.get("/student/academic/calendar", { headers: { Authorization: studentToken } })

        expect(response.status).toBe(200);
        expect(Array.isArray(response.data.data)).toBe(true);

        const createdEvent = response.data.data.find((event: any) => event.title === "Christmas Day");
        expect(createdEvent).toBeDefined();
        expect(createdEvent.category).toBe("HOLIDAY");
    })
})

describe("Student/notice route", () => {
    let adminToken = "";
    let noticeId = ""
    let studentToken = ""
    beforeAll(async () => {
        adminToken = await adminSignupLoginToken()
        const stuId = await createStudent(adminToken)
        studentToken = await studentLoginToken(stuId, stuId)

        const noticeData = {
            title: "Annual Sports Day",
            description: "The annual sports day will be held next month. All students are invited.",
            date: "21-08-2025",
            targetRole: "Student",
            expiryDate: "30-09-2025",
            fileUrl: "http://example.com/sports_day_notice.pdf"
        };

        await axios.post("/admin/notice", noticeData, {
            headers: { Authorization: adminToken }
        });
    })
    test("Get notices should return 200 with an array of notices", async () => {
        const response = await axios.get("/student/notice", {
            headers: { Authorization: studentToken }
        });

        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(Array.isArray(response.data.data)).toBe(true);

        const createdNotice = response.data.data.find((notice: any) => notice.title === "Annual Sports Day");
        expect(createdNotice).toBeDefined();
        expect(createdNotice).toHaveProperty("id");
        expect(createdNotice).toHaveProperty("title", "Annual Sports Day");
        expect(createdNotice).toHaveProperty("date");
        expect(createdNotice).toHaveProperty("targetRole", "Student");

        noticeId = createdNotice.id;
    });

    test("Get notice detail should return 200 with full notice data", async () => {
        expect(noticeId).not.toBe("");

        const response = await axios.get(`/student/notice/${noticeId}`, {
            headers: { Authorization: studentToken }
        });

        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        const notice = response.data.data;
        expect(notice.id).toBe(noticeId);
        expect(notice.title).toBe("Annual Sports Day");
        expect(notice.description).toBe("The annual sports day will be held next month. All students are invited.");
        expect(notice.targetRole).toBe("Student");
        expect(notice.fileUrl).toBe("http://example.com/sports_day_notice.pdf");
    });
})

describe("Student route", () => {
    let studentToken = ""
    let adminToken = ""
    beforeAll(async () => {
        adminToken = await adminSignupLoginToken()
        const stuId = await createStudent(adminToken)
        studentToken = await studentLoginToken(stuId, stuId);
    })

    test("Get Student should return 200 with student profile data", async () => {
        const response = await axios.get("/student", {
            headers: { Authorization: studentToken }
        });

        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        const student = response.data.data;
        expect(student.firstName).toBe("John");
        expect(student.lastName).toBe("Doe");
        expect(student.className).toBe("10");
        expect(student.section).toBe("A");
        expect(student.session).toBe("2025-2026");
        expect(student).toHaveProperty("studentId");
        expect(student.class).toBeUndefined();
    });

    test("Get Student should return 403 if the user is not a student", async () => {
        const res = await axios.get("/student", {
            headers: { Authorization: adminToken }
        });
        expect(res.status).toBe(403);
    });
})