
import { axios } from '@/utils/axios';
import { validateSchema } from '@repo/errorhandler';
import { monthSchema } from '@repo/types';

class StudentAttendanceService {
    attendance = async (month: string) => {
        const parseData = validateSchema(monthSchema, month);
        
        const {data} = await axios.get("/student/attendance", { params: { month: parseData } })
        return data;
    }
}

export default new StudentAttendanceService();