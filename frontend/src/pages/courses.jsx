import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Loading from '../components/Loading'
import '../styles/courses.css'
import { trackPage } from '../analytics'

const categories = ["Barchasi", "Dasturlash", "Fan", "Til", "Dizayn"]

function Courses() {
  const navigate = useNavigate()
  const [active, setActive] = useState("Barchasi")
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [allCourses, setAllCourses] = useState([])

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const res = await fetch(import.meta.env.VITE_API_URL + '/api/admin/courses')
        const data = await res.json()
        if (Array.isArray(data)) {
          setAllCourses(data)
        }
      } catch {
        // API unreachable
      }
      setLoading(false)
    }
    loadCourses()
  }, [])

  const filtered = allCourses.filter(k => {
    const categoryMatch = active === "Barchasi" || k.category === active
    const searchMatch = k.title.toLowerCase().includes(search.toLowerCase())
    return categoryMatch && searchMatch
  })

  if (loading) return (
    <div>
      <Navbar />
      <Loading text="Kurslar yuklanmoqda..." />
    </div>
  )

  return (
    <div>
      <Navbar />
      <div className="courses-page">
        <h2 className="courses-title">Barcha kurslar</h2>

        <input
          className="search-input"
          placeholder="Kurs qidiring..."
          onChange={e => setSearch(e.target.value)}
        />

        <div className="categories">
          {categories.map(cat => (
            <button
              key={cat}
              className={`cat-btn ${active === cat ? 'cat-active' : ''}`}
              onClick={() => setActive(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="cards">
          {filtered.length === 0 ? (
            <p className="no-result">Hech narsa topilmadi</p>
          ) : (
            filtered.map(kurs => (
              <div key={kurs.id} className="card" onClick={() => navigate(`/courses/${kurs.id}`)}>
                <div className="emoji">{kurs.emoji}</div>
                <h4>{kurs.title}</h4>
                <p>{kurs.desc}</p>
                <div className="card-meta">
                  <span>📚 {kurs.lessons?.length || kurs.darslar || 0} dars</span>
                  <span>📊 {kurs.daraja}</span>
                </div>
                <button className="btn-link">Ko'rish →</button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default Courses