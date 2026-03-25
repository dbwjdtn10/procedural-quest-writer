from pydantic import BaseModel
from typing import Literal


class QuestObjective(BaseModel):
    type: Literal["kill", "fetch", "talk", "explore", "escort", "craft", "investigate"]
    target: str
    count: int = 1
    location: str | None = None
    hint: str | None = None


class QuestBranch(BaseModel):
    condition: str
    label: str
    next_quest_seed: str
    consequence: str


class QuestReward(BaseModel):
    gold: int
    exp: int
    items: list[str]
    affinity_change: int
    unlock: str | None = None


class QuestDialogue(BaseModel):
    on_offer: str
    on_accept: str
    on_progress: str
    on_complete: str
    on_reject: str | None = None


class GeneratedQuest(BaseModel):
    quest_id: str
    title: str
    description: str
    type: Literal["main", "side", "daily", "hidden"]
    difficulty: Literal["easy", "normal", "hard", "legendary"]
    estimated_time: str
    prerequisites: list[str]
    objectives: list[QuestObjective]
    branches: list[QuestBranch] | None = None
    rewards: QuestReward
    dialogue: QuestDialogue
    lore_connection: str
    design_notes: str


class QuestChain(BaseModel):
    chain: list[GeneratedQuest]
    chain_narrative: str  # Overall narrative description connecting the quests
