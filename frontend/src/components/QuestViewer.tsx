import { useState } from 'react';
import type { FC } from 'react';
import { Check, ClipboardList, GitFork, Trophy, BookOpen, Target, Paperclip, Gamepad2, RefreshCw } from 'lucide-react';
import type { GeneratedQuest } from '../types/quest';
import { NpcAvatar } from './NpcAvatar';
import { StreamingText } from './StreamingText';
import { JsonViewer } from './JsonViewer';
import { ShareExport } from './ShareExport';
import { LoadingAnimation } from './LoadingAnimation';
import { QuestRadarChart } from './QuestRadarChart';
import { useI18n } from '../i18n/I18nContext';

interface QuestViewerProps {
  quest: GeneratedQuest | null;
  streamingText: string;
  isGenerating: boolean;
  npcName: string;
  onBranchSelect?: (branch: { condition: string; next_quest_seed: string; label: string }) => void;
  onRegenerate?: () => void;
  isGeneratingChain?: boolean;
  exploringBranch?: string | null;
  exploredBranches?: Set<string>;
  previousQuest?: GeneratedQuest | null;
  onCompare?: () => void;
}

const difficultyColors: Record<string, string> = {
  easy: '#10B981',
  normal: '#3B82F6',
  hard: '#F59E0B',
  legendary: '#EF4444',
};

const objectiveIcons: Record<string, string> = {
  kill: 'x',
  fetch: '>>',
  talk: '...',
  explore: '~',
  escort: '=>',
  craft: '+',
  investigate: '?',
};

type DialogueKey = 'on_offer' | 'on_accept' | 'on_progress' | 'on_complete';

