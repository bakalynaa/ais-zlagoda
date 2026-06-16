import { useMemo } from 'react';
import Layout from '../components/Layout';
import { useLanguage } from '../i18n/LanguageContext';

export default function ManagerDashboard() {
  const { t } = useLanguage();

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
        </div>
      </section>
    </Layout>
  );
}
