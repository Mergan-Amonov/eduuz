import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/auth.css'
import { useNotification } from '../context/NotificationContext'
import { trackPage, trackEvent } from '../analytics'

function Register() {
  const { addNotification } = useNotification()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    document.title = "Ro'yxatdan o'tish — EduUz"
    trackPage('Ro\'yxatdan o\'tish')
  }, [])


  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    setError('')

    if (!form.name || !form.email || !form.password) {
      return setError('Barcha maydonlarni to\'ldiring')
    }

    if (form.password !== form.confirm) {
      return setError('Parollar mos kelmadi')
    }

    setLoading(true)

    try {
      const res = await fetch(import.meta.env.VITE_API_URL + '/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password
        })
      })

      const data = await res.json()

      if (!res.ok) {
        addNotification(data.message, 'error')
      } else {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        addNotification('Muvaffaqiyatli ro\'yxatdan o\'tdingiz!', 'success')
        trackEvent('register', 'auth', 'success')
        navigate('/')
      }
    } catch (err) {
      setError('Server bilan bog\'lanib bo\'lmadi')
    }

    setLoading(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">EduUz</h2>
        <p className="auth-sub">Yangi hisob yarating</p>

        {error && <p className="auth-error">{error}</p>}

        <div className="form-group">
          <label>Ism va familiya</label>
          <input name="name" type="text" placeholder="Ali Valiyev" onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input name="email" type="email" placeholder="example@mail.com" onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Parol</label>
          <input name="password" type="password" placeholder="••••••••" onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Parolni tasdiqlang</label>
          <input name="confirm" type="password" placeholder="••••••••" onChange={handleChange} />
        </div>

        <button className="btn-primary full" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Yuklanmoqda...' : 'Ro\'yxatdan o\'tish'}
        </button>

        <p className="auth-link">
          Hisobingiz bormi?{' '}
          <a onClick={() => navigate('/login')} style={{ cursor: 'pointer' }}>
            Kirish
          </a>
        </p>
      </div>
    </div>
  )
}

export default Register