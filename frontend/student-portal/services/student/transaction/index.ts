
import { axios } from '@/utils/axios';
import { validateSchema } from '@repo/errorhandler';
import { ObjectIdSchema, sessionSchema } from '@repo/types';

class StudentTransactionService {
    studentFee = async (year: string) => {
        const parseData = validateSchema(sessionSchema, year);

        const {data} = await axios.get("/student/transaction", { params: { year: parseData } })
        return data;
    }

    studentFeeDetail = async (feeId: string) => {
        const id = validateSchema(ObjectIdSchema, feeId)

        const {data} = await axios.get(`/student/transaction/${id}`)
        return data;
    }
}

export default new StudentTransactionService();