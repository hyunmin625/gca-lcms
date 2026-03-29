'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import type { Profile } from '@/lib/types'
import styles from '../admin.module.css'

type UserWithStats = Profile & { enrollmentCount: number }

export default function AdminUsersPage() {
  const supabase = createClient()
  const [users, setUsers] = useState<UserWithStats[]>([])

  const loadUsers = async () => {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    const usersWithStats = await Promise.all(
      (profiles ?? []).map(async (profile: Profile) => {
        const { count } = await supabase
          .from('enrollments')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', profile.id)
        return { ...profile, enrollmentCount: count ?? 0 }
      })
    )
    setUsers(usersWithStats)
  }

  useEffect(() => { loadUsers() }, [])

  const toggleRole = async (user: UserWithStats) => {
    const newRole = user.role === 'admin' ? 'student' : 'admin'
    await supabase.from('profiles').update({ role: newRole }).eq('id', user.id)
    loadUsers()
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>회원 관리</h1>
        <p className={styles.pageDesc}>{users.length}명의 회원</p>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>이름</th>
              <th>이메일</th>
              <th>역할</th>
              <th>수강 코스</th>
              <th>가입일</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user.display_name ?? '—'}</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{user.email}</td>
                <td>
                  <span className={`${styles.statusBadge} ${user.role === 'admin' ? styles.statusPublished : styles.statusDraft}`}>
                    {user.role === 'admin' ? '관리자' : '수강생'}
                  </span>
                </td>
                <td>{user.enrollmentCount}개</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {new Date(user.created_at).toLocaleDateString('ko-KR')}
                </td>
                <td>
                  <button
                    className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSmall}`}
                    onClick={() => toggleRole(user)}
                  >
                    {user.role === 'admin' ? '수강생으로' : '관리자로'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
