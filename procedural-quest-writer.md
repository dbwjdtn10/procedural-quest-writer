# 📜 Procedural Quest Writer — 프로젝트 기획서

> AI 퀘스트 체인 라이브 생성 데모 · 웹에서 바로 체험 가능
> React (프론트) + FastAPI (백엔드) + LLM · 바이브코딩 프로젝트

---

## 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 목표 | 면접관이 링크 하나로 바로 체험하는 AI 퀘스트 생성 데모 |
| 컨셉 | NPC 설정 + 세계관 입력 → AI가 퀘스트 체인을 라이브 생성 → 게임 UI처럼 표시 |
| 기술 스택 | React + TypeScript (프론트) / FastAPI + LLM (백엔드) |
| 배포 | Vercel (프론트) + Railway 또는 Render (백엔드) |
| 예상 기간 | 1~2주 |
| 포트폴리오 임팩트 | ★★★★☆ (작지만 체험형 → 면접에서 즉시 시연 가능) |

---

## 왜 이 프로젝트인가

기존 Game Content Pipeline과 NPC Dialogue Engine은 **개발자용 도구**입니다.
Streamlit 대시보드나 API 문서로 보여줄 수 있지만, **비개발자(면접관, PM, 기획자)**에게
"이 사람이 AI로 뭘 할 수 있는지" 직관적으로 보여주기 어려워요.

이 프로젝트는 **5분 안에 "와, 이거 게임에 쓸 수 있겠다"** 라는 반응을 끌어내는 데모입니다.

| 기존 프로젝트 | 이 프로젝트 |
|--------------|-----------|
| API 문서 + Streamlit | 게임 같은 UI에서 직접 체험 |
| "콘텐츠 파이프라인 만들었습니다" | "이렇게 동작합니다, 해보세요" (링크 전달) |
| 기술 설명 필요 | 시각적으로 바로 이해 |

---

## 핵심 기능 흐름

```
1. 설정 입력 (좌측 패널)
   ┌─────────────────────────┐
   │ NPC 이름: 리라           │
   │ NPC 성격: 쾌활한 상인    │
   │ 세계관: 다크 판타지      │
   │ 현재 계절: 겨울          │
   │ 플레이어 레벨: 12        │
   │ 호감도: 높음             │
   │                         │
   │ [🎲 퀘스트 생성]         │
   └─────────────────────────┘

2. AI가 실시간 생성 (스트리밍)
   ┌─────────────────────────┐
   │  ⏳ 퀘스트 생성 중...     │
   │  ▓▓▓▓▓▓░░░░ 60%        │
   └─────────────────────────┘

3. 게임 UI로 표시 (우측 패널)
   ┌─────────────────────────┐
   │ 📜 메인 퀘스트           │
   │ "겨울 시장의 비밀 거래"   │
   │                         │
   │ 리라:                    │
   │ "이봐, 겨울 시장에서     │
   │  수상한 거래가 있대..."  │
   │                         │
   │ 목표:                    │
   │ ☐ 겨울 시장 NPC 3명 조사│
   │ ☐ 수상한 물건 입수       │
   │ → 분기: 신고 or 거래 참여│
   │                         │
   │ 보상: 골드 800, 희귀 방한│
   │ 장비, 호감도 +15        │
   │                         │
   │ [📎 JSON 보기]           │
   │ [🔄 재생성]              │
   │ [➡️ 후속 퀘스트 생성]     │
   └─────────────────────────┘

4. 퀘스트 체인 시각화 (하단)
   ┌─────────────────────────────────────────┐
   │  [시작] → [조사] → ┬→ [신고 루트]       │
   │                    └→ [거래 루트]        │
   │                         ↓               │
   │                    [후속 퀘스트]          │
   └─────────────────────────────────────────┘
```

---

## 시스템 아키텍처

```
┌──────────────────────────────────────┐
│  React Frontend (Vercel)             │
│                                      │
│  ┌────────────┐  ┌───────────────┐   │
│  │ 설정 패널   │  │ 퀘스트 뷰어  │   │
│  │ NPC/세계관  │  │ 게임 UI 스타일│  │
│  │ 입력 폼    │  │ 스트리밍 표시 │   │
│  └─────┬──────┘  └───────────────┘   │
│        │         ┌───────────────┐   │
│        │         │ 체인 시각화   │   │
│        │         │ 플로우 차트   │   │
│        │         └───────────────┘   │
└────────┼─────────────────────────────┘
         │ REST API + SSE (스트리밍)
         ▼
┌──────────────────────────────────────┐
│  FastAPI Backend (Railway/Render)    │
│                                      │
│  ┌──────────────────────────────┐    │
│  │ Quest Generator              │    │
│  │ - Pydantic 스키마 검증       │    │
│  │ - 밸런스 체커 (기존 재사용)  │    │
│  │ - 분기 로직 생성             │    │
│  │ - 체인 연결 (이전 퀘스트 참조)│   │
│  └──────────────────────────────┘    │
│                                      │
│  ┌──────────────────────────────┐    │
│  │ NPC Voice Generator          │    │
│  │ - 페르소나별 말투 생성       │    │
│  │ - 감정 상태 반영             │    │
│  │ - 세계관 일관성 검증         │    │
│  └──────────────────────────────┘    │
│                                      │
│  LLM: GPT-4o-mini (비용 효율)       │
│  Fallback: Claude Haiku             │
└──────────────────────────────────────┘
```

