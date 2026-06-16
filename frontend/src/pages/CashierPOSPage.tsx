import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { getStoreProducts } from '../api/store_products';
import { getCustomers } from '../api/customers';
import { apiClient } from '../api/client';
import { useLanguage } from '../i18n/LanguageContext';

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
  const { t } = useLanguage();
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
        setProducts(prods.map((row: unknown[]) => ({
          UPC: row[0] as string,
          selling_price: row[2] as number,
          products_number: row[3] as number,
          promotional_product: row[4] as boolean,
          product_name: row[5] as string,
        })));
        setCustomers(custs.map((row: unknown[]) => ({
          card_number: row[0] as string,
          cust_surname: row[1] as string,
          cust_name: row[2] as string,
          percent: row[8] as number,
        })));
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = products.filter((p) =>
    p.product_name.toLowerCase().includes(search.toLowerCase()),
  );

  const addToCart = (product: StoreProduct) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.UPC === product.UPC);
      if (existing) {
        return prev.map((item) =>
          item.UPC === product.UPC
            ? { ...item, quantity: item.quantity + 1 }
            : item,
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
      prev.map((item) => item.UPC === UPC ? { ...item, quantity } : item),
    );
  };

  const discount = selectedCard
    ? customers.find((c) => c.card_number === selectedCard)?.percent || 0
    : 0;

  const subtotal = cart.reduce((sum, item) => sum + item.selling_price * item.quantity, 0);
  const total = subtotal * (1 - discount / 100);

  const handleCheckout = async () => {
    if (cart.length === 0) {
      setError(t('cartEmptyError'));
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
      setSuccess(t('checkCreatedSuccess', { total: total.toFixed(2) }));
      setCart([]);
      setSelectedCard('');
      setError('');
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } }).response?.data?.detail;
      setError(typeof detail === 'string' ? detail : t('checkCreateError'));
    }
  };

  return (
    <Layout>
      <section className="manager-page cashier-pos">
        <div className="manager-page-header">
          <h1>{t('routeCashier')}</h1>
        </div>

        {loading ? (
          <p className="manager-status">{t('loading')}</p>
        ) : (
          <div className="cashier-pos-grid">
            <div className="cashier-pos-panel">
              <h2>{t('productsTitle')}</h2>
              <input
                className="search-input manager-field-input"
                type="text"
                placeholder={t('searchProductPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className="cashier-pos-scroll">
                <div className="manager-table-wrap">
                  <table className="manager-table data-table">
                    <thead>
                      <tr>
                        <th>{t('name')}</th>
                        <th>{t('price')}</th>
                        <th>{t('stockQty')}</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((p) => (
                        <tr key={p.UPC}>
                          <td>
                            {p.product_name} {p.promotional_product ? t('promoBadge') : ''}
                          </td>
                          <td>{p.selling_price} {t('currency')}</td>
                          <td>{p.products_number}</td>
                          <td>
                            <button
                              type="button"
                              className="manager-action-btn manager-action-btn--primary"
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
            </div>

            <div className="cashier-pos-panel">
              <h2>{t('posCartTitle')}</h2>

              <div className="cashier-card-select">
                <label htmlFor="customer-card">{t('customerCardLabel')}</label>
                <select
                  id="customer-card"
                  value={selectedCard}
                  onChange={(e) => setSelectedCard(e.target.value)}
                >
                  <option value="">{t('noCustomerCard')}</option>
                  {customers.map((c) => (
                    <option key={c.card_number} value={c.card_number}>
                      {c.cust_surname} {c.cust_name} ({c.percent}%)
                    </option>
                  ))}
                </select>
              </div>

              {cart.length === 0 ? (
                <p className="manager-empty">{t('cartEmpty')}</p>
              ) : (
                <>
                  <div className="manager-table-wrap">
                    <table className="manager-table data-table">
                      <thead>
                        <tr>
                          <th>{t('name')}</th>
                          <th>{t('price')}</th>
                          <th>{t('stockQty')}</th>
                          <th>{t('subtotalLabel')}</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {cart.map((item) => (
                          <tr key={item.UPC}>
                            <td>{item.product_name}</td>
                            <td>{item.selling_price} {t('currency')}</td>
                            <td>
                              <input
                                className="manager-field-input"
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateQuantity(item.UPC, parseInt(e.target.value, 10) || 0)}
                                style={{ width: '60px', maxWidth: 'none' }}
                              />
                            </td>
                            <td>{(item.selling_price * item.quantity).toFixed(2)} {t('currency')}</td>
                            <td>
                              <button
                                type="button"
                                className="manager-action-btn manager-action-btn--danger"
                                onClick={() => removeFromCart(item.UPC)}
                              >
                                ✕
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="cashier-totals">
                    {discount > 0 && <p>{t('discountLabel')}: {discount}%</p>}
                    <p><strong>{t('subtotalLabel')}: {subtotal.toFixed(2)} {t('currency')}</strong></p>
                    {discount > 0 && (
                      <p><strong>{t('payableLabel')}: {total.toFixed(2)} {t('currency')}</strong></p>
                    )}
                  </div>
                </>
              )}

              {error && <p className="cashier-msg-error">{error}</p>}
              {success && <p className="cashier-msg-success">{success}</p>}

              <button
                type="button"
                className="manager-action-btn manager-action-btn--primary cashier-checkout-btn"
                onClick={handleCheckout}
                disabled={cart.length === 0}
              >
                {t('checkoutBtn')}
              </button>
            </div>
          </div>
        )}
      </section>
    </Layout>
  );
}
