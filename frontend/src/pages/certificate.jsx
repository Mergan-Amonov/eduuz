import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import '../styles/certificate.css'

function Certificate() {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'))
  const [course, setCourse] = useState(null)
  const date = new Date().toLocaleDateString('uz-UZ', {
    year: 'numeric', month: 'numeric', day: 'numeric'
  })

  useEffect(() => {
    if (!user) { navigate('/'); return }
    fetch(import.meta.env.VITE_API_URL + '/api/admin/courses')
      .then(r => r.json())
      .then(data => {
        const found = Array.isArray(data) ? data.find(c => String(c.id) === String(id)) : null
        if (!found) navigate('/')
        else setCourse(found)
      })
      .catch(() => navigate('/'))
  }, [id])

  if (!user || !course) return null

  const handlePrint = () => window.print()

  return (
    <div className="cert-page">
      <div className="cert-actions no-print">
        <button className="btn-outline" onClick={() => navigate(`/courses/${id}`)}>
          ← Kursga qaytish
        </button>
        <button className="btn-primary" onClick={handlePrint}>
          🖨️ Chop etish
        </button>
      </div>

      <div className="cert-wrapper">
        <div className="cert-card">
          <div className="cert-top">
            <div className="cert-logo">EduUz</div>
            <p className="cert-label">Ta'lim platformasi</p>
          </div>

          <div className="cert-divider"></div>

          <p className="cert-title">SERTIFIKAT</p>
          <p className="cert-sub">Ushbu sertifikat quyidagi shaxsga beriladi</p>

          <h2 className="cert-name">{user.name}</h2>

          <p className="cert-text">
            <strong>{course.title}</strong> kursini muvaffaqiyatli yakunlaganligi uchun
          </p>

          <div className="cert-divider"></div>

          <div className="cert-footer">
            <div className="cert-footer-item">
              <span className="cert-footer-label">Sana</span>
              <span className="cert-footer-value">{date}</span>
            </div>
            <div className="cert-seal">🏆</div>
            <div className="cert-footer-item">
              <span className="cert-footer-label">Platforma</span>
              <span className="cert-footer-value">EduUz</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Certificate
