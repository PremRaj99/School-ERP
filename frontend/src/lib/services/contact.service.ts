import { apiClient, type ApiResponse } from '../api';

export interface ContactPayload {
  name: string;
  email: string;
  mobile: string;
  message: string;
}

export const contactService = {
  submitContact: async (payload: ContactPayload) => {
    const res = await apiClient.post<ApiResponse<null>>('/auth/contact', payload);
    return res.data;
  },
};
