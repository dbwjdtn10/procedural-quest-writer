import json
import re
import uuid
import logging
from typing import AsyncGenerator, Optional

from schemas.quest import GeneratedQuest, QuestChain
from schemas.request import QuestGenerateRequest, ChainGenerateRequest, ContinueQuestRequest
from services.llm_client import llm_client, get_llm_client
from services.balance_checker import check_balance
from services.npc_voice import enhance_dialogue

logger = logging.getLogger(__name__)

QUEST_SYSTEM_PROMPT = """당신은 게임 퀘스트 디자이너 AI입니다. 주어진 NPC, 세계관, 게임 상태 정보를 기반으로
몰입감 있고 균형 잡힌 퀘스트를 생성합니다.

반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트는 포함하지 마세요.

{
  "quest_id": "고유한 퀘스트 ID (영문, snake_case)",
  "title": "퀘스트 제목 (한글)",
  "description": "퀘스트 설명 (2-3문장, 한글)",
  "type": "main | side | daily | hidden",
  "difficulty": "easy | normal | hard | legendary",
  "estimated_time": "예상 소요 시간",
  "prerequisites": ["선행 조건 목록"],
  "objectives": [
    {
      "type": "kill | fetch | talk | explore | escort | craft | investigate",
      "target": "목표 대상",
      "count": 1,
      "location": "위치 (선택)",
      "hint": "힌트 (선택)"
    }
  ],
  "branches": [
    {
      "condition": "분기 조건",
      "label": "분기 라벨",
      "next_quest_seed": "다음 퀘스트 시드",
      "consequence": "결과 설명"
    }
  ],
  "rewards": {
    "gold": 0,
    "exp": 0,
    "items": ["아이템 목록"],
    "affinity_change": 0,
    "unlock": "해금 요소 (선택)"
  },
  "dialogue": {
    "on_offer": "퀘스트 제안 시 NPC 대사",
    "on_accept": "퀘스트 수락 시 NPC 대사",
    "on_progress": "퀘스트 진행 중 NPC 대사",
    "on_complete": "퀘스트 완료 시 NPC 대사",
    "on_reject": "퀘스트 거절 시 NPC 대사 (선택)"
  },
  "lore_connection": "세계관과의 연결 설명",
  "design_notes": "디자인 의도 및 참고사항"
}

퀘스트 설계 원칙:
1. NPC의 성격과 직업이 퀘스트 내용과 대사에 자연스럽게 반영되어야 합니다.
2. 세계관의 장르와 상황에 맞는 퀘스트를 설계하세요.
3. 플레이어 레벨에 맞는 난이도와 보상을 제공하세요.
4. 최소 2개 이상의 분기를 포함하여 리플레이 가치를 높이세요.
5. 대사는 NPC의 성격을 잘 드러내야 합니다.
6. 한글로 작성하되, quest_id와 next_quest_seed는 영문 snake_case로 작성하세요."""


def _extract_json(text: str) -> dict:
    """Extract JSON from text, handling markdown code blocks."""
    # Try direct parse first
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Try extracting from markdown code blocks
    patterns = [
        r"```json\s*([\s\S]*?)\s*```",
        r"```\s*([\s\S]*?)\s*```",
    ]
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            try:
                return json.loads(match.group(1))
            except json.JSONDecodeError:
                continue

    # Try finding JSON object pattern in text
    brace_start = text.find("{")
    brace_end = text.rfind("}")
    if brace_start != -1 and brace_end != -1:
        try:
            return json.loads(text[brace_start : brace_end + 1])
        except json.JSONDecodeError:
            pass

    raise ValueError(f"Could not extract valid JSON from LLM response: {text[:200]}...")


def _build_user_prompt(request: QuestGenerateRequest) -> str:
    return f"""다음 정보를 기반으로 퀘스트를 생성해주세요:

## NPC 정보
- 이름: {request.npc.name}
- 성격: {request.npc.personality}
- 직업: {request.npc.occupation}

## 세계관
- 장르: {request.world.genre}
- 상황: {request.world.season_or_situation}
- 특이사항: {request.world.special_notes or "없음"}

## 게임 상태
- 플레이어 레벨: {request.game_state.player_level}
- NPC 호감도: {request.game_state.affinity}
- 퀘스트 유형: {request.game_state.quest_type}

위 정보를 바탕으로 몰입감 있는 퀘스트를 JSON 형식으로 생성해주세요."""


