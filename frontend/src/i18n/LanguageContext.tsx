import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { translations, routeTranslationKeys } from './translations';
import type { Lang, TranslationKey } from './translations';

const STORAGE_KEY = 'app-lang';

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
  routeLabel: (pathname: string) => string;
  dateLocale: string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function readStoredLang(): Lang {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === 'eng' ? 'eng' : 'ukr';
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readStoredLang);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) => {
      let text = translations[lang][key];
      if (vars) {
        for (const [name, value] of Object.entries(vars)) {
          text = text.replace(`{{${name}}}`, String(value));
        }
      }
      return text;
    },
    [lang],
  );

  const routeLabel = useCallback(
    (pathname: string) => {
      const key = routeTranslationKeys[pathname];
      return key ? t(key) : t('page');
    },
    [t],
  );

  const value = useMemo(
    () => ({
      lang,
      setLang,
      t,
      routeLabel,
      dateLocale: lang === 'ukr' ? 'uk-UA' : 'en-US',
    }),
    [lang, setLang, t, routeLabel],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return ctx;
}
