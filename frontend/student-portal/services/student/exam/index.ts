
import { axios } from '@/utils/axios';

class StudentExamService {
    exam = async () => {

        const { data } = await axios.get("/student/exam")
        return data
    }

}

export default new StudentExamService();