
import { axios } from '@/utils/axios';
import { validateSchema } from '@repo/errorhandler';
import { aboutSchema } from '@repo/types';

class TeacherService {
    teacher = async () => {

        const { data } = await axios.get("/teacher")
        return data;
    }

    updateAbout = async (formData: { about: string }) => {
        const about = validateSchema(aboutSchema, formData.about)

        const { data } = await axios.put(`/teacher/change-about`, { about })
        return data;
    }
}

export default new TeacherService();