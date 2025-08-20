import { axios } from "../axios"

// Mock data for creating a new teacher
const mockTeacher = {
    firstName: "John",
    lastName: "Doe",
    dob: "15-01-1990",
    dateOfJoining: "01-08-2023",
    phone: "9876543210", // valid 10-digit Indian phone number
    salaryPerMonth: 50000,
    about: "An experienced mathematics teacher.",
    address: "123 Main St, Anytown",
    profilePhoto: "http://example.com/photo.jpg",
    qualifications: "M.Sc. in Mathematics",
    teacherAadhar: "123456789012",
    subjectsHandled: ["Mathematics", "Physics"]
};

// Mock data for updating a teacher
const mockUpdateTeacher = {
    firstName: "John",
    lastName: "DoeUpdated",
    phone: "9123456789", // valid 10-digit Indian phone number
    // ... add other fields you want to test for updates
};

// Variable to store the created teacher's ID for use in other tests
let createdTeacherId = '';

describe.skip("admin/teacher Route", () => {
    let token = ""
    beforeAll(async () => {
        const date = new Date()
        const newUser = {
            username: "testuser" + date.toISOString(),
            password: "TestPass123!"
        };

        await axios.post("/auth/signup", newUser)

        const res = await axios.post("/auth/login", newUser)

        token = `bearer ${res.data.data.accessToken}`;
    });

    test("create Teacher should be 201 with valid input schema", async () => {
        const response = await axios.post("/admin/teacher", mockTeacher, {
            headers: {
                Authorization: token
            }
        });
        expect(response.status).toBe(201);
        // Assuming the response for creation doesn't return the full object,
        // but we'll need to fetch it to get the ID for other tests.
        // This part might need adjustment based on your actual API behavior.

    });

    test("create Teacher should be 400 if invalid input schema", async () => {
        // Sending incomplete data to trigger a validation error
        const { firstName, ...invalidData } = mockTeacher;
        await axios.post("/admin/teacher", invalidData);

    });


    test("get Teachers to be 200 and get array of {firstName, lastName, phone, subjectHandled, profilePhoto, teacherId}", async () => {

        const response = await axios.get("/admin/teacher", {
            headers: {
                Authorization: token
            }
        });
        expect(response.status).toBe(200);
        expect(Array.isArray(response.data.data)).toBe(true);
        if (response.data.data.length > 0) {
            const teacher = response.data.data[0];
            expect(teacher).toHaveProperty("firstName");
            expect(teacher).toHaveProperty("lastName");
            expect(teacher).toHaveProperty("phone");
            expect(teacher).toHaveProperty("subjectHandled");
            expect(teacher).toHaveProperty("profilePhoto");
            expect(teacher).toHaveProperty("teacherId");
            // Store the teacherId from the list for later tests
            createdTeacherId = teacher.id;
        }

    });

    test("get Teacher Detail to be 200 with correct data if TeacherId is correct", async () => {
        expect(createdTeacherId).not.toBe(''); // Ensure we have a teacherId to test

        const response = await axios.get(`/admin/teacher/${createdTeacherId}`, {
            headers: {
                Authorization: token
            }
        });
        expect(response.status).toBe(200);
        const teacher = response.data.data;
        expect(teacher).toHaveProperty("firstName");
        expect(teacher).toHaveProperty("lastName");
        expect(teacher).toHaveProperty("dob");
        expect(teacher).toHaveProperty("address");
        expect(teacher).toHaveProperty("phone");
        expect(teacher).toHaveProperty("teacherAadhar");
        expect(teacher).toHaveProperty("dateOfJoining");
        expect(teacher).toHaveProperty("about");
        expect(teacher).toHaveProperty("salaryPerMonth");
        expect(teacher).toHaveProperty("qualifications");
        expect(teacher).toHaveProperty("subjectsHandled");
        expect(teacher).toHaveProperty("profilePhoto");
        expect(teacher).toHaveProperty("teacherId");

    });

    test("get Teacher Detail to be 404 if TeacherId is incorrect", async () => {
        const res = await axios.get("/admin/teacher/507f191e810c19729de860ea", {
            headers: {
                Authorization: token
            }
        });
        expect(res.status).toBe(404)

    });

    test("update Teacher should be 202 with valid data", async () => {
        expect(createdTeacherId).not.toBe('');
        const response = await axios.put(`/admin/teacher/${createdTeacherId}`, mockUpdateTeacher, {
            headers: {
                Authorization: token
            }
        });
        expect(response.status).toBe(202);
    });

    test("update Teacher should be 404 if teacherId is incorrect", async () => {
        const res = await axios.put("/admin/teacher/507f191e810c19729de860ea", mockUpdateTeacher, {
            headers: {
                Authorization: token
            }
        });
        expect(res.status).toBe(404)

    });

    test("delete Teacher should be 202 if teacherId is correct", async () => {
        expect(createdTeacherId).not.toBe('');

        const response = await axios.delete(`/admin/teacher/${createdTeacherId}`, {
            headers: {
                Authorization: token
            }
        });
        expect(response.status).toBe(202);

    });

    test("delete Teacher should be 404 if teacherId is incorrect", async () => {

        const res = await axios.delete("/admin/teacher/507f191e810c19729de860ea", {
            headers: {
                Authorization: token
            }
        });

        expect(res.status).toBe(404)
    });
});

