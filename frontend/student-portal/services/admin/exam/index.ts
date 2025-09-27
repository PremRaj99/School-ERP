
import { axios } from '@/utils/axios';
import { validateSchema } from '@repo/errorhandler';
import { CreateExamSchema, ObjectIdSchema } from '@repo/types';

class AdminExamService {
    exam = async () => {

        const { data } = await axios.get("/admin/exam")
        return data;
    }

    createExam = async (formData: typeof CreateExamSchema) => {
        const parseData = validateSchema(CreateExamSchema, formData)

        const { data } = await axios.post(`/admin/exam`, parseData)
        return data;
    }

    deleteExam = async (examId: string) => {
        const id = validateSchema(ObjectIdSchema, examId)

        const { data } = await axios.delete(`/admin/exam/${id}`)
        return data;
    }
}

export default new AdminExamService();