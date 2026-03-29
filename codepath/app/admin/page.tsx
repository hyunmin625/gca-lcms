'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import styles from './admin.module.css'

export default function AdminDashboard() {
  const supabase = createClient()
  const [stats, setStats] = useState({ courses: 0, lessons: 0, users: 0, enrollments: 0 })

  useEffect(() => {
    (async () => {
      const [courses, lessons, users, enrollments] = await Promise.all([
        supabase.from('courses').select('id', { count: 'exact', head: true }),
        supabase.from('lessons').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('enrollments').select('id', { count: 'exact', head: true }),
      ])
      setStats({
        courses: courses.count ?? 0,
        lessons: lessons.count ?? 0,
        users: users.count ?? 0,
        enrollments: enrollments.count ?? 0,
      })
    })()
  }, [])

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>관리자 대시보드</h1>
        <p className={styles.pageDesc}>CodeNova LCMS 운영 현황</p>
      </div>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statNum}>{stats.courses}</span>
          <span className={styles.statLabel}>코스</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNum}>{stats.lessons}</span>
          <span className={styles.statLabel}>레슨</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNum}>{stats.users}</span>
          <span className={styles.statLabel}>회원</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNum}>{stats.enrollments}</span>
          <span className={styles.statLabel}>수강 등록</span>
        </div>
      </div>
    </div>
  )
}
