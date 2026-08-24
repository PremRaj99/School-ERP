import {
  authContract,
  userContract,
  type ChangePasswordBody,
  type LoginBody,
} from '@schoolerp/contracts';
import { api } from '../api/typed-client';

export const authService = {
  login: (body: LoginBody) => api(authContract.login, { body }),

  logout: () => api(userContract.logout),

  refresh: () => api(userContract.refresh),

  changePassword: (body: ChangePasswordBody) => api(userContract.changePassword, { body }),

  getUser: () => api(userContract.profile),
};
