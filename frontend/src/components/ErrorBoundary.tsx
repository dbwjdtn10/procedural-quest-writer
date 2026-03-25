import { Component, type ErrorInfo, type ReactNode } from 'react';
import { useI18n } from '../i18n/I18nContext';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

const ErrorDisplay: React.FC<{ error: Error | null; onRetry: () => void }> = ({ error, onRetry }) => {
  const { t } = useI18n();
  return (
    <div className="error-boundary">
      <div className="error-boundary-content">
        <div className="error-icon">{t.warningLabel}</div>
        <h2>{t.errorBoundaryTitle}</h2>
        <p className="error-message">{error?.message || t.errorBoundaryUnknown}</p>
        <button className="error-retry-btn" onClick={onRetry}>
          {t.retry}
        </button>
      </div>
    </div>
  );
};

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return <ErrorDisplay error={this.state.error} onRetry={this.handleRetry} />;
    }

    return this.props.children;
  }
}