describe.skip("admin/stundent Route", () => {
    let token = "";
    let studentId = ""; // To store the ID of the student we create for subsequent tests
    let createdStudentData = {}; // To hold the data for the new student
    beforeAll(async () => {
        const date = new Date();
        const newUser = {
            username: "testuser" + date.toISOString(),
            password: "TestPass123!"
        };

        // Sign up and log in to get an authentication token
        await axios.post("/auth/signup", newUser);
        const res = await axios.post("/auth/login", newUser);
        token = `bearer ${res.data.data.accessToken}`;

        await axios.post("/admin/class", { className: "10", section: "A", session: "2023-2024" }, { headers: { Authorization: token } });

        // Define the student data to be used for creation
        createdStudentData = {
            firstName: "John",
            lastName: "Doe",
            dob: "15-05-2010",
            address: "123 Main St",
            phone: "9876543210", // valid 10-digit Indian phone number
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
            session: "2023-2024",
            appId: "someAppId123"
        };
    });

    // Test case for creating a student with a valid schema
    test("Create Student to be 201 if valid schema", async () => {
        const res = await axios.post("/admin/student", createdStudentData, {
            headers: { Authorization: token }
        });

        // Expect a 201 Created status
        expect(res.status).toBe(201);
        // It's good practice to fetch all students again to find the one we just created
        const allStudentsRes = await axios.get("/admin/student", { headers: { Authorization: token } });
        const newStudent = allStudentsRes.data.data.find((s: any) => s.rollNo === 15);
        expect(newStudent).toBeDefined();
        studentId = newStudent.id; // Save the ID for other tests
    });

    // Test case for attempting to create a student with an invalid schema
    test("Create Student to be 400 if invalid schema", async () => {
        // Create an object with missing required fields (e.g., firstName)
        const invalidData = { ...createdStudentData, firstName: undefined };

        const res = await axios.post("/admin/student", invalidData, {
            headers: { Authorization: token }
        });
        expect(res.status).toBe(400);

    });

    // Test case for fetching all students
    test("Get Student to be 200 with data as Array of {firstName, lastName, ...}", async () => {
        const res = await axios.get("/admin/student", {
            headers: { Authorization: token }
        });

        // Expect a 200 OK status
        expect(res.status).toBe(200);
        // Expect the response data to be an array
        expect(Array.isArray(res.data.data)).toBe(true);
        // Check if the first student object has the expected structure
        if (res.data.data.length > 0) {
            expect(res.data.data[0]).toHaveProperty('firstName');
            expect(res.data.data[0]).toHaveProperty('lastName');
            expect(res.data.data[0]).toHaveProperty('studentId');
            expect(res.data.data[0]).toHaveProperty('className');
            expect(res.data.data[0]).toHaveProperty('section');
            expect(res.data.data[0]).toHaveProperty('session');
        }
    });

    // Test case for fetching the details of a specific student
    test("Get Student Detail to be 200 with detailed data", async () => {
        const res = await axios.get(`/admin/student/${studentId}`, {
            headers: { Authorization: token }
        });

        // Expect a 200 OK status
        expect(res.status).toBe(200);
        const student = res.data.data;
        // Check for the detailed properties in the response
        expect(student).toHaveProperty('firstName', 'John');
        expect(student).toHaveProperty('address', '123 Main St');
        expect(student).toHaveProperty('fatherName', 'Richard Doe');
        expect(student).toHaveProperty('studentId');
    });

    // Test case for fetching a student with an invalid ID
    test("Get Student Detail to be 404 if invalid studentId", async () => {

        const res = await axios.get(`/admin/student/507f191e810c19729de860ea`, {
            headers: { Authorization: token }
        });
        expect(res.status).toBe(404);

    });

    // Test case for updating a student with a valid schema
    test("Update Student to be 202 if valid schema", async () => {
        const updateData = {
            firstName: "Jonathan",
            phone: "9987654321"
        };

        const res = await axios.put(`/admin/student/${studentId}`, updateData, {
            headers: { Authorization: token }
        });

        // Expect a 202 Accepted status
        expect(res.status).toBe(202);

        // Verify the update by fetching the student's details again
        const updatedRes = await axios.get(`/admin/student/${studentId}`, { headers: { Authorization: token } });
        expect(updatedRes.data.data.firstName).toBe("Jonathan");
        expect(updatedRes.data.data.phone).toBe("9987654321");
    });

    // Test case for updating a student with an invalid schema
    test("Update Student to be 400 if invalid schema", async () => {
        // rollNo should be a number, not a string
        const invalidUpdate = { rollNo: "not-a-number" };

        const res = await axios.put(`/admin/student/${studentId}`, invalidUpdate, {
            headers: { Authorization: token }
        });
        expect(res.status).toBe(400);

    });

    // Test case for updating a student with an invalid ID
    test("Update Student to be 404 if invalid studentId", async () => {
        const updateData = { firstName: "Jane" };

        const res = await axios.put(`/admin/student/507f191e810c19729de860ea`, updateData, {
            headers: { Authorization: token }
        });
        expect(res.status).toBe(404);

    });

    // Test case for deleting a student with a correct ID
    test("delete Student with correct StudentId give 202", async () => {
        const res = await axios.delete(`/admin/student/${studentId}`, {
            headers: { Authorization: token }
        });

        // Expect a 202 Accepted status
        expect(res.status).toBe(202);

        // Verify deletion by trying to fetch the student again, expecting a 404

        const response = await axios.get(`/admin/student/${studentId}`, { headers: { Authorization: token } });
        expect(response.status).toBe(404);

    });

    // Test case for deleting a student with an incorrect ID
    test("delete Student with incorrect StudentId give 404", async () => {
        const res = await axios.delete(`/admin/student/507f191e810c19729de860ea`, {
            headers: { Authorization: token }
        });
        expect(res.status).toBe(404);

    });
});

