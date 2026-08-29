import axios, { AxiosError } from 'axios';
import { useAuthStore } from '@/stores/auth.store';

const rawApiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');
export const API_BASE_URL = rawApiUrl.endsWith('/api/v1') ? rawApiUrl : `${rawApiUrl}/api/v1`;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRedirecting = false;
let refreshPromise: Promise<unknown> | null = null;

export const redirectToLogin = () => {
  if (typeof window === 'undefined') return;

  const pathname = window.location.pathname;
  // Never redirect if already on login page
  if (pathname === '/auth/login' || pathname.startsWith('/auth/login')) {
    return;
  }

  // Clear auth state in store
  useAuthStore.getState().clear();

  // On public non-authenticated pages (like Home or Contact), don't forcibly redirect visitors
  if (pathname === '/' || pathname === '/contact') {
    return;
  }

  if (isRedirecting) return;
  isRedirecting = true;

  const currentUrl = window.location.pathname + window.location.search;
  const nextParam =
    currentUrl && currentUrl !== '/' && !currentUrl.startsWith('/auth/login')
      ? `?next=${encodeURIComponent(currentUrl)}`
      : '';

  const loginUrl = `/auth/login${nextParam}`;
  window.location.replace(loginUrl);
};

// Response interceptor for standard error handling & refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string; error?: string }>) => {
    const originalRequest = error.config as { _retry?: boolean } & typeof error.config;
    const isLoginEndpoint = originalRequest?.url?.includes('/auth/login');
    const isRefreshEndpoint =
      originalRequest?.url?.includes('/auth/refresh') ||
      originalRequest?.url?.includes('/user/refresh');

    if (error.response?.status === 401 && !isLoginEndpoint) {
      // Try to refresh token once if this is not already a retry or refresh call
      if (!originalRequest?._retry && !isRefreshEndpoint) {
        originalRequest._retry = true;

        if (!refreshPromise) {
          refreshPromise = axios
            .post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true })
            .finally(() => {
              refreshPromise = null;
            });
        }

        try {
          await refreshPromise;
          return apiClient(originalRequest);
        } catch (refreshError) {
          redirectToLogin();
          return Promise.reject(refreshError);
        }
      }

      // If already retried or refresh itself failed with 401, re-route to login
      redirectToLogin();
    }

    return Promise.reject(error);
  },
);

export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected error occurred'
    );
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
};
