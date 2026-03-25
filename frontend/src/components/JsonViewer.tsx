import { useState, type FC } from 'react';
import { BookOpen, Gamepad2, Clipboard, Download } from 'lucide-react';
import type { GeneratedQuest } from '../types/quest';
import { useI18n } from '../i18n/I18nContext';
import { useToast } from './Toast';

interface JsonViewerProps {
  quest: GeneratedQuest;
}

type Tab = 'json' | 'schema' | 'guide';

const SCHEMA_INFO = `Pydantic \uC2A4\uD0A4\uB9C8 \uAD6C\uC870

GeneratedQuest
\u251C\u2500\u2500 quest_id: str              \u2014 \uD018\uC2A4\uD2B8 \uACE0\uC720 ID
\u251C\u2500\u2500 title: str                 \u2014 \uD018\uC2A4\uD2B8 \uC81C\uBAA9
\u251C\u2500\u2500 description: str           \u2014 \uD018\uC2A4\uD2B8 \uC124\uBA85
\u251C\u2500\u2500 type: "main"|"side"|"daily"|"hidden"
\u251C\u2500\u2500 difficulty: "easy"|"normal"|"hard"|"legendary"
\u251C\u2500\u2500 estimated_time: str        \u2014 \uC608\uC0C1 \uC18C\uC694 \uC2DC\uAC04
\u251C\u2500\u2500 prerequisites: list[str]   \u2014 \uC120\uD589 \uD018\uC2A4\uD2B8 ID \uBAA9\uB85D
\u251C\u2500\u2500 objectives: list[QuestObjective]
\u2502   \u251C\u2500\u2500 type: "kill"|"fetch"|"talk"|"explore"|"escort"|"craft"|"investigate"
\u2502   \u251C\u2500\u2500 target: str            \u2014 \uBAA9\uD45C \uB300\uC0C1
\u2502   \u251C\u2500\u2500 count: int             \u2014 \uD544\uC694 \uC218\uB7C9 (\uAE30\uBCF8 1)
\u2502   \u251C\u2500\u2500 location: str?         \u2014 \uC704\uCE58 (\uC120\uD0DD)
\u2502   \u2514\u2500\u2500 hint: str?             \u2014 \uD78C\uD2B8 (\uC120\uD0DD)
\u251C\u2500\u2500 branches: list[QuestBranch]?
\u2502   \u251C\u2500\u2500 condition: str         \u2014 \uBD84\uAE30 \uC870\uAC74
\u2502   \u251C\u2500\u2500 label: str             \u2014 \uC120\uD0DD\uC9C0 \uD45C\uC2DC \uD14D\uC2A4\uD2B8
\u2502   \u251C\u2500\u2500 next_quest_seed: str   \u2014 \uD6C4\uC18D \uD018\uC2A4\uD2B8 \uC0DD\uC131 \uC2DC\uB4DC
\u2502   \u2514\u2500\u2500 consequence: str       \u2014 \uC120\uD0DD \uACB0\uACFC \uC124\uBA85
\u251C\u2500\u2500 rewards: QuestReward
\u2502   \u251C\u2500\u2500 gold: int
\u2502   \u251C\u2500\u2500 exp: int
\u2502   \u251C\u2500\u2500 items: list[str]
\u2502   \u251C\u2500\u2500 affinity_change: int
\u2502   \u2514\u2500\u2500 unlock: str?           \u2014 \uD574\uAE08 \uC694\uC18C (\uC120\uD0DD)
\u251C\u2500\u2500 dialogue: QuestDialogue
\u2502   \u251C\u2500\u2500 on_offer: str          \u2014 \uD018\uC2A4\uD2B8 \uC81C\uC548 \uC2DC \uB300\uC0AC
\u2502   \u251C\u2500\u2500 on_accept: str         \u2014 \uC218\uB77D \uC2DC
\u2502   \u251C\u2500\u2500 on_progress: str       \u2014 \uC9C4\uD589 \uC911
\u2502   \u251C\u2500\u2500 on_complete: str       \u2014 \uC644\uB8CC \uC2DC
\u2502   \u2514\u2500\u2500 on_reject: str?        \u2014 \uAC70\uC808 \uC2DC (\uC120\uD0DD)
\u251C\u2500\u2500 lore_connection: str       \u2014 \uC138\uACC4\uAD00 \uC5F0\uACB0\uC810
\u2514\u2500\u2500 design_notes: str          \u2014 AI \uC124\uACC4 \uC758\uB3C4 \uC124\uBA85`;

