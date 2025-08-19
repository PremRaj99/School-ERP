import axios2 from "axios"

axios2.defaults.baseURL = "http://localhost:3000/api/v1";

export const axios = {
  get: async (...args: Parameters<typeof axios2.get>) => {
    try {
      const res = await axios2.get(...args);
      return res;
    } catch (error: any) {
      return error.response;
    }
  },
  post: async (...args: Parameters<typeof axios2.post>) => {
    try {
      const res = await axios2.post(...args);
      return res;
    } catch (error: any) {
      return error.response;
    }
  },
  put: async (...args: Parameters<typeof axios2.put>) => {
    try {
      const res = await axios2.put(...args);
      return res;
    } catch (error: any) {
      return error.response;
    }
  },
  delete: async (...args: Parameters<typeof axios2.delete>) => {
    try {
      const res = await axios2.delete(...args);
      return res;
    } catch (error: any) {
      return error.response;
    }
  },
};