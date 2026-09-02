import api from './axios';

export const resolveFormConfig = (params) =>
  api.get('/form-builder/resolve', { params }).then((r) => r.data);

export const createFormConfig = (data) =>
  api.post('/form-builder', data).then((r) => r.data);

export const updateFormConfig = (id, data) =>
  api.put(`/form-builder/${id}`, data).then((r) => r.data);
