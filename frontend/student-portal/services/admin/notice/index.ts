
import { axios } from '@/utils/axios';
import { validateSchema } from '@repo/errorhandler';
import { CreateNoticeSchema, ObjectIdSchema } from '@repo/types';

class AdminNoticeService {
    notice = async () => {

        const { data } = await axios.get("/admin/notice")
        return data;
    }

    noticeDetail = async (noticeId: string) => {
        const id = validateSchema(ObjectIdSchema, noticeId)

        const { data } = await axios.get(`/admin/notice/${id}`)
        return data;
    }

    createNotice = async (noticeId: string, formData: typeof CreateNoticeSchema) => {
        const id = validateSchema(ObjectIdSchema, noticeId)
        const parseData = validateSchema(CreateNoticeSchema, formData)

        const { data } = await axios.post(`/admin/notice/${id}`, parseData)
        return data;
    }

    deleteNotice = async (noticeId: string) => {
        const id = validateSchema(ObjectIdSchema, noticeId)

        const { data } = await axios.delete(`/admin/notice/${id}`)
        return data;
    }
}

export default new AdminNoticeService();