async def generate_quest(request: QuestGenerateRequest, user_api_key: str | None = None) -> GeneratedQuest:
    """Generate a quest using LLM and return a validated GeneratedQuest."""
    client = get_llm_client(user_api_key)
    user_prompt = _build_user_prompt(request)

    response_text = await client.generate(
        system_prompt=QUEST_SYSTEM_PROMPT,
        user_prompt=user_prompt,
        response_format={"type": "json_object"},
    )

    quest_data = _extract_json(response_text)

    # Ensure quest_id exists
    if "quest_id" not in quest_data or not quest_data["quest_id"]:
        quest_data["quest_id"] = f"quest_{uuid.uuid4().hex[:8]}"

    # Validate and create the quest model
    quest = GeneratedQuest(**quest_data)

    # Apply balance checking
    quest = check_balance(quest, request.game_state.player_level)

    # Enhance dialogue with NPC voice
    quest = enhance_dialogue(quest, request.npc.personality)

    return quest


async def generate_quest_stream(
    request: QuestGenerateRequest,
    user_api_key: str | None = None,
) -> AsyncGenerator[str, None]:
    """Stream quest generation as SSE events."""
    client = get_llm_client(user_api_key)
    user_prompt = _build_user_prompt(request)

    yield json.dumps({"event": "start", "data": "퀘스트 생성을 시작합니다..."}, ensure_ascii=False)

    accumulated = ""
    try:
        async for chunk in client.generate_stream(
            system_prompt=QUEST_SYSTEM_PROMPT,
            user_prompt=user_prompt,
        ):
            accumulated += chunk
            yield json.dumps(
                {"event": "chunk", "data": chunk}, ensure_ascii=False
            )

        # Parse the final result
        quest_data = _extract_json(accumulated)

        if "quest_id" not in quest_data or not quest_data["quest_id"]:
            quest_data["quest_id"] = f"quest_{uuid.uuid4().hex[:8]}"

        quest = GeneratedQuest(**quest_data)
        quest = check_balance(quest, request.game_state.player_level)
        quest = enhance_dialogue(quest, request.npc.personality)

        yield json.dumps(
            {"event": "complete", "data": quest.model_dump()},
            ensure_ascii=False,
        )
    except Exception as e:
        logger.error(f"Quest generation stream error: {e}")
        yield json.dumps(
            {"event": "error", "data": str(e)}, ensure_ascii=False
        )


CHAIN_SYSTEM_PROMPT = """당신은 숙련된 게임 퀘스트 체인 디자이너입니다.
이전 퀘스트의 결과와 선택한 분기를 바탕으로 연쇄 퀘스트를 설계하세요.

설계 원칙:
1. 이전 퀘스트의 결과가 다음 퀘스트의 동기와 상황에 자연스럽게 이어져야 함
2. 분기 선택의 결과가 후속 퀘스트에 구체적으로 반영되어야 함
3. 체인이 진행될수록 스토리의 긴장감과 보상이 점진적으로 상승
4. 각 퀘스트는 독립적으로도 이해 가능하지만, 체인으로 연결되면 더 풍부한 서사
5. 마지막 퀘스트는 체인의 클라이맥스로, 의미 있는 결말 제공
6. NPC의 성격과 관계 변화가 체인 전체에 걸쳐 일관성 있게 표현

반드시 주어진 JSON 스키마를 따라 응답하세요.
각 퀘스트의 quest_id는 이전 퀘스트의 quest_id를 기반으로 순차적으로 부여하세요.
connects_from 필드 대신 prerequisites에 이전 퀘스트 ID를 포함하세요."""

