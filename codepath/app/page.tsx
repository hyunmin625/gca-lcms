import Link from 'next/link'
import styles from './page.module.css'

const features = [
  { icon: '▶', color: 'green', title: '유튜브 기반 무료 강의', desc: '모든 강의를 YouTube에서 무료로 제공합니다. 별도 결제 없이 바로 학습을 시작하세요.' },
  { icon: '◈', color: 'cyan', title: '체계적 커리큘럼', desc: '입문부터 고급까지 6단계로 구성된 로드맵. 무엇을 어떤 순서로 배울지 고민하지 마세요.' },
  { icon: '◉', color: 'amber', title: '진행률 추적', desc: '완료한 강의를 체크하고 시각적 그래프로 학습 진행 상황을 한눈에 확인하세요.' },
  { icon: '⟐', color: 'pink', title: '실전 프로젝트', desc: '각 단계별 미니 프로젝트로 배운 내용을 직접 적용합니다. 포트폴리오도 함께 완성됩니다.' },
  { icon: '⬡', color: 'purple', title: '한국어 맞춤 설명', desc: '영어 문서의 장벽 없이, 한국어로 된 명쾌한 설명과 예제로 학습 효율을 높입니다.' },
  { icon: '⟁', color: 'green', title: '자기 주도 학습', desc: '언제 어디서든 원하는 속도로 학습하세요. 반복 시청과 북마크로 나만의 학습법을 만듭니다.' },
]

const curriculumItems = [
  { num: '01', title: 'Python 기초', meta: '8개 강의 · 약 4시간', tag: '입문', tagClass: 'beginner' },
  { num: '02', title: '제어문과 함수', meta: '10개 강의 · 약 5시간', tag: '입문', tagClass: 'beginner' },
  { num: '03', title: '자료구조', meta: '8개 강의 · 약 5시간', tag: '중급', tagClass: 'intermediate' },
  { num: '04', title: '객체지향 프로그래밍', meta: '8개 강의 · 약 6시간', tag: '중급', tagClass: 'intermediate' },
  { num: '05', title: '알고리즘 기초', meta: '8개 강의 · 약 6시간', tag: '고급', tagClass: 'advanced' },
  { num: '06', title: '실전 프로젝트', meta: '6개 강의 · 약 8시간', tag: '고급', tagClass: 'advanced' },
]

