import { apiClient } from './client';

export interface SalesByCategoryRow {
  product_name: string;
  category_name: string;
  total_sold: number;
}

export interface CashierSoldAllRow {
  id_employee: string;
  empl_surname: string;
  empl_name: string;
}

export interface StoreStatsRow {
  category_name: string;
  positions_count: number;
  total_units: number;
}

export interface CategoryStockedRow {
  category_number: number;
  category_name: string;
}

export interface CategorySalesSummaryRow {
  category_name: string;
  sale_lines: number;
  total_units: number;
  total_revenue: number;
}

export interface ProductSoldByAllRow {
  id_product: number;
  product_name: string;
}

//       Дар'я Гречко

export const getSalesByCategory = async (
  categoryNumber: number,
  dateFrom: string,
  dateTo: string,
) => {
  const { data } = await apiClient.get<SalesByCategoryRow[]>('/reports/sales-by-category', {
    params: { category_number: categoryNumber, date_from: dateFrom, date_to: dateTo },
  });
  return data;
};

export const getCashiersSoldAllInCategory = async (categoryNumber: number) => {
  const { data } = await apiClient.get<CashierSoldAllRow[]>(
    '/reports/cashiers-sold-all-in-category',
    { params: { category_number: categoryNumber } },
  );
  return data;
};

//       Анастасія Бакалина

export const getStoreStatsByCategory = async (categoryNumber: number) => {
  const { data } = await apiClient.get<StoreStatsRow[]>('/reports/store-stats-by-category', {
    params: { category_number: categoryNumber },
  });
  return data;
};

export const getCategoriesFullyStocked = async () => {
  const { data } = await apiClient.get<CategoryStockedRow[]>('/reports/categories-fully-stocked');
  return data;
};

//       Артем Бутирін

export const getCategorySalesSummary = async (minRevenue = 200) => {
  const { data } = await apiClient.get<CategorySalesSummaryRow[]>(
    '/reports/butyrin/category-sales-summary',
    { params: { min_revenue: minRevenue } },
  );
  return data;
};

export const getProductsSoldByAllCashiers = async () => {
  const { data } = await apiClient.get<ProductSoldByAllRow[]>(
    '/reports/butyrin/products-sold-by-all-cashiers',
  );
  return data;
};