CONTINUE_SYSTEM_PROMPT = """당신은 게임 퀘스트 디자이너 AI입니다. 플레이어가 선택한 분기를 바탕으로
이전 퀘스트의 후속 퀘스트를 생성합니다.

반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트는 포함하지 마세요.

{
  "quest_id": "고유한 퀘스트 ID (영문, snake_case)",
  "title": "퀘스트 제목 (한글)",
  "description": "퀘스트 설명 (2-3문장, 한글)",
  "type": "main | side | daily | hidden",
  "difficulty": "easy | normal | hard | legendary",
  "estimated_time": "예상 소요 시간",
  "prerequisites": ["이전 퀘스트 ID"],
  "objectives": [{"type": "...", "target": "...", "count": 1, "location": "...", "hint": "..."}],
  "branches": [{"condition": "분기 조건", "label": "분기 라벨", "next_quest_seed": "...", "consequence": "결과 설명"}],
  "rewards": {"gold": 0, "exp": 0, "items": [], "affinity_change": 0, "unlock": null},
  "dialogue": {"on_offer": "...", "on_accept": "...", "on_progress": "...", "on_complete": "...", "on_reject": "..."},
  "lore_connection": "세계관과의 연결 설명",
  "design_notes": "디자인 의도 및 참고사항"
}

설계 원칙:
1. 선택한 분기의 결과가 후속 퀘스트에 구체적으로 반영되어야 합니다.
2. NPC의 성격과 직업이 퀘스트 내용과 대사에 자연스럽게 반영되어야 합니다.
3. 이전 퀘스트보다 약간 높은 보상과 긴장감을 제공하세요.
4. 한글로 작성하되, quest_id와 next_quest_seed는 영문 snake_case로 작성하세요."""


def _build_chain_user_prompt(
    request: ChainGenerateRequest,
    initial_quest: Optional[GeneratedQuest] = None,
) -> str:
    quest_title = "알 수 없음"
    quest_description = "알 수 없음"

    if initial_quest:
        quest_title = initial_quest.title
        quest_description = initial_quest.description
    elif request.initial_quest:
        quest_title = request.initial_quest.get("title", "알 수 없음")
        quest_description = request.initial_quest.get("description", "알 수 없음")

    previous_outcomes_str = ", ".join(request.previous_outcomes) if request.previous_outcomes else "없음"

    return f"""초기 퀘스트 정보:
- 제목: {quest_title}
- 설명: {quest_description}
- 분기: {request.branch_chosen or "없음"}

NPC: {request.context.npc.name} ({request.context.npc.personality} {request.context.npc.occupation})
세계관: {request.context.world.genre}, {request.context.world.season_or_situation}
플레이어 레벨: {request.context.game_state.player_level}
호감도: {request.context.game_state.affinity}

이전 결과: {previous_outcomes_str}

위 맥락을 바탕으로 {request.chain_length}개의 연쇄 퀘스트를 JSON 배열로 생성하세요.
또한 체인 전체를 관통하는 내러티브 설명(chain_narrative)도 포함하세요.

응답 형식:
{{
  "chain": [퀘스트 배열],
  "chain_narrative": "체인 내러티브 설명"
}}"""


def _build_continue_user_prompt(request: ContinueQuestRequest) -> str:
    quest_title = request.quest.get("title", "알 수 없음")
    quest_description = request.quest.get("description", "알 수 없음")
    quest_id = request.quest.get("quest_id", "unknown_quest")

    return f"""이전 퀘스트 정보:
- ID: {quest_id}
- 제목: {quest_title}
- 설명: {quest_description}
- 선택한 분기: {request.branch_chosen}

NPC: {request.context.npc.name} ({request.context.npc.personality} {request.context.npc.occupation})
세계관: {request.context.world.genre}, {request.context.world.season_or_situation}
플레이어 레벨: {request.context.game_state.player_level}
호감도: {request.context.game_state.affinity}

위 정보를 바탕으로 선택한 분기에 따른 후속 퀘스트를 JSON 형식으로 생성해주세요.
이전 퀘스트 ID를 prerequisites에 포함하세요."""


