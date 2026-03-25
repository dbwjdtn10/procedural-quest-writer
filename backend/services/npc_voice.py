import logging

from schemas.quest import GeneratedQuest

logger = logging.getLogger(__name__)

# Personality-based dialogue style hints
PERSONALITY_STYLES: dict[str, dict[str, str]] = {
    "쾌활": {
        "prefix": "",
        "suffix": "",
        "tone": "밝고 에너지 넘치는",
    },
    "과묵": {
        "prefix": "",
        "suffix": "",
        "tone": "짧고 간결한",
    },
    "다정": {
        "prefix": "",
        "suffix": "",
        "tone": "따뜻하고 배려하는",
    },
    "호기심": {
        "prefix": "",
        "suffix": "",
        "tone": "궁금해하며 탐구적인",
    },
    "냉정": {
        "prefix": "",
        "suffix": "",
        "tone": "차갑고 사무적인",
    },
    "유머": {
        "prefix": "",
        "suffix": "",
        "tone": "재치 있고 유쾌한",
    },
}


def _detect_personality_key(personality: str) -> str | None:
    """Detect the personality key from the personality description."""
    for key in PERSONALITY_STYLES:
        if key in personality:
            return key
    return None


def enhance_dialogue(quest: GeneratedQuest, personality: str) -> GeneratedQuest:
    """Enhance quest dialogue based on NPC personality.

    For Phase 1, this performs lightweight validation and ensures
    dialogue consistency with the NPC's personality. In future phases,
    this could apply more sophisticated text transformations.

    NOTE: This is currently a stub. The function detects a personality key
    but does not transform dialogue text yet. Full implementation is
    planned for a future phase.
    """
    personality_key = _detect_personality_key(personality)

    if personality_key is None:
        # No matching personality found; return quest as-is
        logger.debug(
            f"No personality style match found for '{personality}'. "
            "Returning dialogue unchanged."
        )
        return quest

    style = PERSONALITY_STYLES[personality_key]
    logger.debug(
        f"Detected personality style '{personality_key}' "
        f"(tone: {style['tone']}) for NPC personality '{personality}'."
    )

    # For Phase 1, we trust the LLM to have already applied the personality
    # in the dialogue. This function serves as a hook for future enhancements
    # such as post-processing dialogue text with personality-specific
    # transformations, adding speech patterns, verbal tics, etc.

    return quest
