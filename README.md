# 📜 Procedural Quest Writer

> AI 퀘스트 체인 라이브 생성 데모 — NPC 설정과 세계관을 입력하면 AI가 게임 퀘스트를 실시간 생성합니다.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)
![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python)

## 🎮 라이브 데모

👉 [quest-writer.vercel.app](https://quest-writer.vercel.app) *(배포 시 업데이트)*

## ✨ 주요 기능

- **AI 퀘스트 생성**: NPC 성격, 세계관, 플레이어 상태를 반영한 퀘스트 자동 생성
- **실시간 스트리밍**: SSE를 통한 타이핑 효과로 퀘스트가 만들어지는 과정을 라이브 확인
- **분기 시스템**: 플레이어 선택에 따라 다른 후속 퀘스트 생성
- **퀘스트 체인**: 분기를 따라가며 연쇄 퀘스트 생성 + React Flow 노드 그래프 시각화
- **게임 UI**: RPG 게임의 퀘스트 로그를 모방한 다크 테마 인터페이스
- **프리셋 시나리오**: 5개의 프리셋으로 즉시 체험 (다크 판타지, 하이 판타지, SF, 무협, 코지 판타지)
- **JSON Export**: 생성된 퀘스트를 JSON으로 다운로드 — 게임 엔진에 바로 import 가능

## 🏗️ 시스템 아키텍처

```
┌──────────────────────────────────┐
│  React Frontend (Vercel)         │
│  ├─ SettingsPanel (NPC/세계관)   │
│  ├─ QuestViewer (게임 UI)        │
│  ├─ QuestChainFlow (React Flow)  │
│  └─ ShareExport (공유/내보내기)  │
└──────────┬───────────────────────┘
           │ REST API + SSE
           ▼
┌──────────────────────────────────┐
│  FastAPI Backend (Render)        │
│  ├─ Quest Generator (LLM)       │
│  ├─ Balance Checker              │
│  ├─ NPC Voice Generator          │
│  └─ Chain Generator              │
│                                  │
│  LLM: GPT-4o-mini / Claude Haiku│
└──────────────────────────────────┘
```

## 🛠️ 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | React 18, TypeScript, Vite, React Flow |
| Backend | FastAPI, Pydantic, SSE-Starlette |
| AI/LLM | OpenAI GPT-4o-mini (primary), Anthropic Claude Haiku (fallback) |
| Styling | Custom RPG Theme (CSS), Cinzel + Noto Sans KR |
| Deploy | Vercel (Frontend), Render/Railway (Backend) |

## 🚀 로컬 실행

### 사전 요구사항
- Node.js 18+
- Python 3.12+

### 백엔드
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env  # API 키 설정 (없으면 데모 모드로 동작)
uvicorn main:app --reload --port 8000
```

### 프론트엔드
```bash
cd frontend
npm install
npm run dev
```

→ http://localhost:5173 에서 확인

### 환경 변수

| 변수 | 설명 | 필수 |
|------|------|------|
| `OPENAI_API_KEY` | OpenAI API 키 (GPT-4o-mini) | 선택 (없으면 데모 모드) |
| `ANTHROPIC_API_KEY` | Anthropic API 키 (Claude Haiku, fallback) | 선택 |
| `VITE_API_BASE_URL` | 백엔드 API URL (프론트엔드) | 선택 (기본: http://localhost:8000) |

## 📡 API 엔드포인트

| Method | Path | 설명 |
|--------|------|------|
| POST | `/api/quest/generate` | 단일 퀘스트 생성 |
| POST | `/api/quest/generate/stream` | SSE 스트리밍 퀘스트 생성 |
| POST | `/api/quest/continue` | 분기 선택 후 후속 퀘스트 생성 |
| POST | `/api/quest/chain` | 연쇄 퀘스트 체인 생성 (최대 5개) |
| POST | `/api/quest/chain/stream` | SSE 스트리밍 체인 생성 |
| GET | `/api/quest/presets` | 프리셋 시나리오 목록 |

## 🎯 퀘스트 데이터 구조

```json
{
  "quest_id": "winter_market_01",
  "title": "겨울 시장의 비밀 거래",
  "description": "리라가 겨울 시장에서 수상한 거래를 목격했다...",
  "type": "main",
  "difficulty": "normal",
  "objectives": [
    { "type": "investigate", "target": "겨울 시장 NPC 3명", "count": 3 },
    { "type": "fetch", "target": "수상한 물건", "count": 1 }
  ],
  "branches": [
    { "label": "신고하기", "consequence": "마을 평판 +10, 상인 호감도 -5" },
    { "label": "거래에 참여하기", "consequence": "골드 +500, 암시장 접근 가능" }
  ],
  "rewards": { "gold": 800, "exp": 400, "items": ["희귀 방한 장비"] },
  "dialogue": {
    "on_offer": "이봐, 겨울 시장에서 수상한 거래가 있대...",
    "on_complete": "역시 네가 해낼 줄 알았어! 고마워!"
  }
}
```

## 🎮 게임 연동

이 퀘스트 생성 엔진은 현재 개발 중인 게임 프로젝트와 직접 연동됩니다:

- **[Abyssal Descent](https://github.com/)** — 3D 던전 크롤러 · 동적 퀘스트 생성
- **[Sunhaven Fields](https://github.com/)** — 3D 농장 시뮬레이션 · NPC 호감도 기반 퀘스트

게임 내에서 NPC 호감도, 계절, 플레이어 상태에 따라 동적으로 퀘스트가 생성됩니다.
생성된 JSON은 게임 엔진에서 바로 import하여 사용할 수 있는 구조입니다.

| 프로젝트 | 역할 |
|----------|------|
| **Procedural Quest Writer** (이 프로젝트) | "이렇게 동작합니다" — 라이브 데모 |
| **Game Content Pipeline** | "이런 기술로 만들었습니다" — 백엔드 엔진 |
| **Abyssal Descent / Sunhaven Fields** | "실제 게임에서 이렇게 쓰입니다" — 게임 적용 |

## 📁 프로젝트 구조

```
procedural-quest-writer/
├── frontend/                      ← React + TypeScript + Vite
│   └── src/
│       ├── components/            ← UI 컴포넌트
│       ├── hooks/                 ← 커스텀 훅 (SSE, 체인 관리)
│       ├── types/                 ← TypeScript 타입
│       └── styles/                ← RPG 테마 CSS
├── backend/                       ← FastAPI + Python
│   ├── routers/                   ← API 라우터
│   ├── services/                  ← 비즈니스 로직 (LLM, 밸런스)
│   ├── schemas/                   ← Pydantic 모델
│   └── data/                      ← 프리셋, 밸런스 테이블
└── README.md
```

## 📄 License

MIT

---

*Procedural Quest Writer · "5분 안에 AI 게임 콘텐츠 생성을 체험하는 라이브 데모"*