def _get_mock_chain_data(
    request: ChainGenerateRequest,
    initial_quest: Optional[GeneratedQuest] = None,
) -> dict:
    """Generate a realistic mock quest chain for demo mode."""
    base_id = request.initial_quest_id or "demo_quest_001"
    branch = request.branch_chosen or "진실을 밝히다"
    player_level = request.context.game_state.player_level

    return {
        "chain": [
            {
                "quest_id": f"{base_id}_chain_01",
                "title": "지하 통로의 추적자",
                "description": "지하실에서 발견한 고대 문서의 단서를 따라 숨겨진 통로를 탐색한다. 통로 깊숙한 곳에서 오래전 사라진 것으로 알려진 비밀 결사의 흔적을 발견하게 된다.",
                "type": "side",
                "difficulty": "normal",
                "estimated_time": "40분",
                "prerequisites": [base_id],
                "objectives": [
                    {
                        "type": "explore",
                        "target": "숨겨진 지하 통로",
                        "count": 1,
                        "location": "마을 지하 통로 네트워크",
                        "hint": "지하실 벽면의 고대 문양을 따라가라",
                    },
                    {
                        "type": "investigate",
                        "target": "비밀 결사의 제단",
                        "count": 1,
                        "location": "지하 통로 최심부",
                        "hint": "제단 위의 상징을 기록하라",
                    },
                    {
                        "type": "fetch",
                        "target": "결사의 인장",
                        "count": 1,
                        "location": "제단 뒤편 비밀 금고",
                        "hint": "금고의 잠금장치는 문서 조각의 암호로 풀린다",
                    },
                ],
                "branches": [
                    {
                        "condition": "인장을 리라에게 가져간다",
                        "label": "빛의 계승자",
                        "next_quest_seed": "heir_of_light_03",
                        "consequence": "리라가 인장의 비밀을 해독하여 결사의 진정한 목적이 밝혀진다",
                    },
                    {
                        "condition": "인장을 사용하여 봉인된 문을 연다",
                        "label": "금지된 지식",
                        "next_quest_seed": "forbidden_knowledge_03",
                        "consequence": "봉인 너머의 고대 지식에 접근하지만 위험한 존재를 깨운다",
                    },
                ],
                "rewards": {
                    "gold": max(player_level * 70, 1000),
                    "exp": max(player_level * 50, 600),
                    "items": ["결사의 인장", "고대 통로 지도"],
                    "affinity_change": 10,
                    "unlock": "지하 통로 네트워크 탐색 가능",
                },
                "dialogue": {
                    "on_offer": "여행자, 그 문서들을 분석해봤는데... 이건 단순한 기록이 아니야. 지하실 벽에 새겨진 문양과 일치하는 부분이 있어. 혹시 더 깊이 들어가볼 용기가 있어?",
                    "on_accept": "역시 믿을 수 있는 사람이야! 이 지도 조각을 가져가. 완벽하진 않지만 길을 찾는 데 도움이 될 거야. 그리고... 조심해. 그 아래에 뭐가 있을지 모르니까.",
                    "on_progress": "통로 안에서 뭔가 찾았어? 여기서도 가끔 이상한 진동이 느껴져. 서둘러줘, 뭔가 불안한 느낌이 들어.",
                    "on_complete": "이... 이건 결사의 인장이잖아! 할머니가 옛날에 들려주신 이야기에 나오던 그 상징이야. 이게 정말 존재했다니... 대단해!",
                    "on_reject": "알겠어, 무리하지 마. 하지만 이 통로의 비밀은 언젠가 누군가가 밝혀야 할 거야.",
                },
                "lore_connection": "비밀 결사 '새벽의 수호자'는 초대 영주와 함께 마을을 세운 7인의 현자들이 결성한 조직으로, 고대의 위험한 유물들을 봉인하고 지키는 임무를 맡았다.",
                "design_notes": "첫 번째 퀘스트에서 발견한 단서를 직접 추적하는 연결 퀘스트. 탐색 중심의 게임플레이로 세계관의 깊이를 보여준다. 두 분기는 각각 평화적/위험한 경로를 제시.",
            },
            {
                "quest_id": f"{base_id}_chain_02",
                "title": "새벽의 수호자, 깨어나는 봉인",
                "description": "결사의 인장이 반응하기 시작한다. 마을 곳곳에서 이상 현상이 발생하고, 오래된 봉인이 약해지고 있음을 알게 된다. 봉인을 강화할 것인지, 봉인 너머의 힘을 이용할 것인지 선택해야 한다.",
                "type": "main",
                "difficulty": "hard",
                "estimated_time": "50분",
                "prerequisites": [f"{base_id}_chain_01"],
                "objectives": [
                    {
                        "type": "investigate",
                        "target": "약해진 봉인 지점",
                        "count": 3,
                        "location": "마을 외곽 3곳",
                        "hint": "인장이 빛나는 방향을 따라가라",
                    },
                    {
                        "type": "fetch",
                        "target": "봉인 강화 재료",
                        "count": 5,
                        "location": "고대 숲과 폐허",
                        "hint": "달빛 아래에서만 채집할 수 있는 은빛 이끼가 필요하다",
                    },
                    {
                        "type": "kill",
                        "target": "봉인에서 흘러나온 그림자 수호병",
                        "count": 5,
                        "location": "봉인 지점 주변",
                        "hint": "그림자 수호병은 빛에 약하다. 횃불을 활용하라",
                    },
                    {
                        "type": "talk",
                        "target": "마을 장로",
                        "count": 1,
                        "location": "마을 회관",
                        "hint": "장로는 결사에 대한 오래된 기억을 가지고 있다",
                    },
                ],
                "branches": [
                    {
                        "condition": "봉인을 강화하여 위협을 다시 가둔다",
                        "label": "수호자의 길",
                        "next_quest_seed": "guardians_path_04",
                        "consequence": "마을은 안전해지지만, 봉인 너머의 고대 지식은 영원히 잠기게 된다. 리라와의 유대가 깊어진다.",
                    },
                    {
                        "condition": "봉인을 열어 고대의 힘을 해방한다",
                        "label": "해방자의 선택",
                        "next_quest_seed": "liberators_choice_04",
                        "consequence": "강력한 고대 유물을 얻지만, 마을에 새로운 위협이 나타난다. 장로와의 관계가 악화된다.",
                    },
                ],
                "rewards": {
                    "gold": max(player_level * 100, 1500),
                    "exp": max(player_level * 70, 900),
                    "items": ["새벽의 수호자 칭호", "봉인의 파편", "은빛 이끼 포션"],
                    "affinity_change": 20,
                    "unlock": "고대 무기 강화 시스템",
                },
                "dialogue": {
                    "on_offer": "여행자... 큰일이야. 인장을 가져온 뒤로 마을 곳곳에서 이상한 일이 벌어지고 있어. 하늘에는 이상한 빛이, 땅에서는 진동이... 네가 아니면 이걸 해결할 사람이 없어.",
                    "on_accept": "고마워, 정말 고마워. 장로님도 이 사태를 알고 계셔. 먼저 장로님을 찾아가 봐. 그리고 이 인장을 꼭 가지고 다녀. 봉인 지점을 찾는 데 도움이 될 거야.",
                    "on_progress": "봉인 지점을 찾았어? 조심해야 해... 그림자 같은 것들이 봉인 틈으로 나오고 있다는 소문이 있어. 절대 혼자 무리하지 마.",
                    "on_complete": "해냈구나... 정말 대단해. 이제 이 마을의 비밀을 아는 사람은 너와 나, 그리고 장로님뿐이야. 이건 우리의 비밀이야, 알겠지?",
                    "on_reject": "안 돼, 제발... 이건 나 혼자 감당할 수 있는 일이 아니야. 부탁이야, 다시 한번 생각해줘.",
                },
                "lore_connection": "새벽의 수호자들이 봉인한 것은 '황혼의 유산'이라 불리는 고대 문명의 유물이다. 이 유물은 강대한 힘을 지녔으나, 사용자의 마음을 타락시키는 저주가 걸려 있다.",
                "design_notes": "체인의 클라이맥스 퀘스트. 전투, 수집, 탐색, 대화 등 다양한 목표를 통해 게임플레이 다양성 제공. 분기 선택이 세계관에 실질적인 영향을 미치는 무게감 있는 결정.",
            },
            {
                "quest_id": f"{base_id}_chain_03",
                "title": "여명의 서약",
                "description": "봉인을 둘러싼 사건이 일단락되고, 마을은 다시 평화를 되찾아간다. 하지만 이번 사건으로 드러난 진실은 리라와 마을 사람들에게 깊은 영향을 남겼다. 마지막으로 남은 일들을 마무리하고, 새로운 여정의 시작을 준비한다.",
                "type": "side",
                "difficulty": "normal",
                "estimated_time": "25분",
                "prerequisites": [f"{base_id}_chain_02"],
                "objectives": [
                    {
                        "type": "talk",
                        "target": "리라",
                        "count": 1,
                        "location": "마을 시장",
                        "hint": "리라가 특별한 이야기를 하고 싶어한다",
                    },
                    {
                        "type": "talk",
                        "target": "마을 장로",
                        "count": 1,
                        "location": "마을 회관",
                        "hint": "장로가 새벽의 수호자에 대한 마지막 이야기를 들려준다",
                    },
                    {
                        "type": "explore",
                        "target": "기념비 건립 장소",
                        "count": 1,
                        "location": "마을 광장",
                        "hint": "지하실 입구 근처에 기념비를 세울 장소를 선정한다",
                    },
                ],
                "branches": [
                    {
                        "condition": "리라의 제안을 수락하여 동행을 결정한다",
                        "label": "함께하는 여정",
                        "next_quest_seed": "journey_together_05",
                        "consequence": "리라가 동료로 합류하며 새로운 모험이 시작된다",
                    },
                    {
                        "condition": "홀로 새로운 모험을 떠난다",
                        "label": "고독한 탐험가",
                        "next_quest_seed": "lone_explorer_05",
                        "consequence": "혼자만의 여정이 시작되지만, 리라는 마을에서 여행자를 기다린다",
                    },
                ],
                "rewards": {
                    "gold": max(player_level * 90, 1200),
                    "exp": max(player_level * 60, 800),
                    "items": ["여명의 반지", "리라의 행운 부적", "새벽의 수호자 기록서"],
                    "affinity_change": 25,
                    "unlock": "리라 동행 시스템 해금",
                },
                "dialogue": {
                    "on_offer": "여행자... 아니, 이제는 친구라고 불러도 될까? 모든 게 끝나고 나니까 좀 허전하기도 하고... 할 얘기가 있어. 시간 괜찮아?",
                    "on_accept": "사실 나도 이번 일로 많은 걸 느꼈어. 이 마을 밖에도 수많은 비밀이 숨어있겠지? 그래서 말인데... 나도 같이 가면 안 될까?",
                    "on_progress": "장로님이 중요한 얘기를 해주신다고 했어. 그리고 광장에 기념비를 세우자는 마을 사람들의 의견도 있었고. 하나씩 정리하자!",
                    "on_complete": "고마워, 정말... 네 덕분에 이 마을이, 아니 내가 많이 변했어. 앞으로 어떤 길을 가든 이 일은 절대 잊지 못할 거야. 자, 이건 내 마음이야. 받아줘.",
                    "on_reject": "그래, 아직 정리할 게 남았을 수도 있지. 준비되면 언제든 와.",
                },
                "lore_connection": "새벽의 수호자의 기록은 이후 마을의 역사서에 정식으로 편입되며, 지하 통로는 '여행자의 통로'라는 이름으로 마을의 관광 명소가 된다.",
                "design_notes": "체인의 에필로그이자 감성적 마무리 퀘스트. 전투 없이 대화와 탐색으로 스토리를 마무리하며, NPC와의 관계 성장을 보여준다. 분기를 통해 향후 콘텐츠와의 연결점을 남긴다.",
            },
        ],
        "chain_narrative": "마을 지하실에서 시작된 작은 의문은 고대 비밀 결사 '새벽의 수호자'의 유산으로 이어진다. "
        "여행자는 상인 리라와 함께 지하 통로의 비밀을 추적하고, 약해진 봉인을 둘러싼 위기를 해결하며, "
        "마을의 숨겨진 역사와 마주한다. 이 여정을 통해 여행자와 리라의 유대는 깊어지고, "
        "작은 마을에서 시작된 모험은 더 큰 세계로의 문을 열게 된다.",
    }


