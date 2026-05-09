# 2026 여름 수련회 방탈출 웹 프로그램
# 기술 스택 문서 + AntiGravity 개발 지시 프롬프트 v1

## 0. 문서 목적

이 문서는 **2026 여름 수련회 방탈출 웹 프로그램**을 개발하기 위한 기술 스택, 개발 구조, 설치 절차, 폴더 구성, 단계별 구현 전략을 정리한 문서다.

현재 프로젝트는 일반적인 React 웹앱이라기보다 **2D 인터랙티브 스토리 게임**에 가깝다.
따라서 기술 선택 기준은 “서비스형 웹앱”이 아니라 다음 요소를 안정적으로 구현할 수 있는가에 둔다.

- 컷신형 장면 전환
- 미니멀 캐릭터 이동
- 배경 이미지 전환
- 문 / 길 / 불빛 / 폭풍 / 모닥불 연출
- BGM 및 효과음 타이밍
- 정답 입력 후 다음 장면 해금
- 힌트 사용
- 팀별 진행 상태 저장
- 운영자 페이지에서 강제 진행 / 상태 확인

---

## 1. 최종 추천 기술 스택

### 1-1. 메인 스택

```txt
Phaser 3 + TypeScript + Vite
```

Phaser 3는 이 프로젝트의 **메인 게임/연출 엔진**으로 사용한다.

담당 범위:

- 2D 장면 렌더링
- 캐릭터 스프라이트 배치
- 배경 이미지 배치
- 문 / 불빛 / 폭풍 / 모닥불 오브젝트 배치
- 컷신형 장면 전환
- Tween 애니메이션
- 카메라 줌 / 흔들림
- BGM / SFX 재생
- 정답 입력 타이밍 제어
- 최종 엔딩 연출

선택 이유:

이 프로젝트는 버튼과 폼 중심의 일반 웹앱이 아니라, 장면과 상호작용 중심의 게임형 웹 프로그램이다.
따라서 React 컴포넌트만으로 모든 장면 전환, 이미지 레이어, 오디오 타이밍을 관리하는 것보다 Phaser의 Scene, Sprite, Tween, Audio 구조가 더 적합하다.

---

### 1-2. 개발 언어

```txt
TypeScript
```

TypeScript는 시나리오 데이터, 스테이지 상태, 정답 목록, 힌트 정보, 장면 전환 조건 등을 타입 안정성 있게 관리하기 위해 사용한다.

예시 타입:

```ts
export type SceneStep = {
  id: string;
  backgroundKey: string;
  characterPose?: string;
  text?: string;
  nextTrigger: "click" | "answer" | "timer";
  answers?: string[];
  hintIds?: string[];
};
```

스토리 컷, 정답, 힌트, 배경 리소스가 늘어나면 JavaScript만으로는 관리가 어려워진다.
TypeScript를 사용하면 AI 코드 생성 과정에서도 구조가 덜 무너지고, 추후 유지보수가 쉬워진다.

---

### 1-3. 빌드 도구

```txt
Vite
```

Vite는 프론트엔드 개발 서버와 빌드 도구로 사용한다.

담당 범위:

- 빠른 로컬 개발 서버
- TypeScript 빌드
- Phaser 정적 리소스 서빙
- PNG / MP3 / JSON 에셋 관리
- 정적 배포 빌드

---

### 1-4. 선택적 연출 스택

```txt
Rive
```

Rive는 전체 장면이 아니라, 일부 핵심 캐릭터 애니메이션에만 선택적으로 사용한다.

추천 적용 장면:

- 걷기 루프
- 무너짐 → 고개 들기
- 모닥불 옆 앉기 / 담요 받기

주의:

Rive는 처음부터 필수로 넣지 않는다.
1차 MVP는 Phaser + PNG 스프라이트로 구현하고, 이후 캐릭터 애니메이션 퀄리티를 높일 때 일부 장면에만 도입한다.

```txt
Rive = 선택적 고도화 도구
```

---

### 1-5. 백엔드 스택

```txt
FastAPI
```

