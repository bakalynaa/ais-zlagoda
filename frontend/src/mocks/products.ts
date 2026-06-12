import type { Product } from '../types';

export const MOCK_PRODUCTS: Product[] = [
  { id_product: 1, product_name: 'Молоко', manufacturer: 'Молокія', characteristics: '2.5%, 1л', category_name: 'Молочні' },
  { id_product: 2, product_name: 'Хліб', manufacturer: 'Кyivkhlib', characteristics: 'Білий, 500г', category_name: 'Хлібобулочні' },
  { id_product: 3, product_name: 'Яблука', manufacturer: 'Україна', characteristics: 'Голден, 1кг', category_name: 'Фрукти' },
  { id_product: 4, product_name: 'Ковбаса', manufacturer: 'Алан', characteristics: 'Докторська, 400г', category_name: 'М\'ясні' },
  { id_product: 5, product_name: 'Кава', manufacturer: 'Lvivska', characteristics: 'Молотий, 250г', category_name: 'Напої' },
];