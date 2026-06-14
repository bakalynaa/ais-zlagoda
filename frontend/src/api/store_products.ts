import { apiClient } from './client';

export const getStoreProducts = async (promotional?: boolean) => {
  if (promotional === true) {
    const response = await apiClient.get('/store-products/promotional');
    return response.data;
  } else if (promotional === false) {
    const response = await apiClient.get('/store-products/non-promotional');
    return response.data;
  }
  const response = await apiClient.get('/store-products/');
  return response.data;
};

export const getStoreProductByUPC = async (upc: string) => {
  const response = await apiClient.get(`/store-products/${upc}`);
  return response.data;
};

export const createStoreProduct = async (data: any) => {
  const response = await apiClient.post('/store-products/', data);
  return response.data;
};

export const updateStoreProduct = async (upc: string, data: any) => {
  const response = await apiClient.put(`/store-products/${upc}`, data);
  return response.data;
};

export const deleteStoreProduct = async (upc: string) => {
  const response = await apiClient.delete(`/store-products/${upc}`);
  return response.data;
};