describe.skip("admin/attendance Route", () => {
    let token = "";
    let teacherId = "";
    let teacherDbId = ""

    beforeAll(async () => {
        const date = new Date();
        const newUser = {
            username: "testuser" + date.toISOString(),
            password: "TestPass123!"
        };

        // Sign up and log in to get an authentication token
        await axios.post("/auth/signup", newUser);
        const res = await axios.post("/auth/login", newUser);
        token = `bearer ${res.data.data.accessToken}`;

        const response = await axios.post("/admin/teacher", mockTeacher, {
            headers: {
                Authorization: token
            }
        });
        expect(response.status).toBe(201);

        const getTeacher = await axios.get("/admin/teacher", {
            headers: {
                Authorization: token
            }
        });
        expect(getTeacher.status).toBe(200);
        teacherId = getTeacher.data.data[0].teacherId;
        teacherDbId = getTeacher.data.data[0].id;
    })

    test("Get Teacher Attendance for Date should return 200 with correct data structure", async () => {
        // Arrange: First, create an attendance record to fetch
        const date = '20-08-2025';
        const attendancePayload = [{
            teacherId: teacherId,
            status: 'Present'
        }];
        await axios.post(`/admin/attendance/teacher-attendance?date=${date}`, attendancePayload, {
            headers: { Authorization: token }
        });

        // Act: Fetch the attendance for that date
        const response = await axios.get(`/admin/attendance/teacher-attendance?date=${date}`, {
            headers: { Authorization: token }
        });

        // Assert
        expect(response.status).toBe(200);
        expect(response.data.data).toHaveProperty('date', date);
        expect(response.data.data).toHaveProperty('teachers');
        expect(Array.isArray(response.data.data.teachers)).toBe(true);

        const attendanceRecord = response.data.data.teachers.find((t: any) => t.teacherId === teacherId);
        expect(attendanceRecord).toBeDefined();
        expect(attendanceRecord).toHaveProperty('id');
        expect(attendanceRecord).toHaveProperty('status', 'Present');
        expect(attendanceRecord).toHaveProperty('firstName', mockTeacher.firstName);
        expect(attendanceRecord).toHaveProperty('lastName', mockTeacher.lastName);
        expect(attendanceRecord).toHaveProperty('teacherId', teacherId);
    });

    test("Create Teacher Attendance for Date should return 201 if teacherId is correct", async () => {
        // Arrange
        const date = '21-08-2025'; // Use dd-mm-yyyy format to match API expectations
        const payload = [{
            teacherId: teacherId,
            status: 'Absent'
        }];

        // Act
        const response = await axios.post(`/admin/attendance/teacher-attendance?date=${date}`, payload, {
            headers: { Authorization: token }
        });

        // Assert
        expect(response.status).toBe(201);

        // Verify by fetching
        const verifyRes = await axios.get(`/admin/attendance/teacher-attendance?date=${date}`, {
            headers: { Authorization: token }
        });
        const createdRecord = verifyRes.data.data.teachers.find((t: any) => t.teacherId === teacherId);
        expect(createdRecord).toBeDefined();
        expect(createdRecord.status).toBe('Absent');
    });

    test("Create Teacher Attendance for Date should return 400 if validation error", async () => {
        // Arrange
        const date = '22-08-2025';
        const invalidPayload = [{
            teacherId: teacherId,
            status: 'LATE_Absent' // Assuming this is not a valid status enum
        }];


        const res = await axios.post(`/admin/attendance/teacher-attendance?date=${date}`, invalidPayload, {
            headers: { Authorization: token }
        });
        expect(res.status).toBe(400);

    });

    test("Create Teacher Attendance for Date should return 404 if teacherId is not valid", async () => {
        // Arrange
        const date = '23-08-2025';
        const payload = [{
            teacherId: 'TCH20240004',
            status: 'Present'
        }];

        const res = await axios.post(`/admin/attendance/teacher-attendance?date=${date}`, payload, {
            headers: { Authorization: token }
        });
        expect(res.status).toBe(404);

    });

    test("Update Teacher Attendance should return 202 if id is correct", async () => {
        // Arrange: Create a record to update
        const date = '24-08-2025';
        const createPayload = [{
            teacherId: teacherId,
            status: 'Present'
        }];
        await axios.post(`/admin/attendance/teacher-attendance?date=${date}`, createPayload, {
            headers: { Authorization: token }
        });
        const getRes = await axios.get(`/admin/attendance/teacher-attendance?date=${date}`, {
            headers: { Authorization: token }
        });
        const recordToUpdate = getRes.data.data.teachers.find((t: any) => t.teacherId === teacherId);
        expect(recordToUpdate).toBeDefined();

        const updatePayload = [{
            id: recordToUpdate.id,
            teacherId: teacherId,
            status: 'Absent'
        }];

        // Act
        const response = await axios.put('/admin/attendance/teacher-attendance', updatePayload, {
            headers: { Authorization: token }
        });

        // Assert
        expect(response.status).toBe(202);

        // Verify the update
        const verifyRes = await axios.get(`/admin/attendance/teacher-attendance?date=${date}`, {
            headers: { Authorization: token }
        });
        const updatedRecord = verifyRes.data.data.teachers.find((t: any) => t.id === recordToUpdate.id);
        expect(updatedRecord).toBeDefined();
        expect(updatedRecord.status).toBe('Absent');
    });

    test("Update Teacher Attendance should return 502 for incorrect id", async () => {
        // The controller throws a generic DatabaseError, which might result in a 500.
        // A 404 would be more appropriate, but we test the current implementation.
        // Arrange
        const invalidUpdatePayload = [{
            id: '507f191e810c19729de860ea', // A valid but non-existent UUID
            teacherId: teacherId,
            status: 'Present'
        }];

        const res = await axios.put('/admin/attendance/teacher-attendance', invalidUpdatePayload, {
            headers: { Authorization: token }
        });
        expect(res.status).toBe(502);

    });
})

