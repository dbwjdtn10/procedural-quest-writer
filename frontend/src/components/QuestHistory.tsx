import { useState, type ReactNode } from 'react';
import type { FC } from 'react';
import { Scroll, ClipboardList, RefreshCw, Sparkles, Library } from 'lucide-react';
import type { GeneratedQuest, QuestType } from '../types/quest';
import { useI18n } from '../i18n/I18nContext';

interface QuestHistoryProps {
  quests: GeneratedQuest[];
  selectedId: string | null;
  onSelect: (quest: GeneratedQuest) => void;
}

const typeIcons: Record<string, ReactNode> = {
  main: <Scroll size={16} />,
  side: <ClipboardList size={16} />,
  daily: <RefreshCw size={16} />,
  hidden: <Sparkles size={16} />,
};

const typeFilters: Array<QuestType | 'all'> = ['all', 'main', 'side', 'daily', 'hidden'];

export const QuestHistory: FC<QuestHistoryProps> = ({ quests, selectedId, onSelect }) => {
  const { t } = useI18n();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<QuestType | 'all'>('all');

  if (quests.length === 0) return null;

  const filteredQuests = quests.filter(q => {
    const matchesSearch = searchTerm === '' || q.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || q.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const typeFilterLabels: Record<string, string> = {
    all: t.historyAll,
    main: t.questTypeMain,
    side: t.questTypeSide,
    daily: t.questTypeDaily,
    hidden: t.questTypeHidden,
  };

  return (
    <div className="quest-history" role="region" aria-label={t.generationHistory}>
      <h3 className="section-title"><Library size={18} className="inline-block" style={{ marginRight: 6, verticalAlign: 'middle' }} />{t.generationHistory}</h3>
      <div className="history-filter">
        <input
          type="text"
          className="history-search"
          placeholder={t.historySearchPlaceholder}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          aria-label="Search quest history"
        />
        <div className="history-type-filters" role="group" aria-label="Filter by quest type">
          {typeFilters.map(tf => (
            <button
              key={tf}
              className={`history-type-btn ${typeFilter === tf ? 'active' : ''}`}
              onClick={() => setTypeFilter(tf)}
              aria-pressed={typeFilter === tf}
            >
              {typeFilterLabels[tf]}
            </button>
          ))}
        </div>
      </div>
      <div className="history-list" role="list">
        {filteredQuests.map(q => (
          <button
            key={q.quest_id}
            className={`history-item ${q.quest_id === selectedId ? 'active' : ''}`}
            onClick={() => onSelect(q)}
            role="listitem"
            aria-current={q.quest_id === selectedId ? 'true' : undefined}
          >
            <span className="history-icon" aria-hidden="true">{typeIcons[q.type] || <Scroll size={16} />}</span>
            <div className="history-info">
              <span className="history-title">{q.title}</span>
              <span className="history-meta">{t.difficultyLabel[q.difficulty] || q.difficulty} &middot; {q.estimated_time}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
