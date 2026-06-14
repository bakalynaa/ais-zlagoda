import { apiClient } from './client';

export const getCustomers = async (surname?: string, percent?: number) => {
  const params = new URLSearchParams();
  if (surname) params.append('surname', surname);
  if (percent !== undefined) params.append('percent', percent.toString());
  const response = await apiClient.get(`/customers/?${params.toString()}`);
  return response.data;
};

export const getCustomer = async (cardNumber: string) => {
  const response = await apiClient.get(`/customers/${cardNumber}`);
  return response.data;
};

export const createCustomer = async (data: any) => {
  const response = await apiClient.post('/customers/', data);
  return response.data;
};

export const updateCustomer = async (cardNumber: string, data: any) => {
  const response = await apiClient.put(`/customers/${cardNumber}`, data);
  return response.data;
};

export const deleteCustomer = async (cardNumber: string) => {
  const response = await apiClient.delete(`/customers/${cardNumber}`);
  return response.data;
};