import { axios } from '@/shared/utils/axios';

export const adminService = {
  // Classes
  getClasses: async () => {
    const response = await axios.get('/admin/class');
    return response.data.data;
  },
  createClass: async (data: { className: string; section: string }) => {
    const response = await axios.post('/admin/class', data);
    return response.data.data;
  },
  deleteClass: async (id: string) => {
    const response = await axios.delete(`/admin/class/${id}`);
    return response.data.data;
  },

  // Subjects
  getSubjects: async () => {
    const response = await axios.get('/admin/subject');
    return response.data.data;
  },
  createSubject: async (data: { subjectName: string; subjectCode: string }) => {
    const response = await axios.post('/admin/subject', data);
    return response.data.data;
  },
  deleteSubject: async (id: string) => {
    const response = await axios.delete(`/admin/subject/${id}`);
    return response.data.data;
  },

  // Teachers
  getTeachers: async () => {
    const response = await axios.get('/admin/teacher');
    return response.data.data;
  },
  createTeacher: async (data: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    phoneNumber: string;
    salary: number;
  }) => {
    const response = await axios.post('/admin/teacher', data);
    return response.data.data;
  },
  deleteTeacher: async (id: string) => {
    const response = await axios.delete(`/admin/teacher/${id}`);
    return response.data.data;
  },

  // Students
  getStudents: async () => {
    const response = await axios.get('/admin/student');
    return response.data.data;
  },
  createStudent: async (data: {
    firstName: string;
    lastName: string;
    username: string;
    rollNo: string;
    className: string;
    section: string;
  }) => {
    const response = await axios.post('/admin/student', data);
    return response.data.data;
  },
  deleteStudent: async (id: string) => {
    const response = await axios.delete(`/admin/student/${id}`);
    return response.data.data;
  },

  // Exams
  getExams: async () => {
    const response = await axios.get('/admin/exam');
    return response.data.data;
  },
  createExam: async (data: {
    title: string;
    dateFrom: string;
    dateTo: string;
    exams: Array<{
      className: string;
      section: string;
      subjects: Array<{
        subjectCode: string;
        fullMarks: number;
        date: string;
      }>;
    }>;
  }) => {
    const response = await axios.post('/admin/exam', data);
    return response.data.data;
  },
  deleteExam: async (id: string) => {
    const response = await axios.delete(`/admin/exam/${id}`);
    return response.data.data;
  },

  // Notices
  getNotices: async () => {
    const response = await axios.get('/admin/notice');
    return response.data.data;
  },
  createNotice: async (data: { title: string; content: string }) => {
    const response = await axios.post('/admin/notice', data);
    return response.data.data;
  },
  deleteNotice: async (id: string) => {
    const response = await axios.delete(`/admin/notice/${id}`);
    return response.data.data;
  },

  // Academic Calendar Events
  getAcademicEvents: async () => {
    const response = await axios.get('/admin/academic');
    return response.data.data;
  },
  createAcademicEvent: async (data: {
    date: string;
    title: string;
    type: string;
    description?: string;
  }) => {
    const response = await axios.post('/admin/academic', data);
    return response.data.data;
  },
  deleteAcademicEvent: async (id: string) => {
    const response = await axios.delete(`/admin/academic/${id}`);
    return response.data.data;
  },

  // Teacher Attendance
  getTeacherAttendance: async (month: string) => {
    const response = await axios.get('/admin/attendance', { params: { month } });
    return response.data.data;
  },
  markTeacherAttendance: async (
    attendanceList: Array<{ teacherId: string; status: string; date: string }>,
  ) => {
    const response = await axios.post('/admin/attendance', attendanceList);
    return response.data.data;
  },
  updateTeacherAttendance: async (
    attendanceList: Array<{ id: string; teacherId: string; status: string }>,
  ) => {
    const response = await axios.put('/admin/attendance', attendanceList);
    return response.data.data;
  },
};
