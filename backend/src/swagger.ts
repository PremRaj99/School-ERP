import { authSwaggerDocs } from './modules/auth/swagger';
import { userSwaggerDocs } from './modules/user/swagger';
import { adminSwaggerDocs } from './modules/admin/swagger';
import { studentSwaggerDocs } from './modules/student/swagger';
import { teacherSwaggerDocs } from './modules/teacher/swagger';

export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'SchoolERP Monolithic Backend API',
    version: '1.0.0',
    description: 'Modular API Documentation for SchoolERP Backend',
  },
  servers: [
    {
      url: 'http://localhost:5000/api/v1',
      description: 'Development Server',
    },
  ],
  paths: {
    ...authSwaggerDocs,
    ...userSwaggerDocs,
    ...adminSwaggerDocs,
    ...studentSwaggerDocs,
    ...teacherSwaggerDocs,
  },
};
