import json
import logging
from pathlib import Path

from schemas.quest import GeneratedQuest

logger = logging.getLogger(__name__)

# Load balance tables from data file
_BALANCE_TABLES_PATH = Path(__file__).parent.parent / "data" / "balance_tables.json"
with open(_BALANCE_TABLES_PATH, "r", encoding="utf-8") as _f:
    _tables = json.load(_f)


def check_balance(quest: GeneratedQuest, player_level: int) -> GeneratedQuest:
    """Check and adjust quest rewards to be within acceptable ranges.

    Uses balance_tables.json values with difficulty multipliers and variance.
    """
    gold_base = player_level * _tables["gold_per_level"]
    exp_base = player_level * _tables["exp_per_level"]
    diff_mult = _tables["difficulty_multiplier"].get(quest.difficulty, 1.0)
    variance = _tables.get("gold_variance", 0.2)

    gold_min = int(gold_base * diff_mult * (1 - variance))
    gold_max = int(gold_base * diff_mult * (1 + variance))
    exp_min = int(exp_base * diff_mult * (1 - variance))
    exp_max = int(exp_base * diff_mult * (1 + variance))

    adjusted_gold = quest.rewards.gold
    adjusted_exp = quest.rewards.exp

    if adjusted_gold < gold_min:
        logger.info(
            f"Gold {adjusted_gold} below min {gold_min}, clamping up."
        )
        adjusted_gold = gold_min
    elif adjusted_gold > gold_max:
        logger.info(
            f"Gold {adjusted_gold} above max {gold_max}, clamping down."
        )
        adjusted_gold = gold_max

    if adjusted_exp < exp_min:
        logger.info(
            f"Exp {adjusted_exp} below min {exp_min}, clamping up."
        )
        adjusted_exp = exp_min
    elif adjusted_exp > exp_max:
        logger.info(
            f"Exp {adjusted_exp} above max {exp_max}, clamping down."
        )
        adjusted_exp = exp_max

    if adjusted_gold != quest.rewards.gold or adjusted_exp != quest.rewards.exp:
        # Create a new quest with adjusted rewards
        rewards_data = quest.rewards.model_dump()
        rewards_data["gold"] = adjusted_gold
        rewards_data["exp"] = adjusted_exp

        quest_data = quest.model_dump()
        quest_data["rewards"] = rewards_data
        quest = GeneratedQuest(**quest_data)

    return quest
