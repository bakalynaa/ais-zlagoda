import { apiClient } from './client';
import type { LoginResponse } from '../types';

export async function login(id_employee: string, password: string): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>('/login', {
    id_employee,
    password,
  });
  return data;
}