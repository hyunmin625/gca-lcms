# CodeNova — LCMS 프로젝트 계획

## 프로젝트 개요
코딩 온라인교육을 위한 **LCMS(Learning Content Management System)**.
Python 등 프로그래밍 언어 강의를 체계적으로 **제작·관리(CMS)** 하고, 수강생에게 **전달·추적·평가(LMS)** 하는 통합 플랫폼입니다.

> **LMS** = 학습 전달·수강 관리·진행률 추적·평가
> **LCMS** = LMS + 콘텐츠 저작·편집·버전 관리·에셋 관리·승인 워크플로우

---

## 목표 기능

### 콘텐츠 관리 (CMS — "C" in LCMS)
- 코스/레슨 CRUD (관리자 저작 도구)
- 커리큘럼 구조 편집 (섹션 순서, 레슨 순서 드래그)
- 미디어 에셋 관리 (썸네일, 첨부파일 — Supabase Storage)
- 콘텐츠 상태 관리 (초안 → 검토 → 게시)
- 콘텐츠 버전 이력

### 학습 관리 (LMS)
- 강의 영상 스트리밍 (YouTube 임베딩)
- 커리큘럼별 영상 목록 / 코스 카탈로그
- 수강 등록 및 수강권 관리
- 수강 진행률 추적 (Supabase 저장)
- 퀴즈 / 코딩 실습 평가
- 수료증 자동 발급
- 학습 경로(Learning Path) 설정

### 사용자·결제
- 회원가입 / 로그인 (이메일 + Google OAuth)
- 유료 강의 결제 (토스페이먼츠)
- 마이페이지 (수강 현황, 결제 내역, 수료증)

### 관리자 대시보드
- 회원 관리 / 수강생 모니터링
- 코스·레슨 관리 (저작 도구)
- 매출·결제 현황
- 학습 통계 리포팅

---

## 현재 기술 스택

| 역할 | 선택 | 이유 |
|------|------|------|
| 프레임워크 | **Next.js 16 (App Router)** | SSR/SSG, API Routes 내장, SEO 유리 |
| 호스팅 | **Vercel** | Next.js 최적화, 무료 플랜 |
| DB + Auth + Storage | **Supabase** | PostgreSQL, 인증 내장, 무료 500MB |
| 결제 (예정) | 토스페이먼츠 | 국내 간편결제, 연동 쉬움 |
| CDN (대규모 시) | Cloudflare | 무제한 대역폭 |

---

## 최종 목표 아키텍처

```
[수강생]                              [관리자/강사]
    │                                       │
    ▼                                       ▼
[Vercel — Next.js App Router]
    │
    ├── 공개 영역
    │   ├── /                  랜딩페이지 (SSG)
    │   ├── /courses           코스 카탈로그
    │   ├── /courses/:id       코스 상세 / 소개
    │   └── /auth/*            로그인 · 회원가입
    │
    ├── 수강생 영역 (LMS)
    │   ├── /classroom/:id     강의실 (영상 + 진행률)
    │   ├── /dashboard         마이페이지 (수강 현황 · 수료증)
    │   └── /quiz/:id          퀴즈 · 평가
    │
    └── 관리자 영역 (CMS + 대시보드)
        ├── /admin             통계 대시보드
        ├── /admin/courses     코스 관리 (CRUD)
        ├── /admin/lessons     레슨 관리 (저작 도구)
        ├── /admin/users       회원 관리
        └── /admin/payments    결제 · 매출 현황
              │
              ├── [Supabase]
              │     ├── PostgreSQL DB
              │     │     ├── profiles       (회원 프로필 · 역할)
              │     │     ├── courses        (코스 메타 · 상태)
              │     │     ├── sections       (코스 내 섹션)
              │     │     ├── lessons        (레슨 · 영상 · 첨부)
              │     │     ├── enrollments    (수강 등록)
              │     │     ├── progress       (레슨별 진행률)
              │     │     ├── quizzes        (퀴즈 문제)
              │     │     ├── quiz_attempts  (퀴즈 응시 기록)
              │     │     ├── certificates   (수료증)
              │     │     └── payments       (결제 내역)
              │     ├── Auth (이메일 + Google OAuth · 역할 기반)
              │     └── Storage (썸네일 · 첨부파일 · 수료증 PDF)
              │
              └── [토스페이먼츠]
                    ├── 결제 요청
                    ├── 웹훅 → 수강권 자동 발급
                    └── 환불 처리
```

---

## 단계별 계획

### 1단계 — MVP 기반 구축 ✅ (거의 완료)
**목표**: Next.js + Supabase 연동, 인증, 기본 강의실 동작

- [x] 랜딩 페이지 Next.js 변환
- [x] 강의실 페이지 Next.js 변환 (로컬 진행률)
- [x] Next.js 프로젝트 생성 (TypeScript + App Router)
- [x] Supabase 클라이언트 설정 (`lib/supabase.ts`)
- [x] DB 스키마 초안 (profiles, progress)
- [x] Git 저장소 초기화 + GitHub push
- [x] Supabase 프로젝트 실제 연동 확인
  - [x] DB 스키마 적용 (profiles, progress)
  - [x] 회원가입 / 로그인 동작 확인 (이메일)
  - [ ] Google OAuth 설정 (Google Cloud Console 설정 필요)
  - [x] 로그인 상태에서 진행률 Supabase 저장 확인
