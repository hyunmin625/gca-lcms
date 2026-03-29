'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import type { Course } from '@/lib/types'
import styles from '../admin.module.css'

export default function AdminCoursesPage() {
  const supabase = createClient()
  const [courses, setCourses] = useState<Course[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ title: '', slug: '', description: '', level: '입문', is_free: true, status: 'draft' })

  const loadCourses = async () => {
    const { data } = await supabase.from('courses').select('*').order('sort_order')
    setCourses(data ?? [])
  }

  useEffect(() => { loadCourses() }, [])

  const resetForm = () => {
    setForm({ title: '', slug: '', description: '', level: '입문', is_free: true, status: 'draft' })
    setEditId(null)
    setShowForm(false)
  }

  const handleEdit = (course: Course) => {
    setForm({
      title: course.title,
      slug: course.slug,
      description: course.description ?? '',
      level: course.level,
      is_free: course.is_free,
      status: course.status,
    })
    setEditId(course.id)
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editId) {
      await supabase.from('courses').update(form).eq('id', editId)
    } else {
      await supabase.from('courses').insert({ ...form, sort_order: courses.length + 1 })
    }
    resetForm()
    loadCourses()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('이 코스를 삭제하시겠습니까? 하위 섹션·레슨도 모두 삭제됩니다.')) return
    await supabase.from('courses').delete().eq('id', id)
    loadCourses()
  }

  const toggleStatus = async (course: Course) => {
    const newStatus = course.status === 'published' ? 'draft' : 'published'
    await supabase.from('courses').update({ status: newStatus }).eq('id', course.id)
    loadCourses()
  }

  return (
    <div>
      <div className={styles.topActions}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>코스 관리</h1>
          <p className={styles.pageDesc}>{courses.length}개 코스</p>
        </div>
        <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => { resetForm(); setShowForm(true) }}>
          + 새 코스
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className={styles.form} style={{ marginBottom: '2rem', padding: '1.5rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px' }}>
          <div className={styles.field}>
            <label>코스 제목</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required placeholder="예: Python 마스터 코스" />
          </div>
          <div className={styles.field}>
            <label>슬러그 (URL)</label>
            <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} required placeholder="예: python-master" />
          </div>
          <div className={styles.field}>
            <label>설명</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="코스 소개 문구" />
          </div>
          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label>난이도</label>
              <select value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value }))}>
                <option value="입문">입문</option>
                <option value="중급">중급</option>
                <option value="고급">고급</option>
              </select>
            </div>
            <div className={styles.field}>
              <label>가격</label>
              <select value={String(form.is_free)} onChange={e => setForm(f => ({ ...f, is_free: e.target.value === 'true' }))}>
                <option value="true">무료</option>
                <option value="false">유료</option>
              </select>
            </div>
            <div className={styles.field}>
              <label>상태</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                <option value="draft">초안</option>
                <option value="published">게시</option>
              </select>
            </div>
          </div>
          <div className={styles.actions}>
            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
              {editId ? '수정 저장' : '코스 생성'}
            </button>
            <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={resetForm}>취소</button>
          </div>
        </form>
      )}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>코스</th>
              <th>난이도</th>
              <th>상태</th>
              <th>가격</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {courses.map(course => (
              <tr key={course.id}>
                <td>
                  <Link href={`/admin/courses/${course.id}`} style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                    {course.title}
                  </Link>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>/{course.slug}</div>
                </td>
                <td>{course.level}</td>
                <td>
                  <button
                    className={`${styles.statusBadge} ${course.status === 'published' ? styles.statusPublished : styles.statusDraft}`}
                    onClick={() => toggleStatus(course)}
                    style={{ cursor: 'pointer', border: 'none' }}
                  >
                    {course.status === 'published' ? '게시됨' : '초안'}
                  </button>
                </td>
                <td>{course.is_free ? '무료' : '유료'}</td>
                <td>
                  <div className={styles.actions}>
                    <Link href={`/admin/courses/${course.id}`} className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSmall}`}>
                      섹션·레슨
                    </Link>
                    <button className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSmall}`} onClick={() => handleEdit(course)}>수정</button>
                    <button className={`${styles.btn} ${styles.btnDanger} ${styles.btnSmall}`} onClick={() => handleDelete(course.id)}>삭제</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
