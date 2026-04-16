import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import '../styles/profile.css'
import { useNotification } from '../context/NotificationContext'

function Profile() {
  const { addNotification } = useNotification()
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'))

  const [nameForm, setNameForm] = useState({ name: user?.name || '' })
  const [passForm, setPassForm] = useState({ oldPassword: '', newPassword: '', confirm: '' })
  const [nameMsg, setNameMsg] = useState('')
  const [passMsg, setPassMsg] = useState('')
  const [nameLoading, setNameLoading] = useState(false)
  const [passLoading, setPassLoading] = useState(false)

  const [aiForm, setAiForm] = useState({ provider: 'openrouter', api_key: '', model: '' })
  const [aiMsg, setAiMsg] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return
    fetch(import.meta.env.VITE_API_URL + '/api/auth/ai-settings', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        if (data.provider || data.model) {
          setAiForm({
            provider: data.provider || 'openrouter',
            api_key: data.api_key || '',
            model: data.model || ''
          })
        }
      })
      .catch(() => {})
  }, [])

  const handleAiSave = async () => {
    setAiLoading(true)
    setAiMsg('')
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + '/api/auth/ai-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(aiForm)
      })
      const data = await res.json()
      if (res.ok) {
        addNotification('✅ AI sozlamalari saqlandi!', 'success')
      } else {
        setAiMsg({ text: data.message, ok: false })
      }
    } catch {
      setAiMsg({ text: 'Server bilan bog\'lanib bo\'lmadi', ok: false })
    }
    setAiLoading(false)
  }

  if (!user) {
    navigate('/login')
    return null
  }

  const handleNameUpdate = async () => {
    if (!nameForm.name.trim()) return setNameMsg({ text: 'Ism bo\'sh bo\'lmasin', ok: false })
    setNameLoading(true)
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + '/api/auth/update-name', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name: nameForm.name })
      })
      const data = await res.json()
      if (res.ok) {
        const updated = { ...user, name: nameForm.name }
        localStorage.setItem('user', JSON.stringify(updated))
        addNotification('✅ Ism muvaffaqiyatli yangilandi!', 'success')
      } else {
        setNameMsg({ text: data.message, ok: false })
      }
    } catch {
      setNameMsg({ text: 'Server bilan bog\'lanib bo\'lmadi', ok: false })
    }
    setNameLoading(false)
  }

  const handlePassUpdate = async () => {
    if (!passForm.oldPassword || !passForm.newPassword) {
      return setPassMsg({ text: 'Barcha maydonlarni to\'ldiring', ok: false })
    }
    if (passForm.newPassword !== passForm.confirm) {
      return setPassMsg({ text: 'Yangi parollar mos kelmadi', ok: false })
    }
    if (passForm.newPassword.length < 6) {
      return setPassMsg({ text: 'Parol kamida 6 ta belgi bo\'lsin', ok: false })
    }
    setPassLoading(true)
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + '/api/auth/update-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          oldPassword: passForm.oldPassword,
          newPassword: passForm.newPassword
        })
      })
      const data = await res.json()
      if (res.ok) {
        addNotification('✅ Parol muvaffaqiyatli yangilandi!', 'success')
        setPassForm({ oldPassword: '', newPassword: '', confirm: '' })
      } else {
        setPassMsg({ text: data.message, ok: false })
      }
    } catch {
      setPassMsg({ text: 'Server bilan bog\'lanib bo\'lmadi', ok: false })
    }
    setPassLoading(false)
  }

  return (
    <div>
      <Navbar />
      <div className="profile-page">

        {/* Profil kartochka */}
        <div className="profile-hero">
          <div className="profile-avatar-big">{user.name[0].toUpperCase()}</div>
          <h2>{user.name}</h2>
          <p>{user.email}</p>
          <span className="profile-badge">🎓 O'quvchi</span>
        </div>

        {/* Ism o'zgartirish */}
        <div className="profile-card">
          <h3>👤 Ismni o'zgartirish</h3>

          {nameMsg && (
            <p className={`profile-msg ${nameMsg.ok ? 'msg-ok' : 'msg-err'}`}>
              {nameMsg.text}
            </p>
          )}

          <div className="form-group">
            <label>Yangi ism</label>
            <input
              type="text"
              value={nameForm.name}
              onChange={e => setNameForm({ name: e.target.value })}
              placeholder="Ism va familiya"
            />
          </div>

          <button className="btn-primary" onClick={handleNameUpdate} disabled={nameLoading}>
            {nameLoading ? 'Saqlanmoqda...' : 'Saqlash'}
          </button>
        </div>

        {/* Parol o'zgartirish */}
        <div className="profile-card">
          <h3>🔒 Parolni o'zgartirish</h3>

          {passMsg && (
            <p className={`profile-msg ${passMsg.ok ? 'msg-ok' : 'msg-err'}`}>
              {passMsg.text}
            </p>
          )}

          <div className="form-group">
            <label>Eski parol</label>
            <input
              type="password"
              value={passForm.oldPassword}
              onChange={e => setPassForm({ ...passForm, oldPassword: e.target.value })}
              placeholder="••••••••"
            />
          </div>

          <div className="form-group">
            <label>Yangi parol</label>
            <input
              type="password"
              value={passForm.newPassword}
              onChange={e => setPassForm({ ...passForm, newPassword: e.target.value })}
              placeholder="••••••••"
            />
          </div>

          <div className="form-group">
            <label>Yangi parolni tasdiqlang</label>
            <input
              type="password"
              value={passForm.confirm}
              onChange={e => setPassForm({ ...passForm, confirm: e.target.value })}
              placeholder="••••••••"
            />
          </div>

          <button className="btn-primary" onClick={handlePassUpdate} disabled={passLoading}>
            {passLoading ? 'Saqlanmoqda...' : 'Parolni yangilash'}
          </button>
        </div>

        {/* AI sozlamalari */}
        <div className="profile-card">
          <h3>🤖 AI sozlamalari</h3>
          <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '1rem' }}>
            O'z API kalitingizni kiriting — ixtiyoriy. Bo'sh qoldirsangiz, bepul model ishlatiladi.
          </p>

          {aiMsg && (
            <p className={`profile-msg ${aiMsg.ok ? 'msg-ok' : 'msg-err'}`}>
              {aiMsg.text}
            </p>
          )}

          <div className="form-group">
            <label>AI Provayder</label>
            <select
              value={aiForm.provider}
              onChange={e => setAiForm({ ...aiForm, provider: e.target.value })}
            >
              <option value="openrouter">OpenRouter (tavsiya)</option>
              <option value="groq">Groq</option>
              <option value="openai">OpenAI</option>
            </select>
          </div>

          <div className="form-group">
            <label>API Kalit</label>
            <input
              type="password"
              value={aiForm.api_key}
              onChange={e => setAiForm({ ...aiForm, api_key: e.target.value })}
              placeholder="sk-... yoki or-..."
            />
          </div>

          <div className="form-group">
            <label>Model (ixtiyoriy)</label>
            <input
              type="text"
              value={aiForm.model}
              onChange={e => setAiForm({ ...aiForm, model: e.target.value })}
              placeholder="mistralai/mistral-7b-instruct:free"
            />
          </div>

          <button className="btn-primary" onClick={handleAiSave} disabled={aiLoading}>
            {aiLoading ? 'Saqlanmoqda...' : 'AI sozlamalarini saqlash'}
          </button>
        </div>

        {/* Xavfli zona */}
        <div className="profile-card danger-card">
          <h3>⚠️ Hisobdan chiqish</h3>
          <p>Barcha qurilmalardan chiqish uchun tugmani bosing.</p>
          <button className="btn-danger" onClick={() => {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            navigate('/')
          }}>
            Chiqish
          </button>
        </div>

      </div>
    </div>
  )
}

export default Profile