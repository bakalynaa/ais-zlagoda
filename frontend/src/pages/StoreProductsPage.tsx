import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { getStoreProducts, deleteStoreProduct } from '../api/store_products';

interface StoreProduct {
  UPC: string;
  UPC_prom: string | null;
  id_product: number;
  selling_price: number;
  products_number: number;
  promotional_product: boolean;
  product_name?: string;
}

export default function StoreProductsPage() {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'promotional' | 'non-promotional'>('all');

  const fetchProducts = (f = filter) => {
    setLoading(true);
    const promotional = f === 'all' ? undefined : f === 'promotional';
    getStoreProducts(promotional)
      .then((data) => {
        const mapped = data.map((row: any[]) => ({
          UPC: row[0],
          UPC_prom: row[1],
          selling_price: row[2],
          products_number: row[3],
          promotional_product: row[4],
          product_name: row[5],
          manufacturer: row[6],
          characteristics: row[7],
        }));
        setProducts(mapped);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleFilter = (f: 'all' | 'promotional' | 'non-promotional') => {
    setFilter(f);
    fetchProducts(f);
  };

  const handleDelete = (upc: string) => {
    if (confirm('Видалити товар з магазину?')) {
      deleteStoreProduct(upc).then(() => fetchProducts());
    }
  };

  return (
    <Layout>
      <h1>Товари в магазині</h1>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <button onClick={() => handleFilter('all')}>Всі</button>
        <button onClick={() => handleFilter('promotional')}>Акційні</button>
        <button onClick={() => handleFilter('non-promotional')}>Не акційні</button>
      </div>
      {loading ? (
        <p>Завантаження...</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>UPC</th>
              <th>Назва</th>
              <th>Ціна</th>
              <th>Кількість</th>
              <th>Акційний</th>
              <th>Дії</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.UPC}>
                <td>{p.UPC}</td>
                <td>{p.product_name || p.id_product}</td>
                <td>{p.selling_price} грн</td>
                <td>{p.products_number}</td>
                <td>{p.promotional_product ? '+' : '-'}</td>
                <td>
                  <button onClick={() => handleDelete(p.UPC)}>Видалити</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {!loading && products.length === 0 && <p>Товарів не знайдено</p>}
    </Layout>
  );
}