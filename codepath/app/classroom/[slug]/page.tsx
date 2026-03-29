'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { Course, Section, Lesson } from '@/lib/types'
import styles from '../classroom.module.css'

const fillColors = ['#00ff88','#00d4ff','#ffb347','#ff6b9d','#a78bfa','#00ff88']
const sectionLevels = ['입문','입문','중급','중급','고급','고급']

export default function ClassroomPage() {
  const { slug } = useParams<{ slug: string }>()
  const supabase = createClient()

  const [course, setCourse] = useState<Course | null>(null)
  const [sections, setSections] = useState<(Section & { lessons: Lesson[] })[]>([])
  const [completedIds, setCompletedIds] = useState<string[]>([])
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null)
  const [openSections, setOpenSections] = useState<number[]>([0])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<{ id: string } | null>(null)
  const [loading, setLoading] = useState(true)

  // Load course data
  useEffect(() => {
    (async () => {
      const { data: courseData } = await supabase
        .from('courses')
        .select('*')
        .eq('slug', slug)
        .single()
      if (!courseData) return
      setCourse(courseData)

      const { data: sectionsData } = await supabase
        .from('sections')
        .select('*')
        .eq('course_id', courseData.id)
        .order('sort_order')

      const sectionsWithLessons = await Promise.all(
        (sectionsData ?? []).map(async (section: Section) => {
          const { data: lessons } = await supabase
            .from('lessons')
            .select('*')
            .eq('section_id', section.id)
            .order('sort_order')
          return { ...section, lessons: (lessons ?? []) as Lesson[] }
        })
      )
      setSections(sectionsWithLessons)

      // Set first lesson as current
      if (sectionsWithLessons.length > 0 && sectionsWithLessons[0].lessons.length > 0) {
        setCurrentLesson(sectionsWithLessons[0].lessons[0])
      }

      // Auth check
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      // Load progress
      if (user) {
        const { data: progressData } = await supabase
          .from('progress')
          .select('lesson_id')
          .eq('user_id', user.id)
        if (progressData) setCompletedIds(progressData.map(r => r.lesson_id))
      } else {
        try {
          const saved = localStorage.getItem('cp_completed')
          if (saved) setCompletedIds(JSON.parse(saved))
        } catch {}
      }

      setLoading(false)
    })()
  }, [slug])

  const allLessons = sections.flatMap(s => s.lessons)
  const totalLessons = allLessons.length

  const currentSectionIdx = sections.findIndex(s => s.lessons.some(l => l.id === currentLesson?.id))

  useEffect(() => {
    if (currentSectionIdx >= 0) {
      setOpenSections(prev => prev.includes(currentSectionIdx) ? prev : [...prev, currentSectionIdx])
    }
  }, [currentSectionIdx])

  const selectLesson = (lesson: Lesson) => {
    setCurrentLesson(lesson)
    setSidebarOpen(false)
  }

  const toggleSection = (i: number) => {
    setOpenSections(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])
  }

  const toggleComplete = useCallback(async () => {
    if (!currentLesson) return
    const lessonSlug = currentLesson.slug
    const isDone = completedIds.includes(lessonSlug)
    const next = isDone ? completedIds.filter(x => x !== lessonSlug) : [...completedIds, lessonSlug]
    setCompletedIds(next)
    localStorage.setItem('cp_completed', JSON.stringify(next))

    if (user) {
      if (isDone) {
        await supabase.from('progress').delete().eq('user_id', user.id).eq('lesson_id', lessonSlug)
      } else {
        await supabase.from('progress').upsert({ user_id: user.id, lesson_id: lessonSlug })
      }
    }
  }, [currentLesson, completedIds, user])

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--text-muted)' }}>로딩 중...</div>
  if (!course || !currentLesson) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--text-muted)' }}>코스를 찾을 수 없습니다</div>

  const pct = totalLessons > 0 ? Math.round((completedIds.length / totalLessons) * 100) : 0
  const circumference = 2 * Math.PI * 52
  const offset = circumference - (pct / 100) * circumference
  const isCompleted = completedIds.includes(currentLesson.slug)

  return (
    <div className={styles.layout}>
      {/* TOPBAR */}
      <div className={styles.topbar}>
        <div className={styles.topLeft}>
          <button className={styles.sidebarToggle} onClick={() => setSidebarOpen(v => !v)}>☰</button>
          <Link href="/" className={styles.logo}>CodeNova<span>_</span></Link>
          <Link href={`/courses/${slug}`} className={styles.backLink}>← 코스 소개</Link>
        </div>
        <div className={styles.topRight}>
          {!user && (
            <Link href="/auth/login" className={styles.loginBtn}>로그인하면 진행률이 저장됩니다</Link>
          )}
          <div className={styles.progressMini}>
            <div className={styles.progressMiniBar}>
              <div className={styles.progressMiniFill} style={{ width: `${pct}%` }} />
            </div>
            <span className={styles.progressMiniText}>{pct}%</span>
          </div>
        </div>
      </div>

      <div className={styles.body}>
        {sidebarOpen && <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />}

        {/* SIDEBAR */}
        <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
          <div className={styles.sidebarHeader}>
            <h2>{course.title}</h2>
            <p>{sections.length}개 섹션 · {totalLessons}개 강의</p>
          </div>
          <div className={styles.sidebarScroll}>
            {sections.map((section, si) => {
              const doneInSection = section.lessons.filter(l => completedIds.includes(l.slug)).length
              const isOpen = openSections.includes(si)
              return (
                <div key={section.id} className={styles.sidebarSection}>
                  <div className={`${styles.sectionHeader} ${isOpen ? styles.sectionOpen : ''}`} onClick={() => toggleSection(si)}>
                    <div className={styles.sectionLeft}>
                      <span className={styles.sectionArrow}>▶</span>
                      <h3>{section.title}</h3>
                    </div>
                    <span className={styles.sectionCount}>{doneInSection}/{section.lessons.length}</span>
                  </div>
                  {isOpen && (
                    <div className={styles.lessonList}>
                      {section.lessons.map(lesson => (
                        <div
                          key={lesson.id}
                          className={`${styles.lessonItem} ${lesson.id === currentLesson.id ? styles.lessonActive : ''} ${completedIds.includes(lesson.slug) ? styles.lessonDone : ''}`}
                          onClick={() => selectLesson(lesson)}
                        >
                          <div className={styles.lessonCheck}>✓</div>
                          <span className={styles.lessonTitle}>{lesson.title}</span>
                          <span className={styles.lessonDuration}>{lesson.duration}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </aside>

        {/* MAIN */}
        <main className={styles.main}>
          <div className={styles.videoWrap}>
            <iframe
              key={currentLesson.id}
              src={`https://www.youtube.com/embed/${currentLesson.video_id}?rel=0`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className={styles.videoFrame}
            />
          </div>

          <div className={styles.bottomPanel}>
            <div className={styles.lessonInfo}>
              <div className={styles.lessonSectionLabel}>// SECTION {String(currentSectionIdx + 1).padStart(2, '0')} — {sections[currentSectionIdx]?.title}</div>
              <h2 className={styles.lessonTitle2}>{currentLesson.title}</h2>
              <div className={styles.lessonMeta}>
                <span>⏱ {currentLesson.duration}</span>
                <span>📊 {sectionLevels[currentSectionIdx] ?? ''}</span>
              </div>
              <p className={styles.lessonDesc}>{currentLesson.description}</p>
              <button
                className={`${styles.completeBtn} ${isCompleted ? styles.completeBtnDone : ''}`}
                onClick={toggleComplete}
              >
                {isCompleted ? '✓ 수강 완료됨' : '✓ 수강 완료'}
              </button>
            </div>

            <div className={styles.progressPanel}>
              <h3>학습 현황</h3>
              <div className={styles.circularProgress}>
                <svg viewBox="0 0 120 120">
                  <circle className={styles.bgRing} cx="60" cy="60" r="52" />
                  <circle
                    className={styles.progressRing}
                    cx="60" cy="60" r="52"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                  />
                </svg>
                <div className={styles.progressText}>
                  <span className={styles.progressPct}>{pct}%</span>
                  <span className={styles.progressLabel}>완료</span>
                </div>
              </div>

              {sections.map((section, si) => {
                const done = section.lessons.filter(l => completedIds.includes(l.slug)).length
                const total = section.lessons.length
                return (
                  <div key={section.id} className={styles.sectionBar}>
                    <div className={styles.sectionBarHeader}>
                      <span className={styles.sectionBarName}>{section.title}</span>
                      <span className={styles.sectionBarCount}>{done}/{total}</span>
                    </div>
                    <div className={styles.sectionBarTrack}>
                      <div className={styles.sectionBarFill} style={{ width: `${Math.round((done/total)*100)}%`, background: fillColors[si % fillColors.length] }} />
                    </div>
                  </div>
                )
              })}

              <div className={styles.completedBox}>
                <div className={styles.completedNum}>{completedIds.length}</div>
                <div className={styles.completedLabel}>강의 완료</div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
