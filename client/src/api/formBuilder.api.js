import api from './axios';

export const resolveFormConfig = (params) =>
  api.get('/form-builder/resolve', { params }).then((r) => r.data);

export const listFormConfigs = (params) =>
  api.get('/form-builder', { params }).then((r) => r.data);

export const getFormConfig = (id) =>
  api.get(`/form-builder/${id}`).then((r) => r.data);

export const createFormConfig = (data) =>
  api.post('/form-builder', data).then((r) => r.data);

export const updateFormConfig = (id, data) =>
  api.put(`/form-builder/${id}`, data).then((r) => r.data);

export const deleteFormConfig = (id) =>
  api.delete(`/form-builder/${id}`).then((r) => r.data);
