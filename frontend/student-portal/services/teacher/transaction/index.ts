
import { axios } from '@/utils/axios';

class TeacherTransactionService {
    salary = async () => {

        const { data } = await axios.get("/teacher/salary")
        return data;
    }
}

export default new TeacherTransactionService();