describe.skip("admin/subject Route", () => {
    let token = "";
    let teacherId = "";
    let teacherDbId = ""

    // Mock data for subjects
    const mockSubject = {
        subjectName: "General Science",
        className: "10" // This should match the class created in beforeAll
    };

    const mockUpdateSubject = {
        subjectName: "Advanced Science"
    };

    beforeAll(async () => {
        const date = new Date();
        const newUser = {
            username: "testuser" + date.toISOString(),
            password: "TestPass123!"
        };

        // Sign up and log in to get an authentication token
        await axios.post("/auth/signup", newUser);
        const res = await axios.post("/auth/login", newUser);
        token = `bearer ${res.data.data.accessToken}`;

        const response = await axios.post("/admin/teacher", mockTeacher, {
            headers: {
                Authorization: token
            }
        });
        expect(response.status).toBe(201);

        const getTeacher = await axios.get("/admin/teacher", {
            headers: {
                Authorization: token
            }
        });
        expect(getTeacher.status).toBe(200);
        teacherId = getTeacher.data.data[0].teacherId;
        teacherDbId = getTeacher.data.data[0].id;

        await axios.post("/admin/class", {
            className: "10",
            section: "A",
            session: "2025-2026"
        }, {
            headers: { Authorization: token }
        });
    })


    test("Create Subject should return 201 if input data is valid", async () => {
        const res = await axios.post("/admin/subject", mockSubject, {
            headers: { Authorization: token }
        });
        expect(res.status).toBe(201);
    });

    test("Get All Class Subjects should return 200 with the correct data structure", async () => {
        const res = await axios.get("/admin/subject/get-all-class-subject", {
            headers: { Authorization: token }
        });

        expect(res.status).toBe(200);
        expect(res.data.data).toHaveProperty("assignedSubjects");
        expect(res.data.data).toHaveProperty("unassignedSubjects");
        expect(Array.isArray(res.data.data.assignedSubjects)).toBe(true);
        expect(Array.isArray(res.data.data.unassignedSubjects)).toBe(true);
    });

    test("Create Subject should return 400 if input data is invalid", async () => {
        const invalidSubject = { ...mockSubject, subjectName: "" }; // Invalid name

        const res = await axios.post("/admin/subject", invalidSubject, {
            headers: { Authorization: token }
        });
        expect(res.status).toBe(400);

    });

    test("Create Subject should return 404 if className is incorrect", async () => {
        const subjectWithWrongClass = { ...mockSubject, className: "12" };

        const res = await axios.post("/admin/subject", subjectWithWrongClass, {
            headers: { Authorization: token }
        });
        expect(res.status).toBe(404);

    });

    test("Update Subject should return 202 if subjectCode and input are valid", async () => {
        // 1. Create a subject to update first
        const createRes = await axios.post("/admin/subject", { ...mockSubject, subjectName: "Updatable Subject" }, {
            headers: { Authorization: token }
        });
        expect(createRes.status).toBe(201);

        // 2. Get all subjects to find the subjectCode of the newly created subject
        const getRes = await axios.get("/admin/subject/get-all-class-subject", { headers: { Authorization: token } });
        const subjectToUpdate = getRes.data.data?.unassignedSubjects.find((s: any) => s.subjectName === "Updatable Subject");
        expect(subjectToUpdate).toBeDefined();

        // 3. Update the subject
        const updateRes = await axios.put(`/admin/subject/${subjectToUpdate.subjectCode}`, mockUpdateSubject, {
            headers: { Authorization: token }
        });
        expect(updateRes.status).toBe(202);
    });

    test("Update Subject should return 400 if input schema is invalid", async () => {
        // Get a valid subject code from a previously created subject
        const getRes = await axios.get("/admin/subject/get-all-class-subject", { headers: { Authorization: token } });
        const subjectCode = getRes.data.data?.unassignedSubjects[0].subjectCode;

        const res = await axios.put(`/admin/subject/${subjectCode}`, { subjectName: "" }, { // Invalid name
            headers: { Authorization: token }
        });
        expect(res.status).toBe(400);

    });

    test("Update Subject should return 404 if subjectCode is invalid", async () => {
        const invalidSubjectCode = "SCI456";

        const res = await axios.put(`/admin/subject/${invalidSubjectCode}`, mockUpdateSubject, {
            headers: { Authorization: token }
        });
        expect(res.status).toBe(404);

    });

    test("Delete Subject should return 202 if subjectCode is valid", async () => {
        // 1. Create a subject to delete
        const createRes = await axios.post("/admin/subject", { ...mockSubject, subjectName: "Deletable Subject" }, {
            headers: { Authorization: token }
        });
        expect(createRes.status).toBe(201);

        // 2. Find its subjectCode
        const getRes = await axios.get("/admin/subject/get-all-class-subject", { headers: { Authorization: token } });
        const subjectToDelete = getRes.data.data?.unassignedSubjects.find((s: any) => s.subjectName === "Deletable Subject");
        expect(subjectToDelete).toBeDefined();

        // 3. Delete it
        const deleteRes = await axios.delete(`/admin/subject/${subjectToDelete.subjectCode}`, {
            headers: { Authorization: token }
        });
        expect(deleteRes.status).toBe(202);
    });

    test("Delete Subject should return 404 if subjectCode is invalid", async () => {
        const invalidSubjectCode = "SCI345";
        const res = await axios.delete(`/admin/subject/${invalidSubjectCode}`, {
            headers: { Authorization: token }
        });
        expect(res.status).toBe(404);

    });
})