export default function LandingPage() {
  return (
    <div className={styles.page}>
      {/* NAV */}
      <nav className={styles.nav}>
        <Link href="/" className={styles.logo}>CodePath<span>_</span></Link>
        <div className={styles.navLinks}>
          <Link href="#features">기능</Link>
          <Link href="#curriculum">커리큘럼</Link>
          <Link href="/classroom" className={styles.navCta}>강의실 입장 →</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroGridBg} />
        <div className={`${styles.heroGlow} ${styles.heroGlow1}`} />
        <div className={`${styles.heroGlow} ${styles.heroGlow2}`} />
        <div className={styles.heroContent}>
          <div>
            <div className={styles.heroBadge}>● 2026 신규 커리큘럼 오픈</div>
            <h1 className={styles.heroTitle}>
              코드 한 줄이<br /><span className={styles.highlight}>미래를 바꿉니다</span>
            </h1>
            <p className={styles.heroDesc}>
              Python 기초부터 알고리즘, 데이터 구조까지.<br />
              실전 중심의 영상 강의와 체계적인 커리큘럼으로 당신의 개발자 여정을 시작하세요.
            </p>
            <div className={styles.heroActions}>
              <Link href="/auth/signup" className={`${styles.btn} ${styles.btnPrimary}`}>무료로 시작하기 →</Link>
              <Link href="#curriculum" className={`${styles.btn} ${styles.btnOutline}`}>커리큘럼 보기</Link>
            </div>
          </div>

          <div className={styles.terminal}>
            <div className={styles.terminalBar}>
              <span className={styles.dot} style={{background:'#ff5f57'}} />
              <span className={styles.dot} style={{background:'#febc2e'}} />
              <span className={styles.dot} style={{background:'#28c840'}} />
              <span className={styles.terminalTitle}>python3 — codepath</span>
            </div>
            <div className={styles.terminalBody}>
              <div className={styles.termComment}># 첫 번째 프로그램</div>
              <div><span className={styles.termKeyword}>def</span><span className={styles.termFunc}> hello_world</span><span className={styles.termText}>():</span></div>
              <div><span className={styles.termText}>{'    '}</span><span className={styles.termKeyword}>return</span><span className={styles.termString}> "안녕, 세상아! 🚀"</span></div>
              <br />
              <div><span className={styles.termPrompt}>&gt;&gt;&gt; </span><span className={styles.termFunc}>print</span><span className={styles.termText}>(hello_world())</span></div>
              <div className={styles.termOutput}>안녕, 세상아! 🚀</div>
              <br />
              <div><span className={styles.termPrompt}>&gt;&gt;&gt; </span><span className={styles.termText}>career</span><span className={styles.termKeyword}> = </span><span className={styles.termString}>"developer"</span></div>
              <div><span className={styles.termPrompt}>&gt;&gt;&gt; </span><span className={styles.termFunc}>print</span><span className={styles.termText}>(</span><span className={styles.termString}>f"목표: </span><span className={styles.termText}>{'{'}</span><span className={styles.termText}>career</span><span className={styles.termText}>{'}'}</span><span className={styles.termString}>"</span><span className={styles.termText}>)</span></div>
              <div className={styles.termOutput}>목표: developer<span className={styles.cursor} /></div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className={styles.statsBar}>
        <div className={styles.statsGrid}>
          {[['48+','강의 영상'],['6','커리큘럼 단계'],['2.4K+','수강생'],['4.9','평균 만족도']].map(([n,l]) => (
            <div key={l} className={styles.statItem}>
              <h3>{n}</h3><p>{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className={styles.section} id="features">
        <div className={styles.sectionLabel}>// FEATURES</div>
        <h2 className={styles.sectionTitle}>왜 CodePath인가?</h2>
        <p className={styles.sectionDesc}>수많은 강의 사이에서 CodePath가 다른 점은 실전 중심의 설계에 있습니다.</p>
        <div className={styles.featuresGrid}>
          {features.map(f => (
            <div key={f.title} className={styles.featureCard}>
              <div className={`${styles.featureIcon} ${styles[f.color]}`}>{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CURRICULUM */}
      <section className={styles.curriculumSection} id="curriculum">
        <div className={styles.section}>
          <div className={styles.sectionLabel}>// CURRICULUM</div>
          <h2 className={styles.sectionTitle}>학습 로드맵</h2>
          <p className={styles.sectionDesc}>기초부터 탄탄하게. 단계별로 설계된 커리큘럼을 따라가세요.</p>
          <div className={styles.curriculumGrid}>
            {curriculumItems.map(item => (
              <div key={item.num} className={styles.curriculumItem}>
                <span className={styles.curriculumNum}>{item.num}</span>
                <div className={styles.curriculumInfo}>
                  <h4>{item.title}</h4>
                  <p>{item.meta}</p>
                </div>
                <span className={`${styles.curriculumTag} ${styles[item.tagClass]}`}>{item.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <div className={styles.heroGlow} style={{top:'50%',left:'50%',transform:'translate(-50%,-50%)',background:'var(--accent-green)',opacity:'0.05',width:'800px',height:'400px',borderRadius:'50%',position:'absolute',filter:'blur(120px)',pointerEvents:'none'}} />
        <div className={styles.ctaContent}>
          <h2>지금 바로<br />코딩을 시작하세요</h2>
          <p>48개 이상의 무료 강의가 당신을 기다리고 있습니다.</p>
          <Link href="/auth/signup" className={`${styles.btn} ${styles.btnPrimary}`}>무료 회원가입 →</Link>
          <div className={styles.ctaCode}><span>$</span> python3 -c &quot;import codepath; codepath.<span>start</span>()&quot;</div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <p>© 2026 CodePath — Built for learners, by developers.</p>
      </footer>
    </div>
  )
}
