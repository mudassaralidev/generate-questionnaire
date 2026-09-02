import api from './axios';

export const fetchTenants = () => api.get('/tenants').then((r) => r.data);
