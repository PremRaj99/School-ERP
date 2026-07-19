import { axios } from '@/shared/utils/axios';

export const authService = {
  login: async (credentials: Record<string, unknown>) => {
    const response = await axios.post('/auth/login', credentials);
    return response.data.data;
  },
  signup: async (adminData: Record<string, unknown>) => {
    const response = await axios.post('/auth/signup', adminData);
    return response.data.data;
  },
  contact: async (contactData: Record<string, unknown>) => {
    const response = await axios.post('/auth/contact', contactData);
    return response.data.data;
  },
};