describe.skip("admin/exam Route", () => {
    let token = "";
    let createdExamId = "";
    let teacherId = "";

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
        const date = new Date();
        const newUser = {
            username: "testuser" + date.toISOString(),
            password: "TestPass123!"
        };

        // Sign up and log in to get an authentication token
        await axios.post("/auth/signup", newUser);
        const res = await axios.post("/auth/login", newUser);
        token = `bearer ${res.data.data.accessToken}`;

        await axios.post("/admin/class", {
            className: "10",
            section: "A",
            session: "2025-2026"
        }, {
            headers: { Authorization: token }
        })

        await axios.post("/admin/subject", {
            className: '10',
            section: "A",
            subjectName: "English"
        }, {
            headers: { Authorization: token }
        })

        const subjectRes = await axios.get("/admin/subject/get-all-class-subject", {
            headers: { Authorization: token }
        });

        validExamData.exams[0]?.subjects.push({
            subjectCode: subjectRes.data.data.unassignedSubjects[0].subjectCode,
            date: "22-08-2025",
            fullMarks: 100
        })

        await axios.post("/admin/teacher", mockTeacher, { headers: { Authorization: token } });

        // 6. Get the teacherId for the created teacher
        const teacherRes = await axios.get("/admin/teacher", { headers: { Authorization: token } });
        teacherId = teacherRes.data.data[0].teacherId;

        const response = await axios.put("/admin/academic/time-table", {
            className: "10",
            section: "A",
            weekday: "MON",
            period: 1,
            subjectCode: subjectRes.data.data.unassignedSubjects[0].subjectCode,
            teacherId: teacherId
        }, { headers: { Authorization: token } });
        expect(response.status).toBe(202);

    })

    test("Create Exam return 201 if data is valid", async () => {
        const response = await axios.post("/admin/exam", validExamData, {
            headers: {
                Authorization: token
            }
        });

        expect(response.status).toBe(201);
        expect(response.data.success).toBe(true);

        const getResponse = await axios.get("/admin/exam", { headers: { Authorization: token } });
        const createdExam = getResponse.data.data.find((e: any) => e.title === validExamData.title);
        if (createdExam) {
            createdExamId = createdExam.id;
        }
    });

    test("Create Exam return 400 if data is invalid (missing title)", async () => {
        const invalidData = {
            ...validExamData,
            title: ""
        }; // Missing title
        const res = await axios.post("/admin/exam", invalidData, {
            headers: {
                Authorization: token
            }
        });
        expect(res.status).toBe(400);
        expect(res.data.success).toBe(false);

    });

    test("Get Exam return 200 with an array of exams", async () => {
        const response = await axios.get("/admin/exam", {
            headers: {
                Authorization: token
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
            expect(exam).toHaveProperty('className');
            expect(exam).toHaveProperty('section');
        }
    });

    test("Delete Exam return 202 if valid examId", async () => {
        // Ensure we have an ID to delete
        if (!createdExamId) {
            // If create test didn't provide an ID, create one now
            const createResponse = await axios.post("/admin/exam", { ...validExamData, title: "Exam to be Deleted" }, {
                headers: { Authorization: token }
            });
            const getResponse = await axios.get("/admin/exam", { headers: { Authorization: token } });
            const examToDelete = getResponse.data.data.find((e: any) => e.title === "Exam to be Deleted");
            createdExamId = examToDelete?.id;
        }

        const response = await axios.delete(`/admin/exam/${createdExamId}`, {
            headers: {
                Authorization: token
            }
        });

        expect(response.status).toBe(202);
        expect(response.data.success).toBe(true);
    });

    test("Delete Exam return 400 if invalid examId", async () => {
        const invalidExamId = "invalid-object-id";

        const res = await axios.delete(`/admin/exam/${invalidExamId}`, {
            headers: {
                Authorization: token
            }
        });
        expect(res.status).toBe(400);
        expect(res.data.success).toBe(false);

    });

})

