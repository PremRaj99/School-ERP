
import { axios } from '@/utils/axios';
import { validateSchema } from '@repo/errorhandler';
import { CreateResultSchema, ObjectIdSchema, UpdateResultSchema } from '@repo/types';
class TeacherExamService {
    exam = async () => {

        const { data } = await axios.get(`/teacher/exam`)
        return data;
    }
    examDetail = async (examId: string) => {
        const eId = validateSchema(ObjectIdSchema, examId)

        const { data } = await axios.get(`/teacher/exam/${eId}`)
        return data;
    }
}

export default new TeacherExamService();