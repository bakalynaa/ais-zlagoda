import { apiClient } from './client';

export const getChecks = async (cashierId?: string, dateFrom?: string, dateTo?: string) => {
  const params = new URLSearchParams();
  if (cashierId) params.append('cashier_id', cashierId);
  if (dateFrom) params.append('date_from', dateFrom);
  if (dateTo) params.append('date_to', dateTo);
  const response = await apiClient.get(`/checks/?${params.toString()}`);
  return response.data;
};

export const getCheck = async (checkNumber: string) => {
  const response = await apiClient.get(`/checks/${checkNumber}`);
  return response.data;
};

export const deleteCheck = async (checkNumber: string) => {
  const response = await apiClient.delete(`/checks/${checkNumber}`);
  return response.data;
};