FastAPI는 게임 로직 자체가 아니라 **운영/저장/관리용 백엔드**로 사용한다.

담당 범위:

- 팀 생성
- 팀별 진행 상태 저장
- 정답 검증
- 힌트 사용 기록
- 완료 시간 저장
- 관리자 페이지 상태 조회
- 강제 스킵 / 강제 완료 처리

주의:

FastAPI는 컷신 애니메이션이나 장면 전환에 직접 개입하지 않는다.
게임 화면과 연출은 Phaser가 담당하고, FastAPI는 상태 저장과 운영 보조만 담당한다.

---

### 1-6. 저장소

초기 개발 단계에서는 다음 순서를 추천한다.

```txt
1차 MVP: localStorage
2차 운영 테스트: FastAPI + JSON 파일 저장
최종 운영: FastAPI + SQLite
```

추천 최종 저장 방식:

```txt
SQLite
```

저장할 데이터:

- team_id
- team_name
- current_stage
- current_cut
- used_hints
- wrong_attempts
- started_at
- completed_at
- final_time
- is_finished

---

## 2. 기술 역할 분리

### 2-1. 전체 구조

```txt
[Phaser 3 + TypeScript + Vite]
  - 실제 게임 화면
  - 컷신
  - 애니메이션
  - 이미지 레이어
  - 오디오
  - 퍼즐 입력 UI

[Rive]
  - 선택적 캐릭터 애니메이션
  - 걷기 / 무너짐 / 회복 / 앉기

[FastAPI]
  - 정답 검증
  - 팀 진행 저장
  - 힌트 사용 기록
  - 완료 시간 저장
  - 관리자 기능

[SQLite]
  - 팀 상태
  - 진행 기록
  - 완료 기록
```

### 2-2. 기술별 책임

| 기술 | 책임 |
|---|---|
| Phaser 3 | 게임 화면, 컷신, 장면 전환, 애니메이션, 오디오 |
| TypeScript | 타입 관리, 시나리오 데이터 안정성 |
| Vite | 개발 서버, 빌드, 정적 리소스 관리 |
| Rive | 일부 고급 캐릭터 애니메이션 |
| FastAPI | 팀 상태 저장, 정답 검증, 관리자 API |
| SQLite | 운영 기록 저장 |
| localStorage | 1차 MVP 임시 진행 저장 |

---

## 3. 단계별 개발 전략

### 3-1. 1단계: Phaser 단독 MVP

목표:

백엔드 없이 Phaser만으로 전체 스토리 흐름을 확인한다.

구현 범위:

- 컷 1~17 진행
- 배경 전환
- 캐릭터 배치
- 클릭으로 다음 컷 이동
- BGM 재생
- 간단한 페이드 효과
- localStorage에 현재 컷 저장

이 단계에서는 FastAPI와 Rive를 붙이지 않는다.

---

### 3-2. 2단계: 퍼즐 / 정답 입력 추가

목표:

특정 장면에서 정답 입력 UI를 띄우고, 정답이 맞으면 다음 장면으로 이동한다.

구현 범위:

- HTML input overlay 또는 Phaser DOM Element
- 정답 검증
- 오답 시 화면 흔들림 / 오류 문구
- 힌트 버튼
- 힌트 사용 기록 localStorage 저장

---

### 3-3. 3단계: FastAPI 추가

목표:

팀별 진행 상태와 정답 검증을 서버에 저장한다.

구현 범위:

- 팀 생성 API
- 팀 진행 조회 API
- 정답 제출 API
- 힌트 사용 API
- 완료 기록 API
- 관리자 강제 이동 API

---

### 3-4. 4단계: 관리자 페이지 추가

목표:

운영자가 각 팀의 진행 상태를 볼 수 있고, 현장 오류 시 강제 진행할 수 있게 만든다.

구현 범위:

- 팀별 현재 스테이지 조회
- 힌트 사용 횟수 조회
- 오답 횟수 조회
- 시작 시간 / 완료 시간 조회
- 강제 다음 스테이지
- 강제 완료
- 팀 상태 초기화

