import Axios from 'axios';
// import { API_DOMAIN } from '@repo/helper';

console.log('API_DOMAIN:', import.meta.env.VITE_API_URL ?? '');
const baseURL = (import.meta.env.VITE_API_URL ?? '') + '/api/v1';
export const axios = Axios.create({
  baseURL: baseURL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Response interceptor
axios.interceptors.response.use(
  (response) => {
    // Any response transformations or logging
    return response;
  },
  async (error) => {
    // Handle errors globallynb
    const originalRequest = error.config;

    if (originalRequest.url?.includes('/auth/refresh')) {
      return Promise.reject(error);
    }
    // Example: Redirect to login on 401
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      // console.log(originalRequest._retry)
      originalRequest._retry = true;
      try {
        // if refresh token is not expired
        await refreshTokenFuntion();
        return axios(originalRequest);
      } catch (error) {
        await axios.post(`${baseURL}/auth/logout`);
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  },
);

const refreshTokenFuntion = async () => {
  await axios.post(`${baseURL}/auth/refresh`);
};
