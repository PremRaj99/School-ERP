
import { axios } from '@/utils/axios';
import { validateSchema } from '@repo/errorhandler';
import { ObjectIdSchema } from '@repo/types';

class TeacherNoticeService {
    notice = async () => {

        const { data } = await axios.get("/teacher/notice")
        return data;
    }

    noticeDetail = async (noticeId: string) => {
        const id = validateSchema(ObjectIdSchema, noticeId)

        const { data } = await axios.get(`/teacher/notice/${id}`)
        return data;
    }
}

export default new TeacherNoticeService();