-- CodeNova LMS Core Schema (2단계)
-- courses, sections, lessons, enrollments + profiles에 role 추가

-- 1. profiles에 역할 컬럼 추가
alter table profiles add column if not exists role text default 'student' check (role in ('student', 'admin'));

-- 2. 코스 테이블
create table if not exists courses (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text unique not null,
  description text,
  thumbnail_url text,
  level text default '입문' check (level in ('입문', '중급', '고급')),
  is_free boolean default true,
  price integer default 0,
  status text default 'published' check (status in ('draft', 'published')),
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. 섹션 테이블 (코스 내 챕터)
create table if not exists sections (
  id uuid default gen_random_uuid() primary key,
  course_id uuid references courses on delete cascade not null,
  title text not null,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- 4. 레슨 테이블 (기존 progress.lesson_id를 uuid FK로 마이그레이션)
create table if not exists lessons (
  id uuid default gen_random_uuid() primary key,
  section_id uuid references sections on delete cascade not null,
  title text not null,
  slug text not null,
  description text,
  video_id text,
  duration text,
  sort_order integer default 0,
  is_free boolean default true,
  created_at timestamptz default now()
);

-- 5. 수강 등록 테이블
create table if not exists enrollments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  course_id uuid references courses on delete cascade not null,
  enrolled_at timestamptz default now(),
  unique(user_id, course_id)
);

-- 6. progress 테이블 업데이트: lesson_id를 uuid FK로 변경
-- 기존 text 기반 lesson_id를 새 컬럼으로 교체
alter table progress add column if not exists lesson_uuid uuid references lessons on delete cascade;
-- 기존 lesson_id(text)는 당분간 유지 (마이그레이션 호환)

-- RLS 활성화
alter table courses enable row level security;
alter table sections enable row level security;
alter table lessons enable row level security;
alter table enrollments enable row level security;

-- courses: 게시된 코스는 누구나 읽기, 관리자만 수정
create policy "코스 공개 읽기" on courses
  for select using (status = 'published');

create policy "관리자 코스 전체 읽기" on courses
  for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "관리자 코스 생성" on courses
  for insert with check (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "관리자 코스 수정" on courses
  for update using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "관리자 코스 삭제" on courses
  for delete using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- sections: 공개 코스의 섹션은 읽기 가능
create policy "섹션 공개 읽기" on sections
  for select using (
    exists (select 1 from courses where courses.id = sections.course_id and status = 'published')
  );

create policy "관리자 섹션 관리" on sections
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- lessons: 공개 코스의 레슨은 읽기 가능
create policy "레슨 공개 읽기" on lessons
  for select using (
    exists (
      select 1 from sections
      join courses on courses.id = sections.course_id
      where sections.id = lessons.section_id and courses.status = 'published'
    )
  );

create policy "관리자 레슨 관리" on lessons
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- enrollments: 본인만 읽기/생성
create policy "본인 수강 읽기" on enrollments
  for select using (auth.uid() = user_id);

create policy "본인 수강 등록" on enrollments
  for insert with check (auth.uid() = user_id);

create policy "본인 수강 취소" on enrollments
  for delete using (auth.uid() = user_id);

create policy "관리자 수강 조회" on enrollments
  for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );
