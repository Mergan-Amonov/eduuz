import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Loading from '../components/Loading'
import '../styles/dashboard.css'

function Dashboard() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'))
  const token = localStorage.getItem('token')
  const [enrolledCourses, setEnrolledCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    document.title = "Dashboard — EduUz"

    fetch(import.meta.env.VITE_API_URL + '/api/courses/my', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setEnrolledCourses(data.filter(c => c && c.title))
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div><Navbar /><Loading text="Dashboard yuklanmoqda..." /></div>
  )

  const certCount = enrolledCourses.filter(k => {
    const state = localStorage.getItem(`quiz_${user?.id}_${k.course_id}`)
    return state ? JSON.parse(state)?.passed : false
  }).length

  const totalLessons = enrolledCourses.reduce((acc, k) =>
    acc + Math.round(((k.progress || 0) / 100) * (k.lessons?.length || 8)), 0)

  const avgProgress = enrolledCourses.length > 0
    ? Math.round(enrolledCourses.reduce((a, k) => a + (k.progress || 0), 0) / enrolledCourses.length)
    : 0

  const completedCourses = enrolledCourses.filter(k => k.progress === 100)
  const inProgressCourses = enrolledCourses.filter(k => k.progress > 0 && k.progress < 100)

  return (
    <div>
      <Navbar />
      <div className="dashboard-page">

        {/* Profil */}
        <div className="dash-profile">
          <div className="dash-avatar">{user.name[0].toUpperCase()}</div>
          <div className="dash-profile-info">
            <h2>{user.name}</h2>
            <p>{user.email}</p>
            <span className="profile-badge">🎓 O'quvchi</span>
          </div>
          <button className="btn-outline" onClick={() => navigate('/profile')}>
            ✏️ Profilni tahrirlash
          </button>
        </div>

        {/* Statistika kartochkalari */}
        <div className="dash-stats">
          {[
            { label: "Kurslar", value: enrolledCourses.length, icon: "📚", color: "#7c3aed" },
            { label: "O'rtacha progress", value: `${avgProgress}%`, icon: "📈", color: "#0ea5e9" },
            { label: "Darslar", value: totalLessons, icon: "✅", color: "#16a34a" },
            { label: "Sertifikatlar", value: certCount, icon: "🏆", color: "#f59e0b" },
          ].map((s, i) => (
            <div key={i} className="dash-stat-card">
              <div className="dash-stat-icon" style={{ background: s.color + '15', color: s.color }}>
                {s.icon}
              </div>
              <div>
                <div className="dash-stat-value" style={{ color: s.color }}>{s.value}</div>
                <div className="dash-stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tablar */}
        <div className="dash-tabs">
          {[
            { key: 'overview', label: 'Umumiy' },
            { key: 'courses', label: 'Kurslarim' },
            { key: 'results', label: 'Natijalar' },
          ].map(tab => (
            <button
              key={tab.key}
              className={`dash-tab ${activeTab === tab.key ? 'dash-tab-active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Umumiy tab */}
        {activeTab === 'overview' && (
          <div className="dash-content">
            <div className="dash-section">
              <h3>Kurslar holati</h3>
              <div className="dash-status-list">
                {[
                  { label: "✅ Tugatilgan", count: completedCourses.length, color: "#16a34a" },
                  { label: "📖 Davom etmoqda", count: inProgressCourses.length, color: "#0ea5e9" },
                  { label: "⏸ Boshlanmagan", count: enrolledCourses.length - completedCourses.length - inProgressCourses.length, color: "#9ca3af" },
                ].map((s, i) => (
                  <div key={i} className="dash-status-item">
                    <div className="dash-status-info">
                      <span>{s.label}</span>
                      <span style={{ color: s.color, fontWeight: '700' }}>{s.count} ta</span>
                    </div>
                    <div className="dash-status-bar">
                      <div className="dash-status-fill" style={{
                        width: `${enrolledCourses.length ? (s.count / enrolledCourses.length) * 100 : 0}%`,
                        background: s.color
                      }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="dash-section">
              <h3>Tezkor havolalar</h3>
              <div className="dash-quick-links">
                <div className="dash-quick-card" onClick={() => navigate('/courses')}>
                  <span>📚</span>
                  <p>Yangi kurs boshlash</p>
                </div>
                <div className="dash-quick-card" onClick={() => navigate('/ai-quiz')}>
                  <span>🤖</span>
                  <p>AI test yechish</p>
                </div>
                <div className="dash-quick-card" onClick={() => navigate('/profile')}>
                  <span>👤</span>
                  <p>Profilni yangilash</p>
                </div>
                {certCount > 0 && (
                  <div className="dash-quick-card" onClick={() => setActiveTab('results')}>
                    <span>🏆</span>
                    <p>Sertifikatlarim</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Kurslarim tab */}
        {activeTab === 'courses' && (
          <div className="dash-content">
            {enrolledCourses.length === 0 ? (
              <div className="dash-empty">
                <p style={{ fontSize: '40px' }}>📚</p>
                <p>Hali hech qaysi kursga yozilmagansiz</p>
                <button className="btn-primary" onClick={() => navigate('/courses')}>
                  Kurslarga o'tish
                </button>
              </div>
            ) : (
              <div className="dash-course-list">
                {enrolledCourses.map((kurs, i) => (
                  <div key={i} className="dash-course-item" onClick={() => navigate(`/courses/${kurs.course_id}`)}>
                    <div className="dash-course-left">
                      <span style={{ fontSize: '28px' }}>{kurs.emoji || '📚'}</span>
                      <div>
                        <h4>{kurs.title}</h4>
                        <span style={{ fontSize: '12px', color: '#9ca3af' }}>{kurs.category}</span>
                      </div>
                    </div>
                    <div className="dash-course-right">
                      <div className="dash-progress-wrap">
                        <div className="progress-bar">
                          <div className="progress-fill" style={{
                            width: `${kurs.progress}%`,
                            background: kurs.progress === 100 ? '#16a34a' : '#7c3aed'
                          }}></div>
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280', minWidth: '36px' }}>
                          {kurs.progress}%
                        </span>
                      </div>
                      {kurs.progress === 100 && (
                        <span className="dash-badge badge-green">✅ Tugadi</span>
                      )}
                      {kurs.progress > 0 && kurs.progress < 100 && (
                        <span className="dash-badge badge-blue">📖 Davom etmoqda</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Natijalar tab */}
        {activeTab === 'results' && (
          <div className="dash-content">
            <div className="dash-results-grid">
              {enrolledCourses.filter(k => k.progress === 100).map((kurs, i) => {
                const quizState = localStorage.getItem(`quiz_${user?.id}_${kurs.course_id}`)
                const passed = quizState ? JSON.parse(quizState)?.passed : false
                return (
                  <div key={i} className="dash-result-card">
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>{kurs.emoji || '📚'}</div>
                    <h4>{kurs.title}</h4>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap', margin: '10px 0' }}>
                      <span className="dash-badge badge-green">✅ Tugatildi</span>
                      {passed && <span className="dash-badge badge-gold">🏆 Sertifikat</span>}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      {passed && (
                        <button className="btn-primary" style={{ fontSize: '13px', padding: '8px 14px' }}
                          onClick={() => navigate(`/certificate/${kurs.course_id}`)}>
                          Sertifikat
                        </button>
                      )}
                      {!passed && (
                        <button className="btn-outline" style={{ fontSize: '13px', padding: '8px 14px' }}
                          onClick={() => navigate(`/courses/${kurs.course_id}`)}>
                          Testga kirish
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
              {enrolledCourses.filter(k => k.progress === 100).length === 0 && (
                <div className="dash-empty">
                  <p style={{ fontSize: '40px' }}>🏆</p>
                  <p>Hali hech qaysi kursni tugatmagansiz</p>
                  <button className="btn-primary" onClick={() => setActiveTab('courses')}>
                    Kurslarimga o'tish
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default Dashboard