---

## Phase 1: 핵심 — 단일 퀘스트 생성 (3~5일)

### 목표
NPC 설정을 입력하면 AI가 퀘스트 1개를 생성하고, 게임 UI처럼 표시

### 백엔드 구현

**퀘스트 생성 API**
- `POST /api/quest/generate` — 단일 퀘스트 생성
- `POST /api/quest/generate/stream` — SSE 스트리밍 생성

**Pydantic 퀘스트 스키마**
```python
class QuestObjective(BaseModel):
    type: Literal["kill", "fetch", "talk", "explore", "escort", "craft", "investigate"]
    target: str
    count: int = 1
    location: str | None = None
    hint: str | None = None

class QuestBranch(BaseModel):
    condition: str           # "player_chooses_report" / "player_chooses_trade"
    label: str               # "신고하기" / "거래에 참여하기"
    next_quest_seed: str     # 후속 퀘스트 생성 시드
    consequence: str         # "마을 평판 +10, 상인 호감도 -5"

class QuestReward(BaseModel):
    gold: int
    exp: int
    items: list[str]
    affinity_change: int
    unlock: str | None = None  # "new_shop_inventory" 등

class QuestDialogue(BaseModel):
    on_offer: str            # 퀘스트 제안 시 NPC 대사
    on_accept: str           # 수락 시
    on_progress: str         # 진행 중 대화
    on_complete: str         # 완료 시
    on_reject: str | None    # 거절 시 (선택)

class GeneratedQuest(BaseModel):
    quest_id: str
    title: str
    description: str
    type: Literal["main", "side", "daily", "hidden"]
    difficulty: Literal["easy", "normal", "hard", "legendary"]
    estimated_time: str      # "15분", "30분" 등
    prerequisites: list[str] # 선행 퀘스트 ID
    objectives: list[QuestObjective]
    branches: list[QuestBranch] | None  # 분기가 있는 경우
    rewards: QuestReward
    dialogue: QuestDialogue
    lore_connection: str     # 세계관과의 연결점
    design_notes: str        # AI가 왜 이렇게 설계했는지 설명
```

**생성 프롬프트 구조**
```python
QUEST_SYSTEM_PROMPT = """
당신은 숙련된 게임 퀘스트 디자이너입니다.
주어진 NPC와 세계관 설정에 맞는 퀘스트를 설계하세요.

설계 원칙:
1. NPC 성격이 퀘스트 동기와 대사에 반영되어야 함
2. 세계관 설정과 현재 계절/상황이 퀘스트 배경에 녹아들어야 함
3. 플레이어 레벨에 맞는 난이도와 보상 밸런스
4. 호감도 수준에 따라 퀘스트 깊이가 달라짐:
   - 낮음: 단순 심부름
   - 보통: 스토리가 있는 의뢰
   - 높음: NPC 개인 스토리 관련 깊은 퀘스트
5. 가능하면 플레이어 선택이 결과를 바꾸는 분기 포함
6. NPC 말투는 성격 설정을 충실히 반영

반드시 주어진 JSON 스키마를 따라 응답하세요.
"""
```

**밸런스 검증 (기존 Content Pipeline 재사용)**
- 골드 보상: 레벨 × 기본값 ± 20% 범위 내
- 경험치: 난이도별 테이블 참조
- 아이템: 레어리티가 난이도와 일치
- 시간 대비 보상 효율 체크

### 프론트엔드 구현

**설정 입력 패널**
- NPC 설정
  - 이름 (텍스트)
  - 성격 (드롭다운 + 커스텀: 쾌활, 과묵, 신비로운, 거칠은, 다정한, 직접 입력)
  - 직업 (드롭다운: 상인, 대장장이, 마법사, 모험가, 사제, 농부, 도적, 직접 입력)
- 세계관
  - 장르 (드롭다운: 하이 판타지, 다크 판타지, SF, 포스트아포칼립스, 무협, 직접 입력)
  - 현재 계절/상황 (텍스트)
  - 특이사항 (텍스트, 선택)
- 게임 상태
  - 플레이어 레벨 (슬라이더: 1~50)
  - NPC 호감도 (슬라이더: 낮음/보통/높음/최대)
  - 퀘스트 타입 (드롭다운: 메인/사이드/일일/히든)

