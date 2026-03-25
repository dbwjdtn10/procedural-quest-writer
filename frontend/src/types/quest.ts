export type ObjectiveType = "kill" | "fetch" | "talk" | "explore" | "escort" | "craft" | "investigate";
export type QuestType = "main" | "side" | "daily" | "hidden";
export type Difficulty = "easy" | "normal" | "hard" | "legendary";
export type Affinity = "low" | "normal" | "high" | "max";

export interface QuestObjective {
  type: ObjectiveType;
  target: string;
  count: number;
  location?: string;
  hint?: string;
}

export interface QuestBranch {
  condition: string;
  label: string;
  next_quest_seed: string;
  consequence: string;
}

export interface QuestReward {
  gold: number;
  exp: number;
  items: string[];
  affinity_change: number;
  unlock?: string;
}

export interface QuestDialogue {
  on_offer: string;
  on_accept: string;
  on_progress: string;
  on_complete: string;
  on_reject?: string;
}

export interface GeneratedQuest {
  quest_id: string;
  title: string;
  description: string;
  type: QuestType;
  difficulty: Difficulty;
  estimated_time: string;
  prerequisites: string[];
  objectives: QuestObjective[];
  branches?: QuestBranch[];
  rewards: QuestReward;
  dialogue: QuestDialogue;
  lore_connection: string;
  design_notes: string;
}

export interface NpcConfig {
  name: string;
  personality: string;
  occupation: string;
}

export interface WorldConfig {
  genre: string;
  season_or_situation: string;
  special_notes?: string;
}

export interface GameState {
  player_level: number;
  affinity: Affinity;
  quest_type: QuestType;
}

export interface QuestGenerateRequest {
  npc: NpcConfig;
  world: WorldConfig;
  game_state: GameState;
}

export interface Preset {
  id: string;
  name: string;
  npc: NpcConfig;
  world: WorldConfig;
  game_state: GameState;
}

export interface QuestChainResponse {
  chain: GeneratedQuest[];
  chain_narrative: string;
}

export interface QuestContinueRequest {
  quest: GeneratedQuest;
  branch_chosen: string;
  context: QuestGenerateRequest;
}
