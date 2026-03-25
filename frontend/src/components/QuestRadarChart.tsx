import { useRef, useEffect, type FC } from 'react';
import type { GeneratedQuest } from '../types/quest';
import { useI18n } from '../i18n/I18nContext';

interface QuestRadarChartProps {
  quest: GeneratedQuest;
  size?: number;
}

export const QuestRadarChart: FC<QuestRadarChartProps> = ({ quest, size = 200 }) => {
  const { t } = useI18n();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const center = size / 2;
    const radius = size * 0.35;

    // Normalize stats to 0-1
    const difficultyMap: Record<string, number> = { easy: 0.25, normal: 0.5, hard: 0.75, legendary: 1 };
    const stats = [
      { label: t.radarDifficulty, value: difficultyMap[quest.difficulty] || 0.5 },
      { label: t.radarObjectives, value: Math.min(quest.objectives.length / 5, 1) },
      { label: t.radarGold, value: Math.min(quest.rewards.gold / 5000, 1) },
      { label: t.radarExp, value: Math.min(quest.rewards.exp / 3000, 1) },
      { label: t.radarBranches, value: quest.branches ? Math.min(quest.branches.length / 3, 1) : 0 },
      { label: t.radarItems, value: Math.min(quest.rewards.items.length / 4, 1) },
    ];

    const n = stats.length;
    const angleStep = (Math.PI * 2) / n;

    // Clear
    ctx.clearRect(0, 0, size, size);

    // Draw grid
    for (let ring = 1; ring <= 4; ring++) {
      const r = (radius * ring) / 4;
      ctx.beginPath();
      for (let i = 0; i <= n; i++) {
        const angle = i * angleStep - Math.PI / 2;
        const x = center + r * Math.cos(angle);
        const y = center + r * Math.sin(angle);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.strokeStyle = 'rgba(42, 42, 64, 0.6)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Draw axes
    for (let i = 0; i < n; i++) {
      const angle = i * angleStep - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.lineTo(center + radius * Math.cos(angle), center + radius * Math.sin(angle));
      ctx.strokeStyle = 'rgba(42, 42, 64, 0.4)';
      ctx.stroke();
    }

    // Draw data
    ctx.beginPath();
    for (let i = 0; i <= n; i++) {
      const idx = i % n;
      const angle = idx * angleStep - Math.PI / 2;
      const r = radius * stats[idx].value;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.fillStyle = 'rgba(212, 175, 55, 0.15)';
    ctx.fill();
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw points
    for (let i = 0; i < n; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const r = radius * stats[i].value;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#d4af37';
      ctx.fill();
    }

    // Draw labels
    ctx.font = '11px "Noto Sans KR", sans-serif';
    ctx.fillStyle = '#9994a8';
    ctx.textAlign = 'center';
    for (let i = 0; i < n; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const labelR = radius + 20;
      const x = center + labelR * Math.cos(angle);
      const y = center + labelR * Math.sin(angle);
      ctx.fillText(stats[i].label, x, y + 4);
    }
  }, [quest, size, t]);

  return (
    <div className="radar-chart" role="img" aria-label="Quest statistics radar chart">
      <canvas ref={canvasRef} width={size} height={size} />
    </div>
  );
};
