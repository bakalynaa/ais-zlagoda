import { apiClient } from './client';

export const getCategories = async () => {
  const response = await apiClient.get('/categories/');
  return response.data;
};

export const createCategory = async (data: any) => {
  const response = await apiClient.post('/categories/', data);
  return response.data;
};

export const updateCategory = async (id: number, data: any) => {
  const response = await apiClient.put(`/categories/${id}`, data);
  return response.data;
};

export const deleteCategory = async (id: number) => {
  const response = await apiClient.delete(`/categories/${id}`);
  return response.data;
};