'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import styles from './course-detail.module.css'

export default function EnrollButton({ courseId, courseSlug, isFree }: { courseId: string; courseSlug: string; isFree: boolean }) {
  const [user, setUser] = useState<{ id: string } | null>(null)
  const [enrolled, setEnrolled] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        const { data } = await supabase
          .from('enrollments')
          .select('id')
          .eq('user_id', user.id)
          .eq('course_id', courseId)
          .maybeSingle()
        setEnrolled(!!data)
      }
      setLoading(false)
    })()
  }, [courseId])

  const handleEnroll = async () => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    setLoading(true)
    await supabase.from('enrollments').insert({ user_id: user.id, course_id: courseId })
    setEnrolled(true)
    setLoading(false)
    router.push(`/classroom/${courseSlug}`)
  }

  if (loading) return <div className={styles.enrollBtn} style={{ opacity: 0.5 }}>로딩...</div>

  if (enrolled) {
    return (
      <button className={`${styles.enrollBtn} ${styles.enrolledBtn}`} onClick={() => router.push(`/classroom/${courseSlug}`)}>
        강의실 입장 →
      </button>
    )
  }

  return (
    <button className={styles.enrollBtn} onClick={handleEnroll}>
      {isFree ? '무료 수강 시작 →' : `수강 신청 (${new Intl.NumberFormat('ko-KR').format(0)}원)`}
    </button>
  )
}
