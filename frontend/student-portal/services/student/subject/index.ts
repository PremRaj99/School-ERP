
import { axios } from '@/utils/axios';

class StudentSubjectService {
    allSubject = async () => {
        const { data } = await axios.get("/student/subject/get-all-subject")
        return data
    }
}

export default new StudentSubjectService();