def _get_mock_continue_quest(request: ContinueQuestRequest) -> dict:
    """Generate a realistic mock follow-up quest for demo mode."""
    prev_quest_id = request.quest.get("quest_id", "unknown_quest")
    prev_title = request.quest.get("title", "이전 퀘스트")
    branch = request.branch_chosen
    player_level = request.context.game_state.player_level

    quest_type = request.context.game_state.quest_type
    difficulty = {"main": "hard", "side": "normal", "daily": "easy", "hidden": "legendary"}.get(quest_type, "normal")

    # Create a contextually relevant follow-up based on the branch chosen
    return {
        "quest_id": f"{prev_quest_id}_follow_{int(__import__('time').time() * 1000) % 100000}",
        "title": f"{branch}의 여파",
        "description": f"'{prev_title}'에서 '{branch}'을(를) 선택한 결과, 새로운 상황이 전개된다. "
        f"{request.context.npc.name}이(가) 급히 여행자를 찾아와 새로운 임무를 전한다.",
        "type": quest_type,
        "difficulty": difficulty,
        "estimated_time": "35분",
        "prerequisites": [prev_quest_id],
        "objectives": [
            {
                "type": "investigate",
                "target": "분기 선택의 여파",
                "count": 1,
                "location": "이전 퀘스트 현장 근처",
                "hint": "선택의 흔적이 남아있는 곳을 살펴보라",
            },
            {
                "type": "talk",
                "target": request.context.npc.name,
                "count": 1,
                "location": "마을 중심가",
                "hint": f"{request.context.npc.name}에게 조사 결과를 보고하라",
            },
            {
                "type": "fetch",
                "target": "결정적 증거",
                "count": 2,
                "location": "사건 현장",
                "hint": "주의 깊게 살펴보면 숨겨진 단서가 있다",
            },
        ],
        "branches": [
            {
                "condition": "증거를 바탕으로 평화적 해결을 시도한다",
                "label": "평화의 중재자",
                "next_quest_seed": f"{prev_quest_id}_peace_02",
                "consequence": "갈등이 평화롭게 해결되며 관련자들의 신뢰를 얻는다",
            },
            {
                "condition": "증거를 무기로 직접 대면한다",
                "label": "단호한 결단",
                "next_quest_seed": f"{prev_quest_id}_confront_02",
                "consequence": "직접적인 대면으로 더 빠른 해결이 가능하지만 적을 만들 수 있다",
            },
        ],
        "rewards": {
            "gold": max(player_level * 80, 900),
            "exp": max(player_level * 55, 550),
            "items": ["수사관의 기록서", "신뢰의 증표"],
            "affinity_change": 15,
            "unlock": None,
        },
        "dialogue": {
            "on_offer": f"여행자, 큰일이야! '{branch}'을(를) 택한 뒤로 상황이 급변했어. 새로운 단서가 나타났는데... 나 혼자는 감당이 안 돼.",
            "on_accept": "정말 고마워! 이번에는 더 조심해야 해. 지난번과는 상황이 다르거든. 이 단서를 먼저 확인해봐.",
            "on_progress": "어떻게 되고 있어? 나도 이쪽에서 할 수 있는 건 다 해보고 있어. 무리하지 마.",
            "on_complete": "대단해, 역시 널 믿길 잘했어. 이 정보라면 다음 단계로 넘어갈 수 있을 거야. 이건 보답이야, 받아줘.",
            "on_reject": "그래... 지금은 무리일 수도 있지. 하지만 시간이 많지 않아. 마음이 바뀌면 알려줘.",
        },
        "lore_connection": f"이전 사건에서 '{branch}'을(를) 선택한 여파가 마을과 주변 지역에 영향을 미치고 있다. "
        "이번 사건의 해결 방식에 따라 향후 이야기의 방향이 크게 달라질 수 있다.",
        "design_notes": f"플레이어가 선택한 분기 '{branch}'의 직접적인 결과를 보여주는 후속 퀘스트. "
        "선택의 무게감을 전달하면서도 새로운 분기를 제시하여 플레이어의 능동적 참여를 유도.",
    }


