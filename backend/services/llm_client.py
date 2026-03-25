import os
import json
import asyncio
import logging
import random
import time
from typing import AsyncGenerator

logger = logging.getLogger(__name__)

# Template pools for varied mock quests
_MOCK_TITLES = {
    "하이 판타지": ["잊혀진 성소의 부름", "용의 눈물", "은빛 숲의 저주", "왕관의 행방", "빛의 수호자"],
    "다크 판타지": ["잊혀진 지하실의 비밀", "피의 계약", "그림자 상인의 거래", "저주받은 유물", "어둠의 속삭임"],
    "SF": ["미지 신호의 추적", "폐쇄된 연구소", "AI의 유산", "궤도 이탈", "양자 균열"],
    "무협": ["혈영검의 행방", "비무대회의 함정", "독문의 비밀", "잃어버린 무공 비급", "강호의 밀서"],
    "코지 판타지": ["수확제 대소동", "잃어버린 레시피", "요정의 부탁", "마법 정원의 비밀", "별빛 축제 준비"],
}
_DEFAULT_TITLES = ["수상한 의뢰", "비밀의 열쇠", "숨겨진 진실", "운명의 갈림길", "잊혀진 약속"]

_DIFFICULTY_MAP = {"main": "hard", "side": "normal", "daily": "easy", "hidden": "legendary"}

def _generate_mock_response(user_prompt: str) -> str:
    """Generate a dynamic mock quest based on request context extracted from user_prompt."""
    import re

    # Extract info from user prompt
    npc_name = "NPC"
    genre = "판타지"
    quest_type = "side"
    player_level = 10
    situation = ""
    personality = ""
    occupation = ""

    for line in user_prompt.split("\n"):
        line = line.strip("- ")
        if line.startswith("이름:"):
            npc_name = line.split(":", 1)[1].strip()
        elif line.startswith("성격:"):
            personality = line.split(":", 1)[1].strip()
        elif line.startswith("직업:"):
            occupation = line.split(":", 1)[1].strip()
        elif line.startswith("장르:"):
            genre = line.split(":", 1)[1].strip()
        elif line.startswith("상황:"):
            situation = line.split(":", 1)[1].strip()
        elif line.startswith("플레이어 레벨:"):
            try:
                player_level = int(line.split(":", 1)[1].strip())
            except ValueError:
                pass
        elif line.startswith("퀘스트 유형:"):
            quest_type = line.split(":", 1)[1].strip()

    # Pick genre-aware title
    genre_key = genre.split("(")[0].strip()  # "SF (포스트아포칼립스)" -> "SF"
    titles = _MOCK_TITLES.get(genre_key, _DEFAULT_TITLES)
    title = random.choice(titles)
    quest_id = f"demo_{int(time.time() * 1000) % 100000}_{random.randint(100,999)}"
    difficulty = _DIFFICULTY_MAP.get(quest_type, "normal")
    est_time = {"easy": "15분", "normal": "30분", "hard": "45분", "legendary": "60분"}[difficulty]

    mock = {
        "quest_id": quest_id,
        "title": title,
        "description": f"{situation or '평화롭던 일상'}에 변화가 찾아왔다. {occupation} {npc_name}은(는) 모험자에게 긴급한 도움을 요청한다. 사건의 진상을 밝히고 해결해야 한다.",
        "type": quest_type,
        "difficulty": difficulty,
        "estimated_time": est_time,
        "prerequisites": [],
        "objectives": [
            {"type": "investigate", "target": "사건 현장", "count": 1, "location": f"{npc_name}이(가) 알려준 장소", "hint": "주변을 꼼꼼히 살펴보라"},
            {"type": "fetch", "target": "핵심 단서", "count": 3, "location": "현장 주변", "hint": "숨겨진 흔적을 찾아라"},
            {"type": "talk", "target": npc_name, "count": 1, "location": "마을", "hint": f"수집한 단서를 {npc_name}에게 보여주자"},
        ],
        "branches": [
            {"condition": f"단서를 모두 수집한 후 {npc_name}에게 전달", "label": "진실을 밝히다", "next_quest_seed": f"{quest_id}_truth", "consequence": f"{npc_name}이(가) 단서를 분석하여 더 깊은 비밀이 드러난다"},
            {"condition": "현장에서 수상한 인물과 조우", "label": "어둠의 거래", "next_quest_seed": f"{quest_id}_dark", "consequence": "수상한 조직과의 접촉으로 새로운 갈등이 시작된다"},
        ],
        "rewards": {
            "gold": max(player_level * 80, 500),
            "exp": max(player_level * 50, 300),
            "items": ["사건 기록서", "감사의 증표"],
            "affinity_change": 15,
            "unlock": None,
        },
        "dialogue": {
            "on_offer": f"여행자, 잠깐! 큰일이야. {situation or '이상한 일이 벌어지고 있어'}. 나 혼자는 해결할 수가 없어... 도와줄 수 있겠어?",
            "on_accept": f"정말 고마워! 조심해야 해. {'위험할 수도 있으니까' if difficulty in ('hard','legendary') else '서두를 필요는 없어'}. 이 단서부터 확인해봐.",
            "on_progress": "어떻게 되고 있어? 나도 이쪽에서 할 수 있는 건 다 해보고 있어. 무리하지 마.",
            "on_complete": f"대단해! 역시 널 믿길 잘했어. 이건 보답이야, 받아줘.",
            "on_reject": "그래, 어쩔 수 없지. 하지만 혹시 마음이 바뀌면 언제든 찾아와줘.",
        },
        "lore_connection": f"이 사건은 {genre_key} 세계의 오래된 비밀과 연결되어 있다. 해결 방식에 따라 향후 이야기의 방향이 달라질 수 있다.",
        "design_notes": f"플레이어 레벨 {player_level}에 맞춘 {quest_type} 퀘스트. {npc_name}의 {personality} 성격을 대사에 반영. 분기를 통해 후속 스토리로 연결.",
    }
    return json.dumps(mock, ensure_ascii=False, indent=2)


