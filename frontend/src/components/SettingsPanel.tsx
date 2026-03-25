import { useState } from 'react';
import type { FC, FormEvent } from 'react';
import { Swords, Wand2, Globe, Gamepad2, Dices, Loader } from 'lucide-react';
import type { QuestGenerateRequest, Affinity, QuestType } from '../types/quest';
import { PresetSelector } from './PresetSelector';
import { useI18n } from '../i18n/I18nContext';

interface SettingsPanelProps {
  onGenerate: (request: QuestGenerateRequest) => void;
  isGenerating: boolean;
}

const PERSONALITY_VALUES = ['\uCF8C\uD65C\uD55C', '\uACFC\uBB35\uD55C', '\uC2E0\uBE44\uB85C\uC6B4', '\uAC70\uCE5C', '\uB2E4\uC815\uD55C', '\uAD50\uD65C\uD55C', '\uC6A9\uB9F9\uD55C'];
const OCCUPATION_VALUES = ['\uC0C1\uC778', '\uB300\uC7A5\uC7A5\uC774', '\uB9C8\uBC95\uC0AC', '\uBAA8\uD5D8\uAC00', '\uC0AC\uC81C', '\uB18D\uBD80', '\uB3C4\uC801', '\uAE30\uC0AC', '\uD559\uC790'];
const GENRE_VALUES = ['\uD558\uC774 \uD310\uD0C0\uC9C0', '\uB2E4\uD06C \uD310\uD0C0\uC9C0', 'SF', '\uD3EC\uC2A4\uD2B8\uC544\uD3EC\uCE7C\uB9BD\uC2A4', '\uBB34\uD611', '\uCF54\uC9C0 \uD310\uD0C0\uC9C0', '\uC2A4\uD300\uD380\uD06C'];

