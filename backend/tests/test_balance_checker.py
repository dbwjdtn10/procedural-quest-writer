"""Tests for balance checker service."""
import pytest
from schemas.quest import GeneratedQuest, QuestReward
from services.balance_checker import check_balance


def _make_quest(gold: int, exp: int, difficulty: str = "normal") -> GeneratedQuest:
    return GeneratedQuest(
        quest_id="test",
        title="테스트",
        description="설명",
        type="main",
        difficulty=difficulty,
        estimated_time="30분",
        prerequisites=[],
        objectives=[{"type": "kill", "target": "적", "count": 1}],
        branches=None,
        rewards={"gold": gold, "exp": exp, "items": [], "affinity_change": 0},
        dialogue={
            "on_offer": "a",
            "on_accept": "b",
            "on_progress": "c",
            "on_complete": "d",
        },
        lore_connection="lore",
        design_notes="notes",
    )


class TestBalanceChecker:
    # level=10, difficulty=normal => gold: 640..960, exp: 400..600
    def test_gold_within_range(self):
        quest = _make_quest(gold=800, exp=500)
        result = check_balance(quest, 10)
        assert 640 <= result.rewards.gold <= 960

    def test_gold_too_high_clamped(self):
        quest = _make_quest(gold=99999, exp=500)
        result = check_balance(quest, 10)
        assert result.rewards.gold == 960  # int(800 * 1.0 * 1.2)

    def test_gold_too_low_clamped(self):
        quest = _make_quest(gold=1, exp=500)
        result = check_balance(quest, 10)
        assert result.rewards.gold == 640  # int(800 * 1.0 * 0.8)

    def test_exp_too_high_clamped(self):
        quest = _make_quest(gold=800, exp=99999)
        result = check_balance(quest, 10)
        assert result.rewards.exp == 600  # int(500 * 1.0 * 1.2)

    def test_exp_too_low_clamped(self):
        quest = _make_quest(gold=800, exp=1)
        result = check_balance(quest, 10)
        assert result.rewards.exp == 400  # int(500 * 1.0 * 0.8)

    # level=50, difficulty=normal => gold: 3200..4800, exp: 2000..3000
    def test_high_level_scaling(self):
        quest = _make_quest(gold=100, exp=100)
        result = check_balance(quest, 50)
        assert result.rewards.gold == 3200  # int(4000 * 1.0 * 0.8)
        assert result.rewards.exp == 2000   # int(2500 * 1.0 * 0.8)

    # difficulty multiplier tests
    def test_easy_difficulty_multiplier(self):
        # level=10, easy => gold: 448..672, exp: 280..420
        quest = _make_quest(gold=500, exp=300, difficulty="easy")
        result = check_balance(quest, 10)
        assert 448 <= result.rewards.gold <= 672
        assert 280 <= result.rewards.exp <= 420

    def test_hard_difficulty_multiplier(self):
        # level=10, hard => gold: 896..1344, exp: 560..840
        quest = _make_quest(gold=1000, exp=700, difficulty="hard")
        result = check_balance(quest, 10)
        assert 896 <= result.rewards.gold <= 1344
        assert 560 <= result.rewards.exp <= 840

    def test_legendary_difficulty_multiplier(self):
        # level=10, legendary => gold: 1280..1920, exp: 800..1200
        quest = _make_quest(gold=1500, exp=1000, difficulty="legendary")
        result = check_balance(quest, 10)
        assert 1280 <= result.rewards.gold <= 1920
        assert 800 <= result.rewards.exp <= 1200
