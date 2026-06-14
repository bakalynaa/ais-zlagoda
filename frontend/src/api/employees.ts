import { apiClient } from './client';

export const getEmployees = async () => {
  const response = await apiClient.get('/employees/');
  return response.data;
};

export const getCashiers = async () => {
  const response = await apiClient.get('/employees/cashiers');
  return response.data;
};

export const getMe = async () => {
  const response = await apiClient.get('/employees/me');
  return response.data;
};

export const createEmployee = async (data: any) => {
  const response = await apiClient.post('/employees/', data);
  return response.data;
};

export const updateEmployee = async (id: string, data: any) => {
  const response = await apiClient.put(`/employees/${id}`, data);
  return response.data;
};

export const deleteEmployee = async (id: string) => {
  const response = await apiClient.delete(`/employees/${id}`);
  return response.data;
};