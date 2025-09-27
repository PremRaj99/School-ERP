
import { axios } from '@/utils/axios';
import { validateSchema } from '@repo/errorhandler';
import { CreateStudentSchema, ObjectIdSchema, UpdateStudentSchema } from '@repo/types';

class AdminStudentService {
    student = async () => {

        const { data } = await axios.get("/admin/student")
        return data;
    }

    studentDetail = async (studentId: string) => {
        const id = validateSchema(ObjectIdSchema, studentId)

        const { data } = await axios.get(`/admin/student/${id}`)
        return data;
    }

    createStudent = async (formData: typeof CreateStudentSchema) => {
        const parseData = validateSchema(CreateStudentSchema, formData)

        const { data } = await axios.post(`/admin/student`, parseData)
        return data;
    }

    updateStudent = async (studentId: string, formData: typeof UpdateStudentSchema) => {
        const id = validateSchema(ObjectIdSchema, studentId)
        const parseData = validateSchema(UpdateStudentSchema, formData)

        const { data } = await axios.put(`/admin/student/${id}`, parseData)
        return data;
    }

    deleteStudent = async (studentId: string) => {
        const id = validateSchema(ObjectIdSchema, studentId)

        const { data } = await axios.delete(`/admin/student/${id}`)
        return data;
    }
}

export default new AdminStudentService();