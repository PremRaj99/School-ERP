
import { axios } from '@/utils/axios';

class StudentService {
    student = async () => {

        const { data } = await axios.get("/student")
        return data;
    }

    info = async () => {

        const { data } = await axios.get("/student/info")
        return data;
    }

}

export default new StudentService();