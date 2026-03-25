import { useEffect, useState, useRef } from 'react';
import type { FC } from 'react';

interface StreamingTextProps {
  text: string;
  speed?: number;
  className?: string;
}

export const StreamingText: FC<StreamingTextProps> = ({ text, speed = 20, className }) => {
  const [displayedLength, setDisplayedLength] = useState(0);
  const prevTextRef = useRef('');

  useEffect(() => {
    if (text.length > prevTextRef.current.length) {
      // New text added, animate from where we were
      const startFrom = prevTextRef.current.length;
      setDisplayedLength(startFrom);

      let current = startFrom;
      const interval = setInterval(() => {
        current++;
        setDisplayedLength(current);
        if (current >= text.length) clearInterval(interval);
      }, speed);

      prevTextRef.current = text;
      return () => clearInterval(interval);
    } else {
      prevTextRef.current = text;
      setDisplayedLength(text.length);
    }
  }, [text, speed]);

  return (
    <span className={className}>
      {text.slice(0, displayedLength)}
      {displayedLength < text.length && <span className="cursor-blink">|</span>}
    </span>
  );
};
