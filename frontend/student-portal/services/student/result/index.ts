
import { axios } from '@/utils/axios';
import { validateSchema } from '@repo/errorhandler';
import { ObjectIdSchema } from '@repo/types';

class StudentResultService {
    result = async (examId: string) => {
        const id = validateSchema(ObjectIdSchema, examId);

        const {data} = await axios.get(`/student/result/${id}`)
        return data
    }
}

export default new StudentResultService();