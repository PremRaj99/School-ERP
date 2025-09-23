
import { axios } from '@/utils/axios';

class TeacherAcademicService {
    timeTable = async () => {

        const { data } = await axios.get("/teacher/academic/time-table")
        return data;
    }

    academicCalendar = async () => {

        const { data } = await axios.get(`/teacher/academic/calendar`)
        return data;
    }
}

export default new TeacherAcademicService();