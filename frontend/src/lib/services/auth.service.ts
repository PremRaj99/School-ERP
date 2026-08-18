import { apiClient, type ApiResponse } from '../api';

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponseData {
  user: {
    id: string;
    username: string;
    role: 'Admin' | 'Teacher' | 'Student';
  };
  accessToken?: string;
  refreshToken?: string;
}

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

export interface UserProfileResponse {
  username: string;
  role: string;
}

export const authService = {
  login: async (payload: LoginPayload) => {
    const res = await apiClient.post<ApiResponse<LoginResponseData>>('/auth/login', payload);
    return res.data;
  },

  logout: async () => {
    const res = await apiClient.post<ApiResponse<null>>('/user/logout');
    return res.data;
  },

  refresh: async () => {
    const res = await apiClient.post<ApiResponse<null>>('/auth/refresh');
    return res.data;
  },

  changePassword: async (payload: ChangePasswordPayload) => {
    const res = await apiClient.post<ApiResponse<null>>('/user/change-password', payload);
    return res.data;
  },

  getUser: async () => {
    const res = await apiClient.get<ApiResponse<UserProfileResponse>>('/user');
    return res.data;
  },
};
