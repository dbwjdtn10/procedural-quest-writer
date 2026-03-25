import { type FC, useState } from 'react';

interface NpcAvatarProps {
  name: string;
  size?: number;
}

const COLORS = ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#6366F1', '#14B8A6'];

function getColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

export const NpcAvatar: FC<NpcAvatarProps> = ({ name, size = 48 }) => {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const diceBearUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}&size=${size * 2}`;

  if (imgError) {
    const initial = name.charAt(0).toUpperCase();
    const color = getColor(name);

    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${color}, ${color}88)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: size * 0.45,
          fontWeight: 700,
          color: '#fff',
          border: '2px solid rgba(212, 175, 55, 0.5)',
          flexShrink: 0,
        }}
      >
        {initial}
      </div>
    );
  }

  return (
    <img
      src={diceBearUrl}
      alt={name}
      onError={() => setImgError(true)}
      onLoad={() => setImgLoaded(true)}
      width={size}
      height={size}
      style={{
        borderRadius: '50%',
        border: '2px solid rgba(212, 175, 55, 0.5)',
        flexShrink: 0,
        opacity: imgLoaded ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out',
        objectFit: 'cover',
      }}
    />
  );
};
