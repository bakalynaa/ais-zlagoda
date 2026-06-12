import { apiClient } from './client';
import type { EmployeeRow } from '../types';

export async function getMe(): Promise<EmployeeRow> {
  const { data } = await apiClient.get<EmployeeRow>('/employees/me');
  return data;
}