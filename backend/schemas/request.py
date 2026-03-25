from typing import Annotated, Literal, Optional

from pydantic import BaseModel, Field


class NpcConfig(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    personality: str = Field(..., min_length=1, max_length=100)
    occupation: str = Field(..., min_length=1, max_length=50)


class WorldConfig(BaseModel):
    genre: str = Field(..., min_length=1, max_length=50)
    season_or_situation: str = Field(..., min_length=1, max_length=100)
    special_notes: str | None = Field(None, max_length=200)


class GameState(BaseModel):
    player_level: int = Field(..., ge=1, le=50)
    affinity: Literal["low", "normal", "high", "max"] = "normal"
    quest_type: Literal["main", "side", "daily", "hidden"] = "side"


class QuestGenerateRequest(BaseModel):
    npc: NpcConfig
    world: WorldConfig
    game_state: GameState


class ChainGenerateRequest(BaseModel):
    initial_quest_id: str
    branch_chosen: str | None = None
    chain_length: int = Field(3, ge=1, le=5)
    context: QuestGenerateRequest
    previous_outcomes: Annotated[
        list[Annotated[str, Field(max_length=200)]],
        Field(max_length=20),
    ] = []
    initial_quest: Optional[dict] = None  # Full GeneratedQuest data as dict


class ContinueQuestRequest(BaseModel):
    quest: dict  # The current GeneratedQuest data as dict
    branch_chosen: str
    context: QuestGenerateRequest