관리자 페이지는 Phaser가 아니라 일반 HTML/TypeScript 페이지로 만들어도 된다.

---

### 3-5. 5단계: Rive 일부 도입

목표:

PNG 시퀀스로 어색한 핵심 장면만 Rive 애니메이션으로 교체한다.

적용 후보:

- 캐릭터 걷기
- 무너짐에서 고개 들기
- 모닥불 옆 앉기
- 담요 받기

주의:

- 모든 장면을 Rive로 만들지 않는다.
- Rive는 연출 고도화용이다.
- Rive가 없어도 게임은 정상 작동해야 한다.

---

## 4. 추천 폴더 구조

### 4-1. 전체 구조

```txt
retreat-road-game/
  frontend/
  backend/
  docs/
  README.md
```

---

### 4-2. Frontend 구조

```txt
frontend/
  package.json
  tsconfig.json
  vite.config.ts
  index.html
  public/
    assets/
      images/
        backgrounds/
        characters/
        objects/
        overlays/
      audio/
        bgm/
        sfx/
      rive/
  src/
    main.ts
    game/
      config/
        gameConfig.ts
        assetKeys.ts
      scenes/
        BootScene.ts
        PreloadScene.ts
        TitleScene.ts
        RoadScene.ts
        DoorOneScene.ts
        DoorTwoScene.ts
        StormScene.ts
        CampfireScene.ts
        FinalQuestionScene.ts
      systems/
        ProgressManager.ts
        AudioManager.ts
        AnswerManager.ts
        HintManager.ts
        SceneFlowManager.ts
        RiveManager.ts
      data/
        scenario.ts
        answers.ts
        hints.ts
      ui/
        createInputOverlay.ts
        createHintButton.ts
        createSystemMessage.ts
      types/
        scenario.types.ts
        team.types.ts
      api/
        client.ts
        teamApi.ts
        answerApi.ts
        hintApi.ts
    admin/
      adminMain.ts
      adminApi.ts
      adminView.ts
    styles/
      global.css
```

---

### 4-3. Backend 구조

```txt
backend/
  pyproject.toml
  README.md
  app/
    main.py
    core/
      config.py
      database.py
    models/
      team.py
      progress.py
      hint.py
    schemas/
      team_schema.py
      answer_schema.py
      progress_schema.py
      admin_schema.py
    routes/
      teams.py
      answers.py
      hints.py
      admin.py
    services/
      team_service.py
      answer_service.py
      progress_service.py
      hint_service.py
    storage/
      game_state.sqlite
```

---

### 4-4. Docs 구조

```txt
docs/
  01_storyboard_scenario.md
  02_tech_stack.md
  03_asset_list.md
  04_api_contract.md
  05_operation_manual.md
```

---

## 5. 설치 명령어 초안

### 5-1. 프로젝트 루트 생성

```bash
mkdir retreat-road-game
cd retreat-road-game
mkdir frontend backend docs
```

---

### 5-2. Frontend 설치

```bash
cd frontend
npm create vite@latest . -- --template vanilla-ts
npm install phaser
npm install @rive-app/canvas
npm install axios
npm install -D vite-plugin-static-copy
```

선택 설치:

```bash
npm install gsap
```

---

### 5-3. Frontend 실행

```bash
npm run dev
```

---

### 5-4. Backend 설치

```bash
cd ../backend
python -m venv .venv
```

Windows PowerShell:

```powershell
.venv\Scripts\Activate.ps1
```

macOS / Linux:

```bash
source .venv/bin/activate
```

패키지 설치:

```bash
pip install fastapi uvicorn sqlalchemy pydantic-settings
```

---

### 5-5. Backend 실행

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---

## 6. API 초안

### 6-1. 팀 생성

```http
POST /api/teams
```

Request:

```json
{
  "team_name": "TEAM-A"
}
```

Response:

```json
{
  "team_id": "team-a",
  "team_name": "TEAM-A",
  "current_stage": "title",
  "current_cut": 1
}
```

---

### 6-2. 진행 상태 조회