export const QuestViewer: FC<QuestViewerProps> = ({
  quest,
  streamingText,
  isGenerating,
  npcName,
  onBranchSelect,
  onRegenerate,
  isGeneratingChain = false,
  exploringBranch = null,
  exploredBranches,
  previousQuest,
  onCompare,
}) => {
  const { t } = useI18n();
  const [showJson, setShowJson] = useState(false);
  const [activeDialogueTab, setActiveDialogueTab] = useState<DialogueKey>('on_offer');

  const dialogueTabLabels: Record<DialogueKey, string> = {
    on_offer: t.dialogueOffer,
    on_accept: t.dialogueAccept,
    on_progress: t.dialogueProgress,
    on_complete: t.dialogueComplete,
  };

  if (!quest && !isGenerating && !streamingText) {
    return (
      <div className="quest-viewer empty">
        <div className="empty-state">
          <div className="empty-icon">QUEST</div>
          <p>{t.emptyStateTitle}</p>
          <p className="empty-sub">{t.emptyStateSubtitle}</p>
        </div>
      </div>
    );
  }

  if (isGenerating && !quest) {
    return (
      <div className="quest-viewer generating">
        <LoadingAnimation text={t.generatingQuest} />
        {streamingText && (
          <div className="streaming-preview">
            <StreamingText text={streamingText} speed={10} />
          </div>
        )}
      </div>
    );
  }

  if (!quest) return null;

  return (
    <div className="quest-viewer" role="article" aria-label={`Quest: ${quest.title}`}>
      <div className="quest-header">
        <span className="quest-type-badge">{t.questTypeLabel[quest.type] || quest.type}</span>
        <span className="quest-difficulty" style={{ color: difficultyColors[quest.difficulty] }}>
          {t.difficultyLabel[quest.difficulty] || quest.difficulty}
        </span>
        <span className="quest-time">{t.estimatedTime} {quest.estimated_time}</span>
      </div>

      <h2 className="quest-title">{quest.title}</h2>
      <p className="quest-description">{quest.description}</p>

      {/* NPC Dialogue with Tabs */}
      <div className="dialogue-box">
        <div className="dialogue-header">
          <NpcAvatar name={npcName || 'NPC'} size={40} />
          <span className="npc-name">{npcName}</span>
        </div>
        <div className="dialogue-tabs">
          {(Object.keys(dialogueTabLabels) as DialogueKey[]).map(key => (
            <button
              key={key}
              className={`dialogue-tab ${activeDialogueTab === key ? 'active' : ''}`}
              onClick={() => setActiveDialogueTab(key)}
            >
              {dialogueTabLabels[key]}
            </button>
          ))}
        </div>
        <div className="dialogue-bubble">
          <p>{quest.dialogue[activeDialogueTab]}</p>
        </div>
      </div>

      {/* Objectives */}
      <div className="quest-section" aria-label="Quest objectives">
        <h3><ClipboardList size={18} className="inline-block" style={{ marginRight: 6, verticalAlign: 'middle' }} />{t.objectives}</h3>
        <ul className="objective-list">
          {quest.objectives.map((obj, i) => (
            <li key={i} className="objective-item">
              <span className="objective-check">[ ]</span>
              <span className="objective-icon">{objectiveIcons[obj.type] || '?'}</span>
              <span>{obj.target}</span>
              {obj.count > 1 && <span className="objective-count">x{obj.count}</span>}
              {obj.location && <span className="objective-location">({obj.location})</span>}
            </li>
          ))}
        </ul>
      </div>

      {/* Branches */}
      {quest.branches && quest.branches.length > 0 && (
        <div className="quest-section">
          <h3><GitFork size={18} className="inline-block" style={{ marginRight: 6, verticalAlign: 'middle' }} />{t.branches}</h3>
          <div className="branch-list">
            {quest.branches.map((branch, i) => {
              const isExploring = exploringBranch === branch.condition;
              const isExplored = exploredBranches?.has(branch.label) ?? false;
              return (
                <button
                  key={i}
                  className={`branch-btn ${isExploring ? 'exploring' : ''} ${isExplored ? 'explored' : ''}`}
                  onClick={() => onBranchSelect?.({
                    condition: branch.condition,
                    next_quest_seed: branch.next_quest_seed,
                    label: branch.label,
                  })}
                  disabled={isGeneratingChain}
                >
                  <span className="branch-label">
                    {isExploring ? t.exploring : branch.label}
                    {isExplored && <> <Check size={14} className="inline-block" style={{ verticalAlign: 'middle' }} /></>}
                  </span>
                  <span className="branch-consequence">{branch.consequence}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Rewards */}
      <div className="quest-section" aria-label="Quest rewards">
        <h3><Trophy size={18} className="inline-block" style={{ marginRight: 6, verticalAlign: 'middle' }} />{t.rewards}</h3>
        <div className="reward-grid">
          <div className="reward-item">
            <span className="reward-icon">G</span>
            <span>{quest.rewards.gold} {t.gold}</span>
          </div>
          <div className="reward-item">
            <span className="reward-icon">*</span>
            <span>{quest.rewards.exp} {t.exp}</span>
          </div>
          {quest.rewards.items.map((item, i) => (
            <div key={i} className="reward-item">
              <span className="reward-icon">+</span>
              <span>{item}</span>
            </div>
          ))}
          {quest.rewards.affinity_change !== 0 && (
            <div className="reward-item">
              <span className="reward-icon">{quest.rewards.affinity_change > 0 ? '+' : '-'}</span>
              <span>{t.affinityChange} {quest.rewards.affinity_change > 0 ? '+' : ''}{quest.rewards.affinity_change}</span>
            </div>
          )}
        </div>
      </div>

      {/* Lore Connection */}
      <div className="quest-section lore-section">
        <h3><BookOpen size={18} className="inline-block" style={{ marginRight: 6, verticalAlign: 'middle' }} />{t.loreConnection}</h3>
        <p>{quest.lore_connection}</p>
      </div>

      {/* Design Notes */}
      <div className="quest-section design-notes">
        <h3><Target size={18} className="inline-block" style={{ marginRight: 6, verticalAlign: 'middle' }} />{t.designNotes}</h3>
        <p>{quest.design_notes}</p>
      </div>

      {/* Radar Chart */}
      <QuestRadarChart quest={quest} />

      {/* Action Buttons */}
      <div className="quest-actions">
        <button className="action-btn" onClick={() => setShowJson(!showJson)}>
          {showJson ? <><Gamepad2 size={16} className="inline-block" style={{ marginRight: 4, verticalAlign: 'middle' }} />{t.viewQuest}</> : <><Paperclip size={16} className="inline-block" style={{ marginRight: 4, verticalAlign: 'middle' }} />{t.viewJson}</>}
        </button>
        <button className="action-btn" onClick={onRegenerate}>
          <RefreshCw size={16} className="inline-block" style={{ marginRight: 4, verticalAlign: 'middle' }} />{t.regenerate}
        </button>
        {previousQuest && onCompare && (
          <button className="action-btn" onClick={onCompare}>
            {t.compareButton}
          </button>
        )}
      </div>

      {showJson && <JsonViewer quest={quest} />}

      {/* Share & Export */}
      <ShareExport quest={quest} npcName={npcName} />
    </div>
  );
};
