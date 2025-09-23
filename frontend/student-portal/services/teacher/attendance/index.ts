
import { axios } from '@/utils/axios';
import { validateSchema } from '@repo/errorhandler';
import { CreateClassAttendanceSchema, monthSchema, ObjectIdSchema, UpdateClassAttendanceSchema } from '@repo/types';
class TeacherAttendanceService {
    attendance = async (month: string) => {
        const m = validateSchema(monthSchema, month)

        const { data } = await axios.get(`/teacher/attendance?month=${m}`)
        return data;
    }
    classAttendance = async (month: string) => {
        const m = validateSchema(monthSchema, month)

        const { data } = await axios.get(`/teacher/attendance/class-attendance?month=${m}`)
        return data;
    }

    classAttendanceDetail = async (classAttendanceId: string) => {
        const id = validateSchema(ObjectIdSchema, classAttendanceId)

        const { data } = await axios.get(`/teacher/attendance/class-attendance/${id}`)
        return data;
    }
    creeateClassAttendance = async (
        formData: typeof CreateClassAttendanceSchema
    ) => {
        const parseData = validateSchema(CreateClassAttendanceSchema, formData)

        const { data } = await axios.post(`/teacher/attendance/class-attendance`, parseData)
        return data;
    }
    editClassAttendance = async (classAttendanceId: string, formData: typeof UpdateClassAttendanceSchema) => {

        const id = validateSchema(ObjectIdSchema, classAttendanceId)
        const parseData = validateSchema(UpdateClassAttendanceSchema, formData)

        const { data } = await axios.put(`/teacher/attendance/class-attendance/${id}`, parseData)
        return data;
    }
}

export default new TeacherAttendanceService();