async def generate_quest_chain(
    request: ChainGenerateRequest,
    initial_quest: Optional[GeneratedQuest] = None,
    user_api_key: str | None = None,
) -> QuestChain:
    """Generate a chain of connected quests using LLM."""
    client = get_llm_client(user_api_key)
    user_prompt = _build_chain_user_prompt(request, initial_quest)

    response_text = await client.generate(
        system_prompt=CHAIN_SYSTEM_PROMPT,
        user_prompt=user_prompt,
        response_format={"type": "json_object"},
    )

    # Check if we got a mock single-quest response (demo mode)
    raw_data = _extract_json(response_text)

    # If the response is a single quest (demo mode returns mock quest),
    # build a proper chain from mock data instead
    if "chain" not in raw_data:
        logger.info("LLM returned single quest (demo mode). Using mock chain data.")
        raw_data = _get_mock_chain_data(request, initial_quest)

    # Validate each quest in the chain
    chain_quests = []
    for i, quest_data in enumerate(raw_data["chain"]):
        if "quest_id" not in quest_data or not quest_data["quest_id"]:
            quest_data["quest_id"] = f"chain_{uuid.uuid4().hex[:8]}_{i}"
        quest = GeneratedQuest(**quest_data)
        quest = check_balance(quest, request.context.game_state.player_level)
        quest = enhance_dialogue(quest, request.context.npc.personality)
        chain_quests.append(quest)

    return QuestChain(
        chain=chain_quests,
        chain_narrative=raw_data.get("chain_narrative", ""),
    )