```http
GET /api/teams/{team_id}/progress
```

Response:

```json
{
  "team_id": "team-a",
  "current_stage": "road",
  "current_cut": 5,
  "used_hints": [],
  "wrong_attempts": 0,
  "is_finished": false
}
```

---

### 6-3. 정답 제출

```http
POST /api/answers
```

Request:

```json
{
  "team_id": "team-a",
  "stage_id": "final-question",
  "answer": "그리스도"
}
```

Response:

```json
{
  "correct": true,
  "next_stage": "ending",
  "message": "Confession received."
}
```

---

### 6-4. 힌트 사용

```http
POST /api/hints/use
```

Request:

```json
{
  "team_id": "team-a",
  "hint_id": "final-path-hint-1"
}
```

Response:

```json
{
  "success": true,
  "hint_text": "그가 들어간 문이 아니라, 그가 지나온 방향을 기억하라."
}
```

---

### 6-5. 관리자 상태 조회

```http
GET /api/admin/teams
```

Response:

```json
[
  {
    "team_id": "team-a",
    "team_name": "TEAM-A",
    "current_stage": "storm",
    "current_cut": 12,
    "used_hint_count": 2,
    "wrong_attempts": 3,
    "is_finished": false
  }
]
```

---

### 6-6. 관리자 강제 진행

```http
POST /api/admin/teams/{team_id}/force-next
```

Response:

```json
{
  "success": true,
  "current_stage": "campfire",
  "current_cut": 16
}
```

---

## 7. 개발상 주의사항

### 7-1. Rive를 필수 의존성으로 만들지 말 것

Rive 파일이 없어도 PNG 스프라이트로 게임이 진행되어야 한다.

### 7-2. FastAPI가 죽어도 최소 진행 가능해야 함

현장 안정성을 위해 Phaser 쪽에는 localStorage 기반 fallback이 있어야 한다.

### 7-3. 모든 장면은 config-driven 구조로 만들 것

장면 정보를 코드에 하드코딩하지 말고 `scenario.ts` 또는 `scenario.json`에서 관리한다.

### 7-4. 에셋 교체가 쉬워야 함

AI 이미지가 계속 바뀔 수 있으므로 파일 경로와 asset key를 한 곳에서 관리한다.

### 7-5. 십자가 형태를 진행 중에 노출하지 말 것

경로 전체를 top-view로 보여주면 안 된다.
최종 퍼즐 전까지는 참가자가 길의 전체 모양을 알아차리면 안 된다.

### 7-6. 예수님 얼굴을 직접 묘사하지 말 것

엔딩 인물은 뒷모습, 실루엣, 손짓, 담요, 옆자리로만 표현한다.

---

# 8. AntiGravity 개발 지시 프롬프트

아래 프롬프트를 AntiGravity 또는 코드 생성 AI에게 그대로 전달하면 된다.

