'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Nav from '@/components/Nav'
import { createClient } from '@/lib/supabase'
import type { Course, Profile } from '@/lib/types'
import styles from './dashboard.module.css'

type EnrolledCourse = Course & {
  totalLessons: number
  completedLessons: number
  enrolledAt: string
}

export default function DashboardPage() {
  const supabase = createClient()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [courses, setCourses] = useState<EnrolledCourse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      // Profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      setProfile(profileData)

      // Enrollments
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('course_id, enrolled_at')
        .eq('user_id', user.id)

      // Progress
      const { data: progressData } = await supabase
        .from('progress')
        .select('lesson_id')
        .eq('user_id', user.id)
      const completedSlugs = new Set(progressData?.map(p => p.lesson_id) ?? [])

      // Course details
      const enrolledCourses: EnrolledCourse[] = await Promise.all(
        (enrollments ?? []).map(async (enrollment) => {
          const { data: course } = await supabase
            .from('courses')
            .select('*')
            .eq('id', enrollment.course_id)
            .single()

          const { data: sections } = await supabase
            .from('sections')
            .select('id')
            .eq('course_id', enrollment.course_id)
          const sectionIds = sections?.map(s => s.id) ?? []

          let totalLessons = 0
          let completedLessons = 0
          if (sectionIds.length > 0) {
            const { data: lessons } = await supabase
              .from('lessons')
              .select('slug')
              .in('section_id', sectionIds)
            totalLessons = lessons?.length ?? 0
            completedLessons = lessons?.filter(l => completedSlugs.has(l.slug)).length ?? 0
          }

          return {
            ...course!,
            totalLessons,
            completedLessons,
            enrolledAt: enrollment.enrolled_at,
          }
        })
      )

      setCourses(enrolledCourses)
      setLoading(false)
    })()
  }, [])

  if (loading) return <div className={styles.loading}>로딩 중...</div>

  const totalCompleted = courses.reduce((s, c) => s + c.completedLessons, 0)
  const totalLessons = courses.reduce((s, c) => s + c.totalLessons, 0)

  return (
    <div className={styles.page}>
      <Nav links={[{ href: '/courses', label: '코스' }]} />

      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.avatar}>{profile?.display_name?.[0] ?? '?'}</div>
          <div>
            <h1 className={styles.name}>{profile?.display_name ?? '사용자'}</h1>
            <p className={styles.email}>{profile?.email}</p>
            {profile?.role === 'admin' && <span className={styles.badge}>관리자</span>}
          </div>
        </div>

        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <span className={styles.statNum}>{courses.length}</span>
            <span className={styles.statLabel}>수강 중인 코스</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNum}>{totalCompleted}</span>
            <span className={styles.statLabel}>완료한 강의</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNum}>{totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0}%</span>
            <span className={styles.statLabel}>전체 진행률</span>
          </div>
        </div>

        <div className={styles.sectionLabel}>// MY COURSES</div>
        <h2 className={styles.sectionTitle}>수강 중인 코스</h2>

        {courses.length === 0 ? (
          <div className={styles.empty}>
            <p>아직 수강 중인 코스가 없습니다.</p>
            <Link href="/courses" className={styles.ctaBtn}>코스 둘러보기 →</Link>
          </div>
        ) : (
          <div className={styles.courseList}>
            {courses.map(course => {
              const pct = course.totalLessons > 0 ? Math.round((course.completedLessons / course.totalLessons) * 100) : 0
              return (
                <Link key={course.id} href={`/classroom/${course.slug}`} className={styles.courseCard}>
                  <div className={styles.courseInfo}>
                    <h3>{course.title}</h3>
                    <p>{course.completedLessons}/{course.totalLessons}개 강의 완료</p>
                  </div>
                  <div className={styles.courseProgress}>
                    <div className={styles.progressBar}>
                      <div className={styles.progressFill} style={{ width: `${pct}%` }} />
                    </div>
                    <span className={styles.progressPct}>{pct}%</span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