async def generate_quest_chain_stream(
    request: ChainGenerateRequest,
    initial_quest: Optional[GeneratedQuest] = None,
    user_api_key: str | None = None,
) -> AsyncGenerator[str, None]:
    """Stream quest chain generation as SSE events, yielding quests one by one."""
    yield json.dumps(
        {"event": "start", "data": "퀘스트 체인 생성을 시작합니다..."},
        ensure_ascii=False,
    )

    try:
        chain = await generate_quest_chain(request, initial_quest, user_api_key=user_api_key)

        # Yield each quest in the chain one by one
        for i, quest in enumerate(chain.chain):
            yield json.dumps(
                {
                    "event": "quest",
                    "index": i,
                    "total": len(chain.chain),
                    "data": quest.model_dump(),
                },
                ensure_ascii=False,
            )

        # Yield the chain narrative and completion event
        yield json.dumps(
            {
                "event": "complete",
                "data": {
                    "chain": [q.model_dump() for q in chain.chain],
                    "chain_narrative": chain.chain_narrative,
                },
            },
            ensure_ascii=False,
        )
    except Exception as e:
        logger.error(f"Quest chain generation stream error: {e}")
        yield json.dumps(
            {"event": "error", "data": str(e)}, ensure_ascii=False
        )


async def generate_continue_quest(request: ContinueQuestRequest, user_api_key: str | None = None) -> GeneratedQuest:
    """Generate a follow-up quest based on branch selection."""
    client = get_llm_client(user_api_key)
    user_prompt = _build_continue_user_prompt(request)

    response_text = await client.generate(
        system_prompt=CONTINUE_SYSTEM_PROMPT,
        user_prompt=user_prompt,
        response_format={"type": "json_object"},
    )

    quest_data = _extract_json(response_text)

    # If the response is a demo mock (doesn't reference the branch),
    # use the mock continue data instead
    if str(quest_data.get("quest_id", "")).startswith("demo_"):
        logger.info("LLM returned mock quest (demo mode). Using mock continue data.")
        quest_data = _get_mock_continue_quest(request)

    if "quest_id" not in quest_data or not quest_data["quest_id"]:
        quest_data["quest_id"] = f"continue_{uuid.uuid4().hex[:8]}"

    quest = GeneratedQuest(**quest_data)
    quest = check_balance(quest, request.context.game_state.player_level)
    quest = enhance_dialogue(quest, request.context.npc.personality)

    return quest
