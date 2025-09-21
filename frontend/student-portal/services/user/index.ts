
import { axios } from '@/utils/axios';
import { validateSchema } from '@repo/errorhandler';
import { ChangePasswordSchema } from '@repo/types';

class UserService {
    user = async () => {

        const { data } = await axios.get("/user")
        return data;
    }

    changePassword = async (formdata: { oldPassword: string, newPassword: string }) => {

        const parseData = validateSchema(ChangePasswordSchema, formdata)
        const { data } = await axios.post("/user/change-password", parseData)
        return data;
    }

    logout = async () => {

        const { data } = await axios.post("/user/logout")
        return data;
    }
}

export default new UserService();