export const SettingsPanel: FC<SettingsPanelProps> = ({ onGenerate, isGenerating }) => {
  const { t } = useI18n();

  const [npcName, setNpcName] = useState('');
  const [personality, setPersonality] = useState('');
  const [customPersonality, setCustomPersonality] = useState('');
  const [occupation, setOccupation] = useState('');
  const [customOccupation, setCustomOccupation] = useState('');
  const [genre, setGenre] = useState('');
  const [customGenre, setCustomGenre] = useState('');
  const [season, setSeason] = useState('');
  const [specialNotes, setSpecialNotes] = useState('');
  const [playerLevel, setPlayerLevel] = useState(10);
  const [affinity, setAffinity] = useState<Affinity>('normal');
  const [questType, setQuestType] = useState<QuestType>('side');

  const personalityLabels: Record<string, string> = {
    '\uCF8C\uD65C\uD55C': t.cheerful,
    '\uACFC\uBB35\uD55C': t.taciturn,
    '\uC2E0\uBE44\uB85C\uC6B4': t.mysterious,
    '\uAC70\uCE5C': t.rough,
    '\uB2E4\uC815\uD55C': t.gentle,
    '\uAD50\uD65C\uD55C': t.cunning,
    '\uC6A9\uB9F9\uD55C': t.brave,
  };

  const occupationLabels: Record<string, string> = {
    '\uC0C1\uC778': t.merchant,
    '\uB300\uC7A5\uC7A5\uC774': t.blacksmith,
    '\uB9C8\uBC95\uC0AC': t.wizard,
    '\uBAA8\uD5D8\uAC00': t.adventurer,
    '\uC0AC\uC81C': t.priest,
    '\uB18D\uBD80': t.farmer,
    '\uB3C4\uC801': t.thief,
    '\uAE30\uC0AC': t.knight,
    '\uD559\uC790': t.scholar,
  };

  const genreLabels: Record<string, string> = {
    '\uD558\uC774 \uD310\uD0C0\uC9C0': t.highFantasy,
    '\uB2E4\uD06C \uD310\uD0C0\uC9C0': t.darkFantasy,
    'SF': t.sciFi,
    '\uD3EC\uC2A4\uD2B8\uC544\uD3EC\uCE7C\uB9BD\uC2A4': t.postApocalypse,
    '\uBB34\uD611': t.martialArts,
    '\uCF54\uC9C0 \uD310\uD0C0\uC9C0': t.cozyFantasy,
    '\uC2A4\uD300\uD380\uD06C': t.steampunk,
  };

  const getPersonality = () => personality === 'custom' ? customPersonality : personality;
  const getOccupation = () => occupation === 'custom' ? customOccupation : occupation;
  const getGenre = () => genre === 'custom' ? customGenre : genre;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const p = getPersonality();
    const o = getOccupation();
    const g = getGenre();
    if (!npcName || !p || !o || !g || !season) return;

    onGenerate({
      npc: { name: npcName, personality: p, occupation: o },
      world: { genre: g, season_or_situation: season, special_notes: specialNotes || undefined },
      game_state: { player_level: playerLevel, affinity, quest_type: questType },
    });
  };

  const handlePresetSelect = (request: QuestGenerateRequest) => {
    setNpcName(request.npc.name);
    const personalityMatch = PERSONALITY_VALUES.includes(request.npc.personality);
    setPersonality(personalityMatch ? request.npc.personality : 'custom');
    setCustomPersonality(personalityMatch ? '' : request.npc.personality);
    setOccupation(OCCUPATION_VALUES.includes(request.npc.occupation) ? request.npc.occupation : 'custom');
    setCustomOccupation(request.npc.occupation);
    setGenre(GENRE_VALUES.includes(request.world.genre) ? request.world.genre : 'custom');
    setCustomGenre(request.world.genre);
    setSeason(request.world.season_or_situation);
    setSpecialNotes(request.world.special_notes || '');
    setPlayerLevel(request.game_state.player_level);
    setAffinity(request.game_state.affinity);
    setQuestType(request.game_state.quest_type);
    onGenerate(request);
  };

  const affinityLabels: Record<Affinity, string> = {
    low: t.affinityLow,
    normal: t.affinityNormal,
    high: t.affinityHigh,
    max: t.affinityMax,
  };

  const questTypeLabels: Record<QuestType, string> = {
    main: t.questTypeMain,
    side: t.questTypeSide,
    daily: t.questTypeDaily,
    hidden: t.questTypeHidden,
  };

  return (
    <div className="settings-panel">
      <h2 className="panel-title"><Swords size={20} className="inline-block" style={{ marginRight: 6, verticalAlign: 'middle' }} />{t.questSettings}</h2>

      <PresetSelector onSelect={handlePresetSelect} disabled={isGenerating} />

      <form onSubmit={handleSubmit} aria-label="Quest generation settings">
        <div className="form-section">
          <h3 className="section-title"><Wand2 size={18} className="inline-block" style={{ marginRight: 6, verticalAlign: 'middle' }} />{t.npcSettings}</h3>
          <div className="form-group">
            <label>{t.npcName}</label>
            <input type="text" value={npcName} onChange={e => setNpcName(e.target.value)} placeholder={t.npcNamePlaceholder} maxLength={50} />
          </div>
          <div className="form-group">
            <label>{t.personality}</label>
            <select value={personality} onChange={e => setPersonality(e.target.value)}>
              <option value="">{t.selectPlaceholder}</option>
              {PERSONALITY_VALUES.map(p => <option key={p} value={p}>{personalityLabels[p]}</option>)}
              <option value="custom">{t.customInput}</option>
            </select>
            {personality === 'custom' && (
              <input type="text" value={customPersonality} onChange={e => setCustomPersonality(e.target.value)} placeholder={t.customInput} className="mt-1" />
            )}
          </div>
          <div className="form-group">
            <label>{t.occupation}</label>
            <select value={occupation} onChange={e => setOccupation(e.target.value)}>
              <option value="">{t.selectPlaceholder}</option>
              {OCCUPATION_VALUES.map(o => <option key={o} value={o}>{occupationLabels[o]}</option>)}
              <option value="custom">{t.customInput}</option>
            </select>
            {occupation === 'custom' && (
              <input type="text" value={customOccupation} onChange={e => setCustomOccupation(e.target.value)} placeholder={t.customInput} className="mt-1" />
            )}
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title"><Globe size={18} className="inline-block" style={{ marginRight: 6, verticalAlign: 'middle' }} />{t.worldSettings}</h3>
          <div className="form-group">
            <label>{t.genre}</label>
            <select value={genre} onChange={e => setGenre(e.target.value)}>
              <option value="">{t.selectPlaceholder}</option>
              {GENRE_VALUES.map(g => <option key={g} value={g}>{genreLabels[g]}</option>)}
              <option value="custom">{t.customInput}</option>
            </select>
            {genre === 'custom' && (
              <input type="text" value={customGenre} onChange={e => setCustomGenre(e.target.value)} placeholder={t.customInput} className="mt-1" />
            )}
          </div>
          <div className="form-group">
            <label>{t.seasonSituation}</label>
            <input type="text" value={season} onChange={e => setSeason(e.target.value)} placeholder={t.seasonPlaceholder} />
          </div>
          <div className="form-group">
            <label>{t.specialNotes}</label>
            <input type="text" value={specialNotes} onChange={e => setSpecialNotes(e.target.value)} placeholder={t.specialNotesPlaceholder} />
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title"><Gamepad2 size={18} className="inline-block" style={{ marginRight: 6, verticalAlign: 'middle' }} />{t.gameState}</h3>
          <div className="form-group">
            <label>{t.playerLevel}: {playerLevel}</label>
            <input type="range" min={1} max={50} value={playerLevel} onChange={e => setPlayerLevel(Number(e.target.value))} />
          </div>
          <div className="form-group">
            <label>{t.npcAffinity}</label>
            <div className="radio-group">
              {(Object.keys(affinityLabels) as Affinity[]).map(a => (
                <label key={a} className="radio-label">
                  <input type="radio" name="affinity" value={a} checked={affinity === a} onChange={() => setAffinity(a)} />
                  {affinityLabels[a]}
                </label>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>{t.questType}</label>
            <select value={questType} onChange={e => setQuestType(e.target.value as QuestType)}>
              {(Object.keys(questTypeLabels) as QuestType[]).map(qt => (
                <option key={qt} value={qt}>{questTypeLabels[qt]}</option>
              ))}
            </select>
          </div>
        </div>

        <button type="submit" className="generate-btn" disabled={isGenerating}>
          {isGenerating ? <><Loader size={16} className="inline-block" style={{ marginRight: 6, verticalAlign: 'middle' }} />{t.generating}</> : <><Dices size={16} className="inline-block" style={{ marginRight: 6, verticalAlign: 'middle' }} />{t.generateQuest}</>}
        </button>
      </form>
    </div>
  );
};
