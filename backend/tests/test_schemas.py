"""Tests for Pydantic quest schemas."""
import pytest
from schemas.quest import (
    QuestObjective,
    QuestBranch,
    QuestReward,
    QuestDialogue,
    GeneratedQuest,
    QuestChain,
)
from schemas.request import (
    NpcConfig,
    WorldConfig,
    GameState,
    QuestGenerateRequest,
    ChainGenerateRequest,
    ContinueQuestRequest,
)


class TestQuestObjective:
    def test_valid_objective(self):
        obj = QuestObjective(type="kill", target="슬라임", count=5, location="숲")
        assert obj.type == "kill"
        assert obj.count == 5

    def test_default_count(self):
        obj = QuestObjective(type="talk", target="NPC")
        assert obj.count == 1

    def test_optional_fields(self):
        obj = QuestObjective(type="explore", target="동굴")
        assert obj.location is None
        assert obj.hint is None


class TestQuestReward:
    def test_valid_reward(self):
        reward = QuestReward(gold=100, exp=50, items=["검", "방패"], affinity_change=5)
        assert reward.gold == 100
        assert len(reward.items) == 2

    def test_optional_unlock(self):
        reward = QuestReward(gold=100, exp=50, items=[], affinity_change=0)
        assert reward.unlock is None


class TestGeneratedQuest:
    def _make_quest(self, **overrides):
        defaults = {
            "quest_id": "test_001",
            "title": "테스트 퀘스트",
            "description": "설명",
            "type": "main",
            "difficulty": "normal",
            "estimated_time": "30분",
            "prerequisites": [],
            "objectives": [{"type": "kill", "target": "적", "count": 3}],
            "branches": None,
            "rewards": {"gold": 100, "exp": 50, "items": [], "affinity_change": 0},
            "dialogue": {
                "on_offer": "안녕",
                "on_accept": "좋아",
                "on_progress": "진행중",
                "on_complete": "완료",
            },
            "lore_connection": "세계관",
            "design_notes": "노트",
        }
        defaults.update(overrides)
        return GeneratedQuest(**defaults)

    def test_valid_quest(self):
        quest = self._make_quest()
        assert quest.quest_id == "test_001"
        assert quest.type == "main"

    def test_with_branches(self):
        branches = [
            {
                "condition": "choose_a",
                "label": "선택 A",
                "next_quest_seed": "seed_a",
                "consequence": "결과 A",
            }
        ]
        quest = self._make_quest(branches=branches)
        assert len(quest.branches) == 1

    def test_invalid_type_rejected(self):
        with pytest.raises(Exception):
            self._make_quest(type="invalid_type")

    def test_invalid_difficulty_rejected(self):
        with pytest.raises(Exception):
            self._make_quest(difficulty="impossible")


class TestRequestSchemas:
    def test_npc_config(self):
        npc = NpcConfig(name="리라", personality="쾌활한", occupation="상인")
        assert npc.name == "리라"

    def test_npc_name_too_long(self):
        with pytest.raises(Exception):
            NpcConfig(name="a" * 51, personality="쾌활한", occupation="상인")

    def test_game_state_level_range(self):
        gs = GameState(player_level=25, affinity="high", quest_type="main")
        assert gs.player_level == 25

    def test_game_state_level_too_high(self):
        with pytest.raises(Exception):
            GameState(player_level=51)

    def test_game_state_level_too_low(self):
        with pytest.raises(Exception):
            GameState(player_level=0)

    def test_quest_generate_request(self):
        req = QuestGenerateRequest(
            npc=NpcConfig(name="리라", personality="쾌활한", occupation="상인"),
            world=WorldConfig(genre="판타지", season_or_situation="겨울"),
            game_state=GameState(player_level=10),
        )
        assert req.npc.name == "리라"
