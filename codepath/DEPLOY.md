# 배포 가이드 — Vercel + Supabase

## 1. Supabase 설정

1. [supabase.com](https://supabase.com) → New Project 생성
2. **SQL Editor**에서 `supabase/schema.sql` 내용 실행
3. **Authentication → Providers**에서 Google OAuth 활성화
   - Google Cloud Console에서 OAuth 클라이언트 ID/Secret 발급 필요
4. **Project Settings → API**에서 다음 값 복사:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 2. 로컬 개발

```bash
cd codepath

# .env.local 수정
cp .env.local.example .env.local
# NEXT_PUBLIC_SUPABASE_URL=...  ← Supabase URL 입력
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...  ← anon key 입력

# 개발 서버 실행
npm run dev
# → http://localhost:3000
```

## 3. Vercel 배포

### 방법 A: GitHub 연동 (권장)

```bash
# GitHub에 push
git init
git add .
git commit -m "Initial commit: CodePath Next.js"
git remote add origin https://github.com/your-username/codepath.git
git push -u origin main
```

1. [vercel.com](https://vercel.com) → Import Project → GitHub 저장소 선택
2. **Environment Variables** 추가:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Deploy 클릭 → 완료

### 방법 B: CLI

```bash
npm i -g vercel
vercel login
vercel --prod
# 환경변수 입력 프롬프트에서 Supabase 값 입력
```

## 4. Supabase Auth 콜백 URL 설정

Vercel 배포 완료 후 Supabase 대시보드에서:

**Authentication → URL Configuration**
```
Site URL: https://your-project.vercel.app
Redirect URLs: https://your-project.vercel.app/**
```

## 5. 빌드 명령어

```bash
npm run dev      # 개발 서버 (localhost:3000)
npm run build    # 프로덕션 빌드
npm run start    # 프로덕션 서버 실행
```

## 파일 구조 요약

```
codepath/
├── app/
│   ├── page.tsx              ← 랜딩 페이지 (/)
│   ├── classroom/page.tsx    ← 강의실 (/classroom)
│   └── auth/
│       ├── login/page.tsx    ← 로그인 (/auth/login)
│       └── signup/page.tsx   ← 회원가입 (/auth/signup)
├── lib/supabase.ts           ← Supabase 클라이언트
├── supabase/schema.sql       ← DB 스키마 (Supabase SQL Editor에서 실행)
├── .env.local.example        ← 환경변수 템플릿
└── DEPLOY.md                 ← 이 파일
```
