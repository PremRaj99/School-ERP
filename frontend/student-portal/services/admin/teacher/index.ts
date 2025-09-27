
import { axios } from '@/utils/axios';
import { validateSchema } from '@repo/errorhandler';
import { CreateTeacherSchema, ObjectIdSchema, UpdateTeacherSchema } from '@repo/types';

class AdminTeacherService {
    teacher = async () => {

        const { data } = await axios.get("/admin/teacher")
        return data;
    }

    teacherDetail = async (teacherId: string) => {
        const id = validateSchema(ObjectIdSchema, teacherId)

        const { data } = await axios.get(`/admin/teacher/${id}`)
        return data;
    }

    createTeacher = async (formData: typeof CreateTeacherSchema) => {
        const parseData = validateSchema(CreateTeacherSchema, formData)

        const { data } = await axios.post(`/admin/teacher`, parseData)
        return data;
    }

    updateTeacher = async (teacherId: string, formData: typeof UpdateTeacherSchema) => {
        const id = validateSchema(ObjectIdSchema, teacherId)
        const parseData = validateSchema(UpdateTeacherSchema, formData)

        const { data } = await axios.put(`/admin/teacher/${id}`, parseData)
        return data;
    }

    deleteTeacher = async (teacherId: string) => {
        const id = validateSchema(ObjectIdSchema, teacherId)

        const { data } = await axios.delete(`/admin/teacher/${id}`)
        return data;
    }
}

export default new AdminTeacherService();