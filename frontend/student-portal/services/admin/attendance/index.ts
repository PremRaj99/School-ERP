
import { axios } from '@/utils/axios';
import { validateSchema } from '@repo/errorhandler';
import { CreateStudentSchema, dateSchema, UpdateStudentSchema } from '@repo/types';

class AdminAttendanceService {
    teacherAttendance = async (date: string) => {
        const dateString = validateSchema(dateSchema, date)

        const { data } = await axios.get(`/admin/attendance/teacher-attendance?date=${dateString}`)
        return data;
    }

    createTeacherAttendance = async (date: string, formData: typeof CreateStudentSchema) => {
        const dateString = validateSchema(dateSchema, date)
        const parseData = validateSchema(CreateStudentSchema, formData)

        const { data } = await axios.post(`/admin/teacher-attendance?date=${dateString}`, parseData)
        return data;
    }

    updateTeacherAttendance = async (formData: typeof UpdateStudentSchema) => {
        const parseData = validateSchema(UpdateStudentSchema, formData)

        const { data } = await axios.put(`/admin/teacher-attendance`, parseData)
        return data;
    }
}

export default new AdminAttendanceService();