describe.skip("admin/academic Route", () => {
    let token = "";
    let subjectCode = "";
    let teacherId = "";
    let calendarId = "";

    beforeAll(async () => {
        const date = new Date();
        const uniqueIdentifier = date.toISOString();
        const newUser = {
            username: `testuser${uniqueIdentifier}`,
            password: "TestPass123!"
        };

        // Sign up and log in to get an authentication token
        await axios.post("/auth/signup", newUser);
        const res = await axios.post("/auth/login", newUser);
        token = `bearer ${res.data.data.accessToken}`;

        const authHeader = { headers: { Authorization: token } };

        await axios.post("/admin/class", {
            className: "10",
            section: "A",
            session: "2025-2026"
        }, {
            headers: { Authorization: token }
        })

        await axios.post("/admin/subject", {
            className: '10',
            section: "A",
            subjectName: "English"
        }, {
            headers: { Authorization: token }
        })

        const subjectRes = await axios.get("/admin/subject/get-all-class-subject", {
            headers: { Authorization: token }
        });

        subjectCode = subjectRes.data.data.unassignedSubjects[0].subjectCode

        await axios.post("/admin/teacher", mockTeacher, authHeader);

        // 6. Get the teacherId for the created teacher
        const teacherRes = await axios.get("/admin/teacher", authHeader);
        teacherId = teacherRes.data.data[0].teacherId;
    })

    describe("/admin/academic/time-table", () => {
        test("Update Time Table should return 202 for valid data", async () => {
            const response = await axios.put("/admin/academic/time-table", {
                className: "10",
                section: "A",
                weekday: "MON",
                period: 1,
                subjectCode: subjectCode,
                teacherId: teacherId
            }, { headers: { Authorization: token } });
            expect(response.status).toBe(202);
        });

        test("Update Time Table should return 400 for invalid data", async () => {
            const res = await axios.put("/admin/academic/time-table", {
                className: "10",
                // Missing section and other required fields
            }, { headers: { Authorization: token } });
            expect(res.status).toBe(400);
        });

        test("Get Time Table should return 200 with the correct structure", async () => {
            const response = await axios.get("/admin/academic/time-table", {
                headers: { Authorization: token }
            });

            expect(response.status).toBe(200);
            expect(response.data.success).toBe(true);
            expect(Array.isArray(response.data.data)).toBe(true);

            const classTimetable = response.data.data.find((ct: any) => ct.className === "10" && ct.section === "A");
            expect(classTimetable).toBeDefined();
            expect(classTimetable.timetable[0].weekday).toBe("MON");

            const period1 = classTimetable.timetable[0].subjects.find((s: any) => s.period === 1);
            expect(period1.subject).toBe("English");
            expect(period1.subjectCode).toBe(subjectCode);
            expect(period1.teacherId).toBe(teacherId);
        });
    });

    // --- Academic Calendar Tests ---
    describe("/admin/academic/calendar", () => {
        test("Create Calendar event should return 201 for valid data", async () => {
            const response = await axios.post("/admin/academic/calendar", {
                date: "25-12-2025",
                title: "Christmas Day",
                category: "HOLIDAY"
            }, { headers: { Authorization: token } });

            expect(response.status).toBe(201);
        });

        test("Create Calendar event should return 400 for invalid data", async () => {
            const res = await axios.post("/admin/academic/calendar", {
                date: "invalid-date", // Invalid date format
                title: "Invalid Event",
                category: "INVALID_CATEGORY" // Invalid category
            }, { headers: { Authorization: token } });
            expect(res.status).toBe(400);

        });

        test("Get Calendar should return 200 with an array of events", async () => {
            const response = await axios.get("/admin/academic/calendar", {
                headers: { Authorization: token }
            });

            expect(response.status).toBe(200);
            expect(Array.isArray(response.data.data)).toBe(true);

            const createdEvent = response.data.data.find((event: any) => event.title === "Christmas Day");
            expect(createdEvent).toBeDefined();
            expect(createdEvent.category).toBe("HOLIDAY");

            // Store the ID for the delete test
            calendarId = createdEvent.id;
        });

        test("Delete Calendar event should return 202 for a valid calendarId", async () => {
            expect(calendarId).not.toBe(""); // Ensure calendarId was captured
            const response = await axios.delete(`/admin/academic/calendar/${calendarId}`, {
                headers: { Authorization: token }
            });
            expect(response.status).toBe(202);
        });

        test("Delete Calendar event should return 404 for an invalid calendarId", async () => {
            const invalidId = "60d5ec49f6d1b22b3c7b3b3b"; // A random valid ObjectId format
            const res = await axios.delete(`/admin/academic/calendar/${invalidId}`, {
                headers: { Authorization: token }
            });
            expect(res.status).toBe(404);

        });
    });

})

