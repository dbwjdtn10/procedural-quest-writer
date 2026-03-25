import { useState, useCallback, useEffect, useRef, createContext, useContext, type FC, type ReactNode } from 'react';
import { CheckCircle, XCircle, Info } from 'lucide-react';

interface ToastMessage {
  id: number;
  text: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContextType {
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });
export const useToast = () => useContext(ToastContext);

let nextId = 0;

export const ToastProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const timeoutIds = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  const showToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = nextId++;
    setToasts(prev => [...prev, { id, text, type }]);
    const tid = setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
      timeoutIds.current.delete(tid);
    }, 3000);
    timeoutIds.current.add(tid);
  }, []);

  useEffect(() => {
    return () => {
      timeoutIds.current.forEach(clearTimeout);
    };
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container" role="status" aria-live="polite">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <span className="toast-icon" aria-hidden="true">
              {t.type === 'success' ? <CheckCircle size={16} /> : t.type === 'error' ? <XCircle size={16} /> : <Info size={16} />}
            </span>
            <span>{t.text}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
