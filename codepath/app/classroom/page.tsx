'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import styles from './classroom.module.css'

const curriculum = [
  { title: 'Python 기초', color: 'green', lessons: [
    { id: 'L01', title: 'Python이란 무엇인가?', duration: '12:30', videoId: 'kqtD5dpn9C8', desc: 'Python 프로그래밍 언어의 역사, 특징, 그리고 왜 Python을 배워야 하는지 알아봅니다.' },
    { id: 'L02', title: '개발 환경 설정', duration: '15:20', videoId: 'YYXdXT2l-Gg', desc: 'Python 설치부터 VS Code 설정까지, 코딩을 시작하기 위한 환경을 구축합니다.' },
    { id: 'L03', title: '변수와 데이터 타입', duration: '18:45', videoId: 'khKv-8q7YmY', desc: '숫자, 문자열, 불리언 등 Python의 기본 데이터 타입과 변수 선언 방법을 배웁니다.' },
    { id: 'L04', title: '문자열 다루기', duration: '14:10', videoId: 'k9TUPpGqYTo', desc: '문자열 포매팅, 슬라이싱, 주요 메서드 등 문자열 조작법을 학습합니다.' },
    { id: 'L05', title: '연산자 총정리', duration: '11:30', videoId: 'v1064mFMEAs', desc: '산술, 비교, 논리, 할당 연산자의 종류와 활용법을 익힙니다.' },
    { id: 'L06', title: '입출력 함수', duration: '10:00', videoId: 'ehSP-sYoKCY', desc: 'print()와 input() 함수로 사용자와 상호작용하는 프로그램을 만듭니다.' },
    { id: 'L07', title: '주석과 코드 스타일', duration: '8:20', videoId: 'SaOFuW011G8', desc: '가독성 좋은 코드를 작성하기 위한 주석 작성법과 PEP 8 스타일 가이드를 소개합니다.' },
    { id: 'L08', title: '기초 종합 실습', duration: '22:00', videoId: 'HW29067qVWk', desc: '배운 내용을 활용하여 간단한 계산기 프로그램을 직접 만들어 봅니다.' },
  ]},
  { title: '제어문과 함수', color: 'cyan', lessons: [
    { id: 'L09', title: 'if 조건문', duration: '16:40', videoId: 'FN9sNSs3DcE', desc: '조건에 따라 코드 흐름을 분기하는 if, elif, else 구문을 배웁니다.' },
    { id: 'L10', title: 'for 반복문', duration: '18:30', videoId: '6iF8Xb7Z3wQ', desc: 'for문과 range() 함수를 활용한 반복 처리를 학습합니다.' },
    { id: 'L11', title: 'while 반복문', duration: '14:20', videoId: '6iF8Xb7Z3wQ', desc: 'while문의 사용법과 break, continue 키워드를 알아봅니다.' },
    { id: 'L12', title: '함수 기초', duration: '20:15', videoId: '9Os0o3wzS_I', desc: '함수 정의, 매개변수, 반환값 등 함수의 기본 개념을 배웁니다.' },
    { id: 'L13', title: '함수 심화', duration: '17:50', videoId: '9Os0o3wzS_I', desc: '기본값 인자, 가변 인자(*args, **kwargs), 람다 함수를 학습합니다.' },
    { id: 'L14', title: '스코프와 네임스페이스', duration: '12:00', videoId: 'QVdf0LgmICw', desc: '변수의 유효 범위와 전역/지역 변수의 차이를 이해합니다.' },
    { id: 'L15', title: '에러 처리 (try/except)', duration: '15:40', videoId: 'NIWwJbo-9_8', desc: '예외 처리 구문으로 안정적인 프로그램을 만드는 방법을 배웁니다.' },
    { id: 'L16', title: '파일 입출력', duration: '16:10', videoId: 'Uh2ebFW8OYM', desc: '파일 읽기/쓰기와 with 구문을 활용한 파일 처리를 학습합니다.' },
    { id: 'L17', title: '모듈과 패키지', duration: '14:30', videoId: 'V27FQ6UBTPY', desc: 'import문과 pip를 활용한 외부 모듈 설치 및 사용법을 배웁니다.' },
    { id: 'L18', title: '제어문 종합 실습', duration: '25:00', videoId: 'HW29067qVWk', desc: '숫자 맞추기 게임을 만들며 조건문, 반복문, 함수를 종합 실습합니다.' },
  ]},
  { title: '자료구조', color: 'amber', lessons: [
    { id: 'L19', title: '리스트 (List)', duration: '20:30', videoId: 'ohCDWZgNIU0', desc: '리스트의 생성, 인덱싱, 슬라이싱, 주요 메서드를 배웁니다.' },
    { id: 'L20', title: '튜플과 집합', duration: '15:20', videoId: 'GIHdn3MrLRI', desc: '튜플(tuple)과 집합(set)의 특성과 활용법을 학습합니다.' },
    { id: 'L21', title: '딕셔너리 (Dictionary)', duration: '18:40', videoId: 'daefaLgNkw0', desc: '키-값 쌍의 자료구조인 딕셔너리의 사용법을 익힙니다.' },
    { id: 'L22', title: '리스트 컴프리헨션', duration: '14:10', videoId: '3dt4OGnU5sM', desc: '파이썬스러운 코드를 작성하는 리스트 컴프리헨션 문법을 배웁니다.' },
    { id: 'L23', title: '스택과 큐', duration: '16:20', videoId: 'HW29067qVWk', desc: '리스트와 deque를 활용한 스택, 큐 자료구조를 구현합니다.' },
    { id: 'L24', title: '정렬과 검색', duration: '19:00', videoId: 'HW29067qVWk', desc: 'sorted(), sort() 함수와 이진 탐색 알고리즘을 배웁니다.' },
    { id: 'L25', title: '자료구조 종합 실습', duration: '24:00', videoId: 'HW29067qVWk', desc: '연락처 관리 프로그램을 만들며 다양한 자료구조를 활용합니다.' },
  ]},
  { title: '객체지향 프로그래밍', color: 'pink', lessons: [
    { id: 'L26', title: '클래스와 객체', duration: '22:10', videoId: 'ZDa-Z5JzLYM', desc: '객체지향 프로그래밍의 기본 개념과 클래스 정의 방법을 배웁니다.' },
    { id: 'L27', title: '상속', duration: '18:20', videoId: 'ZDa-Z5JzLYM', desc: '클래스 상속과 메서드 오버라이딩의 개념을 이해합니다.' },
    { id: 'L28', title: '캡슐화와 다형성', duration: '16:40', videoId: 'ZDa-Z5JzLYM', desc: '접근 제어자와 다형성을 활용한 유연한 설계를 배웁니다.' },
    { id: 'L29', title: '데코레이터', duration: '17:30', videoId: 'ZDa-Z5JzLYM', desc: '함수 데코레이터와 클래스 데코레이터의 원리를 이해합니다.' },
    { id: 'L30', title: '제너레이터와 이터레이터', duration: '19:20', videoId: 'ZDa-Z5JzLYM', desc: 'yield 키워드와 이터레이터 프로토콜을 배웁니다.' },
    { id: 'L31', title: 'OOP 종합 실습', duration: '28:00', videoId: 'HW29067qVWk', desc: '은행 계좌 관리 시스템을 OOP로 설계하고 구현합니다.' },
  ]},
  { title: '알고리즘 기초', color: 'purple', lessons: [
    { id: 'L32', title: '시간 복잡도와 Big-O', duration: '16:00', videoId: 'HW29067qVWk', desc: '알고리즘 효율성을 측정하는 Big-O 표기법을 배웁니다.' },
    { id: 'L33', title: '재귀 함수', duration: '18:30', videoId: 'HW29067qVWk', desc: '재귀적 사고방식과 재귀 함수 작성법을 학습합니다.' },
    { id: 'L34', title: '정렬 알고리즘', duration: '22:00', videoId: 'HW29067qVWk', desc: '버블, 선택, 삽입, 병합, 퀵 정렬을 구현하고 비교합니다.' },
    { id: 'L35', title: '탐색 알고리즘', duration: '17:40', videoId: 'HW29067qVWk', desc: '선형 탐색, 이진 탐색, DFS, BFS의 원리를 배웁니다.' },
    { id: 'L36', title: '동적 프로그래밍 입문', duration: '20:10', videoId: 'HW29067qVWk', desc: '메모이제이션과 타뷸레이션 기법을 소개합니다.' },
    { id: 'L37', title: '알고리즘 종합 문제풀이', duration: '30:00', videoId: 'HW29067qVWk', desc: '코딩 테스트 유형의 문제를 실전으로 풀어봅니다.' },
  ]},
  { title: '실전 프로젝트', color: 'green', lessons: [
    { id: 'L38', title: '웹 스크래핑 프로젝트', duration: '35:00', videoId: 'HW29067qVWk', desc: 'BeautifulSoup으로 웹 데이터를 수집하는 프로젝트를 진행합니다.' },
    { id: 'L39', title: 'REST API 만들기', duration: '40:00', videoId: 'HW29067qVWk', desc: 'Flask로 간단한 REST API 서버를 구축합니다.' },
    { id: 'L40', title: '데이터 분석 프로젝트', duration: '38:00', videoId: 'HW29067qVWk', desc: 'pandas와 matplotlib으로 실제 데이터를 분석하고 시각화합니다.' },
    { id: 'L41', title: '최종 포트폴리오 프로젝트', duration: '45:00', videoId: 'HW29067qVWk', desc: '종합 프로젝트를 완성하고 GitHub에 배포합니다.' },
  ]},
]

