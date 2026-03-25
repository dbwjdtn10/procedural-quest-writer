import { type FC, useId } from 'react';

interface LoadingAnimationProps {
  text?: string;
  progress?: number;
}

const OUTER_RUNES = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ'];
const INNER_RUNES = ['ᛈ', 'ᛇ', 'ᛉ', 'ᛊ', 'ᛏ', 'ᛒ', 'ᛚ', 'ᛞ'];

export const LoadingAnimation: FC<LoadingAnimationProps> = ({ text = 'Generating quest...', progress }) => {
  const id = useId().replace(/:/g, '');

  const keyframesStyle = `
    @keyframes runeSpinOuter_${id} {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @keyframes runeSpinInner_${id} {
      from { transform: rotate(0deg); }
      to { transform: rotate(-360deg); }
    }
    @keyframes runePulseCenter_${id} {
      0%, 100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
      50% { opacity: 1; transform: translate(-50%, -50%) scale(1.15); }
    }
    @keyframes runeGlow_${id} {
      0%, 100% { box-shadow: 0 0 15px rgba(212, 175, 55, 0.15), inset 0 0 15px rgba(212, 175, 55, 0.05); }
      50% { box-shadow: 0 0 30px rgba(212, 175, 55, 0.35), inset 0 0 30px rgba(212, 175, 55, 0.1); }
    }
    @keyframes runeGlowInner_${id} {
      0%, 100% { box-shadow: 0 0 10px rgba(240, 208, 96, 0.1), inset 0 0 10px rgba(240, 208, 96, 0.05); }
      50% { box-shadow: 0 0 20px rgba(240, 208, 96, 0.3), inset 0 0 20px rgba(240, 208, 96, 0.1); }
    }
    @keyframes sparkle_${id} {
      0%, 100% { opacity: 0; transform: translate(-50%, -50%) scale(0); }
      50% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    }
    @keyframes textFlicker_${id} {
      0%, 100% { opacity: 1; }
      92% { opacity: 1; }
      93% { opacity: 0.6; }
      94% { opacity: 1; }
      96% { opacity: 0.7; }
      97% { opacity: 1; }
    }
    @keyframes progressGlow_${id} {
      0%, 100% { box-shadow: 0 0 4px rgba(212, 175, 55, 0.3); }
      50% { box-shadow: 0 0 8px rgba(212, 175, 55, 0.6); }
    }
  `;

  const containerSize = 160;
  const outerRadius = 70;
  const innerRadius = 46;

  return (
    <div className="loading-animation" style={{ padding: '3rem 2rem' }}>
      <style dangerouslySetInnerHTML={{ __html: keyframesStyle }} />

      {/* Magic circle container */}
      <div style={{
        position: 'relative',
        width: containerSize,
        height: containerSize,
        marginBottom: '1.5rem',
      }}>

        {/* Outer ring border */}
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          border: '1.5px solid var(--gold-dark)',
          opacity: 0.4,
          animation: `runeGlow_${id} 3s ease-in-out infinite`,
        }} />

        {/* Outer rotating rune ring */}
        <div style={{
          position: 'absolute',
          inset: 0,
          animation: `runeSpinOuter_${id} 12s linear infinite`,
        }}>
          {OUTER_RUNES.map((rune, i) => {
            const angle = (360 / OUTER_RUNES.length) * i;
            const rad = (angle * Math.PI) / 180;
            const x = containerSize / 2 + outerRadius * Math.cos(rad);
            const y = containerSize / 2 + outerRadius * Math.sin(rad);
            return (
              <span
                key={i}
                style={{
                  position: 'absolute',
                  left: x,
                  top: y,
                  transform: `translate(-50%, -50%) rotate(${angle + 90}deg)`,
                  fontSize: '0.85rem',
                  color: 'var(--gold)',
                  opacity: 0.75,
                  fontWeight: 'bold',
                  textShadow: '0 0 6px rgba(212, 175, 55, 0.5)',
                  willChange: 'transform',
                }}
              >
                {rune}
              </span>
            );
          })}
        </div>

        {/* Inner ring border */}
        <div style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: innerRadius * 2 + 16,
          height: innerRadius * 2 + 16,
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          border: '1px dashed var(--gold-light)',
          opacity: 0.3,
          animation: `runeGlowInner_${id} 2.5s ease-in-out infinite`,
        }} />

        {/* Inner counter-rotating rune ring */}
        <div style={{
          position: 'absolute',
          inset: 0,
          animation: `runeSpinInner_${id} 8s linear infinite`,
        }}>
          {INNER_RUNES.map((rune, i) => {
            const angle = (360 / INNER_RUNES.length) * i;
            const rad = (angle * Math.PI) / 180;
            const x = containerSize / 2 + innerRadius * Math.cos(rad);
            const y = containerSize / 2 + innerRadius * Math.sin(rad);
            return (
              <span
                key={i}
                style={{
                  position: 'absolute',
                  left: x,
                  top: y,
                  transform: `translate(-50%, -50%) rotate(${-angle - 90}deg)`,
                  fontSize: '0.7rem',
                  color: 'var(--gold-light)',
                  opacity: 0.6,
                  textShadow: '0 0 4px rgba(240, 208, 96, 0.4)',
                  willChange: 'transform',
                }}
              >
                {rune}
              </span>
            );
          })}
        </div>

        {/* Sparkle particles */}
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const angle = (360 / 6) * i;
          const rad = (angle * Math.PI) / 180;
          const dist = 30 + (i % 3) * 14;
          const x = containerSize / 2 + dist * Math.cos(rad);
          const y = containerSize / 2 + dist * Math.sin(rad);
          return (
            <span
              key={`sparkle-${i}`}
              style={{
                position: 'absolute',
                left: x,
                top: y,
                width: 3,
                height: 3,
                borderRadius: '50%',
                background: 'var(--gold-light)',
                animation: `sparkle_${id} ${1.5 + i * 0.3}s ease-in-out infinite`,
                animationDelay: `${i * 0.4}s`,
                opacity: 0,
                willChange: 'transform, opacity',
              }}
            />
          );
        })}

        {/* Center glow backdrop */}
        <div style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: 48,
          height: 48,
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, transparent 70%)',
        }} />

        {/* Center symbol */}
        <div style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          fontSize: '1.6rem',
          color: 'var(--gold)',
          animation: `runePulseCenter_${id} 2s ease-in-out infinite`,
          textShadow: '0 0 12px rgba(212, 175, 55, 0.6), 0 0 24px rgba(212, 175, 55, 0.3)',
          willChange: 'transform, opacity',
          lineHeight: 1,
        }}>
          &#x2726;
        </div>
      </div>

      {/* Loading text */}
      <p className="loading-text" style={{
        animation: `textFlicker_${id} 4s ease-in-out infinite`,
        letterSpacing: '0.04em',
      }}>
        {text}
      </p>

      {/* Progress bar */}
      {progress !== undefined && (
        <div className="progress-bar" style={{
          animation: `progressGlow_${id} 2s ease-in-out infinite`,
        }}>
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
};
