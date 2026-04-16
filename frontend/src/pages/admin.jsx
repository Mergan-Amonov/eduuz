import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import '../styles/admin.css'
import TeacherRequests from '../components/TeacherRequests'

const ADMIN_EMAIL = 'admin@eduuz.uz'

const getCategoryIcon = (title) => {
  const t = title.toLowerCase()
  if (t.includes('python')) return '🐍'
  if (t.includes('javascript') || t.includes('js')) return '⚡'
  if (t.includes('react')) return '⚛️'
  if (t.includes('vue')) return '💚'
  if (t.includes('angular')) return '🔴'
  if (t.includes('node')) return '🟢'
  if (t.includes('java')) return '☕'
  if (t.includes('c++') || t.includes('c#')) return '💻'
  if (t.includes('php')) return '🐘'
  if (t.includes('swift')) return '🍎'
  if (t.includes('kotlin')) return '📱'
  if (t.includes('flutter') || t.includes('dart')) return '🦋'
  if (t.includes('sql') || t.includes('database') || t.includes('ma\'lumot')) return '🗄️'
  if (t.includes('matematika') || t.includes('math')) return '📐'
  if (t.includes('fizika') || t.includes('physics')) return '⚗️'
  if (t.includes('kimyo') || t.includes('chem')) return '🧪'
  if (t.includes('biologiya') || t.includes('bio')) return '🧬'
  if (t.includes('ingliz') || t.includes('english')) return '🇬🇧'
  if (t.includes('rus') || t.includes('russian')) return '🇷🇺'
  if (t.includes('arab') || t.includes('arabic')) return '🇸🇦'
  if (t.includes('xitoy') || t.includes('chinese')) return '🇨🇳'
  if (t.includes('dizayn') || t.includes('design')) return '🎨'
  if (t.includes('figma')) return '✏️'
  if (t.includes('video') || t.includes('montaj')) return '🎬'
  if (t.includes('marketing')) return '📈'
  if (t.includes('excel')) return '📊'
  if (t.includes('word')) return '📝'
  if (t.includes('tarih') || t.includes('history')) return '📜'
  if (t.includes('geografiya') || t.includes('geo')) return '🌍'
  if (t.includes('musiqa') || t.includes('music')) return '🎵'
  return '📚'
}

const defaultCourses = [
  { id: 1, title: "Python dasturlash", category: "Dasturlash", daraja: "Boshlang'ich", emoji: "🐍", desc: "Noldan professional darajaga", about: "Bu kursda Python dasturlash tilini noldan o'rganasiz.", lessons: [{ title: "Python nima va o'rnatish", video: "https://www.youtube.com/watch?v=rfscVS0vtbw", desc: "Python o'rnatish" }, { title: "O'zgaruvchilar", video: "https://www.youtube.com/watch?v=khKv-8q7YmY", desc: "O'zgaruvchilar" }] },
  { id: 2, title: "JavaScript", category: "Dasturlash", daraja: "Boshlang'ich", emoji: "⚡", desc: "Web dasturlash asoslari", about: "JavaScript — web dasturlashning asosi.", lessons: [{ title: "JavaScript nima?", video: "https://www.youtube.com/watch?v=W6NZfCO5SIk", desc: "JS asoslari" }] },
  { id: 3, title: "React", category: "Dasturlash", daraja: "O'rta", emoji: "⚛️", desc: "Zamonaviy frontend", about: "React kutubxonasi.", lessons: [{ title: "React kirish", video: "https://www.youtube.com/watch?v=Tn6-PIqc4UM", desc: "React asoslari" }] },
  { id: 4, title: "Matematika", category: "Fan", daraja: "Boshlang'ich", emoji: "📐", desc: "Maktab va olimpiada", about: "Matematika kursi.", lessons: [{ title: "Sonlar nazariyasi", video: "", desc: "Sonlar" }] },
  { id: 5, title: "Fizika", category: "Fan", daraja: "O'rta", emoji: "⚗️", desc: "Mexanika, optika", about: "Fizika kursi.", lessons: [{ title: "Kinematika", video: "", desc: "Harakat" }] },
  { id: 6, title: "Ingliz tili", category: "Til", daraja: "Boshlang'ich", emoji: "🇬🇧", desc: "A1 dan C1 gacha", about: "Ingliz tili kursi.", lessons: [{ title: "Alifbo", video: "", desc: "Alifbo" }] },
  { id: 7, title: "Rus tili", category: "Til", daraja: "Boshlang'ich", emoji: "🇷🇺", desc: "Grammatika", about: "Rus tili kursi.", lessons: [{ title: "Kirill alifbosi", video: "", desc: "Alifbo" }] },
  { id: 8, title: "Grafik dizayn", category: "Dizayn", daraja: "Boshlang'ich", emoji: "🎨", desc: "Figma va Adobe", about: "Dizayn kursi.", lessons: [{ title: "Dizayn nima?", video: "", desc: "Kirish" }] },
  { id: 9, title: "UI/UX dizayn", category: "Dizayn", daraja: "O'rta", emoji: "✏️", desc: "Foydalanuvchi tajribasi", about: "UI/UX kursi.", lessons: [{ title: "UX nima?", video: "", desc: "Kirish" }] },
]

