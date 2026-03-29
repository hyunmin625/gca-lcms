export type Course = {
  id: string
  title: string
  slug: string
  description: string | null
  thumbnail_url: string | null
  level: '입문' | '중급' | '고급'
  is_free: boolean
  price: number
  status: 'draft' | 'published'
  sort_order: number
  created_at: string
  updated_at: string
}

export type Section = {
  id: string
  course_id: string
  title: string
  sort_order: number
  created_at: string
  lessons?: Lesson[]
}

export type Lesson = {
  id: string
  section_id: string
  title: string
  slug: string
  description: string | null
  video_id: string | null
  duration: string | null
  sort_order: number
  is_free: boolean
  created_at: string
}

export type Enrollment = {
  id: string
  user_id: string
  course_id: string
  enrolled_at: string
}

export type Profile = {
  id: string
  email: string | null
  display_name: string | null
  avatar_url: string | null
  role: 'student' | 'admin'
  created_at: string
  updated_at: string
}
