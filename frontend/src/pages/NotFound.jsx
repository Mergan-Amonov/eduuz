import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import '../styles/notfound.css'

function NotFound() {
  const navigate = useNavigate()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <div className="notfound-page">
        <div className="notfound-card">
          <div className="notfound-code">404</div>
          <div className="notfound-emoji">🔍</div>
          <h2 className="notfound-title">Sahifa topilmadi</h2>
          <p className="notfound-desc">
            Siz qidirayotgan sahifa mavjud emas yoki ko'chirilgan bo'lishi mumkin.
          </p>
          <div className="notfound-actions">
            <button className="btn-primary" onClick={() => navigate('/')}>
              Bosh sahifaga qaytish
            </button>
            <button className="btn-outline" onClick={() => navigate('/courses')}>
              Kurslarga o'tish
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default NotFound