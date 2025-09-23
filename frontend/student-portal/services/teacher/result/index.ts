
import { axios } from '@/utils/axios';
import { validateSchema } from '@repo/errorhandler';
import { CreateResultSchema, ObjectIdSchema, UpdateResultSchema } from '@repo/types';
class TeacherResultService {
    result = async (examId: string, subjectId: string) => {
        const eId = validateSchema(ObjectIdSchema, examId)
        const sId = validateSchema(ObjectIdSchema, subjectId)

        const { data } = await axios.get(`/teacher/result/${eId}/${sId}`)
        return data;
    }
    createResult = async (examId: string, subjectId: string, formData: { studentId: string, marksObtained: number, remark: string }) => {
        const eId = validateSchema(ObjectIdSchema, examId)
        const sId = validateSchema(ObjectIdSchema, subjectId)
        const parseData = validateSchema(CreateResultSchema, formData)

        const { data } = await axios.post(`/teacher/result/${eId}/${sId}`, parseData)
        return data;
    }

    editResult = async (examId: string, subjectId: string, formData: { studentId: string, marksObtained: number, remark: string }) => {
        const eId = validateSchema(ObjectIdSchema, examId)
        const sId = validateSchema(ObjectIdSchema, subjectId)
        const parseData = validateSchema(UpdateResultSchema, formData)

        const { data } = await axios.put(`/teacher/result/${eId}/${sId}`, parseData)
        return data;
    }
}

export default new TeacherResultService();