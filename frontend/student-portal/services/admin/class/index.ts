
import { axios } from '@/utils/axios';
import { validateSchema } from '@repo/errorhandler';
import { CreateClassSchema, ObjectIdSchema } from '@repo/types';

class AdminClassService {
    class = async () => {

        const { data } = await axios.get("/admin/class")
        return data;
    }

    createClass = async (formData: typeof CreateClassSchema) => {
        const parseData = validateSchema(CreateClassSchema, formData)

        const { data } = await axios.post(`/admin/class`, parseData)
        return data;
    }

    deleteClass = async (classId: string) => {
        const id = validateSchema(ObjectIdSchema, classId)

        const { data } = await axios.delete(`/admin/class/${id}`)
        return data;
    }
}

export default new AdminClassService();