const emptyForm = {
  title: '',
  category: 'Dasturlash',
  daraja: "Boshlang'ich",
  desc: '',
  about: '',
}

const emptyLesson = { title: '', video: '', desc: '' }

function Admin() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'))
  const token = localStorage.getItem('token')

  const [activeTab, setActiveTab] = useState('dashboard')
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState({ users: 0, enrollments: 0 })
  const [courses, setCourses] = useState(() => {
    const saved = localStorage.getItem('courses')
    return saved ? JSON.parse(saved) : defaultCourses
  })
  const [showForm, setShowForm] = useState(false)
  const [editCourse, setEditCourse] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [lessons, setLessons] = useState([{ ...emptyLesson }])
  const [deleteUserId, setDeleteUserId] = useState(null)
  const [deleteCourseId, setDeleteCourseId] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!user || user.email !== ADMIN_EMAIL) {
      navigate('/')
      return
    }
    fetchStats()
    fetchUsers()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + '/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) return
      const data = await res.json()
      setStats(data)
    } catch (err) { console.error(err) }
  }

  const fetchUsers = async () => {
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + '/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) return
      const data = await res.json()
      setUsers(data)
      setStats(s => ({ ...s, users: data.length }))
    } catch (err) { console.error(err) }
  }

  const saveCourses = async (updated) => {
    setCourses(updated)
    localStorage.setItem('courses', JSON.stringify(updated))
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + '/api/admin/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updated)
      })
      const data = await res.json()
      console.log('Saqlandi:', data)
    } catch (err) {
      console.error('Saqlash xatosi:', err)
    }
  }

  const addLesson = () => {
    setLessons([...lessons, { ...emptyLesson }])
  }

  const removeLesson = (index) => {
    setLessons(lessons.filter((_, i) => i !== index))
  }

  const updateLesson = (index, field, value) => {
    const updated = lessons.map((l, i) => i === index ? { ...l, [field]: value } : l)
    setLessons(updated)
  }

  const handleCourseSubmit = () => {
    if (!form.title.trim()) return
    const validLessons = lessons.filter(l => l.title.trim() !== '')
    const emoji = getCategoryIcon(form.title)

    const courseData = {
      title: form.title,
      category: form.category,
      daraja: form.daraja,
      emoji,
      desc: form.desc,
      about: form.about,
      lessons: validLessons,
      darslar: validLessons.length,
    }

    if (editCourse) {
      saveCourses(courses.map(c => c.id === editCourse.id ? { ...editCourse, ...courseData } : c))
    } else {
      saveCourses([...courses, { id: Date.now(), ...courseData }])
    }

    setForm(emptyForm)
    setLessons([{ ...emptyLesson }])
    setShowForm(false)
    setEditCourse(null)
  }

  const handleEdit = (course) => {
    setEditCourse(course)
    setForm({
      title: course.title || '',
      category: course.category || 'Dasturlash',
      daraja: course.daraja || "Boshlang'ich",
      desc: course.desc || '',
      about: course.about || '',
    })
    setLessons(course.lessons && course.lessons.length > 0
      ? course.lessons.map(l => ({
        title: typeof l === 'string' ? l : (l.title || ''),
        video: typeof l === 'string' ? '' : (l.video || ''),
        desc: typeof l === 'string' ? '' : (l.desc || '')
      }))
      : [{ ...emptyLesson }]
    )
    setShowForm(true)
    setActiveTab('courses')
    window.scrollTo(0, 0)
  }

  const handleDeleteCourse = (id) => {
    saveCourses(courses.filter(c => c.id !== id))
    setDeleteCourseId(null)
  }

  const handleDeleteUser = async (id) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      setUsers(users.filter(u => u.id !== id))
      setStats(s => ({ ...s, users: s.users - 1 }))
    } catch (err) { console.error(err) }
    setDeleteUserId(null)
  }

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  const statCards = [
    { label: "Foydalanuvchilar", value: stats.users, icon: "👥", color: "#7c3aed" },
    { label: "Jami kurslar", value: courses.length, icon: "📚", color: "#0ea5e9" },
    { label: "Yozilishlar", value: stats.enrollments, icon: "✅", color: "#16a34a" },
    { label: "Faol bugun", value: 1, icon: "🔥", color: "#f59e0b" },
  ]

  return (
    <div>
      <Navbar />
      <div className="admin-layout">

        <div className="admin-sidebar">
          <div className="sidebar-logo">⚙️ Admin panel</div>
          <nav className="sidebar-nav">
            {[
              { key: 'dashboard', icon: '📊', label: 'Dashboard' },
              { key: 'courses', icon: '📚', label: 'Kurslar' },
              { key: 'users', icon: '👥', label: 'Foydalanuvchilar' },
              { key: 'teachers', icon: '🎓', label: 'O\'qituvchilar' },
            ].map(item => (
              <button
                key={item.key}
                className={`sidebar-item ${activeTab === item.key ? 'sidebar-active' : ''}`}
                onClick={() => setActiveTab(item.key)}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
          <button className="sidebar-logout" onClick={() => navigate('/')}>
            ← Saytga qaytish
          </button>
        </div>

        <div className="admin-main">

          {activeTab === 'dashboard' && (
            <div>
              <div className="admin-page-header">
                <div>
                  <h2>Dashboard</h2>
                  <p>EduUz platformasi umumiy ko'rinishi</p>
                </div>
              </div>
              <div className="stat-cards">
                {statCards.map((s, i) => (
                  <div key={i} className="stat-card-new">
                    <div className="stat-card-icon" style={{ background: s.color + '15', color: s.color }}>
                      {s.icon}
                    </div>
                    <div>
                      <div className="stat-card-value" style={{ color: s.color }}>{s.value}</div>
                      <div className="stat-card-label">{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="admin-table-card">
                <h3>So'nggi foydalanuvchilar</h3>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Foydalanuvchi</th>
                      <th>Email</th>
                      <th>Rol</th>
                      <th>Sana</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.slice(0, 5).map(u => (
                      <tr key={u.id}>
                        <td>
                          <div className="table-user">
                            <div className="table-avatar">{u.name[0].toUpperCase()}</div>
                            <span>{u.name}</span>
                          </div>
                        </td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`badge ${u.email === ADMIN_EMAIL ? 'badge-purple' : 'badge-green'}`}>
                            {u.email === ADMIN_EMAIL ? 'Admin' : "O'quvchi"}
                          </span>
                        </td>
                        <td>{new Date(u.created_at).toLocaleDateString('uz-UZ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'courses' && (
            <div>
              <div className="admin-page-header">
                <div>
                  <h2>Kurslar</h2>
                  <p>Jami {courses.length} ta kurs</p>
                </div>
                <button className="btn-primary" onClick={() => {
                  setForm(emptyForm)
                  setLessons([{ ...emptyLesson }])
                  setEditCourse(null)
                  setShowForm(true)
                }}>
                  + Yangi kurs
                </button>
              </div>

              {showForm && (
                <div className="admin-form-card">
                  <h4>{editCourse ? 'Kursni tahrirlash' : 'Yangi kurs qo\'shish'}</h4>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Kurs nomi *</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '24px' }}>{getCategoryIcon(form.title)}</span>
                        <input
                          style={{ flex: 1 }}
                          value={form.title}
                          onChange={e => setForm({ ...form, title: e.target.value })}
                          placeholder="Masalan: Vue.js dasturlash"
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Toifa</label>
                      <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                        <option>Dasturlash</option>
                        <option>Fan</option>
                        <option>Til</option>
                        <option>Dizayn</option>
                        <option>Biznes</option>
                        <option>Boshqa</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Daraja</label>
                      <select value={form.daraja} onChange={e => setForm({ ...form, daraja: e.target.value })}>
                        <option>Boshlang'ich</option>
                        <option>O'rta</option>
                        <option>Yuqori</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Qisqa tavsif</label>
                      <input
                        value={form.desc}
                        onChange={e => setForm({ ...form, desc: e.target.value })}
                        placeholder="Noldan professional darajaga"
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '24px' }}>
                    <label>To'liq tavsif</label>
                    <textarea
                      value={form.about}
                      onChange={e => setForm({ ...form, about: e.target.value })}
                      placeholder="Kurs haqida batafsil ma'lumot..."
                      rows={3}
                      style={{ padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', outline: 'none', resize: 'vertical', fontFamily: 'sans-serif', width: '100%', boxSizing: 'border-box' }}
                    />
                  </div>

                  {/* Darslar */}
                  <div className="lessons-form">
                    <div className="lessons-form-header">
                      <h4>📚 Darslar ({lessons.length} ta)</h4>
                      <button className="btn-add-lesson" onClick={addLesson}>
                        + Dars qo'shish
                      </button>
                    </div>

                    {lessons.map((lesson, i) => (
                      <div key={i} className="lesson-form-item">
                        <div className="lesson-form-num">{i + 1}</div>
                        <div className="lesson-form-fields">
                          <input
                            placeholder="Dars nomi *"
                            value={lesson.title}
                            onChange={e => updateLesson(i, 'title', e.target.value)}
                          />
                          <input
                            placeholder="YouTube havolasi (ixtiyoriy) — https://youtube.com/watch?v=..."
                            value={lesson.video}
                            onChange={e => updateLesson(i, 'video', e.target.value)}
                          />
                          <input
                            placeholder="Dars tavsifi (ixtiyoriy)"
                            value={lesson.desc}
                            onChange={e => updateLesson(i, 'desc', e.target.value)}
                          />
                        </div>
                        {lessons.length > 1 && (
                          <button className="lesson-form-remove" onClick={() => removeLesson(i)}>
                            🗑️
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="form-actions" style={{ marginTop: '20px' }}>
                    <button className="btn-outline" onClick={() => {
                      setShowForm(false)
                      setEditCourse(null)
                      setForm(emptyForm)
                      setLessons([{ ...emptyLesson }])
                    }}>
                      Bekor qilish
                    </button>
                    <button className="btn-primary" onClick={handleCourseSubmit}>
                      {editCourse ? '💾 Saqlash' : '➕ Kurs qo\'shish'}
                    </button>
                  </div>
                </div>
              )}

              <div className="admin-table-card">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Kurs</th>
                      <th>Toifa</th>
                      <th>Daraja</th>
                      <th>Darslar</th>
                      <th>Amallar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map(course => (
                      <tr key={course.id}>
                        <td>
                          <div className="table-user">
                            <span style={{ fontSize: '22px' }}>{course.emoji || getCategoryIcon(course.title)}</span>
                            <span>{course.title}</span>
                          </div>
                        </td>
                        <td><span className="badge badge-blue">{course.category}</span></td>
                        <td>{course.daraja}</td>
                        <td>{course.lessons?.length || 0} ta</td>
                        <td>
                          <div className="table-actions">
                            <button className="btn-edit" onClick={() => handleEdit(course)}>✏️ Tahrir</button>
                            <button className="btn-delete" onClick={() => setDeleteCourseId(course.id)}>🗑️ O'chirish</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {activeTab === 'users' && (
            <div>
              <div className="admin-page-header">
                <div>
                  <h2>Foydalanuvchilar</h2>
                  <p>Jami {users.length} ta foydalanuvchi</p>
                </div>
              </div>
              <div className="admin-table-card">
                <div className="table-search">
                  <input
                    placeholder="🔍 Ism yoki email qidiring..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Foydalanuvchi</th>
                      <th>Email</th>
                      <th>Rol</th>
                      <th>Sana</th>
                      <th>Amallar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u, i) => (
                      <tr key={u.id}>
                        <td style={{ color: '#9ca3af' }}>{i + 1}</td>
                        <td>
                          <div className="table-user">
                            <div className="table-avatar">{u.name[0].toUpperCase()}</div>
                            <span>{u.name}</span>
                          </div>
                        </td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`badge ${u.email === ADMIN_EMAIL ? 'badge-purple' : 'badge-green'}`}>
                            {u.email === ADMIN_EMAIL ? 'Admin' : "O'quvchi"}
                          </span>
                        </td>
                        <td>{new Date(u.created_at).toLocaleDateString('uz-UZ')}</td>
                        <td>
                          {u.email !== ADMIN_EMAIL && (
                            <button className="btn-delete" onClick={() => setDeleteUserId(u.id)}>
                              🗑️ O'chirish
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {activeTab === 'teachers' && (
            <TeacherRequests token={token} />
          )}

        </div>
      </div>

      {deleteUserId && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-icon">🗑️</div>
            <h3>Foydalanuvchini o'chirish</h3>
            <p>Rostdan ham bu foydalanuvchini o'chirmoqchimisiz?</p>
            <div className="modal-actions">
              <button className="btn-outline" onClick={() => setDeleteUserId(null)}>Bekor qilish</button>
              <button className="btn-delete-confirm" onClick={() => handleDeleteUser(deleteUserId)}>O'chirish</button>
            </div>
          </div>
        </div>
      )}

      {deleteCourseId && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-icon">🗑️</div>
            <h3>Kursni o'chirish</h3>
            <p>Rostdan ham bu kursni o'chirmoqchimisiz?</p>
            <div className="modal-actions">
              <button className="btn-outline" onClick={() => setDeleteCourseId(null)}>Bekor qilish</button>
              <button className="btn-delete-confirm" onClick={() => handleDeleteCourse(deleteCourseId)}>O'chirish</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default Admin