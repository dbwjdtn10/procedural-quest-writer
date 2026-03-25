"""Tests for API endpoints."""
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


class TestRootEndpoint:
    def test_root(self):
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"


class TestPresetsEndpoint:
    def test_get_presets(self):
        response = client.get("/api/quest/presets")
        assert response.status_code == 200
        presets = response.json()
        assert isinstance(presets, list)
        assert len(presets) >= 5

    def test_preset_structure(self):
        response = client.get("/api/quest/presets")
        preset = response.json()[0]
        assert "id" in preset
        assert "name" in preset
        assert "npc" in preset
        assert "world" in preset
        assert "game_state" in preset


class TestQuestGeneration:
    def _make_request(self):
        return {
            "npc": {"name": "리라", "personality": "쾌활한", "occupation": "상인"},
            "world": {"genre": "판타지", "season_or_situation": "겨울"},
            "game_state": {
                "player_level": 12,
                "affinity": "high",
                "quest_type": "main",
            },
        }

    def test_generate_quest(self):
        response = client.post("/api/quest/generate", json=self._make_request())
        assert response.status_code == 200
        quest = response.json()
        assert "quest_id" in quest
        assert "title" in quest
        assert "objectives" in quest
        assert "rewards" in quest
        assert "dialogue" in quest

    def test_generate_has_timing_header(self):
        response = client.post("/api/quest/generate", json=self._make_request())
        assert "x-generation-time-ms" in response.headers

    def test_generate_invalid_request(self):
        response = client.post("/api/quest/generate", json={"invalid": "data"})
        assert response.status_code == 422


class TestQuestContinue:
    def test_continue_quest(self):
        request = {
            "quest": {
                "quest_id": "test_001",
                "title": "테스트",
                "description": "설명",
                "type": "main",
                "difficulty": "normal",
                "estimated_time": "30분",
                "prerequisites": [],
                "objectives": [{"type": "kill", "target": "적", "count": 1}],
                "branches": [
                    {
                        "condition": "choose_a",
                        "label": "A",
                        "next_quest_seed": "seed",
                        "consequence": "결과",
                    }
                ],
                "rewards": {
                    "gold": 100,
                    "exp": 50,
                    "items": [],
                    "affinity_change": 0,
                },
                "dialogue": {
                    "on_offer": "a",
                    "on_accept": "b",
                    "on_progress": "c",
                    "on_complete": "d",
                },
                "lore_connection": "lore",
                "design_notes": "notes",
            },
            "branch_chosen": "choose_a",
            "context": {
                "npc": {"name": "리라", "personality": "쾌활한", "occupation": "상인"},
                "world": {"genre": "판타지", "season_or_situation": "겨울"},
                "game_state": {"player_level": 12, "affinity": "high", "quest_type": "main"},
            },
        }
        response = client.post("/api/quest/continue", json=request)
        assert response.status_code == 200
        quest = response.json()
        assert "quest_id" in quest


class TestStatsEndpoint:
    def test_get_stats(self):
        response = client.get("/api/stats")
        assert response.status_code == 200
        stats = response.json()
        assert "total_quests_generated" in stats
        assert "uptime_seconds" in stats
