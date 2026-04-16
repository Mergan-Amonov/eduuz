import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Loading from '../components/Loading'
import { useNotification } from '../context/NotificationContext.jsx'
import '../styles/coursedetail.css'
import { trackPage, trackEvent } from '../analytics'
import Comments from '../components/Comments'

function getQuizState(courseId, userId) {
  const key = `quiz_${userId}_${courseId}`
  const saved = localStorage.getItem(key)
  return saved ? JSON.parse(saved) : null
}

function CourseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addNotification } = useNotification()

  const [course, setCourse] = useState(null)
  const [enrolled, setEnrolled] = useState(false)
  const [enrollLoading, setEnrollLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [completedLessons, setCompletedLessons] = useState([])
  const [progress, setProgress] = useState(0)

  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user'))

  useEffect(() => {
    const loadCourse = async () => {
      try {
        const res = await fetch(import.meta.env.VITE_API_URL + '/api/admin/courses')
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          const found = data.find(k => String(k.id) === String(id))
          if (found) {
            const normalizedLessons = (found.lessons || []).map((l, i) => {
              if (!l) return { title: `${i + 1}-dars`, video: '', desc: '' }
              if (typeof l === 'string') return { title: l, video: '', desc: '' }
              if (typeof l === 'object') return {
                title: l.title || `${i + 1}-dars`,
                video: l.video || '',
                desc: l.desc || ''
              }
              return { title: `${i + 1}-dars`, video: '', desc: '' }
            })
            setCourse({ ...found, lessons: normalizedLessons })
            document.title = `${found.title} — EduUz`
          } else {
            setCourse(null)
          }
        }
      } catch {
        setCourse(null)
      }

      if (!token) {
        setPageLoading(false)
        return
      }

      Promise.all([
        fetch(import.meta.env.VITE_API_URL + '/api/courses/my', {
          headers: { Authorization: `Bearer ${token}` }
        }).then(r => r.json()).catch(() => []),
        fetch(`${import.meta.env.VITE_API_URL}/api/courses/progress/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        }).then(r => r.json()).catch(() => [])
      ])
        .then(([myData, progressData]) => {
          if (Array.isArray(myData)) {
            const enrolledCourse = myData.find(e => String(e.course_id) === String(id))
            if (enrolledCourse) {
              setEnrolled(true)
              setProgress(enrolledCourse.progress)
            }
          }
          if (Array.isArray(progressData)) {
            const completed = progressData.filter(l => l.completed).map(l => l.lesson_index)
            setCompletedLessons(completed)
          }
        })
        .catch(err => console.error(err))
        .finally(() => setPageLoading(false))
    }

    loadCourse()
  }, [id])

  const handleEnroll = async () => {
    if (!token) return navigate('/login')
    setEnrollLoading(true)
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + '/api/courses/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ course_id: parseInt(id) || id })
      })
      const data = await res.json()
      if (res.ok) {
        trackEvent('enroll', 'course', course.title)
        setEnrolled(true)
        setMessage('🎉 Kursga muvaffaqiyatli yozildingiz!')
        addNotification('🎉 Kursga muvaffaqiyatli yozildingiz!', 'success')
      } else {
        setMessage(data.message)
        addNotification(data.message, 'error')
      }
    } catch {
      addNotification('Server bilan bog\'lanib bo\'lmadi', 'error')
    }
    setEnrollLoading(false)
  }

  const handleLesson = async (index) => {
    if (!token || !enrolled || !course) return
    const isCompleted = completedLessons.includes(index)
    const newCompleted = isCompleted
      ? completedLessons.filter(i => i !== index)
      : [...completedLessons, index]
    setCompletedLessons(newCompleted)

    try {
      const res = await fetch(import.meta.env.VITE_API_URL + '/api/courses/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          course_id: parseInt(id) || id,
          lesson_index: index,
          completed: !isCompleted,
          total_lessons: course.lessons.length
        })
      })
      const data = await res.json()
      if (res.ok) {
        setProgress(data.progress)
        addNotification(
          isCompleted ? '📖 Dars bekor qilindi' : '✅ Dars bajarildi!',
          isCompleted ? 'warning' : 'success'
        )
      }
    } catch (err) {
      console.error(err)
    }
  }

  if (pageLoading) return (
    <div>
      <Navbar />
      <Loading text="Kurs yuklanmoqda..." />
    </div>
  )

  if (!course) return (
    <div>
      <Navbar />
      <div style={{ textAlign: 'center', padding: '80px' }}>
        <h2>Kurs topilmadi 😕</h2>
        <button className="btn-primary" onClick={() => navigate('/courses')}>
          Kurslarga qaytish
        </button>
      </div>
    </div>
  )

  const quizState = user ? getQuizState(id, user.id) : null
  const getAIBlockState = (courseId) => {
    const key = `ai_quiz_block_${courseId}`
    const saved = localStorage.getItem(key)
    if (!saved) return null
    const state = JSON.parse(saved)
    const remaining = new Date(state.blockedUntil) - new Date()
    return remaining > 0 ? state : null
  }

  const aiBlockState = getAIBlockState(id)
  const aiBlocked = !!aiBlockState
  const aiBlockRemaining = aiBlockState
    ? Math.max(0, new Date(aiBlockState.blockedUntil) - new Date())
    : 0
  const aiBlockHours = Math.floor(aiBlockRemaining / 3600000)
  const aiBlockMinutes = Math.floor((aiBlockRemaining % 3600000) / 60000)

  return (
    <div>
      <Navbar />
      <div className="detail-page">
        <div className="detail-header">
          <div className="detail-emoji">{course.emoji}</div>
          <div style={{ flex: 1 }}>
            <span className="detail-category">{course.category}</span>
            <h2 className="detail-title">{course.title}</h2>
            <p className="detail-desc">{course.about}</p>
            <div className="detail-meta">
              <span>📚 {course.lessons?.length || 0} dars</span>
              <span>📊 {course.daraja}</span>
              {enrolled && <span>✅ {progress}% bajarildi</span>}
            </div>
            {enrolled && (
              <div className="detail-progress">
                <div className="detail-progress-fill" style={{ width: `${progress}%` }}></div>
              </div>
            )}
          </div>
        </div>

        <div className="detail-body">
          <div className="lessons-box">
            <h3>Darslar ro'yxati</h3>
            {!enrolled && (
              <p className="lessons-hint">💡 Kursga yoziling va darslarni belgilab boring!</p>
            )}
            {course.lessons && course.lessons.length > 0 ? (
              <ul className="lessons-list">
                {course.lessons.map((lesson, i) => {
                  const lessonTitle = lesson === null || lesson === undefined
                    ? `${i + 1}-dars`
                    : typeof lesson === 'object'
                      ? (lesson.title || `${i + 1}-dars`)
                      : String(lesson)

                  return (
                    <li
                      key={i}
                      className={`lesson-item ${completedLessons.includes(i) ? 'lesson-done' : ''} ${enrolled ? 'lesson-clickable' : ''}`}
                      onClick={() => {
                        if (enrolled) navigate(`/courses/${id}/lessons/${i}`)
                      }}
                    >
                      <span className="lesson-num">
                        {completedLessons.includes(i) ? '✓' : i + 1}
                      </span>
                      <span>{lessonTitle}</span>
                      {enrolled && (
                        <span className="lesson-check">
                          {completedLessons.includes(i) ? '✅' : '⬜'}
                        </span>
                      )}
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p style={{ color: '#9ca3af', fontSize: '14px' }}>
                Darslar hali qo'shilmagan
              </p>
            )}
          </div>

          <div className="enroll-box">
            <p className="enroll-price">Bepul</p>

            {message && (
              <p style={{
                background: '#f0fdf4',
                color: '#16a34a',
                padding: '10px',
                borderRadius: '8px',
                fontSize: '14px',
                marginBottom: '12px',
                textAlign: 'center'
              }}>{message}</p>
            )}

            {enrolled ? (
              <div>
                <div className="progress-bar" style={{ marginBottom: '8px' }}>
                  <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                </div>
                <p style={{ textAlign: 'center', fontSize: '14px', color: '#7c3aed', fontWeight: '600', marginBottom: '16px' }}>
                  {progress}% bajarildi
                </p>

                {progress < 100 && (
                  <p style={{ fontSize: '13px', color: '#9ca3af', textAlign: 'center', marginBottom: '12px' }}>
                    📖 Testga kirish uchun barcha darslarni tugating
                  </p>
                )}

                {progress === 100 && !quizState?.passed && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '12px' }}>
                    {aiBlocked ? (
                      <div style={{
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '10px',
                        padding: '12px',
                        textAlign: 'center'
                      }}>
                        <p style={{ color: '#dc2626', fontSize: '13px', fontWeight: '600' }}>🔒 AI test bloklangan</p>
                        <p style={{ color: '#9ca3af', fontSize: '12px' }}>
                          {aiBlockHours} soat {aiBlockMinutes} daqiqadan keyin
                        </p>
                      </div>
                    ) : (
                      <button
                        className="btn-primary full"
                        style={{ background: '#0ea5e9' }}
                        onClick={() => navigate(`/ai-quiz?course=${id}&title=${encodeURIComponent(course.title)}&lessons=${encodeURIComponent(course.lessons.map(l => typeof l === 'object' ? l.title : l).join(', '))}`)}
                      >
                        Testni boshlash
                      </button>
                    )}
                  </div>
                )}

                {quizState?.passed && (
                  <button className="btn-primary full"
                    style={{ background: '#16a34a', marginBottom: '12px' }}
                    onClick={() => navigate(`/certificate/${id}`)}>
                    🏆 Sertifikat olish
                  </button>
                )}
              </div>
            ) : (
              <button className="btn-primary full" onClick={handleEnroll} disabled={enrollLoading}>
                {enrollLoading ? 'Yuklanmoqda...' : 'Kursga yozilish'}
              </button>
            )}

            <ul className="enroll-info">
              <li>✅ To'liq bepul</li>
              <li>✅ Sertifikat beriladi</li>
              <li>✅ O'zbek tilida</li>
              <li>✅ Istalgan vaqtda o'qish</li>
            </ul>
          </div>
          <Comments courseId={id} />
        </div>
      </div>
    </div>
  )
}

export default CourseDetail