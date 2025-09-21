
import { axios } from '@/utils/axios';
import { validateSchema } from '@repo/errorhandler';
import { ObjectIdSchema } from '@repo/types';

class StudentNoticeService {
    notice = async () => {

        const { data } = await axios.get(`/student/notice`)
        return data
    }
    noticeDetail = async (noticeId: string) => {
        const id = validateSchema(ObjectIdSchema, noticeId);

        const { data } = await axios.get(`/student/notice/${id}`)
        return data
    }
}

export default new StudentNoticeService();