import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.message || err.message || 'Something went wrong';
    const errors = err.response?.data?.errors || [];
    const enhancedError = new Error(message);
    enhancedError.errors = errors;
    enhancedError.status = err.response?.status;
    return Promise.reject(enhancedError);
  }
);

export default api;