**퀘스트 뷰어 (게임 UI 스타일)**
- RPG 게임의 퀘스트 로그 UI를 모방
- 다크 테마 + 양피지 텍스처
- NPC 대사: 말풍선 스타일, 캐릭터 아이콘 (생성된 이니셜 아바타)
- 목표 리스트: 체크박스 스타일
- 보상: 아이콘 + 수치
- 분기: 선택지 버튼 (클릭하면 해당 루트의 후속 퀘스트 생성)
- SSE 스트리밍: 생성되는 동안 텍스트가 타이핑 효과로 표시

**JSON 뷰어 (개발자 모드)**
- 토글로 원본 JSON 확인
- Pydantic 스키마 구조 설명
- "이 데이터를 게임 엔진에서 이렇게 쓸 수 있습니다" 가이드

### 마일스톤
> NPC "리라" + 다크판타지 + 겨울 + 레벨12 입력 → AI가 퀘스트 생성 → 게임 UI로 표시

---

## Phase 2: 퀘스트 체인 + 분기 시각화 (3~5일)

### 목표
퀘스트 분기를 따라가며 체인을 만들고, 플로우 차트로 시각화

### 구현 항목

**퀘스트 체인 생성**
- `POST /api/quest/chain` — 연쇄 퀘스트 생성 (최대 5개)
- 이전 퀘스트의 결과가 다음 퀘스트에 영향
- 분기 선택 시 다른 루트의 퀘스트 생성

```json
// 체인 생성 요청
{
  "initial_quest_id": "winter_market_01",
  "branch_chosen": "player_chooses_trade",  // 거래 루트 선택
  "chain_length": 3,
  "context": {
    "npc": { ... },
    "world": { ... },
    "previous_outcomes": ["joined_secret_trade"]
  }
}

// 응답: 퀘스트 체인
{
  "chain": [
    {
      "quest_id": "winter_market_02_trade",
      "title": "밀수품 중개인",
      "connects_from": "winter_market_01",
      "branch_context": "거래에 참여하기로 한 플레이어에게...",
      ...
    },
    {
      "quest_id": "winter_market_03_trade",
      "title": "암시장의 보스",
      "connects_from": "winter_market_02_trade",
      ...
    }
  ],
  "chain_narrative": "리라의 제안을 수락한 뒤, 점점 깊은 암시장 세계로 빠져드는 스토리..."
}
```

**플로우 차트 시각화**
- React Flow 또는 D3.js로 퀘스트 체인을 노드 그래프로 표시
- 노드: 각 퀘스트 (클릭하면 상세 보기)
- 엣지: 연결 관계 + 분기 조건
- 색상: 메인(금색), 사이드(은색), 분기(빨강/파랑)
- 미탐험 분기: 점선으로 표시 ("이 선택을 했다면?")

**프리셋 시나리오 (빠른 체험용)**
| 시나리오 | NPC | 세계관 | 상황 |
|----------|-----|--------|------|
| 겨울 시장의 비밀 | 리라 (상인) | 다크 판타지 | 겨울, 의문의 거래 |
| 용의 둥지 | 카이른 (기사) | 하이 판타지 | 여름, 드래곤 출현 |
| 폐허의 신호 | 엘라 (과학자) | SF | 포스트아포칼립스, 미지 신호 |
| 강호의 원한 | 백무명 (검객) | 무협 | 가을, 문파 분쟁 |
| 수확제 소동 | 미나 (농부) | 코지 판타지 | 가을 축제, 도난 사건 |

### 마일스톤
> 프리셋 "겨울 시장" 클릭 → 퀘스트 생성 → "거래 참여" 분기 클릭 → 후속 퀘스트 체인 자동 생성 → 플로우 차트 시각화

---

## Phase 3: 폴리싱 + 배포 (2~3일)

### 구현 항목

**UI 폴리싱**
- RPG 게임 감성 UI (다크 테마, 골드 포인트 컬러, 판타지 폰트)
- 반응형 디자인 (모바일에서도 확인 가능)
- 로딩 애니메이션 (마법진 회전 또는 두루마리 펼치는 효과)
- 생성 히스토리 (이전에 만든 퀘스트 목록)

**공유 기능**
- "이 퀘스트 공유하기" 링크 생성
- 퀘스트 JSON 다운로드 (게임에서 바로 사용 가능)
- 퀘스트 이미지 export (SNS 공유용)

**배포**
- 프론트: Vercel (GitHub 연동 자동 배포)
- 백엔드: Railway 또는 Render (Docker)
- 도메인: quest-writer.vercel.app 또는 커스텀

