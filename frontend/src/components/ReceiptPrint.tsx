import { useLanguage } from '../i18n/LanguageContext';

export interface ReceiptItem {
  product_name: string;
  selling_price: number;
  quantity: number;
}

export interface ReceiptData {
  check_number: string;
  sum_total: number;
  vat: number;
  discount: number;
  items: ReceiptItem[];
  card_label?: string;
  created_at: Date;
}

interface Props {
  receipt: ReceiptData;
  onClose: () => void;
}

export default function ReceiptPrint({ receipt, onClose }: Props) {
  const { t, dateLocale } = useLanguage();

  const subtotal = receipt.items.reduce(
    (sum, item) => sum + item.selling_price * item.quantity,
    0,
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <div className="receipt-overlay no-print" onClick={onClose} aria-hidden="true" />
      <div className="receipt-dialog">
        <div className="receipt-actions no-print">
          <button type="button" className="manager-action-btn manager-action-btn--primary" onClick={handlePrint}>
            {t('printReceipt')}
          </button>
          <button type="button" className="manager-action-btn" onClick={onClose}>
            {t('receiptClose')}
          </button>
        </div>

        <div id="receipt-print-area" className="receipt-paper">
          <h2>{t('receiptTitle')}</h2>
          <p><strong>{t('checkNumber')}:</strong> {receipt.check_number}</p>
          <p><strong>{t('date')}:</strong> {receipt.created_at.toLocaleString(dateLocale)}</p>
          {receipt.card_label && (
            <p><strong>{t('card')}:</strong> {receipt.card_label}</p>
          )}

          <table className="receipt-table">
            <thead>
              <tr>
                <th>{t('name')}</th>
                <th>{t('price')}</th>
                <th>{t('stockQty')}</th>
                <th>{t('subtotalLabel')}</th>
              </tr>
            </thead>
            <tbody>
              {receipt.items.map((item) => (
                <tr key={item.product_name + item.selling_price}>
                  <td>{item.product_name}</td>
                  <td>{item.selling_price.toFixed(2)}</td>
                  <td>{item.quantity}</td>
                  <td>{(item.selling_price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {receipt.discount > 0 && (
            <p>{t('discountLabel')}: {receipt.discount}%</p>
          )}
          <p><strong>{t('subtotalLabel')}:</strong> {subtotal.toFixed(2)} {t('currency')}</p>
          <p><strong>{t('payableLabel')}:</strong> {receipt.sum_total.toFixed(2)} {t('currency')}</p>
          <p><strong>{t('vat')}:</strong> {receipt.vat.toFixed(2)} {t('currency')}</p>
          <p className="receipt-thanks">{t('receiptThankYou')}</p>
        </div>
      </div>
    </>
  );
}
