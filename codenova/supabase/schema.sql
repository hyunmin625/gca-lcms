-- CodeNova DB Schema
-- Supabase SQL Editor에서 실행하세요

-- 1. 프로필 테이블 (회원 정보)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  display_name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 신규 유저 가입 시 프로필 자동 생성
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- 2. 수강 진행률 테이블
create table if not exists progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  lesson_id text not null,
  completed_at timestamptz default now(),
  unique(user_id, lesson_id)
);

-- RLS (Row Level Security) 활성화
alter table profiles enable row level security;
alter table progress enable row level security;

-- 프로필: 트리거에서 생성 가능
create policy "서비스 프로필 생성" on profiles
  for insert with check (true);

-- 프로필: 본인만 읽기/수정 가능
create policy "본인 프로필 읽기" on profiles
  for select using (auth.uid() = id);

create policy "본인 프로필 수정" on profiles
  for update using (auth.uid() = id);

-- 진행률: 본인만 읽기/쓰기/삭제 가능
create policy "본인 진행률 읽기" on progress
  for select using (auth.uid() = user_id);

create policy "본인 진행률 추가" on progress
  for insert with check (auth.uid() = user_id);

create policy "본인 진행률 삭제" on progress
  for delete using (auth.uid() = user_id);
