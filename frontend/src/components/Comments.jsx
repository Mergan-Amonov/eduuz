import { useState, useEffect } from 'react'
import '../styles/comments.css'

function Comments({ courseId }) {
  const [comments, setComments] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const user = JSON.parse(localStorage.getItem('user'))
  const token = localStorage.getItem('token')

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/comments/${courseId}`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setComments(data)
      })
      .catch(console.error)
  }, [courseId])

  const handleSubmit = async () => {
    if (!text.trim()) return setError('Izoh yozing!')
    if (!token) return setError('Izoh qoldirish uchun kiring!')
    setError('')
    setLoading(true)

    try {
      const res = await fetch(import.meta.env.VITE_API_URL + '/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ course_id: String(courseId), text })
      })
      const data = await res.json()
      if (res.ok) {
        setComments([data, ...comments])
        setText('')
      } else {
        setError(data.message)
      }
    } catch {
      setError('Xatolik yuz berdi')
    }
    setLoading(false)
  }

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/comments/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        setComments(comments.filter(c => c.id !== id))
      }
    } catch (err) {
      console.error(err)
    }
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="comments-section">
      <h3 className="comments-title">
        💬 Izohlar <span className="comments-count">{comments.length}</span>
      </h3>

      {/* Izoh yozish */}
      {user ? (
        <div className="comment-form">
          <div className="comment-form-header">
            <div className="comment-avatar">{user.name[0].toUpperCase()}</div>
            <span className="comment-username">{user.name}</span>
          </div>
          {error && <p className="comment-error">{error}</p>}
          <textarea
            className="comment-input"
            placeholder="Kurs haqida fikringizni yozing..."
            value={text}
            onChange={e => setText(e.target.value)}
            rows={3}
          />
          <div className="comment-form-footer">
            <span className="comment-hint">
              {text.length}/500 belgi
            </span>
            <button
              className="btn-primary comment-btn"
              onClick={handleSubmit}
              disabled={loading || !text.trim()}
            >
              {loading ? 'Yuborilmoqda...' : '💬 Izoh qoldirish'}
            </button>
          </div>
        </div>
      ) : (
        <div className="comment-login-hint">
          <p>💬 Izoh qoldirish uchun <a href="/login">kiring</a></p>
        </div>
      )}

      {/* Izohlar ro'yxati */}
      <div className="comments-list">
        {comments.length === 0 ? (
          <div className="comments-empty">
            <p>Hali izoh yo'q. Birinchi bo'ling!</p>
          </div>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="comment-item">
              <div className="comment-header">
                <div className="comment-user">
                  <div className="comment-avatar">
                    {comment.name[0].toUpperCase()}
                  </div>
                  <div>
                    <span className="comment-name">{comment.name}</span>
                    <span className="comment-date">{formatDate(comment.created_at)}</span>
                  </div>
                </div>
                {user && user.id === comment.user_id && (
                  <button
                    className="comment-delete"
                    onClick={() => handleDelete(comment.id)}
                  >
                    🗑️
                  </button>
                )}
              </div>
              <p className="comment-text">{comment.text}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Comments