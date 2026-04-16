import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/navbar.css'

function Navbar() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'))
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
    setMenuOpen(false)
  }

  const goTo = (path) => {
    navigate(path)
    setMenuOpen(false)
  }

  return (
    <>
      <nav className="navbar">
        <h1 className="logo" onClick={() => goTo('/')}>EduUz</h1>

        {/* Desktop links */}
        <div className="nav-links">
          <span onClick={() => goTo('/')}>Bosh sahifa</span>
          <span onClick={() => goTo('/courses')}>Kurslar</span>
          {user && <span onClick={() => goTo('/dashboard')}>Dashboard</span>}
          {user?.email === 'admin@eduuz.uz' && (
            <span onClick={() => goTo('/admin')}>Admin</span>
          )}
          {user && <span onClick={() => goTo('/teacher/apply')}>O'qituvchi bo'lish</span>}
          <span onClick={() => goTo('/ai-quiz')}>AI Test</span>
        </div>

        {/* Desktop buttons */}
        <div className="nav-buttons desktop-only">
          {user ? (
            <>
              <div className="nav-avatar" onClick={() => goTo('/profile')}>
                {user.name[0].toUpperCase()}
              </div>
              <button className="btn-outline" onClick={handleLogout}>Chiqish</button>
            </>
          ) : (
            <>
              <button className="btn-outline" onClick={() => goTo('/login')}>Kirish</button>
              <button className="btn-primary" onClick={() => goTo('/register')}>Ro'yxatdan o'tish</button>
            </>
          )}
        </div>

        {/* Hamburger */}
        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          <span className={`ham-line ${menuOpen ? 'ham-open' : ''}`}></span>
          <span className={`ham-line ${menuOpen ? 'ham-open' : ''}`}></span>
          <span className={`ham-line ${menuOpen ? 'ham-open' : ''}`}></span>
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="mobile-menu">
          <div className="mobile-menu-inner">
            {user && (
              <div className="mobile-user">
                <div className="mobile-avatar">{user.name[0].toUpperCase()}</div>
                <div>
                  <p className="mobile-name">{user.name}</p>
                  <p className="mobile-email">{user.email}</p>
                </div>
              </div>
            )}

            <div className="mobile-links">
              <button onClick={() => goTo('/')}>Bosh sahifa</button>
              <button onClick={() => goTo('/courses')}>Kurslar</button>
              {user && <button onClick={() => goTo('/dashboard')}>Dashboard</button>}
              {user && <button onClick={() => goTo('/profile')}>Profil</button>}
              {user?.email === 'admin@eduuz.uz' && (
                <button onClick={() => goTo('/admin')}>Admin panel</button>
              )}
              {user && !user.role === 'teacher' && (
                <button onClick={() => goTo('/teacher/apply')}>🎓 O'qituvchi bo'lish</button>
              )}
              <button onClick={() => goTo('/ai-quiz')}>🤖 AI Test</button>
            </div>

            <div className="mobile-actions">
              {user ? (
                <button className="btn-danger-outline" onClick={handleLogout}>
                  Chiqish
                </button>
              ) : (
                <>
                  <button className="btn-outline full" onClick={() => goTo('/login')}>
                    Kirish
                  </button>
                  <button className="btn-primary full" onClick={() => goTo('/register')}>
                    Ro'yxatdan o'tish
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Navbar