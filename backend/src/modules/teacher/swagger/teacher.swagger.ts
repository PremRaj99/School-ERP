export const teacherSwaggerDocs = {
  '/teacher': {
    get: {
      tags: ['Teacher'],
      summary: 'Get teacher profile',
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: 'Teacher profile details' } },
    },
  },
  '/teacher/attendance/mark': {
    post: {
      tags: ['Teacher'],
      summary: 'Mark student class attendance',
      security: [{ bearerAuth: [] }],
      responses: { 201: { description: 'Class attendance marked' } },
    },
  },
  '/teacher/notice': {
    get: {
      tags: ['Teacher'],
      summary: 'Get teacher notices',
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: 'List of notices' } },
    },
  },
};
