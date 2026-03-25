import logging

from fastapi import APIRouter, HTTPException, Request
from sse_starlette.sse import EventSourceResponse

from schemas.quest import GeneratedQuest, QuestChain
from schemas.request import ChainGenerateRequest
from services.quest_generator import generate_quest_chain, generate_quest_chain_stream
from services.stats import increment_chains

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/quest", tags=["chain"])


@router.post("/chain", response_model=QuestChain)
async def create_quest_chain(request_body: ChainGenerateRequest, request: Request):
    """Generate a chain of connected quests.

    Accepts a ChainGenerateRequest with the initial quest context,
    branch selection, and desired chain length. Returns a QuestChain
    with connected quests and an overall chain narrative.
    """
    try:
        user_api_key = request.headers.get("x-user-api-key")

        # If initial_quest data is provided, parse it into a GeneratedQuest
        initial_quest = None
        if request_body.initial_quest:
            try:
                initial_quest = GeneratedQuest(**request_body.initial_quest)
            except Exception as e:
                logger.warning(
                    f"Could not parse initial_quest data: {e}. "
                    "Proceeding without it."
                )

        chain = await generate_quest_chain(request_body, initial_quest, user_api_key=user_api_key)
        increment_chains()
        return chain
    except Exception as e:
        logger.error(f"Quest chain generation failed: {e}")
        raise HTTPException(
            status_code=500,
            detail="Quest chain generation failed",
        )


@router.post("/chain/stream")
async def create_quest_chain_stream(request_body: ChainGenerateRequest, request: Request):
    """Generate a quest chain with streaming SSE updates.

    Yields quests one by one as they are generated, followed by
    the complete chain with narrative on completion.
    """
    user_api_key = request.headers.get("x-user-api-key")

    # If initial_quest data is provided, parse it into a GeneratedQuest
    initial_quest = None
    if request_body.initial_quest:
        try:
            initial_quest = GeneratedQuest(**request_body.initial_quest)
        except Exception as e:
            logger.warning(
                f"Could not parse initial_quest data: {e}. "
                "Proceeding without it."
            )

    async def event_generator():
        async for event_data in generate_quest_chain_stream(
            request_body, initial_quest, user_api_key=user_api_key
        ):
            yield {"data": event_data}
            if '"event": "complete"' in event_data:
                increment_chains()

    return EventSourceResponse(event_generator())
