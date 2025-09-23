import Axios from 'axios';

const baseURL = 'http://localhost:3000/api/v1'
export const axios = Axios.create({
    baseURL: baseURL,
    headers: { "Content-Type": "application/json" }
});

// Request interceptor
axios.interceptors.request.use(
    (config) => {
        // You can add authorization headers or other config changes here
        // Example: Add token from localStorage
        const token = localStorage.getItem('token');
        if (token) {
            config.headers = config.headers || {};
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
axios.interceptors.response.use(
    (response) => {
        // Any response transformations or logging
        return response;
    },
    async (error) => {
        // Handle errors globally
        const originalRequest = error.config;
        // Example: Redirect to login on 401
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            // console.log(originalRequest._retry)
            originalRequest._retry = true;
            try {
                // if refresh token is not expired
                await refreshTokenFuntion();
                const token = localStorage.getItem("token");
                originalRequest.headers['Authorization'] = 'Bearer ' + token;
                return axios(originalRequest)
            } catch (error) {
                localStorage.removeItem("token")
                localStorage.removeItem("refresh-token")
                window.location.href = '/login';
                return Promise.reject(error)
            }
        }
        return Promise.reject(error)
    }
);

const refreshTokenFuntion = async () => {
    const { data } = await Axios.post(`${baseURL}/user/refresh`, { refresh: localStorage.getItem("refresh-token") }, { headers: { Authorization: `Bearer ${localStorage.getItem("refresh-token")}` } });
    if (data.success) {
        localStorage.setItem("token", data.data.accessToken)
        localStorage.setItem("refresh-token", data.data.refreshToken)
    }
}