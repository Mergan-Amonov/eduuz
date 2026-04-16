import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotification } from '../context/NotificationContext.jsx'
import '../styles/auth.css'
import { trackPage, trackEvent } from '../analytics'

function Login() {
  const navigate = useNavigate()
  const { addNotification } = useNotification()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    document.title = "Kirish — EduUz"
    trackPage('Kirish')
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    setError('')
    if (!form.email || !form.password) {
      return setError('Barcha maydonlarni to\'ldiring')
    }
    setLoading(true)
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + '/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.message)
        addNotification(data.message, 'error')
      } else {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        addNotification('Xush kelibsiz! 👋', 'success')
        trackEvent('login', 'auth', 'success')
        navigate('/')
      }
    } catch {
      setError('Server bilan bog\'lanib bo\'lmadi')
    }
    setLoading(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">EduUz</h2>
        <p className="auth-sub">Hisobingizga kiring</p>

        {error && <p className="auth-error">{error}</p>}

        <div className="form-group">
          <label>Email</label>
          <input name="email" type="email" placeholder="example@mail.com" onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Parol</label>
          <input name="password" type="password" placeholder="••••••••" onChange={handleChange} />
        </div>

        <button className="btn-primary full" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Yuklanmoqda...' : 'Kirish'}
        </button>

        <p className="auth-link">
          Hisobingiz yo'qmi?{' '}
          <a onClick={() => navigate('/register')} style={{ cursor: 'pointer' }}>
            Ro'yxatdan o'ting
          </a>
        </p>
      </div>
    </div>
  )
}

export default Login