import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import '../styles/quiz.css'
import '../styles/aiquiz.css'

function AIQuiz() {
  const navigate = useNavigate()
  const params = new URLSearchParams(window.location.search)
  const courseId = params.get('course')
  const courseTitle = params.get('title')
  const courseLessons = params.get('lessons')

  const [topic, setTopic] = useState('')
  const [count, setCount] = useState(5)
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [answers, setAnswers] = useState([])
  const [finished, setFinished] = useState(false)
  const [started, setStarted] = useState(false)
  const [blocked, setBlocked] = useState(false)
  const [blockTime, setBlockTime] = useState(null)

  const getBlockKey = () => `ai_quiz_block_${courseId}`

  const checkBlock = () => {
    if (!courseId) return false
    const saved = localStorage.getItem(getBlockKey())
    if (!saved) return false
    const state = JSON.parse(saved)
    const remaining = new Date(state.blockedUntil) - new Date()
    if (remaining > 0) {
      setBlocked(true)
      setBlockTime(state.blockedUntil)
      return true
    }
    return false
  }

  const doBlock = () => {
    if (!courseId) return
    const blockedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000)
    localStorage.setItem(getBlockKey(), JSON.stringify({ blockedUntil: blockedUntil.toISOString() }))
  }

  const clearBlock = () => {
    if (!courseId) return
    localStorage.removeItem(getBlockKey())
  }

  const generateQuizAuto = async (autoTopic, autoCount) => {
    setError('')
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(import.meta.env.VITE_API_URL + '/api/ai/generate-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ topic: autoTopic, count: autoCount })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.message || 'Xatolik yuz berdi')
        setLoading(false)
        return
      }
      setQuestions(data.questions)
      setStarted(true)
      setCurrent(0)
      setAnswers([])
      setSelected(null)
      setFinished(false)
    } catch {
      setError('Server bilan bog\'lanib bo\'lmadi')
    }
    setLoading(false)
  }

  const generateQuiz = async () => {
    if (!topic.trim()) return setError('Mavzuni kiriting!')
    await generateQuizAuto(topic, count)
  }

  useEffect(() => {
    if (courseTitle) {
      const fullTopic = courseLessons
        ? `${courseTitle} kursi mavzulari: ${courseLessons}`
        : courseTitle
      setTopic(fullTopic)
      setCount(20)

      if (checkBlock()) return

      setTimeout(() => {
        generateQuizAuto(fullTopic, 20)
      }, 300)
    }
  }, [])

  const handleSelect = (index) => {
    if (selected !== null) return
    setSelected(index)
  }

  const handleNext = () => {
    const newAnswers = [...answers, selected]
    setAnswers(newAnswers)
    if (current + 1 < questions.length) {
      setCurrent(current + 1)
      setSelected(null)
    } else {
      setFinished(true)
    }
  }

  const reset = () => {
    setStarted(false)
    setQuestions([])
    setTopic(courseTitle ? (courseLessons ? `${courseTitle} kursi mavzulari: ${courseLessons}` : courseTitle) : '')
    setAnswers([])
    setSelected(null)
    setFinished(false)
    setCurrent(0)
    setError('')
  }

  // Blocked screen
  if (blocked) {
    const remaining = blockTime ? Math.max(0, new Date(blockTime) - new Date()) : 0
    const hours = Math.floor(remaining / 3600000)
    const minutes = Math.floor((remaining % 3600000) / 60000)
    return (
      <div>
        <Navbar />
        <div className="aiquiz-page">
          <div className="aiquiz-generate" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔒</div>
            <h2 style={{ color: '#dc2626' }}>AI Test bloklangan</h2>
            <p style={{ color: '#6b7280', marginBottom: '20px' }}>
              Siz testdan o'ta olmadingiz. Qayta urinish uchun kuting.
            </p>
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '12px',
              padding: '20px 32px',
              display: 'inline-block',
              marginBottom: '24px'
            }}>
              <span style={{ fontSize: '32px', fontWeight: '700', color: '#dc2626', display: 'block' }}>
                {hours} soat {minutes} daqiqa
              </span>
              <p style={{ color: '#6b7280', margin: '4px 0 0', fontSize: '14px' }}>
                dan so'ng qayta urinishingiz mumkin
              </p>
            </div>
            <br />
            <button className="btn-outline" onClick={() => navigate(-1)}>
              ← Kursga qaytish
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Loading screen
  if (loading && !started) return (
    <div>
      <Navbar />
      <div className="aiquiz-page">
        <div className="aiquiz-generate" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🤖</div>
          <h2>AI test yaratmoqda...</h2>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>
            Kurs mavzulari asosida {count} ta savol tayyorlanmoqda
          </p>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #f3f0ff',
            borderTop: '4px solid #7c3aed',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto'
          }}></div>
        </div>
      </div>
    </div>
  )

  // Finished screen
  if (finished) {
    const score = answers.filter((a, i) => a === questions[i].correct).length
    const percent = Math.round((score / questions.length) * 100)
    const passed = percent >= 80

    if (courseId) {
      if (!passed) doBlock()
      else clearBlock()
    }

    return (
      <div>
        <Navbar />
        <div className="aiquiz-page">
          <div className="aiquiz-result">
            <div className="result-emoji">
              {percent >= 80 ? '🏆' : percent >= 60 ? '👍' : '📚'}
            </div>
            <h2>{percent >= 80 ? 'Ajoyib!' : percent >= 60 ? 'Yaxshi urinish!' : 'Ko\'proq o\'qing!'}</h2>
            {topic && <div className="aiquiz-topic-badge">📝 {courseTitle || topic}</div>}
            <p className="result-score">{score} / {questions.length}</p>
            <p className="result-percent">{percent}% to'g'ri</p>

            <div className="result-bar">
              <div className="result-fill" style={{
                width: `${percent}%`,
                background: passed ? '#16a34a' : percent >= 60 ? '#d97706' : '#dc2626'
              }}></div>
            </div>

            <p style={{
              fontSize: '14px',
              padding: '10px 16px',
              borderRadius: '10px',
              marginBottom: '16px',
              background: passed ? '#f0fdf4' : '#fef2f2',
              color: passed ? '#16a34a' : '#dc2626'
            }}>
              {passed
                ? '✅ Tabriklaymiz! Testdan o\'tdingiz!'
                : '❌ Testdan o\'ta olmadingiz. 24 soatdan keyin qayta urining.'}
            </p>

            <div className="aiquiz-answers">
              <h3>Javoblar tahlili:</h3>
              {questions.map((q, i) => (
                <div key={i} className={`aiquiz-answer-item ${answers[i] === q.correct ? 'answer-correct' : 'answer-wrong'}`}>
                  <p className="aiquiz-q">{i + 1}. {q.question}</p>
                  <p className="aiquiz-a">
                    {answers[i] === q.correct ? '✅' : '❌'}
                    Sizning javobingiz: <strong>{q.options[answers[i]]}</strong>
                  </p>
                  {answers[i] !== q.correct && (
                    <p className="aiquiz-correct">
                      ✅ To'g'ri javob: <strong>{q.options[q.correct]}</strong>
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="result-actions">
              {!passed && !courseId && (
                <button className="btn-outline" onClick={reset}>
                  🔄 Qayta urinish
                </button>
              )}
              <button className="btn-outline" onClick={() => navigate(-1)}>
                ← Kursga qaytish
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Generate screen
  if (!started) return (
    <div>
      <Navbar />
      <div className="aiquiz-page">
        <div className="aiquiz-generate">
          <div className="aiquiz-icon">🤖</div>
          <h2>AI Test Generatsiya</h2>
          <p>Istalgan mavzu bo'yicha AI avtomatik test yaratadi!</p>

          {error && <p className="aiquiz-error">{error}</p>}

          <div className="aiquiz-form">
            <div className="form-group">
              <label>Mavzu</label>
              <input
                type="text"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="Masalan: Python o'zgaruvchilar, Fotosintez..."
                onKeyDown={e => e.key === 'Enter' && generateQuiz()}
              />
            </div>

            <div className="form-group">
              <label>Savollar soni</label>
              <div className="count-select">
                {[5, 10, 15, 20].map(n => (
                  <button
                    key={n}
                    className={`count-btn ${count === n ? 'count-active' : ''}`}
                    onClick={() => setCount(n)}
                  >
                    {n} ta
                  </button>
                ))}
              </div>
            </div>

            <div className="aiquiz-examples">
              <p>Mashhur mavzular:</p>
              <div className="aiquiz-tags">
                {['Python asoslari', 'JavaScript', 'Matematika', 'Ingliz tili', 'Fizika', 'Tarix', 'React', 'SQL'].map(t => (
                  <span key={t} className="aiquiz-tag" onClick={() => setTopic(t)}>{t}</span>
                ))}
              </div>
            </div>

            <button className="btn-primary full aiquiz-btn" onClick={generateQuiz} disabled={loading}>
              {loading ? (
                <span className="aiquiz-loading">
                  <span className="aiquiz-spinner"></span>
                  Yaratmoqda...
                </span>
              ) : '🤖 Test yaratish'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  // Quiz screen
  const question = questions[current]

  return (
    <div>
      <Navbar />
      <div className="aiquiz-page">
        <div className="quiz-card">
          <div className="quiz-header">
            <span className="quiz-course">🤖 AI Test — {courseTitle || topic}</span>
            <span className="quiz-progress">{current + 1} / {questions.length}</span>
          </div>

          <div className="quiz-progressbar">
            <div className="quiz-progressfill" style={{ width: `${(current / questions.length) * 100}%` }}></div>
          </div>

          <h3 className="quiz-question">{question.question}</h3>

          <div className="quiz-options">
            {question.options.map((opt, i) => (
              <button
                key={i}
                className={`quiz-option ${selected === i ? (i === question.correct ? 'option-correct' : 'option-wrong') : ''} ${selected !== null && i === question.correct ? 'option-correct' : ''}`}
                onClick={() => handleSelect(i)}
              >
                <span className="option-letter">{['A', 'B', 'C', 'D'][i]}</span>
                {opt}
              </button>
            ))}
          </div>

          {selected !== null && (
            <button className="btn-primary full quiz-next" onClick={handleNext}>
              {current + 1 === questions.length ? 'Natijani ko\'rish' : 'Keyingi savol →'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default AIQuiz