**README / 포트폴리오 패키지**
- 라이브 데모 링크
- 아키텍처 다이어그램
- 기술 스택 설명
- "이 기술을 실제 게임에 어떻게 적용하나" 연결 (→ Abyssal Descent, Sunhaven Fields)
- GIF: 퀘스트 생성 → 분기 선택 → 체인 시각화 과정

---

## 프로젝트 구조

```
procedural-quest-writer/
├── frontend/                      ← React + TypeScript
│   ├── src/
│   │   ├── components/
│   │   │   ├── SettingsPanel.tsx   ← NPC/세계관 설정 입력
│   │   │   ├── QuestViewer.tsx     ← 게임 UI 스타일 퀘스트 표시
│   │   │   ├── QuestChainFlow.tsx  ← 플로우 차트 시각화
│   │   │   ├── JsonViewer.tsx      ← 개발자 모드 JSON 표시
│   │   │   ├── NpcAvatar.tsx       ← NPC 아바타 (이니셜 기반)
│   │   │   ├── StreamingText.tsx   ← 타이핑 효과 텍스트
│   │   │   └── PresetSelector.tsx  ← 프리셋 시나리오 선택
│   │   ├── hooks/
│   │   │   ├── useQuestGeneration.ts  ← SSE 스트리밍 훅
│   │   │   └── useQuestChain.ts       ← 체인 관리 상태
│   │   ├── types/
│   │   │   └── quest.ts           ← TypeScript 타입 (Pydantic 미러)
│   │   ├── styles/
│   │   │   └── rpg-theme.css      ← RPG 감성 테마
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                       ← FastAPI
│   ├── main.py
│   ├── routers/
│   │   ├── quest.py               ← 퀘스트 생성 API
│   │   └── chain.py               ← 체인 생성 API
│   ├── services/
│   │   ├── quest_generator.py     ← LLM 퀘스트 생성
│   │   ├── balance_checker.py     ← 밸런스 검증
│   │   ├── npc_voice.py           ← NPC 말투 생성
│   │   └── llm_client.py          ← LLM API 래퍼 (폴백 포함)
│   ├── schemas/
│   │   ├── quest.py               ← Pydantic 모델
│   │   └── request.py             ← 요청 스키마
│   ├── data/
│   │   ├── presets.json           ← 프리셋 시나리오
│   │   └── balance_tables.json    ← 밸런스 테이블
│   ├── Dockerfile
│   └── requirements.txt
│
└── README.md
```

---

## 바이브코딩 프롬프트 가이드

### Phase 1 프론트
```
"React + TypeScript + Vite로 RPG 게임 감성의 퀘스트 생성 데모 페이지를 만들어줘.
좌측에 NPC 설정 입력 (이름, 성격, 직업, 세계관, 레벨, 호감도),
우측에 게임 퀘스트 로그 스타일로 결과를 표시.
다크 테마 + 골드 포인트 컬러. SSE로 스트리밍 받아서 타이핑 효과로 텍스트 표시."
```

### Phase 1 백엔드
```
"FastAPI로 퀘스트 생성 API를 만들어줘.
POST /api/quest/generate: NPC 설정과 세계관을 받아서 GPT-4o-mini로 퀘스트 생성.
Pydantic으로 퀘스트 스키마 검증 (title, objectives, branches, rewards, dialogue).
POST /api/quest/generate/stream: SSE 스트리밍으로 생성 과정을 실시간 전달.
밸런스 체크: 레벨 대비 보상이 적절한지 검증."
```

### Phase 2 체인
```
"이전에 만든 퀘스트의 분기를 클릭하면 후속 퀘스트를 AI가 생성하는 기능 추가해줘.
React Flow로 퀘스트 체인을 노드 그래프로 시각화하고,
각 노드 클릭하면 퀘스트 상세 보기. 미탐험 분기는 점선으로 표시."
```

---

## Sunhaven Fields / Abyssal Descent와의 연결고리

이 데모에서 생성한 퀘스트 JSON은 그대로 게임에 import 가능한 구조입니다.
README에 이렇게 적을 수 있어요:

> "이 퀘스트 생성 엔진은 현재 개발 중인 Abyssal Descent (3D 던전 크롤러)와
> Sunhaven Fields (3D 농장 시뮬레이션)의 퀘스트 시스템에 직접 연동됩니다.
> 게임 내에서 NPC 호감도, 계절, 플레이어 상태에 따라 동적으로 퀘스트가 생성됩니다."

이렇게 하면 3개 프로젝트가 하나의 스토리로 연결됩니다:
- **데모(이 프로젝트)** → "이렇게 동작합니다"
- **엔진(기존 Content Pipeline)** → "이런 기술로 만들었습니다"
- **게임(Abyssal Descent)** → "실제 게임에서 이렇게 쓰입니다"

---

*Procedural Quest Writer · React + FastAPI + LLM*
*컨셉: "5분 안에 AI 게임 콘텐츠 생성을 체험하는 라이브 데모"*
