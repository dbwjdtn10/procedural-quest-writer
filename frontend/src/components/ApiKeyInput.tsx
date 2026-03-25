import { useState, type FC } from 'react';
import { EyeOff, Eye, ChevronUp, ChevronDown, Lock, KeyRound } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';

interface ApiKeyInputProps {
  onKeyChange: (key: string | null) => void;
}

export const ApiKeyInput: FC<ApiKeyInputProps> = ({ onKeyChange }) => {
  const { t } = useI18n();
  const [key, setKey] = useState(() => sessionStorage.getItem('pqw-api-key') || '');
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSave = () => {
    if (key.trim()) {
      sessionStorage.setItem('pqw-api-key', key.trim());
      onKeyChange(key.trim());
    } else {
      sessionStorage.removeItem('pqw-api-key');
      onKeyChange(null);
    }
  };

  const handleClear = () => {
    setKey('');
    sessionStorage.removeItem('pqw-api-key');
    onKeyChange(null);
  };

  const hasKey = !!sessionStorage.getItem('pqw-api-key');

  return (
    <div className="api-key-section">
      <button
        className="api-key-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span>{hasKey ? <><KeyRound size={16} className="inline-block" style={{ marginRight: 4, verticalAlign: 'middle' }} />{t.apiKeySet}</> : <><Lock size={16} className="inline-block" style={{ marginRight: 4, verticalAlign: 'middle' }} />{t.apiKeyInput}</>}</span>
        <span className="toggle-arrow">{isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</span>
      </button>
      {isExpanded && (
        <div className="api-key-form">
          <p className="api-key-desc">
            {t.apiKeyDesc}
          </p>
          <div className="api-key-input-row">
            <input
              type={isVisible ? 'text' : 'password'}
              value={key}
              onChange={e => setKey(e.target.value)}
              placeholder="sk-..."
              className="api-key-input"
            />
            <button
              className="api-key-vis-btn"
              onClick={() => setIsVisible(!isVisible)}
            >
              {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <div className="api-key-actions">
            <button className="api-key-save" onClick={handleSave} disabled={!key.trim()}>
              {t.apiKeyApply}
            </button>
            {hasKey && (
              <button className="api-key-clear" onClick={handleClear}>
                {t.apiKeyClear}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
