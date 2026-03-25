import json
import logging
import time
from pathlib import Path

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
from sse_starlette.sse import EventSourceResponse

from schemas.quest import GeneratedQuest
from schemas.request import QuestGenerateRequest, ContinueQuestRequest
from services.quest_generator import generate_quest, generate_quest_stream, generate_continue_quest
from services.llm_client import is_demo_mode
from services.stats import increment_quests

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/quest", tags=["quest"])

PRESETS_PATH = Path(__file__).parent.parent / "data" / "presets.json"


@router.post("/generate", response_model=GeneratedQuest)
async def create_quest(request_body: QuestGenerateRequest, request: Request):
    """Generate a new quest based on NPC, world, and game state configuration."""
    try:
        user_api_key = request.headers.get("x-user-api-key")
        start = time.time()
        quest = await generate_quest(request_body, user_api_key=user_api_key)
        elapsed_ms = int((time.time() - start) * 1000)
        increment_quests()
        demo = is_demo_mode(user_api_key)
        return JSONResponse(
            content=quest.model_dump(),
            headers={
                "X-Generation-Time-Ms": str(elapsed_ms),
                "X-Demo-Mode": str(demo).lower(),
            },
        )
    except Exception as e:
        logger.error(f"Quest generation failed: {e}")
        raise HTTPException(
            status_code=500,
            detail="Quest generation failed",
        )


@router.post("/generate/stream")
async def create_quest_stream(request_body: QuestGenerateRequest, request: Request):
    """Generate a quest with streaming SSE updates."""
    user_api_key = request.headers.get("x-user-api-key")

    async def event_generator():
        async for event_data in generate_quest_stream(request_body, user_api_key=user_api_key):
            yield {"data": event_data}
            if '"event": "complete"' in event_data:
                increment_quests()

    return EventSourceResponse(event_generator())


@router.post("/continue", response_model=GeneratedQuest)
async def continue_quest(request_body: ContinueQuestRequest, request: Request):
    """Generate the next quest following a branch selection.

    Given a completed quest and the branch the player chose,
    generates a follow-up quest that continues the narrative.
    """
    try:
        user_api_key = request.headers.get("x-user-api-key")
        start = time.time()
        quest = await generate_continue_quest(request_body, user_api_key=user_api_key)
        elapsed_ms = int((time.time() - start) * 1000)
        increment_quests()
        demo = is_demo_mode(user_api_key)
        return JSONResponse(
            content=quest.model_dump(),
            headers={
                "X-Generation-Time-Ms": str(elapsed_ms),
                "X-Demo-Mode": str(demo).lower(),
            },
        )
    except Exception as e:
        logger.error(f"Quest continuation failed: {e}")
        raise HTTPException(
            status_code=500,
            detail="Quest continuation failed",
        )


@router.get("/presets")
async def get_presets():
    """Return preset quest generation scenarios."""
    try:
        with open(PRESETS_PATH, "r", encoding="utf-8") as f:
            presets = json.load(f)
        return presets
    except FileNotFoundError:
        logger.error(f"Presets file not found at {PRESETS_PATH}")
        raise HTTPException(status_code=404, detail="Presets file not found")
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse presets file: {e}")
        raise HTTPException(
            status_code=500, detail="Failed to parse presets file"
        )
