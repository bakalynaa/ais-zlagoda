import { useMemo, useState } from 'react';
import Layout from '../components/Layout';
import { MOCK_PRODUCTS } from '../mocks/products';

export default function ProductsPage() {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return MOCK_PRODUCTS;
    return MOCK_PRODUCTS.filter((p) =>
      p.product_name.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <Layout>
      <h1>Товари</h1>

      <input
        className="search-input"
        type="text"
        placeholder="Пошук за назвою..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Назва</th>
            <th>Виробник</th>
            <th>Характеристики</th>
            <th>Категорія</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((p) => (
            <tr key={p.id_product}>
              <td>{p.id_product}</td>
              <td>{p.product_name}</td>
              <td>{p.manufacturer}</td>
              <td>{p.characteristics}</td>
              <td>{p.category_name}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {filtered.length === 0 && <p>Товарів не знайдено</p>}
    </Layout>
  );
}