import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import '../styles/lesson.css'

function getYouTubeId(url) {
    if (!url) return null
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[7].length === 11 ? match[7] : null
}

function Lesson() {
    const { courseId, lessonIndex } = useParams()
    const navigate = useNavigate()
    const [course, setCourse] = useState(null)
    const [lesson, setLesson] = useState(null)
    const [completedLessons, setCompletedLessons] = useState([])
    const token = localStorage.getItem('token')
    const index = parseInt(lessonIndex)

    useEffect(() => {
        const loadCourse = async () => {
            try {
                const res = await fetch(import.meta.env.VITE_API_URL + '/api/admin/courses')
                const data = await res.json()
                if (Array.isArray(data) && data.length > 0) {
                    localStorage.setItem('courses', JSON.stringify(data))
                    let found = data.find(c => String(c.id) === String(courseId))
                    if (found) {
                        const normalizedLessons = (found.lessons || []).map((l, i) => {
                            if (!l) return { title: `${i + 1}-dars`, video: '', desc: '' }
                            if (typeof l === 'string') return { title: l, video: '', desc: '' }
                            if (typeof l === 'object') return {
                                title: l.title || `${i + 1}-dars`,
                                video: l.video || '',
                                desc: l.desc || ''
                            }
                            return { title: `${i + 1}-dars`, video: '', desc: '' }
                        })
                        setCourse({ ...found, lessons: normalizedLessons })
                        setLesson(normalizedLessons[index] || null)
                        document.title = normalizedLessons[index]
                            ? `${normalizedLessons[index].title} — EduUz`
                            : 'Dars — EduUz'
                    }
                }
            } catch {
                // API unreachable, nothing to fall back to
            }

            if (token) {
                fetch(`${import.meta.env.VITE_API_URL}/api/courses/progress/${courseId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                    .then(r => r.json())
                    .then(data => {
                        if (Array.isArray(data)) {
                            const done = data.filter(l => l.completed).map(l => l.lesson_index)
                            setCompletedLessons(done)
                        }
                    })
                    .catch(console.error)
            }
        }

        loadCourse()
    }, [courseId, lessonIndex])

    const handleComplete = async () => {
        if (!token) return navigate('/login')
        const isCompleted = completedLessons.includes(index)
        try {
            const res = await fetch(import.meta.env.VITE_API_URL + '/api/courses/progress', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    course_id: isNaN(parseInt(courseId)) ? courseId : parseInt(courseId),
                    lesson_index: index,
                    completed: !isCompleted,
                    total_lessons: course.lessons.length
                })
            })
            if (res.ok) {
                setCompletedLessons(isCompleted
                    ? completedLessons.filter(i => i !== index)
                    : [...completedLessons, index]
                )
            }
        } catch (err) {
            console.error(err)
        }
    }

    const goNext = () => {
        const next = index + 1
        if (course && next < course.lessons.length) {
            navigate(`/courses/${courseId}/lessons/${next}`)
        } else {
            navigate(`/courses/${courseId}`)
        }
    }

    const goPrev = () => {
        if (index > 0) navigate(`/courses/${courseId}/lessons/${index - 1}`)
    }

    if (!course || !lesson) return (
        <div>
            <Navbar />
            <div style={{ textAlign: 'center', padding: '80px' }}>
                <h2>Dars topilmadi 😕</h2>
                <button className="btn-primary" onClick={() => navigate(`/courses/${courseId}`)}>
                    Kursga qaytish
                </button>
            </div>
        </div>
    )

    const isDone = completedLessons.includes(index)
    const videoId = getYouTubeId(lesson.video)
    const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : null

    return (
        <div>
            <Navbar />
            <div className="lesson-layout">

                <div className="lesson-sidebar">
                    <div className="lesson-sidebar-header">
                        <span>{course.emoji}</span>
                        <h3>{course.title}</h3>
                    </div>
                    <div className="lesson-list">
                        {course.lessons.map((l, i) => (
                            <div
                                key={i}
                                className={`lesson-list-item ${i === index ? 'lesson-list-active' : ''} ${completedLessons.includes(i) ? 'lesson-list-done' : ''}`}
                                onClick={() => navigate(`/courses/${courseId}/lessons/${i}`)}
                            >
                                <span className="lesson-list-num">
                                    {completedLessons.includes(i) ? '✓' : i + 1}
                                </span>
                                <span className="lesson-list-title">{l.title}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="lesson-main">
                    <div className="lesson-video-wrap">
                        {embedUrl ? (
                            <iframe
                                src={embedUrl}
                                title={lesson.title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="lesson-video"
                            />
                        ) : (
                            <div className="lesson-no-video">
                                <p>🎬 Video qo'shilmagan</p>
                            </div>
                        )}
                    </div>

                    <div className="lesson-content">
                        <div className="lesson-top">
                            <div className="lesson-info">
                                <span className="lesson-badge">
                                    {index + 1} / {course.lessons.length} — dars
                                </span>
                                <h2 className="lesson-title">{lesson.title}</h2>
                                {lesson.desc && (
                                    <p className="lesson-desc">{lesson.desc}</p>
                                )}
                            </div>
                            <button
                                className={isDone ? 'btn-done' : 'btn-mark'}
                                onClick={handleComplete}
                            >
                                {isDone ? '✅ Bajarildi' : '⬜ Bajarildi deb belgilash'}
                            </button>
                        </div>

                        <div className="lesson-nav">
                            <button
                                className="btn-outline"
                                onClick={goPrev}
                                disabled={index === 0}
                                style={{ opacity: index === 0 ? 0.4 : 1 }}
                            >
                                ← Oldingi dars
                            </button>
                            <button className="btn-primary" onClick={goNext}>
                                {index + 1 === course.lessons.length ? '🏁 Kursga qaytish' : 'Keyingi dars →'}
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default Lesson