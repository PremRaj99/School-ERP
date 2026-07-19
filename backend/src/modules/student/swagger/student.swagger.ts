export const studentSwaggerDocs = {
  "/student": {
    get: {
      tags: ["Student"],
      summary: "Get student profile",
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: "Student profile data" } }
    }
  },
  "/student/attendance": {
    get: {
      tags: ["Student"],
      summary: "Get student attendance",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "month", in: "query", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "Student attendance records" } }
    }
  },
  "/student/subject/get-all-subject": {
    get: {
      tags: ["Student"],
      summary: "Get student subjects",
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: "List of subjects" } }
    }
  },
  "/student/exam": {
    get: {
      tags: ["Student"],
      summary: "Get student exams",
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: "List of exams" } }
    }
  },
  "/student/notice": {
    get: {
      tags: ["Student"],
      summary: "Get student notices",
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: "List of notices" } }
    }
  }
};
