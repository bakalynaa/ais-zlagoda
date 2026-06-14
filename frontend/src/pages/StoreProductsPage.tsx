import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { getStoreProducts, deleteStoreProduct } from '../api/store_products';

interface StoreProduct {
  UPC: string;
  UPC_prom: string | null;
  selling_price: number;
  products_number: number;
  promotional_product: boolean;
  product_name?: string;
}

export default function StoreProductsPage() {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'promotional' | 'non-promotional'>('all');
  const [upcSearch, setUpcSearch] = useState('');

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

  const filtered = products.filter(p =>
    upcSearch ? p.UPC.includes(upcSearch) : true
  );

  return (
    <Layout>
      <h1>Товари в магазині</h1>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <button onClick={() => handleFilter('all')}>Всі</button>
        <button onClick={() => handleFilter('promotional')}>Акційні</button>
        <button onClick={() => handleFilter('non-promotional')}>Не акційні</button>
        <input
          className="search-input"
          type="text"
          placeholder="Пошук за UPC..."
          value={upcSearch}
          onChange={(e) => setUpcSearch(e.target.value)}
        />
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
            {filtered.map((p) => (
              <tr key={p.UPC}>
                <td>{p.UPC}</td>
                <td>{p.product_name}</td>
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
      {!loading && filtered.length === 0 && <p>Товарів не знайдено</p>}
    </Layout>
  );
}