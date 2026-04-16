const express = require('express')
const router = express.Router()
const pool = require('../db')
const adminAuth = require('../middleware/adminAuth')

router.get('/users', adminAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, created_at FROM users ORDER BY created_at DESC'
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ message: 'Xatolik yuz berdi' })
  }
})

router.get('/stats', adminAuth, async (req, res) => {
  try {
    const users = await pool.query('SELECT COUNT(*) FROM users')
    const enrollments = await pool.query('SELECT COUNT(*) FROM enrollments')
    res.json({
      users: parseInt(users.rows[0].count),
      enrollments: parseInt(enrollments.rows[0].count),
    })
  } catch (err) {
    res.status(500).json({ message: 'Xatolik yuz berdi' })
  }
})

router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM enrollments WHERE user_id = $1', [req.params.id])
    await pool.query('DELETE FROM users WHERE id = $1', [req.params.id])
    res.json({ message: 'Foydalanuvchi o\'chirildi' })
  } catch (err) {
    res.status(500).json({ message: 'Xatolik yuz berdi' })
  }
})

router.get('/courses', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM courses ORDER BY created_at ASC')
    const courses = result.rows.map(c => ({
      ...c,
      desc: c.description,
      lessons: c.lessons || []
    }))
    res.json(courses)
  } catch (err) {
    res.status(500).json({ message: 'Xatolik' })
  }
})

// DELETE o'rniga upsert — teacher kurslari saqlanadi
router.post('/courses', adminAuth, async (req, res) => {
  try {
    const courses = req.body
    if (!Array.isArray(courses)) {
      return res.status(400).json({ message: 'Kurslar array bo\'lishi kerak' })
    }

    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      for (const course of courses) {
        await client.query(
          `INSERT INTO courses (id, title, category, daraja, emoji, description, about, lessons, darslar)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (id) DO UPDATE SET
             title = $2, category = $3, daraja = $4, emoji = $5,
             description = $6, about = $7, lessons = $8, darslar = $9`,
          [
            String(course.id),
            course.title,
            course.category || 'Boshqa',
            course.daraja || "Boshlang'ich",
            course.emoji || '📚',
            course.desc || course.description || '',
            course.about || '',
            JSON.stringify(course.lessons || []),
            course.darslar || (course.lessons?.length || 0)
          ]
        )
      }
      await client.query('COMMIT')
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }

    res.json({ message: 'Saqlandi' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Xatolik: ' + err.message })
  }
})

module.exports = router