```txt
너는 TypeScript 게임 프론트엔드와 FastAPI 백엔드 구조를 설계하는 시니어 개발자다.

우리는 2026 여름 수련회 방탈출 웹 프로그램을 개발한다.
이 프로젝트는 일반 React 웹앱이 아니라 2D 인터랙티브 스토리 게임에 가깝다.

프로젝트명:
retreat-road-game

핵심 콘셉트:
THE ROAD : 길 위의 질문

주제:
Who do you say I am?

말씀:
마태복음 16:15-16

개발 목표:
Phaser 3 + TypeScript + Vite 기반의 2D 인터랙티브 스토리 게임 프론트엔드를 만든다.
FastAPI는 팀 진행 상태 저장, 정답 검증, 힌트 사용 기록, 관리자 기능을 담당한다.
Rive는 선택적 캐릭터 애니메이션 도구로만 사용하고, 1차 MVP에서는 PNG 스프라이트로 대체 가능해야 한다.

중요한 아키텍처 원칙:
1. Phaser가 게임 화면과 장면 전환의 중심이다.
2. TypeScript로 시나리오, 정답, 힌트, 에셋 타입을 명확히 관리한다.
3. Vite로 frontend 프로젝트를 구성한다.
4. FastAPI는 상태 저장과 운영 관리만 담당한다.
5. Rive는 필수가 아니라 선택적 고도화 도구다.
6. 모든 장면은 scenario.ts 또는 scenario.json 기반의 config-driven 구조로 만든다.
7. PNG 에셋을 쉽게 교체할 수 있게 assetKeys.ts에서 에셋 키를 관리한다.
8. 백엔드가 없어도 localStorage fallback으로 기본 진행이 가능해야 한다.
9. 관리자 페이지에서는 팀별 현재 상태, 힌트 사용 횟수, 오답 횟수, 강제 진행 기능을 제공한다.
10. 최종 관문 전까지 길의 전체 형태나 십자가 형태가 드러나면 안 된다.

기술 스택:
Frontend:
- Phaser 3
- TypeScript
- Vite
- @rive-app/canvas
- axios
- 선택: gsap

Backend:
- FastAPI
- Uvicorn
- SQLAlchemy
- SQLite
- pydantic-settings

작업 요청:
아래 폴더 구조를 생성하고, 실행 가능한 기본 프로젝트 뼈대를 만들어라.

루트 구조:
retreat-road-game/
  frontend/
  backend/
  docs/
  README.md

Frontend 구조:
frontend/
  package.json
  tsconfig.json
  vite.config.ts
  index.html
  public/
    assets/
      images/
        backgrounds/
        characters/
        objects/
        overlays/
      audio/
        bgm/
        sfx/
      rive/
  src/
    main.ts
    game/
      config/
        gameConfig.ts
        assetKeys.ts
      scenes/
        BootScene.ts
        PreloadScene.ts
        TitleScene.ts
        RoadScene.ts
        DoorOneScene.ts
        DoorTwoScene.ts
        StormScene.ts
        CampfireScene.ts
        FinalQuestionScene.ts
      systems/
        ProgressManager.ts
        AudioManager.ts
        AnswerManager.ts
        HintManager.ts
        SceneFlowManager.ts
        RiveManager.ts
      data/
        scenario.ts
        answers.ts
        hints.ts
      ui/
        createInputOverlay.ts
        createHintButton.ts
        createSystemMessage.ts
      types/
        scenario.types.ts
        team.types.ts
      api/
        client.ts
        teamApi.ts
        answerApi.ts
        hintApi.ts
    admin/
      adminMain.ts
      adminApi.ts
      adminView.ts
    styles/
      global.css

Backend 구조:
backend/
  pyproject.toml
  README.md
  app/
    main.py
    core/
      config.py
      database.py
    models/
      team.py
      progress.py
      hint.py
    schemas/
      team_schema.py
      answer_schema.py
      progress_schema.py
      admin_schema.py
    routes/
      teams.py
      answers.py
      hints.py
      admin.py
    services/
      team_service.py
      answer_service.py
      progress_service.py
      hint_service.py
    storage/
      game_state.sqlite

Docs 구조:
docs/
  01_storyboard_scenario.md
  02_tech_stack.md
  03_asset_list.md
  04_api_contract.md
  05_operation_manual.md

Frontend 초기 구현 요구사항:
1. Phaser 게임 인스턴스를 main.ts에서 생성한다.
2. BootScene, PreloadScene, TitleScene, RoadScene, StormScene, CampfireScene, FinalQuestionScene을 등록한다.
3. PreloadScene에서 기본 placeholder assets를 로드할 수 있게 assetKeys.ts 구조를 만든다.
4. scenario.ts에 컷 1~17의 기본 데이터를 넣는다.
5. RoadScene은 scenario.ts 데이터를 읽어 배경, 캐릭터 포즈, 텍스트를 순차적으로 보여준다.
6. 클릭하면 다음 컷으로 넘어가게 한다.
7. localStorage에 currentCut을 저장한다.
8. 특정 컷에서는 input overlay를 띄워 정답을 입력받을 수 있게 한다.
9. FinalQuestionScene에서는 “WHO DO YOU SAY I AM?” 또는 “너는 나를 누구라 하느냐?”를 출력하고 정답 “그리스도” 또는 “CHRIST”를 받는다.
10. 오디오 시스템은 AudioManager로 분리한다.
11. RiveManager는 빈 adapter 형태로 만들고, Rive 파일이 없어도 오류 없이 동작하게 한다.
12. FastAPI 연결은 api/client.ts에서 axios 인스턴스로 분리하고, 백엔드가 없으면 local fallback을 사용한다.

Backend 초기 구현 요구사항:
1. FastAPI 앱을 app/main.py에 생성한다.
2. CORS 설정을 추가한다.
3. SQLite 연결 구조를 만든다.
4. 팀 생성, 진행 상태 조회, 정답 제출, 힌트 사용, 관리자 상태 조회, 강제 진행 API를 만든다.
5. 초기에는 DB가 복잡하지 않아도 된다. SQLite 또는 메모리 저장소로 시작해도 된다.
6. 정답 검증은 answer_service.py로 분리한다.
7. 관리자 API는 admin.py에 분리한다.

설치 명령어도 README.md에 작성하라.

Frontend 설치:
cd frontend
npm create vite@latest . -- --template vanilla-ts
npm install phaser @rive-app/canvas axios
npm install -D vite-plugin-static-copy

Frontend 실행:
npm run dev

Backend 설치:
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install fastapi uvicorn sqlalchemy pydantic-settings

Backend 실행:
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

중요:
- React를 사용하지 않는다.
- Phaser 중심 구조로 만든다.
- 코드 생략하지 말고 실제 실행 가능한 파일을 만든다.
- placeholder 이미지가 없어도 에러가 나지 않도록 fallback graphics를 그려라.
- 모든 에셋 경로는 나중에 교체하기 쉽게 한 곳에서 관리하라.
- MVP를 먼저 만들고, Rive와 FastAPI 고도화는 나중에 붙일 수 있게 구조화하라.
```

