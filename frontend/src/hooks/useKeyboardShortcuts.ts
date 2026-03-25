import { useEffect, useRef } from 'react';

interface Shortcuts {
  onGenerate?: () => void;
  onRegenerate?: () => void;
  onToggleJson?: () => void;
  onToggleTheme?: () => void;
}

export function useKeyboardShortcuts(shortcuts: Shortcuts) {
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) {
        return;
      }

      const s = shortcutsRef.current;

      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'g':
            e.preventDefault();
            s.onGenerate?.();
            break;
          case 'r':
            if (e.shiftKey) {
              e.preventDefault();
              s.onRegenerate?.();
            }
            break;
          case 'j':
            e.preventDefault();
            s.onToggleJson?.();
            break;
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
}
