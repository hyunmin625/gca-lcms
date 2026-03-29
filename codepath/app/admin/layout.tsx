'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import styles from './admin.module.css'

const menuItems = [
  { href: '/admin', label: '대시보드', icon: '◈' },
  { href: '/admin/courses', label: '코스 관리', icon: '▶' },
  { href: '/admin/users', label: '회원 관리', icon: '◉' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const router = useRouter()
  const pathname = usePathname()
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      if (profile?.role !== 'admin') { router.push('/dashboard'); return }
      setAuthorized(true)
    })()
  }, [])

  if (!authorized) return <div className={styles.loading}>권한 확인 중...</div>

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <Link href="/" className={styles.logo}>CodePath<span>_</span></Link>
        <span className={styles.badge}>ADMIN</span>
        <nav className={styles.menu}>
          {menuItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.menuItem} ${pathname === item.href ? styles.menuActive : ''}`}
            >
              <span className={styles.menuIcon}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className={styles.sidebarFooter}>
          <Link href="/dashboard" className={styles.backLink}>← 사이트로 돌아가기</Link>
        </div>
      </aside>
      <main className={styles.main}>{children}</main>
    </div>
  )
}
