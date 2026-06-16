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

export interface CheckCreatePayload {
  card_number?: string | null;
  items: { UPC: string; product_number: number }[];
}

export interface CheckCreateResponse {
  message: string;
  check_number: string;
  sum_total: number;
  vat: number;
}

export const createCheck = async (payload: CheckCreatePayload) => {
  const response = await apiClient.post<CheckCreateResponse>('/checks/', payload);
  return response.data;
};