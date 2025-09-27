
import { axios } from '@/utils/axios';
import { validateSchema } from '@repo/errorhandler';
import { CreateSubjectSchema, subjectCodeSchema, UpdateSubjectSchema } from '@repo/types';

class AdminSubjectService {
    subject = async () => {

        const { data } = await axios.get("/admin/subject/get-all-class-subject")
        return data;
    }

    createSubject = async (formData: typeof CreateSubjectSchema) => {
        const parseData = validateSchema(CreateSubjectSchema, formData)

        const { data } = await axios.post(`/admin/subject`, parseData)
        return data;
    }

    updateSubject = async (subjectCode: string, formData: typeof UpdateSubjectSchema) => {
        const code = validateSchema(subjectCodeSchema, subjectCode)
        const parseData = validateSchema(UpdateSubjectSchema, formData)

        const { data } = await axios.put(`/admin/subject/${code}`, parseData)
        return data;
    }

    deleteSubject = async (subjectCode: string) => {
        const code = validateSchema(subjectCodeSchema, subjectCode)

        const { data } = await axios.delete(`/admin/subject/${code}`)
        return data;
    }
}

export default new AdminSubjectService();