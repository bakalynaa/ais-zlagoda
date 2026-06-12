import type { UserRole } from '../types';

export function devLogin(role: UserRole): void {
  localStorage.setItem('token', 'dev-test-token');
  localStorage.setItem('role', role);
}
