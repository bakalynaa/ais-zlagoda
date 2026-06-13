import { useEffect, useMemo, useState } from 'react';
import Layout from '../components/Layout';
import { getProducts } from '../api/products';

interface Product {
  id_product: number;
  product_name: string;
  manufacturer: string;
  characteristics: string;
  category_name?: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts()
      .then((data) => {
        const mapped = data.map((row: any[]) => ({
          id_product: row[0],
          product_name: row[1],
          manufacturer: row[2],
          characteristics: row[3],
          category_name: row[5],
        }));
        setProducts(mapped);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) =>
      p.product_name.toLowerCase().includes(q)
    );
  }, [search, products]);

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
      {loading ? (
        <p>Завантаження...</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Назва</th>
              <th>Виробник</th>
              <th>Характеристики</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id_product}>
                <td>{p.id_product}</td>
                <td>{p.product_name}</td>
                <td>{p.manufacturer}</td>
                <td>{p.characteristics}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {!loading && filtered.length === 0 && <p>Товарів не знайдено</p>}
    </Layout>
  );
}