'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import styles from '../auth.module.css'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: name } },
    })
    if (error) { setError(error.message); setLoading(false) }
    else setDone(true)
  }

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/dashboard` },
    })
  }

  if (done) return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Link href="/" className={styles.logo}>CodeNova<span>_</span></Link>
        <div className={styles.doneIcon}>✓</div>
        <h1 className={styles.title}>이메일을 확인해 주세요</h1>
        <p className={styles.sub}>{email}으로 인증 링크를 보냈습니다.<br />이메일을 확인하고 링크를 클릭하면 시작할 수 있습니다.</p>
        <Link href="/classroom" className={styles.submitBtn} style={{display:'block', textAlign:'center', marginTop:'1.5rem'}}>
          강의실 바로가기 →
        </Link>
      </div>
    </div>
  )

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Link href="/" className={styles.logo}>CodeNova<span>_</span></Link>
        <h1 className={styles.title}>무료 회원가입</h1>
        <p className={styles.sub}>48개 강의를 무료로 시작하세요</p>

        <button className={styles.googleBtn} onClick={handleGoogle}>
          <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/></svg>
          Google로 시작하기
        </button>

        <div className={styles.divider}><span>또는</span></div>

        <form onSubmit={handleSignup} className={styles.form}>
          <div className={styles.field}>
            <label>이름</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="홍길동" required />
          </div>
          <div className={styles.field}>
            <label>이메일</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>
          <div className={styles.field}>
            <label>비밀번호</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="8자 이상" minLength={8} required />
          </div>
          {error && <div className={styles.error}>{error}</div>}
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? '가입 중...' : '무료로 시작하기'}
          </button>
        </form>

        <p className={styles.switchLink}>
          이미 계정이 있으신가요? <Link href="/auth/login">로그인</Link>
        </p>
      </div>
    </div>
  )
}
