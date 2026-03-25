import type { FC } from 'react';
import { Globe } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';

export const LanguageToggle: FC = () => {
  const { locale, toggleLocale } = useI18n();

  return (
    <button className="language-toggle" onClick={toggleLocale} title="Toggle language">
      <Globe size={16} className="inline-block" style={{ marginRight: 4, verticalAlign: 'middle' }} /> {locale === 'ko' ? 'EN' : 'KO'}
    </button>
  );
};
