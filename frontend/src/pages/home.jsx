import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/home.css'
import Navbar from '../components/Navbar'
import { trackPage } from '../analytics'

function Home() {
  const navigate = useNavigate()
  useEffect(() => {
    document.title = "EduUz — O'zbek tilida bepul ta'lim"
    trackPage("Bosh sahifa")
  }, [])
  return (
    <div>
      <Navbar />
      <section className="hero">
        <h2>O'zbek tilida bepul ta'lim</h2>
        <p>Dasturlash, matematika, til o'rganish va boshqa ko'plab kurslar</p>
        <button className="btn-primary" onClick={() => navigate('/courses')}>
          Boshlash
        </button>
      </section>

      <section className="courses">
        <h3>Mashhur kurslar</h3>
        <div className="cards">
          {[
            { id: 1, title: "Python dasturlash", desc: "Noldan professional darajaga", emoji: "🐍" },
            { id: 2, title: "JavaScript", desc: "Web dasturlash asoslari", emoji: "⚡" },
            { id: 3, title: "React", desc: "Zamonaviy frontend dasturlash", emoji: "⚛️" },
          ].map((kurs) => (
            <div key={kurs.id} className="card" onClick={() => navigate(`/courses/${kurs.id}`)}>
              <div className="emoji">{kurs.emoji}</div>
              <h4>{kurs.title}</h4>
              <p>{kurs.desc}</p>
              <button className="btn-link">Ko'rish →</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Home