const ENGINE_GUIDE = `\uAC8C\uC784 \uC5D4\uC9C4 \uC5F0\uB3D9 \uAC00\uC774\uB4DC

\uC774 JSON \uB370\uC774\uD130\uB97C \uAC8C\uC784 \uC5D4\uC9C4\uC5D0\uC11C \uBC14\uB85C \uC0AC\uC6A9\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.

\u2501\u2501\u2501 Unity (C#) \u2501\u2501\u2501

// 1. JSON \uC5ED\uC9C1\uB82C\uD654
var quest = JsonUtility.FromJson<GeneratedQuest>(jsonString);

// 2. \uD018\uC2A4\uD2B8 \uC2DC\uC2A4\uD15C\uC5D0 \uB4F1\uB85D
QuestManager.Instance.RegisterQuest(quest);

// 3. NPC \uB300\uD654 \uC5F0\uACB0
npc.SetDialogue("quest_offer", quest.dialogue.on_offer);

// 4. \uBAA9\uD45C \uD2B8\uB798\uCEE4 \uC0DD\uC131
foreach (var obj in quest.objectives) {
    ObjectiveTracker.Create(obj.type, obj.target, obj.count);
}

\u2501\u2501\u2501 Unreal Engine (Blueprint) \u2501\u2501\u2501

// 1. JSON \u2192 FQuestData \uAD6C\uC870\uCCB4 \uBCC0\uD658
FQuestData Quest;
FJsonObjectConverter::JsonObjectStringToUStruct(JsonString, &Quest);

// 2. Quest Subsystem\uC5D0 \uB4F1\uB85D
UQuestSubsystem* QS = GetGameInstance()->GetSubsystem<UQuestSubsystem>();
QS->AddQuest(Quest);

\u2501\u2501\u2501 Godot (GDScript) \u2501\u2501\u2501

# 1. JSON \uD30C\uC2F1
var quest_data = JSON.parse_string(json_string)

# 2. \uD018\uC2A4\uD2B8 \uB9AC\uC18C\uC2A4 \uC0DD\uC131
var quest = QuestResource.new()
quest.from_dict(quest_data)

# 3. \uD018\uC2A4\uD2B8 \uB9E4\uB2C8\uC800\uC5D0 \uCD94\uAC00
QuestManager.add_quest(quest)

\u2501\u2501\u2501 \uD65C\uC6A9 \uD3EC\uC778\uD2B8 \u2501\u2501\u2501

\u2022 objectives \u2192 \uBAA9\uD45C \uD2B8\uB798\uCEE4 UI \uC790\uB3D9 \uC0DD\uC131
\u2022 branches \u2192 \uB300\uD654 \uC120\uD0DD\uC9C0 \uBD84\uAE30 \uCC98\uB9AC
\u2022 rewards \u2192 \uBCF4\uC0C1 \uC9C0\uAE09 + \uC778\uBCA4\uD1A0\uB9AC \uC5F0\uB3D9
\u2022 dialogue \u2192 NPC \uB300\uD654 \uC2DC\uC2A4\uD15C\uC5D0 \uC9C1\uC811 \uB9E4\uD551
\u2022 prerequisites \u2192 \uD018\uC2A4\uD2B8 \uD574\uAE08 \uC870\uAC74 \uCCB4\uD06C
\u2022 lore_connection \u2192 \uC138\uACC4\uAD00 \uC0AC\uC804(Codex) \uD56D\uBAA9 \uC5F0\uACB0`;

export const JsonViewer: FC<JsonViewerProps> = ({ quest }) => {
  const { t } = useI18n();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('json');
  const jsonStr = JSON.stringify(quest, null, 2);

  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(jsonStr);
    } catch {
      showToast('Failed to copy to clipboard', 'error');
    }
  };

  const handleDownload = () => {
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quest_${quest.quest_id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="json-viewer">
      <div className="json-header">
        <div className="json-tabs">
          <button
            className={`json-tab ${activeTab === 'json' ? 'active' : ''}`}
            onClick={() => setActiveTab('json')}
          >
            {t.jsonData}
          </button>
          <button
            className={`json-tab ${activeTab === 'schema' ? 'active' : ''}`}
            onClick={() => setActiveTab('schema')}
          >
            <BookOpen size={16} className="inline-block" style={{ marginRight: 4, verticalAlign: 'middle' }} />{t.schemaStructure}
          </button>
          <button
            className={`json-tab ${activeTab === 'guide' ? 'active' : ''}`}
            onClick={() => setActiveTab('guide')}
          >
            <Gamepad2 size={16} className="inline-block" style={{ marginRight: 4, verticalAlign: 'middle' }} />{t.engineIntegration}
          </button>
        </div>
        {activeTab === 'json' && (
          <div className="json-actions">
            <button onClick={handleCopy} className="json-btn"><Clipboard size={16} className="inline-block" style={{ marginRight: 4, verticalAlign: 'middle' }} />{t.copy}</button>
            <button onClick={handleDownload} className="json-btn"><Download size={16} className="inline-block" style={{ marginRight: 4, verticalAlign: 'middle' }} />{t.download}</button>
          </div>
        )}
      </div>
      <pre className="json-content">
        <code>
          {activeTab === 'json' && jsonStr}
          {activeTab === 'schema' && SCHEMA_INFO}
          {activeTab === 'guide' && ENGINE_GUIDE}
        </code>
      </pre>
    </div>
  );
};