const totalLessons = curriculum.reduce((s, sec) => s + sec.lessons.length, 0)
const sectionLevels = ['입문','입문','중급','중급','고급','고급']
const fillColors = ['#00ff88','#00d4ff','#ffb347','#ff6b9d','#a78bfa','#00ff88']

export default function ClassroomPage() {
  const [completedIds, setCompletedIds] = useState<string[]>([])
  const [currentId, setCurrentId] = useState('L01')
  const [openSections, setOpenSections] = useState<number[]>([0])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<{ id: string } | null>(null)
  const supabase = createClient()

  // Get current lesson object
  const currentLesson = curriculum.flatMap(s => s.lessons).find(l => l.id === currentId)!
  const currentSection = curriculum.find(s => s.lessons.some(l => l.id === currentId))!
  const currentSectionIdx = curriculum.indexOf(currentSection)

  // Auth check
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  // Load progress
  useEffect(() => {
    if (user) {
      supabase.from('progress').select('lesson_id').eq('user_id', user.id)
        .then(({ data }) => {
          if (data) setCompletedIds(data.map((r: { lesson_id: string }) => r.lesson_id))
        })
    } else {
      try {
        const saved = localStorage.getItem('cp_completed')
        if (saved) setCompletedIds(JSON.parse(saved))
        const cur = localStorage.getItem('cp_current')
        if (cur) setCurrentId(cur)
      } catch {}
    }
  }, [user])

  // Open section containing current lesson on mount
  useEffect(() => {
    setOpenSections(prev => prev.includes(currentSectionIdx) ? prev : [...prev, currentSectionIdx])
  }, [currentSectionIdx])

  const selectLesson = (id: string) => {
    setCurrentId(id)
    localStorage.setItem('cp_current', id)
    setSidebarOpen(false)
  }

  const toggleSection = (i: number) => {
    setOpenSections(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])
  }

  const toggleComplete = useCallback(async () => {
    const isDone = completedIds.includes(currentId)
    const next = isDone ? completedIds.filter(x => x !== currentId) : [...completedIds, currentId]
    setCompletedIds(next)
    localStorage.setItem('cp_completed', JSON.stringify(next))

    if (user) {
      if (isDone) {
        await supabase.from('progress').delete().eq('user_id', user.id).eq('lesson_id', currentId)
      } else {
        await supabase.from('progress').upsert({ user_id: user.id, lesson_id: currentId })
      }
    }
  }, [currentId, completedIds, user])

  const pct = Math.round((completedIds.length / totalLessons) * 100)
  const circumference = 2 * Math.PI * 52
  const offset = circumference - (pct / 100) * circumference
  const isCompleted = completedIds.includes(currentId)

  return (
    <div className={styles.layout}>
      {/* TOPBAR */}
      <div className={styles.topbar}>
        <div className={styles.topLeft}>
          <button className={styles.sidebarToggle} onClick={() => setSidebarOpen(v => !v)}>☰</button>
          <Link href="/" className={styles.logo}>CodePath<span>_</span></Link>
          <Link href="/" className={styles.backLink}>← 홈으로</Link>
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
        {/* OVERLAY */}
        {sidebarOpen && <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />}

        {/* SIDEBAR */}
        <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
          <div className={styles.sidebarHeader}>
            <h2>Python 마스터 코스</h2>
            <p>6개 섹션 · {totalLessons}개 강의</p>
          </div>
          <div className={styles.sidebarScroll}>
            {curriculum.map((section, si) => {
              const doneInSection = section.lessons.filter(l => completedIds.includes(l.id)).length
              const isOpen = openSections.includes(si)
              return (
                <div key={section.title} className={styles.sidebarSection}>
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
                          className={`${styles.lessonItem} ${lesson.id === currentId ? styles.lessonActive : ''} ${completedIds.includes(lesson.id) ? styles.lessonDone : ''}`}
                          onClick={() => selectLesson(lesson.id)}
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
          {/* VIDEO */}
          <div className={styles.videoWrap}>
            <iframe
              key={currentId}
              src={`https://www.youtube.com/embed/${currentLesson.videoId}?rel=0`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className={styles.videoFrame}
            />
          </div>

          {/* BOTTOM */}
          <div className={styles.bottomPanel}>
            {/* LESSON INFO */}
            <div className={styles.lessonInfo}>
              <div className={styles.lessonSectionLabel}>// SECTION {String(currentSectionIdx + 1).padStart(2, '0')} — {currentSection.title}</div>
              <h2 className={styles.lessonTitle2}>{currentLesson.title}</h2>
              <div className={styles.lessonMeta}>
                <span>⏱ {currentLesson.duration}</span>
                <span>📊 {sectionLevels[currentSectionIdx]}</span>
              </div>
              <p className={styles.lessonDesc}>{currentLesson.desc}</p>
              <button
                className={`${styles.completeBtn} ${isCompleted ? styles.completeBtnDone : ''}`}
                onClick={toggleComplete}
              >
                {isCompleted ? '✓ 수강 완료됨' : '✓ 수강 완료'}
              </button>
            </div>

            {/* PROGRESS */}
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

              {curriculum.map((section, si) => {
                const done = section.lessons.filter(l => completedIds.includes(l.id)).length
                const total = section.lessons.length
                return (
                  <div key={section.title} className={styles.sectionBar}>
                    <div className={styles.sectionBarHeader}>
                      <span className={styles.sectionBarName}>{section.title}</span>
                      <span className={styles.sectionBarCount}>{done}/{total}</span>
                    </div>
                    <div className={styles.sectionBarTrack}>
                      <div className={styles.sectionBarFill} style={{ width: `${Math.round((done/total)*100)}%`, background: fillColors[si] }} />
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