describe.skip("admin/notice Route", () => {
    let token = "";
    let noticeId = "";
    beforeAll(async () => {
        const date = new Date();
        const uniqueIdentifier = date.toISOString();
        const newUser = {
            username: `testuser${uniqueIdentifier}`,
            password: "TestPass123!"
        };

        // Sign up and log in to get an authentication token
        await axios.post("/auth/signup", newUser);
        const res = await axios.post("/auth/login", newUser);
        token = `bearer ${res.data.data.accessToken}`;
    })

    test("Create notice should return 201 for valid data", async () => {
        const noticeData = {
            title: "Annual Sports Day",
            description: "The annual sports day will be held next month. All students are invited.",
            date: "21-08-2025",
            targetRole: "Student",
            expiryDate: "30-09-2025",
            fileUrl: "http://example.com/sports_day_notice.pdf"
        };

        const response = await axios.post("/admin/notice", noticeData, {
            headers: { Authorization: token }
        });

        expect(response.status).toBe(201);
    });

    test("Create notice should return 400 for invalid data", async () => {
        const invalidNoticeData = {
            title: "Invalid Event",
            description: "This has an invalid target role.",
            date: "22-08-2025",
            targetRole: "INVALID_ROLE", // This role is not valid
        };

        const res = await axios.post("/admin/notice", invalidNoticeData, {
            headers: { Authorization: token }
        });
        expect(res.status).toBe(400);

    });

    test("Get notices should return 200 with an array of notices", async () => {
        const response = await axios.get("/admin/notice", {
            headers: { Authorization: token }
        });

        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(Array.isArray(response.data.data)).toBe(true);

        // Find the notice we created earlier
        const createdNotice = response.data.data.find((notice: any) => notice.title === "Annual Sports Day");
        expect(createdNotice).toBeDefined();
        expect(createdNotice).toHaveProperty("id");
        expect(createdNotice).toHaveProperty("title", "Annual Sports Day");
        expect(createdNotice).toHaveProperty("date");
        expect(createdNotice).toHaveProperty("targetRole", "Student");

        // Store the ID for the detail and delete tests
        noticeId = createdNotice.id;
    });

    test("Get notice detail should return 200 with full notice data", async () => {
        expect(noticeId).not.toBe(""); // Make sure we have an ID from the previous test

        const response = await axios.get(`/admin/notice/${noticeId}`, {
            headers: { Authorization: token }
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

    test("Delete notice should return 202 for a correct noticeId", async () => {
        expect(noticeId).not.toBe(""); // Ensure we have a valid ID

        const response = await axios.delete(`/admin/notice/${noticeId}`, {
            headers: { Authorization: token }
        });

        expect(response.status).toBe(202);
    });

    test("Delete notice should return 404 for an incorrect noticeId", async () => {
        const nonExistentId = "60d5ec49f6d1b22b3c7b3b3b"; // A random, valid ObjectId format that likely doesn't exist
        const res = await axios.delete(`/admin/notice/${nonExistentId}`, {
            headers: { Authorization: token }
        });
        expect(res.status).toBe(404);

    });

})

describe.skip("admin/class Route", () => {
    let token = "";
    let classId = "";
    beforeAll(async () => {
        const date = new Date();
        const uniqueIdentifier = date.toISOString();
        const newUser = {
            username: `testuser${uniqueIdentifier}`,
            password: "TestPass123!"
        };

        // Sign up and log in to get an authentication token
        await axios.post("/auth/signup", newUser);
        const res = await axios.post("/auth/login", newUser);
        token = `bearer ${res.data.data.accessToken}`;
    })

    test("Create Class should return 201 for valid data", async () => {
        const classData = {
            className: "10",
            section: "A",
            session: "2025-2026"
        };

        const response = await axios.post("/admin/class", classData, {
            headers: { Authorization: token }
        });

        expect(response.status).toBe(201);
    });

    test("Create Class should return 400 for invalid data", async () => {
        const invalidClassData = {
            className: "10",
            // Missing section and session
        };

        const res = await axios.post("/admin/class", invalidClassData, {
            headers: { Authorization: token }
        });
        expect(res.status).toBe(400);

    });

    test("Create Class should return 400 if the class already exists", async () => {
        const classData = {
            className: "10",
            section: "A",
            session: "2025-2026"
        };
        const res = await axios.post("/admin/class", classData, {
            headers: { Authorization: token }
        });
        expect(res.status).toBe(400);

    });


    test("Get Class should return 200 with an array of classes", async () => {
        const response = await axios.get("/admin/class", {
            headers: { Authorization: token }
        });

        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(Array.isArray(response.data.data)).toBe(true);

        const createdClass = response.data.data.find((c: any) =>
            c.className === "10" && c.section === "A" && c.session === "2025-2026"
        );
        expect(createdClass).toBeDefined();
        expect(createdClass).toHaveProperty("id");

        // Store the ID for the delete test
        classId = createdClass.id;
    });

    test("Delete Class should return 202 for a correct classId", async () => {
        expect(classId).not.toBe(""); // Ensure we have a valid ID

        const response = await axios.delete(`/admin/class/${classId}`, {
            headers: { Authorization: token }
        });

        expect(response.status).toBe(202);
    });

    test("Delete Class should return 404 for an incorrect classId", async () => {
        const nonExistentId = "60d5ec49f6d1b22b3c7b3b3b"; // A random, valid ObjectId format
        const res = await axios.delete(`/admin/class/${nonExistentId}`, {
            headers: { Authorization: token }
        });
        expect(res.status).toBe(404);

    });


})