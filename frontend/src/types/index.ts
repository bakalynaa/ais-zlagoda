export type UserRole = 'Manager' | 'Cashier';

export interface LoginResponse {
  token: string;
  role: UserRole;
}

export type EmployeeRow = [
  string,
  string,
  string,
  string | null,
  UserRole,
  number,
  string,
  string,
  string,
  string,
  string,
  string,
];

export interface Product {
  id_product: number;
  product_name: string;
  manufacturer: string;
  characteristics: string;
  category_name: string;
}