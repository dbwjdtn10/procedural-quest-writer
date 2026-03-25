import React, { useState, useEffect, type ReactNode } from 'react';
import { Wand2, Sparkles, Link } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';

export const OnboardingTour: React.FC = () => {
  const { t } = useI18n();
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem('pqw-onboarding-seen');
    if (!seen) setVisible(true);
  }, []);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem('pqw-onboarding-seen', 'true');
  };

  if (!visible) return null;

  const steps: Array<{ title: string; desc: string; icon: ReactNode }> = [
    { title: t.onboardingStep1Title, desc: t.onboardingStep1Desc, icon: <Wand2 size={32} /> },
    { title: t.onboardingStep2Title, desc: t.onboardingStep2Desc, icon: <Sparkles size={32} /> },
    { title: t.onboardingStep3Title, desc: t.onboardingStep3Desc, icon: <Link size={32} /> },
  ];

  const current = steps[step];

  return (
    <div className="onboarding-overlay" onClick={dismiss} role="dialog" aria-modal="true" aria-label="Onboarding tour">
      <div className="onboarding-modal" onClick={e => e.stopPropagation()}>
        <button className="onboarding-skip" onClick={dismiss} aria-label="Skip onboarding tour">{t.onboardingSkip}</button>
        <div className="onboarding-icon">{current.icon}</div>
        <h2 className="onboarding-title">{current.title}</h2>
        <p className="onboarding-desc">{current.desc}</p>
        <div className="onboarding-dots">
          {steps.map((_, i) => (
            <span key={i} className={`onboarding-dot ${i === step ? 'active' : ''}`} />
          ))}
        </div>
        <div className="onboarding-actions">
          {step > 0 && (
            <button className="onboarding-btn secondary" onClick={() => setStep(s => s - 1)}>
              {t.onboardingPrev}
            </button>
          )}
          {step < steps.length - 1 ? (
            <button className="onboarding-btn primary" onClick={() => setStep(s => s + 1)}>
              {t.onboardingNext}
            </button>
          ) : (
            <button className="onboarding-btn primary" onClick={dismiss}>
              {t.onboardingStart}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