class LLMClient:
    def __init__(self, override_api_key: str | None = None):
        self.openai_api_key = override_api_key or os.getenv("OPENAI_API_KEY")
        self.anthropic_api_key = os.getenv("ANTHROPIC_API_KEY")
        self._openai_client = None
        self._anthropic_client = None

    @property
    def openai_client(self):
        if self._openai_client is None and self.openai_api_key:
            from openai import AsyncOpenAI

            self._openai_client = AsyncOpenAI(api_key=self.openai_api_key)
        return self._openai_client

    @property
    def anthropic_client(self):
        if self._anthropic_client is None and self.anthropic_api_key:
            from anthropic import AsyncAnthropic

            self._anthropic_client = AsyncAnthropic(api_key=self.anthropic_api_key)
        return self._anthropic_client

    @property
    def has_any_key(self) -> bool:
        return bool(self.openai_api_key or self.anthropic_api_key)

    @property
    def is_demo_mode(self) -> bool:
        """Return True when no real API keys are available (demo/mock mode)."""
        return not self.has_any_key

    async def generate(
        self,
        system_prompt: str,
        user_prompt: str,
        response_format: dict | None = None,
    ) -> str:
        if not self.has_any_key:
            logger.warning(
                "No API keys configured. Returning mock demo response."
            )
            return _generate_mock_response(user_prompt)

        # Try OpenAI first
        if self.openai_client:
            try:
                return await self._generate_openai(
                    system_prompt, user_prompt, response_format
                )
            except Exception as e:
                logger.warning(f"OpenAI generation failed: {e}")

        # Fallback to Anthropic
        if self.anthropic_client:
            try:
                return await self._generate_anthropic(system_prompt, user_prompt)
            except Exception as e:
                logger.warning(f"Anthropic generation failed: {e}")

        logger.error("All LLM providers failed. Returning mock response.")
        return _generate_mock_response(user_prompt)

    async def _generate_openai(
        self,
        system_prompt: str,
        user_prompt: str,
        response_format: dict | None = None,
    ) -> str:
        kwargs: dict = {
            "model": "gpt-4o-mini",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "temperature": 0.8,
            "max_tokens": 4096,
        }
        if response_format:
            kwargs["response_format"] = response_format

        response = await self.openai_client.chat.completions.create(**kwargs)
        return response.choices[0].message.content

    async def _generate_anthropic(
        self, system_prompt: str, user_prompt: str
    ) -> str:
        # Anthropic does not support response_format; reinforce JSON-only output
        # via the system prompt.
        anthropic_system = system_prompt + "\n\n반드시 JSON 형식으로만 응답하세요."
        response = await self.anthropic_client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=4096,
            system=anthropic_system,
            messages=[{"role": "user", "content": user_prompt}],
            temperature=0.8,
        )
        return response.content[0].text

    async def generate_stream(
        self, system_prompt: str, user_prompt: str
    ) -> AsyncGenerator[str, None]:
        if not self.has_any_key:
            logger.warning(
                "No API keys configured. Streaming mock demo response."
            )
            mock = _generate_mock_response(user_prompt)
            chunk_size = 40
            for i in range(0, len(mock), chunk_size):
                yield mock[i : i + chunk_size]
                await asyncio.sleep(0.03)
            return

        # Try OpenAI streaming first
        if self.openai_client:
            try:
                async for chunk in self._stream_openai(system_prompt, user_prompt):
                    yield chunk
                return
            except Exception as e:
                logger.warning(f"OpenAI streaming failed: {e}")

        # Fallback to Anthropic streaming
        if self.anthropic_client:
            try:
                async for chunk in self._stream_anthropic(
                    system_prompt, user_prompt
                ):
                    yield chunk
                return
            except Exception as e:
                logger.warning(f"Anthropic streaming failed: {e}")

        # If all fail, stream mock response
        logger.error("All LLM providers failed for streaming. Using mock response.")
        mock = _generate_mock_response(user_prompt)
        chunk_size = 40
        for i in range(0, len(mock), chunk_size):
            yield mock[i : i + chunk_size]
            await asyncio.sleep(0.03)

    async def _stream_openai(
        self, system_prompt: str, user_prompt: str
    ) -> AsyncGenerator[str, None]:
        stream = await self.openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.8,
            max_tokens=4096,
            stream=True,
        )
        async for chunk in stream:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content

    async def _stream_anthropic(
        self, system_prompt: str, user_prompt: str
    ) -> AsyncGenerator[str, None]:
        async with self.anthropic_client.messages.stream(
            model="claude-3-haiku-20240307",
            max_tokens=4096,
            system=system_prompt,
            messages=[{"role": "user", "content": user_prompt}],
            temperature=0.8,
        ) as stream:
            async for text in stream.text_stream:
                yield text


# Singleton instance
llm_client = LLMClient()


def get_llm_client(user_api_key: str | None = None) -> LLMClient:
    """Get an LLM client, optionally with a user-provided API key."""
    if user_api_key:
        return LLMClient(override_api_key=user_api_key)
    return llm_client


def is_demo_mode(user_api_key: str | None = None) -> bool:
    """Return True when no real API keys are available (demo/mock mode)."""
    return get_llm_client(user_api_key).is_demo_mode
