import { useState, type FC } from 'react';
import { soundManager } from '../utils/soundManager';

export const SoundToggle: FC = () => {
  const [enabled, setEnabled] = useState(soundManager.enabled);

  const toggle = () => {
    const next = !enabled;
    soundManager.enabled = next;
    setEnabled(next);
    if (next) soundManager.playClick();
  };

  return (
    <button className="sound-toggle" onClick={toggle} title={enabled ? 'Sound ON' : 'Sound OFF'}>
      {enabled ? 'SND ON' : 'SND OFF'}
    </button>
  );
};
