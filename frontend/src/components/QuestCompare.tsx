import React from 'react';
import type { GeneratedQuest } from '../types/quest';
import { useI18n } from '../i18n/I18nContext';

interface QuestCompareProps {
  questA: GeneratedQuest;
  questB: GeneratedQuest;
  onClose: () => void;
}

export const QuestCompare: React.FC<QuestCompareProps> = ({ questA, questB, onClose }) => {
  const { t } = useI18n();
  const CompareRow = ({ label, a, b }: { label: string; a: string; b: string }) => (
    <tr>
      <td className="compare-label">{label}</td>
      <td className="compare-val">{a}</td>
      <td className="compare-val">{b}</td>
    </tr>
  );

  return (
    <div className="compare-overlay" onClick={onClose}>
      <div className="compare-modal" onClick={e => e.stopPropagation()}>
        <div className="compare-header">
          <h2>{t.compareTitle}</h2>
          <button className="compare-close" onClick={onClose}>X</button>
        </div>
        <div className="compare-table-wrap">
          <table className="compare-table">
            <thead>
              <tr>
                <th></th>
                <th className="compare-quest-title">{questA.title}</th>
                <th className="compare-quest-title">{questB.title}</th>
              </tr>
            </thead>
            <tbody>
              <CompareRow label={t.compareType} a={questA.type} b={questB.type} />
              <CompareRow label={t.compareDifficulty} a={t.difficultyLabel[questA.difficulty] || questA.difficulty} b={t.difficultyLabel[questB.difficulty] || questB.difficulty} />
              <CompareRow label={t.compareEstTime} a={questA.estimated_time} b={questB.estimated_time} />
              <CompareRow label={t.compareObjectives} a={`${questA.objectives.length}`} b={`${questB.objectives.length}`} />
              <CompareRow label={t.compareBranches} a={`${questA.branches?.length || 0}`} b={`${questB.branches?.length || 0}`} />
              <CompareRow label={t.compareGold} a={`${questA.rewards.gold}`} b={`${questB.rewards.gold}`} />
              <CompareRow label={t.compareExp} a={`${questA.rewards.exp}`} b={`${questB.rewards.exp}`} />
              <CompareRow label={t.compareItems} a={questA.rewards.items.join(', ')} b={questB.rewards.items.join(', ')} />
              <CompareRow label={t.compareAffinity} a={`${questA.rewards.affinity_change > 0 ? '+' : ''}${questA.rewards.affinity_change}`} b={`${questB.rewards.affinity_change > 0 ? '+' : ''}${questB.rewards.affinity_change}`} />
            </tbody>
          </table>
        </div>
        <div className="compare-dialogues">
          <div className="compare-dialogue-col">
            <h4>{t.compareDialogueOffer}</h4>
            <p>{questA.dialogue.on_offer}</p>
          </div>
          <div className="compare-dialogue-col">
            <h4>{t.compareDialogueOffer}</h4>
            <p>{questB.dialogue.on_offer}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
