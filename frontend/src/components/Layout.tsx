import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import FlowingMenu from './FlowingMenu';
import { useLanguage } from '../i18n/LanguageContext';
import type { TranslationKey } from '../i18n/translations';

interface Props {
  children: React.ReactNode;
}

const managerLinkDefs: { to: string; labelKey: TranslationKey; image: string }[] = [
  { to: '/manager/categories', labelKey: 'routeCategories', image: '/menu/categories.png' },
  { to: '/manager/products', labelKey: 'routeProducts', image: '/menu/products.png' },
  { to: '/manager/store-products', labelKey: 'routeStoreProducts', image: '/menu/store-products.png' },
  { to: '/manager/customers', labelKey: 'routeCustomers', image: '/menu/customers.png' },
  { to: '/manager/checks', labelKey: 'routeChecks', image: '/menu/checks.png' },
  { to: '/manager/reports', labelKey: 'routeReports', image: '/menu/reports.png' },
  { to: '/manager/statistics', labelKey: 'routeStatistics', image: '/menu/statistics.png' },
];

const cashierLinkDefs: { to: string; labelKey: TranslationKey; image: string }[] = [
  { to: '/cashier/products', labelKey: 'routeProducts', image: '/menu/products.png' },
  { to: '/cashier/customers', labelKey: 'routeCustomers', image: '/menu/customers.png' },
  { to: '/cashier/checks', labelKey: 'routeMyChecks', image: '/menu/checks.png' },
];

export default function Layout({ children }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const { lang, setLang, t, routeLabel } = useLanguage();
  const role = localStorage.getItem('role');
  const isManager = role === 'Manager';
  const [menuOpen, setMenuOpen] = useState(false);

  const homePath = isManager ? '/manager' : '/cashier';
  const isHome = location.pathname === homePath;
  const linkDefs = isManager ? managerLinkDefs : cashierLinkDefs;

  const currentPage = useMemo(
    () => routeLabel(location.pathname),
    [location.pathname, routeLabel],
  );

  const menuLinks = useMemo(
    () => linkDefs.map((item) => ({ ...item, label: t(item.labelKey) })),
    [linkDefs, t],
  );

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/first-screen');
  }

  const shellClass = [
    'layout-manager',
    !isManager && 'layout-cashier',
    isHome ? 'layout-manager--home' : 'layout-manager--inner',
  ]
    .filter(Boolean)
    .join(' ');

  const menuId = isManager ? 'manager-side-menu' : 'cashier-side-menu';

  return (
    <div className={shellClass}>
      <div className="manager-bg-layer" aria-hidden="true" />
      <div className="manager-bg-overlay" aria-hidden="true" />
      {isHome && (
        <>
          <div className="manager-bg-glow manager-bg-glow-left" />
          <div className="manager-bg-glow manager-bg-glow-bottom" />
        </>
      )}

      <header className="manager-topbar">
        <div className="manager-breadcrumbs">
          <Link to={homePath} className="manager-home-link">
            <img src="/cart-nier-main-page_new.png" alt="" aria-hidden="true" className="manager-home-link-icon" />
            <span>{t('home')}</span>
          </Link>
          <span>/</span>
          <span>{currentPage}</span>
        </div>

        <div className="manager-actions">
          <div className="manager-lang-toggle">
            <button
              type="button"
              className={lang === 'eng' ? 'active' : ''}
              onClick={() => setLang('eng')}
            >
              eng
            </button>
            <span>/</span>
            <button
              type="button"
              className={lang === 'ukr' ? 'active' : ''}
              onClick={() => setLang('ukr')}
            >
              ukr
            </button>
          </div>

          <Link to="/profile" className="manager-pill-btn">{t('profile')}</Link>
          <button
            type="button"
            className="manager-menu-btn"
            onClick={() => setMenuOpen((value) => !value)}
            aria-expanded={menuOpen}
            aria-controls={menuId}
          >
            {menuOpen ? t('close') : t('menu')}
          </button>
        </div>
      </header>

      <main className="manager-main-content">{children}</main>

      <div
        className={`manager-side-overlay ${menuOpen ? 'visible' : ''}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden={!menuOpen}
      />
      <aside id={menuId} className={`manager-side-menu ${menuOpen ? 'open' : ''}`}>
        <button type="button" className="manager-side-close" onClick={() => setMenuOpen(false)}>
          {t('logoutMenu')}
        </button>
        <FlowingMenu
          items={[
            ...menuLinks,
            { label: t('logout'), image: '/menu/logout.png', onClick: handleLogout },
          ]}
          onNavigate={() => setMenuOpen(false)}
        />
      </aside>
    </div>
  );
}
