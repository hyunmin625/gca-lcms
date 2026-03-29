import Link from 'next/link'
import { notFound } from 'next/navigation'
import Nav from '@/components/Nav'
import { createServerClient } from '@/lib/supabase-server'
import type { Course, Section, Lesson } from '@/lib/types'
import EnrollButton from './EnrollButton'
import styles from './course-detail.module.css'

const sectionColors = ['green', 'cyan', 'amber', 'pink', 'purple', 'green']

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = createServerClient()

  const { data: course } = await supabase
    .from('courses')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single() as { data: Course | null }

  if (!course) notFound()

  const { data: sections } = await supabase
    .from('sections')
    .select('*')
    .eq('course_id', course.id)
    .order('sort_order') as { data: Section[] | null }

  const sectionsWithLessons = await Promise.all(
    (sections ?? []).map(async (section) => {
      const { data: lessons } = await supabase
        .from('lessons')
        .select('*')
        .eq('section_id', section.id)
        .order('sort_order') as { data: Lesson[] | null }
      return { ...section, lessons: lessons ?? [] }
    })
  )

  const totalLessons = sectionsWithLessons.reduce((s, sec) => s + sec.lessons.length, 0)
  const totalDuration = sectionsWithLessons.reduce((s, sec) =>
    s + sec.lessons.reduce((ls, l) => {
      if (!l.duration) return ls
      const [m, s2] = l.duration.split(':').map(Number)
      return ls + m + (s2 || 0) / 60
    }, 0)
  , 0)

  return (
    <div className={styles.page}>
      <Nav links={[{ href: '/courses', label: '← 코스 목록' }]} />

      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroInfo}>
            <span className={styles.level}>{course.level}</span>
            <h1 className={styles.title}>{course.title}</h1>
            <p className={styles.desc}>{course.description}</p>
            <div className={styles.stats}>
              <div className={styles.stat}>
                <span className={styles.statNum}>{sectionsWithLessons.length}</span>
                <span className={styles.statLabel}>섹션</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNum}>{totalLessons}</span>
                <span className={styles.statLabel}>강의</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNum}>{Math.round(totalDuration / 60)}시간+</span>
                <span className={styles.statLabel}>총 분량</span>
              </div>
            </div>
            <EnrollButton courseId={course.id} courseSlug={course.slug} isFree={course.is_free} />
          </div>
        </div>
      </section>

      <section className={styles.curriculum}>
        <div className={styles.sectionLabel}>// CURRICULUM</div>
        <h2 className={styles.curriculumTitle}>커리큘럼</h2>
        <div className={styles.sectionList}>
          {sectionsWithLessons.map((section, si) => (
            <div key={section.id} className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <span className={`${styles.sectionNum} ${styles[sectionColors[si % sectionColors.length]]}`}>
                  {String(si + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className={styles.sectionTitle}>{section.title}</h3>
                  <span className={styles.sectionMeta}>{section.lessons.length}개 강의</span>
                </div>
              </div>
              <div className={styles.lessonList}>
                {section.lessons.map((lesson, li) => (
                  <div key={lesson.id} className={styles.lessonRow}>
                    <span className={styles.lessonIdx}>{li + 1}</span>
                    <span className={styles.lessonTitle}>{lesson.title}</span>
                    <span className={styles.lessonDuration}>{lesson.duration}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
