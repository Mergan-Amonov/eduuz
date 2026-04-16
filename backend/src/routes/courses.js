const express = require('express')
const router = express.Router()
const pool = require('../db')
const auth = require('../middleware/auth')

router.post('/enroll', auth, async (req, res) => {
  try {
    const { course_id } = req.body
    const user_id = req.user.id

    const exists = await pool.query(
      'SELECT * FROM enrollments WHERE user_id = $1 AND course_id = $2',
      [user_id, course_id]
    )

    if (exists.rows.length > 0) {
      return res.status(400).json({ message: 'Allaqachon yozilgansiz' })
    }

    await pool.query(
      'INSERT INTO enrollments (user_id, course_id) VALUES ($1, $2)',
      [user_id, course_id]
    )

    res.json({ message: 'Kursga muvaffaqiyatli yozildingiz!' })

  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Xatolik yuz berdi' })
  }
})

router.get('/my', auth, async (req, res) => {
  try {
    const user_id = req.user.id

    const result = await pool.query(
      `SELECT e.course_id, e.progress, e.created_at,
              c.title, c.category, c.daraja, c.emoji, c.description, c.about, c.lessons, c.darslar
       FROM enrollments e
       LEFT JOIN courses c ON c.id = e.course_id
       WHERE e.user_id = $1`,
      [user_id]
    )

    const rows = result.rows.map(r => ({
      ...r,
      desc: r.description,
      lessons: r.lessons || []
    }))

    res.json(rows)

  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Xatolik yuz berdi' })
  }
})

router.post('/progress', auth, async (req, res) => {
  try {
    const { course_id, lesson_index, completed, total_lessons } = req.body
    const user_id = req.user.id

    await pool.query(
      `INSERT INTO lesson_progress (user_id, course_id, lesson_index, completed)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, course_id, lesson_index)
       DO UPDATE SET completed = $4`,
      [user_id, String(course_id), lesson_index, completed]
    )

    const result = await pool.query(
      'SELECT COUNT(*) FROM lesson_progress WHERE user_id = $1 AND course_id = $2 AND completed = TRUE',
      [user_id, String(course_id)]
    )

    const completed_count = parseInt(result.rows[0].count)
    const progress = total_lessons > 0 ? Math.round((completed_count / total_lessons) * 100) : 0

    await pool.query(
      'UPDATE enrollments SET progress = $1 WHERE user_id = $2 AND course_id = $3',
      [progress, user_id, String(course_id)]
    )

    res.json({ progress, completed_count })

  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Xatolik yuz berdi' })
  }
})

router.get('/progress/:course_id', auth, async (req, res) => {
  try {
    const user_id = req.user.id
    const { course_id } = req.params

    const result = await pool.query(
      'SELECT lesson_index, completed FROM lesson_progress WHERE user_id = $1 AND course_id = $2',
      [user_id, course_id]
    )

    res.json(result.rows)

  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Xatolik yuz berdi' })
  }
})

module.exports = router