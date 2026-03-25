import { useEffect, useState } from 'react';
import type { FC } from 'react';
import { Zap } from 'lucide-react';
import type { Preset, QuestGenerateRequest } from '../types/quest';
import { useI18n } from '../i18n/I18nContext';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Fallback presets in case API is not available
const FALLBACK_PRESETS: Preset[] = [
  {
    id: "winter_market",
    name: "\uACA8\uC6B8 \uC2DC\uC7A5\uC758 \uBE44\uBC00",
    npc: { name: "\uB9AC\uB77C", personality: "\uCF8C\uD65C\uD55C \uC0C1\uC778", occupation: "\uC0C1\uC778" },
    world: { genre: "\uB2E4\uD06C \uD310\uD0C0\uC9C0", season_or_situation: "\uACA8\uC6B8, \uC758\uBB38\uC758 \uAC70\uB798", special_notes: "\uC2DC\uC7A5\uC5D0 \uC218\uC0C1\uD55C \uC678\uBD80\uC778\uB4E4\uC774 \uCD9C\uBAB0" },
    game_state: { player_level: 12, affinity: "high", quest_type: "main" }
  },
  {
    id: "dragon_nest",
    name: "\uC6A9\uC758 \uB465\uC9C0",
    npc: { name: "\uCE74\uC774\uB978", personality: "\uACFC\uBB35\uD55C \uAE30\uC0AC", occupation: "\uAE30\uC0AC" },
    world: { genre: "\uD558\uC774 \uD310\uD0C0\uC9C0", season_or_situation: "\uC5EC\uB984, \uB4DC\uB798\uACE4 \uCD9C\uD604", special_notes: "\uC655\uAD6D \uBCC0\uACBD\uC5D0 \uB4DC\uB798\uACE4 \uBAA9\uACA9\uB2F4" },
    game_state: { player_level: 25, affinity: "normal", quest_type: "main" }
  },
  {
    id: "ruin_signal",
    name: "\uD3D0\uD5C8\uC758 \uC2E0\uD638",
    npc: { name: "\uC5D8\uB77C", personality: "\uD638\uAE30\uC2EC \uB9CE\uC740 \uACFC\uD559\uC790", occupation: "\uACFC\uD559\uC790" },
    world: { genre: "SF (\uD3EC\uC2A4\uD2B8\uC544\uD3EC\uCE7C\uB9BD\uC2A4)", season_or_situation: "\uD3EC\uC2A4\uD2B8\uC544\uD3EC\uCE7C\uB9BD\uC2A4, \uBBF8\uC9C0 \uC2E0\uD638 \uC218\uC2E0", special_notes: "\uD3D0\uD5C8\uC5D0\uC11C \uC815\uCCB4\uBD88\uBA85\uC758 \uC804\uD30C \uAC10\uC9C0" },
    game_state: { player_level: 18, affinity: "normal", quest_type: "side" }
  },
  {
    id: "martial_grudge",
    name: "\uAC15\uD638\uC758 \uC6D0\uD55C",
    npc: { name: "\uBC31\uBB34\uBA85", personality: "\uACFC\uBB35\uD55C \uAC80\uAC1D", occupation: "\uAC80\uAC1D" },
    world: { genre: "\uBB34\uD611", season_or_situation: "\uAC00\uC744, \uBB38\uD30C \uBD84\uC7C1", special_notes: "\uBA85\uBB38 \uC815\uD30C \uAC04 \uAE34\uC7A5 \uACE0\uC870" },
    game_state: { player_level: 30, affinity: "high", quest_type: "main" }
  },
  {
    id: "harvest_festival",
    name: "\uC218\uD655\uC81C \uC18C\uB3D9",
    npc: { name: "\uBBF8\uB098", personality: "\uB2E4\uC815\uD55C \uB18D\uBD80", occupation: "\uB18D\uBD80" },
    world: { genre: "\uCF54\uC9C0 \uD310\uD0C0\uC9C0", season_or_situation: "\uAC00\uC744 \uCD95\uC81C, \uB3C4\uB09C \uC0AC\uAC74", special_notes: "\uCD95\uC81C \uC900\uBE44 \uC911 \uADC0\uC911\uD488 \uB3C4\uB09C" },
    game_state: { player_level: 5, affinity: "high", quest_type: "side" }
  }
];

interface PresetSelectorProps {
  onSelect: (request: QuestGenerateRequest) => void;
  disabled?: boolean;
}

export const PresetSelector: FC<PresetSelectorProps> = ({ onSelect, disabled }) => {
  const { t } = useI18n();
  const [presets, setPresets] = useState<Preset[]>(FALLBACK_PRESETS);

  const genreLabels: Record<string, string> = {
    '\uD558\uC774 \uD310\uD0C0\uC9C0': t.highFantasy,
    '\uB2E4\uD06C \uD310\uD0C0\uC9C0': t.darkFantasy,
    'SF': t.sciFi,
    'SF (\uD3EC\uC2A4\uD2B8\uC544\uD3EC\uCE7C\uB9BD\uC2A4)': t.postApocalypse,
    '\uD3EC\uC2A4\uD2B8\uC544\uD3EC\uCE7C\uB9BD\uC2A4': t.postApocalypse,
    '\uBB34\uD611': t.martialArts,
    '\uCF54\uC9C0 \uD310\uD0C0\uC9C0': t.cozyFantasy,
    '\uC2A4\uD300\uD380\uD06C': t.steampunk,
  };

  useEffect(() => {
    fetch(`${API_BASE}/api/quest/presets`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0 && data[0].id) {
          setPresets(data);
        }
      })
      .catch(() => { /* use fallback */ });
  }, []);

  return (
    <div className="preset-selector">
      <h3 className="section-title"><Zap size={18} className="inline-block" style={{ marginRight: 6, verticalAlign: 'middle' }} />{t.quickStart}</h3>
      <div className="preset-grid">
        {presets.map(p => (
          <button
            key={p.id}
            className="preset-btn"
            disabled={disabled}
            onClick={() => onSelect({ npc: p.npc, world: p.world, game_state: p.game_state })}
          >
            <span className="preset-name">{t.presetNames[p.id] || p.name}</span>
            <span className="preset-desc">{t.presetNpcNames[p.id] || p.npc.name} · {genreLabels[p.world.genre] || p.world.genre}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
