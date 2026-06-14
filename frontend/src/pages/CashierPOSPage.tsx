import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { getStoreProducts } from '../api/store_products';
import { getCustomers } from '../api/customers';
import { apiClient } from '../api/client';

interface StoreProduct {
  UPC: string;
  selling_price: number;
  products_number: number;
  promotional_product: boolean;
  product_name: string;
}

interface CartItem {
  UPC: string;
  product_name: string;
  selling_price: number;
  quantity: number;
}

interface Customer {
  card_number: string;
  cust_surname: string;
  cust_name: string;
  percent: number;
}

export default function CashierPOSPage() {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCard, setSelectedCard] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getStoreProducts(), getCustomers()])
      .then(([prods, custs]) => {
        setProducts(prods.map((row: any[]) => ({
          UPC: row[0],
          selling_price: row[2],
          products_number: row[3],
          promotional_product: row[4],
          product_name: row[5],
        })));
        setCustomers(custs.map((row: any[]) => ({
          card_number: row[0],
          cust_surname: row[1],
          cust_name: row[2],
          percent: row[8],
        })));
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = products.filter((p) =>
    p.product_name.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (product: StoreProduct) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.UPC === product.UPC);
      if (existing) {
        return prev.map((item) =>
          item.UPC === product.UPC
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, {
        UPC: product.UPC,
        product_name: product.product_name,
        selling_price: product.selling_price,
        quantity: 1,
      }];
    });
  };

  const removeFromCart = (UPC: string) => {
    setCart((prev) => prev.filter((item) => item.UPC !== UPC));
  };

  const updateQuantity = (UPC: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(UPC);
      return;
    }
    setCart((prev) =>
      prev.map((item) => item.UPC === UPC ? { ...item, quantity } : item)
    );
  };

  const discount = selectedCard
    ? customers.find((c) => c.card_number === selectedCard)?.percent || 0
    : 0;

  const subtotal = cart.reduce((sum, item) => sum + item.selling_price * item.quantity, 0);
  const total = subtotal * (1 - discount / 100);

  const handleCheckout = async () => {
    if (cart.length === 0) {
      setError('Кошик порожній');
      return;
    }
    try {
      await apiClient.post('/checks/', {
        card_number: selectedCard || null,
        items: cart.map((item) => ({
          UPC: item.UPC,
          product_number: item.quantity,
        })),
      });
      setSuccess(`Чек створено! Сума: ${total.toFixed(2)} грн`);
      setCart([]);
      setSelectedCard('');
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Помилка створення чека');
    }
  };

  return (
    <Layout>
      <h1>Каса</h1>
      {loading ? <p>Завантаження...</p> : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          
          {/* Ліва частина — товари */}
          <div>
            <h2>Товари</h2>
            <input
              className="search-input"
              type="text"
              placeholder="Пошук товару..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ marginBottom: '1rem' }}
            />
            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Назва</th>
                    <th>Ціна</th>
                    <th>К-сть</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.UPC}>
                      <td>{p.product_name} {p.promotional_product ? '(акція)' : ''}</td>
                      <td>{p.selling_price} грн</td>
                      <td>{p.products_number}</td>
                      <td>
                        <button
                          onClick={() => addToCart(p)}
                          disabled={p.products_number === 0}
                        >
                          +
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Права частина — кошик */}
          <div>
            <h2>Кошик</h2>

            <div style={{ marginBottom: '1rem' }}>
              <label>Картка клієнта:</label>
              <select
                value={selectedCard}
                onChange={(e) => setSelectedCard(e.target.value)}
                style={{ marginLeft: '0.5rem', padding: '0.25rem' }}
              >
                <option value="">— без картки —</option>
                {customers.map((c) => (
                  <option key={c.card_number} value={c.card_number}>
                    {c.cust_surname} {c.cust_name} ({c.percent}%)
                  </option>
                ))}
              </select>
            </div>

            {cart.length === 0 ? (
              <p>Кошик порожній</p>
            ) : (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Назва</th>
                      <th>Ціна</th>
                      <th>К-сть</th>
                      <th>Сума</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((item) => (
                      <tr key={item.UPC}>
                        <td>{item.product_name}</td>
                        <td>{item.selling_price} грн</td>
                        <td>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.UPC, parseInt(e.target.value))}
                            style={{ width: '60px' }}
                          />
                        </td>
                        <td>{(item.selling_price * item.quantity).toFixed(2)} грн</td>
                        <td>
                          <button onClick={() => removeFromCart(item.UPC)}>✕</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                  {discount > 0 && <p>Знижка: {discount}%</p>}
                  <p><strong>Сума: {subtotal.toFixed(2)} грн</strong></p>
                  {discount > 0 && <p><strong>До сплати: {total.toFixed(2)} грн</strong></p>}
                </div>
              </>
            )}

            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}

            <button
              onClick={handleCheckout}
              disabled={cart.length === 0}
              style={{ marginTop: '1rem', width: '100%', padding: '0.75rem', fontSize: '1rem' }}
            >
              Оформити чек
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}