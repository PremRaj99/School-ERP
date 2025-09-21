
import { axios } from '@/utils/axios';
import { validateSchema } from '@repo/errorhandler';
import { ContactUsSchema, LoginSchema } from '@repo/types';

class AuthService {
    login = async (formdata: { username: string, password: string }) => {
        const parseData = validateSchema(LoginSchema, formdata);
        
        const {data} = await axios.post("/auth/login", parseData)
        return data;
    }

    contactus = async (formdata: {name: string, email: string, mobile: string, message: string}) => {
        const parseData = validateSchema(ContactUsSchema, formdata)

        const {data} = await axios.post("/auth/contact", parseData)
        return data;
    }
}

export default new AuthService();