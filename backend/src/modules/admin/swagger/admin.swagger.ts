export const adminSwaggerDocs = {
  '/admin/teacher': {
    get: {
      tags: ['Admin'],
      summary: 'Get all teachers',
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: 'Teachers retrieved successfully' } },
    },
    post: {
      tags: ['Admin'],
      summary: 'Create a teacher',
      security: [{ bearerAuth: [] }],
      responses: { 201: { description: 'Teacher created successfully' } },
    },
  },
  '/admin/student': {
    get: {
      tags: ['Admin'],
      summary: 'Get all students',
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: 'Students retrieved successfully' } },
    },
    post: {
      tags: ['Admin'],
      summary: 'Create a student',
      security: [{ bearerAuth: [] }],
      responses: { 201: { description: 'Student created successfully' } },
    },
  },
  '/admin/class': {
    get: {
      tags: ['Admin'],
      summary: 'Get all classes',
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: 'Classes retrieved successfully' } },
    },
    post: {
      tags: ['Admin'],
      summary: 'Create a class',
      security: [{ bearerAuth: [] }],
      responses: { 201: { description: 'Class created successfully' } },
    },
  },
  '/admin/subject': {
    get: {
      tags: ['Admin'],
      summary: 'Get all class subjects',
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: 'Subjects retrieved successfully' } },
    },
    post: {
      tags: ['Admin'],
      summary: 'Create a subject',
      security: [{ bearerAuth: [] }],
      responses: { 201: { description: 'Subject created successfully' } },
    },
  },
  '/admin/exam': {
    get: {
      tags: ['Admin'],
      summary: 'Get all exams',
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: 'Exams retrieved successfully' } },
    },
    post: {
      tags: ['Admin'],
      summary: 'Create an exam',
      security: [{ bearerAuth: [] }],
      responses: { 201: { description: 'Exam created successfully' } },
    },
  },
  '/admin/notice': {
    get: {
      tags: ['Admin'],
      summary: 'Get all notices',
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: 'Notices retrieved successfully' } },
    },
    post: {
      tags: ['Admin'],
      summary: 'Create a notice',
      security: [{ bearerAuth: [] }],
      responses: { 201: { description: 'Notice created successfully' } },
    },
  },
};
