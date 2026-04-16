import { useNavigate } from 'react-router-dom'
import '../styles/footer.css'

function Footer() {
  const navigate = useNavigate()
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer-inner">

        <div className="footer-brand">
          <h2 className="footer-logo">EduUz</h2>
          <p className="footer-desc">
            O'zbek tilida bepul ta'lim platformasi. Dasturlash, fan, til va dizayn kurslarini o'rganing.
          </p>
          <div className="footer-socials">
            <a href="#" className="social-btn">📘 Facebook</a>
            <a href="#" className="social-btn">📸 Instagram</a>
            <a href="#" className="social-btn">✈️ Telegram</a>
          </div>
        </div>

        <div className="footer-links">
          <div className="footer-col">
            <h4>Sahifalar</h4>
            <ul>
              <li onClick={() => navigate('/')}>Bosh sahifa</li>
              <li onClick={() => navigate('/courses')}>Kurslar</li>
              <li onClick={() => navigate('/dashboard')}>Dashboard</li>
              <li onClick={() => navigate('/profile')}>Profil</li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Kurslar</h4>
            <ul>
              <li onClick={() => navigate('/courses')}>Dasturlash</li>
              <li onClick={() => navigate('/courses')}>Matematika</li>
              <li onClick={() => navigate('/courses')}>Ingliz tili</li>
              <li onClick={() => navigate('/courses')}>Dizayn</li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Yordam</h4>
            <ul>
              <li>Biz haqimizda</li>
              <li>Aloqa</li>
              <li>Maxfiylik siyosati</li>
              <li>Foydalanish shartlari</li>
            </ul>
          </div>
        </div>

      </div>

      <div className="footer-bottom">
        <p>© {year} EduUz. Barcha huquqlar himoyalangan.</p>
        <p>O'zbekiston 🇺🇿</p>
      </div>
    </footer>
  )
}

export default Footer