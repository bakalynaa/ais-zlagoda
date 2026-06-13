import { apiClient } from './client';

export const getProducts = async (search?: string) => {
  const params = search ? `?search=${search}` : '';
  const response = await apiClient.get(`/products${params}`);
  return response.data;
};

export const getCategories = async () => {
  const response = await apiClient.get('/categories');
  return response.data;
};

export const createProduct = async (data: any) => {
  const response = await apiClient.post('/products', data);
  return response.data;
};

export const updateProduct = async (id: number, data: any) => {
  const response = await apiClient.put(`/products/${id}`, data);
  return response.data;
};

export const deleteProduct = async (id: number) => {
  const response = await apiClient.delete(`/products/${id}`);
  return response.data;
};