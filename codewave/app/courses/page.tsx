import Link from 'next/link'
import Nav from '@/components/Nav'
import { createServerClient } from '@/lib/supabase-server'
import type { Course } from '@/lib/types'
import styles from './courses.module.css'

const levelColors: Record<string, string> = {
  '입문': 'beginner',
  '중급': 'intermediate',
  '고급': 'advanced',
}

export default async function CoursesPage() {
  const supabase = createServerClient()
  const { data: courses } = await supabase
    .from('courses')
    .select('*')
    .eq('status', 'published')
    .order('sort_order') as { data: Course[] | null }

  // 각 코스별 레슨 수와 섹션 수
  const coursesWithStats = await Promise.all(
    (courses ?? []).map(async (course) => {
      const { count: lessonCount } = await supabase
        .from('lessons')
        .select('id', { count: 'exact', head: true })
        .in('section_id',
          (await supabase.from('sections').select('id').eq('course_id', course.id))
            .data?.map(s => s.id) ?? []
        )
      const { count: sectionCount } = await supabase
        .from('sections')
        .select('id', { count: 'exact', head: true })
        .eq('course_id', course.id)
      return { ...course, lessonCount: lessonCount ?? 0, sectionCount: sectionCount ?? 0 }
    })
  )

  return (
    <div className={styles.page}>
      <Nav links={[{ href: '/courses', label: '코스' }]} />

      <section className={styles.hero}>
        <div className={styles.sectionLabel}>// COURSES</div>
        <h1 className={styles.title}>코스 카탈로그</h1>
        <p className={styles.subtitle}>체계적인 커리큘럼으로 프로그래밍을 마스터하세요</p>
      </section>

      <section className={styles.grid}>
        {coursesWithStats.map(course => (
          <Link key={course.id} href={`/courses/${course.slug}`} className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={`${styles.level} ${styles[levelColors[course.level]]}`}>
                {course.level}
              </span>
              {course.is_free && <span className={styles.free}>무료</span>}
            </div>
            <h2 className={styles.cardTitle}>{course.title}</h2>
            <p className={styles.cardDesc}>{course.description}</p>
            <div className={styles.cardMeta}>
              <span>{course.sectionCount}개 섹션</span>
              <span>·</span>
              <span>{course.lessonCount}개 강의</span>
            </div>
            <div className={styles.cardAction}>
              코스 보기 →
            </div>
          </Link>
        ))}
      </section>
    </div>
  )
}
