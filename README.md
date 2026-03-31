# steel-wip-frontend

철강 잔재 재고 관리 시스템 프론트엔드 (React + JavaScript)

## 기술 스택

- **Framework**: React 18
- **번들러**: Vite
- **라우팅**: React Router v6
- **상태관리**: Zustand
- **HTTP 클라이언트**: Axios

## 화면 구성

| 경로 | 대상 | 설명 |
|---|---|---|
| `/office/dashboard` | 생산계획자 | 잔재 재고 현황 대시보드 |
| `/office/wips` | 생산계획자 | 잔재 목록 및 상세 조회 |
| `/office/work-order` | 생산계획자 | 작업지시서 import |
| `/office/scenario` | 생산계획자 | 알고리즘 결과 확인 |
| `/field/tasks` | 현장직 | 오늘의 작업 목록 |
| `/field/tasks/:id` | 현장직 | 작업 상세 지시 (피킹/적재) |
| `/field/complete` | 현장직 | 작업 완료 처리 |

## 로컬 실행 방법

```bash
# 1. 패키지 설치
npm install
npm install react-router-dom
npm install -D @vitejs/plugin-react

# 2. 환경변수 설정
cp .env.example .env
# .env 파일에 백엔드 주소 입력: VITE_API_BASE_URL=http://localhost:8000

# 3. 개발 서버 실행
npm run dev
```

## 브랜치 전략

```
main      ← 배포 브랜치 (hotfix/*, release/* 만 PR 허용)
  └── develop  ← 통합 개발 브랜치
        ├── feature/GP-123-office-wip-list
        ├── feature/GP-124-field-task-detail
        └── bugfix/GP-125-routing-fix
```

## PR 규칙

- PR 제목에 Jira 키 포함 필수 (예: `[FE][Feature] GP-123 잔재 목록 화면 구현`)
- 브랜치명 형식: `feature/GP-123-설명`
- `develop` 브랜치로만 PR 가능
