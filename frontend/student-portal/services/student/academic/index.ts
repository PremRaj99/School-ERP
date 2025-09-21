
import { axios } from '@/utils/axios';

class StudentAcademicService {
    timeTable = async () => {

        const { data } = await axios.get("/student/academic/time-table")
        return data
    }

    calendar = async () => {

        const { data } = await axios.get("/student/academic/calendar")
        return data
    }
}

export default new StudentAcademicService();