- [ ] Vercel 배포 (첫 배포)

**스택**: Next.js 16 / Vercel / Supabase (무료)

---

### 2단계 — LMS 핵심 (코스 구조화 + 수강 관리) ✅
**목표**: 하드코딩된 커리큘럼을 DB 기반으로 전환, 수강 등록 체계 확립

- [x] DB 스키마 확장 (courses, sections, lessons, enrollments)
- [x] 코스 카탈로그 페이지 (`/courses`)
- [x] 코스 상세 / 소개 페이지 (`/courses/[slug]`)
- [x] 수강 등록 플로우 (무료 코스 → 즉시 등록)
- [x] 강의실 DB 연동 (하드코딩 제거 → Supabase 조회)
- [x] 마이페이지 (`/dashboard` — 수강 목록, 진행률)
- [x] 역할 기반 접근 제어 (student / admin)
- [x] 공통 Nav 컴포넌트 (로그인 상태 유지, 프로필 드롭다운)

---

### 3단계 — CMS (콘텐츠 저작 도구) ✅
**목표**: 관리자가 코드 수정 없이 코스/레슨을 생성·편집·게시

- [x] 관리자 레이아웃 (`/admin/*` + 역할 기반 접근 제어)
- [x] 관리자 대시보드 (코스/레슨/회원/수강 통계)
- [x] 코스 관리 CRUD (`/admin/courses` — 생성/수정/삭제/상태 토글)
- [x] 섹션·레슨 관리 (추가/수정/삭제/순서 변경)
- [x] 레슨 편집기 (YouTube URL, 설명, 재생시간)
- [x] 콘텐츠 상태 관리 (초안 ↔ 게시)
- [ ] 미디어 에셋 관리 (Supabase Storage — 썸네일, 첨부) → 추후
- [x] 회원 관리 (목록, 역할 변경, 수강 현황)

---

### 4단계 — 유료 강의 + 결제
**목표**: 유료 강의 판매 시작

- [ ] 토스페이먼츠 결제 연동
- [ ] 유료 코스 접근 제어 (수강권 확인 미들웨어)
- [ ] 결제 웹훅 → 수강권 자동 발급
- [ ] 결제 내역 관리 (마이페이지 + 관리자)
- [ ] 환불 처리

---

### 5단계 — 평가 + 수료
**목표**: 학습 성과 측정 및 수료 인증

- [ ] 퀴즈 시스템 (객관식, 코드 빈칸 채우기)
- [ ] 퀴즈 결과 기록 및 재응시
- [ ] 코스 수료 조건 설정 (진행률 + 퀴즈 점수)
- [ ] 수료증 자동 생성 (PDF)
- [ ] 학습 경로(Learning Path) — 여러 코스 묶음

---

### 6단계 — 운영 고도화
**목표**: 통계·알림·확장성

- [ ] 관리자 통계 대시보드 (매출, 수강 통계, 완료율)
- [ ] 이메일 알림 (수강 완료, 결제 확인)
- [ ] Cloudflare CDN
- [ ] Supabase Pro 업그레이드
- [ ] 모니터링 (Sentry, Vercel Analytics)

---

## 파일 구조 (목표)

```
gca_lcms/
├── PROJECT_PLAN.md
├── CLAUDE.md
└── codenova/                       ← Next.js 프로젝트 (메인)
    ├── package.json
    ├── next.config.ts
    ├── .env.local.example
    ├── supabase/
    │   └── schema.sql              ← 전체 DB 스키마
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx                ← 랜딩 페이지
    │   ├── globals.css
    │   ├── courses/
    │   │   ├── page.tsx            ← 코스 카탈로그
    │   │   └── [id]/page.tsx       ← 코스 상세
    │   ├── classroom/
    │   │   └── [id]/page.tsx       ← 강의실 (코스별)
    │   ├── dashboard/
    │   │   └── page.tsx            ← 마이페이지
    │   ├── quiz/
    │   │   └── [id]/page.tsx       ← 퀴즈
    │   ├── auth/
    │   │   ├── login/page.tsx
    │   │   └── signup/page.tsx
    │   └── admin/
    │       ├── page.tsx            ← 관리자 대시보드
    │       ├── courses/page.tsx    ← 코스 관리
    │       ├── lessons/page.tsx    ← 레슨 관리
    │       ├── users/page.tsx      ← 회원 관리
    │       └── payments/page.tsx   ← 결제 관리
    ├── components/
    │   ├── Nav.tsx
    │   └── ...
    └── lib/
        └── supabase.ts
```

## 참고 사항
- Netlify 고유 기능 사용하지 않음 (처음부터 Vercel)
- Supabase 무료 플랜: 비활성 7일 후 일시 중지 → MVP 초기에는 감수, 유저 확보 후 Pro 업그레이드
- LCMS 특성상 관리자 저작 도구 품질이 핵심 — 3단계(CMS)에서 충분히 시간 투자
