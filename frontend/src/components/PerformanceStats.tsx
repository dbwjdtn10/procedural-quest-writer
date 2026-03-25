import { useState, useEffect, type FC } from 'react';
import { useI18n } from '../i18n/I18nContext';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

interface Stats {
  total_quests_generated: number;
  total_chains_generated: number;
  uptime_seconds: number;
}

interface PerformanceStatsProps {
  generationTimeMs?: number;
}

export const PerformanceStats: FC<PerformanceStatsProps> = ({ generationTimeMs }) => {
  const { t } = useI18n();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    const fetchStats = () => {
      fetch(`${API_BASE}/api/stats`)
        .then(r => r.json())
        .then(data => setStats(data))
        .catch(() => {});
    };
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  return (
    <div className="performance-stats">
      {generationTimeMs !== undefined && (
        <div className="stat-item highlight">
          <span className="stat-icon">GEN</span>
          <span className="stat-value">{(generationTimeMs / 1000).toFixed(1)}s</span>
          <span className="stat-label">{t.statGenerationTime}</span>
        </div>
      )}
      {stats && (
        <>
          <div className="stat-item">
            <span className="stat-icon">Q</span>
            <span className="stat-value">{stats.total_quests_generated}</span>
            <span className="stat-label">{t.statQuests}</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">C</span>
            <span className="stat-value">{stats.total_chains_generated}</span>
            <span className="stat-label">{t.statChains}</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">UP</span>
            <span className="stat-value">{formatUptime(stats.uptime_seconds)}</span>
            <span className="stat-label">{t.statUptime}</span>
          </div>
        </>
      )}
    </div>
  );
};
