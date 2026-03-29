'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import type { Course, Section, Lesson } from '@/lib/types'
import styles from '../../admin.module.css'

type SectionWithLessons = Section & { lessons: Lesson[] }

export default function AdminCourseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const supabase = createClient()
  const [course, setCourse] = useState<Course | null>(null)
  const [sections, setSections] = useState<SectionWithLessons[]>([])

  // Section form
  const [showSectionForm, setShowSectionForm] = useState(false)
  const [editSectionId, setEditSectionId] = useState<string | null>(null)
  const [sectionTitle, setSectionTitle] = useState('')

  // Lesson form
  const [showLessonForm, setShowLessonForm] = useState<string | null>(null) // section_id
  const [editLessonId, setEditLessonId] = useState<string | null>(null)
  const [lessonForm, setLessonForm] = useState({ title: '', slug: '', description: '', video_id: '', duration: '' })

  const loadData = useCallback(async () => {
    const { data: courseData } = await supabase.from('courses').select('*').eq('id', id).single()
    setCourse(courseData)

    const { data: sectionsData } = await supabase
      .from('sections').select('*').eq('course_id', id).order('sort_order')

    const withLessons = await Promise.all(
      (sectionsData ?? []).map(async (sec: Section) => {
        const { data: lessons } = await supabase
          .from('lessons').select('*').eq('section_id', sec.id).order('sort_order')
        return { ...sec, lessons: (lessons ?? []) as Lesson[] }
      })
    )
    setSections(withLessons)
  }, [id])

  useEffect(() => { loadData() }, [loadData])

  // Section CRUD
  const handleSectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editSectionId) {
      await supabase.from('sections').update({ title: sectionTitle }).eq('id', editSectionId)
    } else {
      await supabase.from('sections').insert({ course_id: id, title: sectionTitle, sort_order: sections.length + 1 })
    }
    setSectionTitle(''); setEditSectionId(null); setShowSectionForm(false)
    loadData()
  }

  const handleSectionDelete = async (sectionId: string) => {
    if (!confirm('이 섹션과 하위 레슨을 모두 삭제하시겠습니까?')) return
    await supabase.from('sections').delete().eq('id', sectionId)
    loadData()
  }

  const moveSectionUp = async (idx: number) => {
    if (idx === 0) return
    const updates = [
      { id: sections[idx].id, sort_order: sections[idx - 1].sort_order },
      { id: sections[idx - 1].id, sort_order: sections[idx].sort_order },
    ]
    for (const u of updates) await supabase.from('sections').update({ sort_order: u.sort_order }).eq('id', u.id)
    loadData()
  }

  const moveSectionDown = async (idx: number) => {
    if (idx >= sections.length - 1) return
    const updates = [
      { id: sections[idx].id, sort_order: sections[idx + 1].sort_order },
      { id: sections[idx + 1].id, sort_order: sections[idx].sort_order },
    ]
    for (const u of updates) await supabase.from('sections').update({ sort_order: u.sort_order }).eq('id', u.id)
    loadData()
  }

  // Lesson CRUD
  const resetLessonForm = () => {
    setLessonForm({ title: '', slug: '', description: '', video_id: '', duration: '' })
    setEditLessonId(null); setShowLessonForm(null)
  }

  const handleLessonEdit = (lesson: Lesson, sectionId: string) => {
    setLessonForm({
      title: lesson.title, slug: lesson.slug,
      description: lesson.description ?? '', video_id: lesson.video_id ?? '', duration: lesson.duration ?? '',
    })
    setEditLessonId(lesson.id); setShowLessonForm(sectionId)
  }

  const handleLessonSubmit = async (e: React.FormEvent, sectionId: string) => {
    e.preventDefault()
    if (editLessonId) {
      await supabase.from('lessons').update(lessonForm).eq('id', editLessonId)
    } else {
      const section = sections.find(s => s.id === sectionId)
      await supabase.from('lessons').insert({
        ...lessonForm, section_id: sectionId, sort_order: (section?.lessons.length ?? 0) + 1,
      })
    }
    resetLessonForm(); loadData()
  }

  const handleLessonDelete = async (lessonId: string) => {
    if (!confirm('이 레슨을 삭제하시겠습니까?')) return
    await supabase.from('lessons').delete().eq('id', lessonId)
    loadData()
  }

  const moveLessonUp = async (sectionId: string, idx: number) => {
    const sec = sections.find(s => s.id === sectionId)
    if (!sec || idx === 0) return
    const updates = [
      { id: sec.lessons[idx].id, sort_order: sec.lessons[idx - 1].sort_order },
      { id: sec.lessons[idx - 1].id, sort_order: sec.lessons[idx].sort_order },
    ]
    for (const u of updates) await supabase.from('lessons').update({ sort_order: u.sort_order }).eq('id', u.id)
    loadData()
  }

  const moveLessonDown = async (sectionId: string, idx: number) => {
    const sec = sections.find(s => s.id === sectionId)
    if (!sec || idx >= sec.lessons.length - 1) return
    const updates = [
      { id: sec.lessons[idx].id, sort_order: sec.lessons[idx + 1].sort_order },
      { id: sec.lessons[idx + 1].id, sort_order: sec.lessons[idx].sort_order },
    ]
    for (const u of updates) await supabase.from('lessons').update({ sort_order: u.sort_order }).eq('id', u.id)
    loadData()
  }

  if (!course) return <div>로딩 중...</div>

  const totalLessons = sections.reduce((s, sec) => s + sec.lessons.length, 0)

  return (
    <div>
      <div className={styles.topActions}>
        <div className={styles.pageHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <Link href="/admin/courses" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>← 코스 목록</Link>
          </div>
          <h1 className={styles.pageTitle}>{course.title}</h1>
          <p className={styles.pageDesc}>{sections.length}개 섹션 · {totalLessons}개 레슨</p>
        </div>
      </div>

      {/* SECTION LIST */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>섹션 관리</h2>
        <button className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSmall}`} onClick={() => { setSectionTitle(''); setEditSectionId(null); setShowSectionForm(true) }}>
          + 섹션 추가
        </button>
      </div>

      {showSectionForm && (
        <form onSubmit={handleSectionSubmit} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <input
            className={styles.field}
            value={sectionTitle}
            onChange={e => setSectionTitle(e.target.value)}
            placeholder="섹션 제목"
            required
            style={{ flex: 1, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.6rem 0.9rem', color: 'var(--text-primary)', fontSize: '0.9rem' }}
          />
          <button type="submit" className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSmall}`}>
            {editSectionId ? '수정' : '추가'}
          </button>
          <button type="button" className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSmall}`} onClick={() => setShowSectionForm(false)}>취소</button>
        </form>
      )}

      {sections.map((section, si) => (
        <div key={section.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', marginBottom: '1rem', overflow: 'hidden' }}>
          {/* Section Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{String(si + 1).padStart(2, '0')}</span>
              <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>{section.title}</h3>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>{section.lessons.length}개 레슨</span>
            </div>
            <div className={styles.actions}>
              <button className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSmall}`} onClick={() => moveSectionUp(si)} disabled={si === 0}>↑</button>
              <button className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSmall}`} onClick={() => moveSectionDown(si)} disabled={si === sections.length - 1}>↓</button>
              <button className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSmall}`} onClick={() => { setSectionTitle(section.title); setEditSectionId(section.id); setShowSectionForm(true) }}>수정</button>
              <button className={`${styles.btn} ${styles.btnDanger} ${styles.btnSmall}`} onClick={() => handleSectionDelete(section.id)}>삭제</button>
            </div>
          </div>

          {/* Lessons */}
          <div>
            {section.lessons.map((lesson, li) => (
              <div key={lesson.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.7rem 1.25rem', borderBottom: '1px solid rgba(42,53,80,0.3)' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)', width: '24px', textAlign: 'center' }}>{li + 1}</span>
                <span style={{ flex: 1, fontSize: '0.88rem' }}>{lesson.title}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>{lesson.duration}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)' }}>{lesson.video_id ? '🎬' : '—'}</span>
                <div className={styles.actions}>
                  <button className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSmall}`} onClick={() => moveLessonUp(section.id, li)} disabled={li === 0}>↑</button>
                  <button className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSmall}`} onClick={() => moveLessonDown(section.id, li)} disabled={li === section.lessons.length - 1}>↓</button>
                  <button className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSmall}`} onClick={() => handleLessonEdit(lesson, section.id)}>수정</button>
                  <button className={`${styles.btn} ${styles.btnDanger} ${styles.btnSmall}`} onClick={() => handleLessonDelete(lesson.id)}>삭제</button>
                </div>
              </div>
            ))}

            {/* Lesson Form */}
            {showLessonForm === section.id ? (
              <form onSubmit={e => handleLessonSubmit(e, section.id)} style={{ padding: '1rem 1.25rem', background: 'rgba(0,255,136,0.02)' }}>
                <div className={styles.form} style={{ maxWidth: '100%' }}>
                  <div className={styles.fieldRow}>
                    <div className={styles.field}>
                      <label>레슨 제목</label>
                      <input value={lessonForm.title} onChange={e => setLessonForm(f => ({ ...f, title: e.target.value }))} required placeholder="레슨 제목" />
                    </div>
                    <div className={styles.field}>
                      <label>슬러그</label>
                      <input value={lessonForm.slug} onChange={e => setLessonForm(f => ({ ...f, slug: e.target.value }))} required placeholder="L01" />
                    </div>
                  </div>
                  <div className={styles.field}>
                    <label>설명</label>
                    <textarea value={lessonForm.description} onChange={e => setLessonForm(f => ({ ...f, description: e.target.value }))} placeholder="레슨 설명" />
                  </div>
                  <div className={styles.fieldRow}>
                    <div className={styles.field}>
                      <label>YouTube Video ID</label>
                      <input value={lessonForm.video_id} onChange={e => setLessonForm(f => ({ ...f, video_id: e.target.value }))} placeholder="예: kqtD5dpn9C8" />
                    </div>
                    <div className={styles.field}>
                      <label>재생시간</label>
                      <input value={lessonForm.duration} onChange={e => setLessonForm(f => ({ ...f, duration: e.target.value }))} placeholder="12:30" />
                    </div>
                  </div>
                  <div className={styles.actions}>
                    <button type="submit" className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSmall}`}>
                      {editLessonId ? '수정 저장' : '레슨 추가'}
                    </button>
                    <button type="button" className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSmall}`} onClick={resetLessonForm}>취소</button>
                  </div>
                </div>
              </form>
            ) : (
              <div style={{ padding: '0.7rem 1.25rem' }}>
                <button
                  className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSmall}`}
                  onClick={() => { resetLessonForm(); setShowLessonForm(section.id) }}
                >
                  + 레슨 추가
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
