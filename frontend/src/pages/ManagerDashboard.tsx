import { useMemo } from 'react';
import Layout from '../components/Layout';
import Dock from '../components/Dock';
import { useLanguage } from '../i18n/LanguageContext';

export default function ManagerDashboard() {
  const { t } = useLanguage();

  const dockItems = useMemo(
    () => [
      { label: t('query1'), onClick: () => {} },
      { label: t('query2'), onClick: () => {} },
      { label: t('query3'), onClick: () => {} },
    ],
    [t],
  );

  return (
    <Layout>
      <section className="manager-hero">
        <div className="manager-hero-intro">
          <h1>
            <span className="manager-brand-title">ZLAGODA</span>
            <span className="manager-brand-subtitle">{t('dashboardSubtitle')}</span>
          </h1>
          <p>{t('dashboardDescription')}</p>
          <h3>{t('dashboardInstruction')}</h3>

          <div className="manager-hero-dock">
            <Dock
              items={dockItems}
              inline
              className="manager-dock"
              panelHeight={58}
              baseItemSize={50}
              magnification={56}
            />
          </div>
        </div>
      </section>
    </Layout>
  );
}