---

# 9. AntiGravity 1차 MVP 전용 짧은 프롬프트

처음부터 전체를 만들라고 하면 복잡해질 수 있으므로, 1차로는 아래 짧은 프롬프트를 먼저 쓰는 것도 좋다.

```txt
Phaser 3 + TypeScript + Vite로 2D 인터랙티브 스토리 게임 MVP를 만들어줘.

React는 사용하지 않는다.

목표:
- Phaser 게임 인스턴스 생성
- BootScene, PreloadScene, TitleScene, RoadScene, StormScene, CampfireScene, FinalQuestionScene 생성
- scenario.ts에 컷 1~17 데이터 구성
- 클릭하면 다음 컷으로 이동
- 배경/캐릭터/텍스트를 컷별로 변경
- localStorage에 현재 컷 저장
- assetKeys.ts에서 이미지 키 관리
- 이미지 파일이 없어도 fallback graphics로 동작
- FinalQuestionScene에서 “WHO DO YOU SAY I AM?” 출력
- 정답은 “그리스도” 또는 “CHRIST”
- 정답 성공 시 엔딩 메시지 출력

폴더 구조는 다음으로 만들어줘:
frontend/
  src/
    main.ts
    game/
      config/
      scenes/
      systems/
      data/
      ui/
      types/
      api/
    styles/
  public/
    assets/
      images/
      audio/
      rive/

실행 가능한 코드로 작성하고, 설치/실행 방법을 README.md에 포함해줘.
```

---

# 10. 현재 최종 판단

이 프로젝트의 기술 방향은 다음이 가장 적합하다.

```txt
메인:
Phaser 3 + TypeScript + Vite

운영:
FastAPI + SQLite

선택 고도화:
Rive

1차 MVP:
Phaser 단독 + localStorage

2차:
정답/힌트/관리자 기능

3차:
FastAPI 연동

4차:
Rive 일부 도입
```

핵심은 처음부터 모든 기술을 완성형으로 엮는 것이 아니라, **Phaser 중심 MVP를 먼저 완성한 뒤 FastAPI와 Rive를 단계적으로 붙이는 것**이다.
