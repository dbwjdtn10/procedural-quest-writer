"""Tests for stats service."""
from services.stats import increment_quests, increment_chains, get_stats, _stats


class TestStats:
    def setup_method(self):
        _stats["total_quests"] = 0
        _stats["total_chains"] = 0

    def test_increment_quests(self):
        increment_quests()
        increment_quests()
        stats = get_stats()
        assert stats["total_quests_generated"] == 2

    def test_increment_chains(self):
        increment_chains()
        stats = get_stats()
        assert stats["total_chains_generated"] == 1

    def test_uptime_positive(self):
        stats = get_stats()
        assert stats["uptime_seconds"] >= 0
