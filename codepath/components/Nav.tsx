'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import styles from './Nav.module.css'

type NavProps = {
  links?: { href: string; label: string }[]
}

export default function Nav({ links = [] }: NavProps) {
  const supabase = createClient()
  const router = useRouter()
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [displayName, setDisplayName] = useState<string>('')
  const [role, setRole] = useState<string>('student')
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Initial auth check
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      if (data.user) {
        supabase
          .from('profiles')
          .select('display_name, role')
          .eq('id', data.user.id)
          .single()
          .then(({ data: profile }) => {
            if (profile) { setDisplayName(profile.display_name ?? ''); setRole(profile.role ?? 'student') }
          })
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        supabase
          .from('profiles')
          .select('display_name, role')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profile }) => {
            if (profile) { setDisplayName(profile.display_name ?? ''); setRole(profile.role ?? 'student') }
          })
      } else {
        setDisplayName('')
        setRole('student')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Close menu on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setMenuOpen(false)
    router.push('/')
  }

  const initial = displayName?.[0] ?? user?.email?.[0]?.toUpperCase() ?? '?'

  return (
    <nav className={styles.nav}>
      <Link href="/" className={styles.logo}>CodePath<span>_</span></Link>
      <div className={styles.right}>
        {links.map(link => (
          <Link key={link.href} href={link.href} className={styles.link}>{link.label}</Link>
        ))}

        {user ? (
          <div className={styles.profileWrap} ref={menuRef}>
            <button className={styles.profileBtn} onClick={() => setMenuOpen(v => !v)}>
              <span className={styles.avatar}>{initial}</span>
            </button>
            {menuOpen && (
              <div className={styles.dropdown}>
                <div className={styles.dropdownHeader}>
                  <span className={styles.dropdownName}>{displayName || '사용자'}</span>
                  <span className={styles.dropdownEmail}>{user.email}</span>
                </div>
                <div className={styles.dropdownDivider} />
                <Link href="/dashboard" className={styles.dropdownItem} onClick={() => setMenuOpen(false)}>마이페이지</Link>
                <Link href="/courses" className={styles.dropdownItem} onClick={() => setMenuOpen(false)}>코스 목록</Link>
                {role === 'admin' && (
                  <>
                    <div className={styles.dropdownDivider} />
                    <Link href="/admin" className={styles.dropdownItem} onClick={() => setMenuOpen(false)}>관리자</Link>
                  </>
                )}
                <div className={styles.dropdownDivider} />
                <button className={styles.dropdownItem} onClick={handleLogout}>로그아웃</button>
              </div>
            )}
          </div>
        ) : (
          <Link href="/auth/login" className={styles.loginBtn}>로그인</Link>
        )}
      </div>
    </nav>
  )
}
