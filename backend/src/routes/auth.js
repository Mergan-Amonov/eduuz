const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const pool = require('../db')
const auth = require('../middleware/auth')

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (email === process.env.ADMIN_EMAIL) {
      return res.status(400).json({ message: 'Bu email taqiqlangan' })
    }

    const exists = await pool.query('SELECT id FROM users WHERE email = $1', [email])
    if (exists.rows.length > 0) {
      return res.status(400).json({ message: 'Bu email allaqachon mavjud' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const result = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, hashedPassword]
    )

    const user = result.rows[0]
    const token = jwt.sign({ id: user.id, email }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, user })

  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Xatolik yuz berdi' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])
    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Email yoki parol noto\'g\'ri' })
    }

    const user = result.rows[0]
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Email yoki parol noto\'g\'ri' })
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } })

  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Xatolik yuz berdi' })
  }
})

router.put('/update-name', auth, async (req, res) => {
  try {
    const { name } = req.body
    await pool.query('UPDATE users SET name = $1 WHERE id = $2', [name, req.user.id])
    res.json({ message: 'Ism yangilandi' })
  } catch (err) {
    res.status(500).json({ message: 'Xatolik yuz berdi' })
  }
})

router.put('/update-password', auth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id])
    const user = result.rows[0]

    const isMatch = await bcrypt.compare(oldPassword, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Eski parol noto\'g\'ri' })
    }

    const hashed = await bcrypt.hash(newPassword, 10)
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashed, req.user.id])
    res.json({ message: 'Parol yangilandi' })
  } catch (err) {
    res.status(500).json({ message: 'Xatolik yuz berdi' })
  }
})

// AI sozlamalarini saqlash
router.put('/ai-settings', auth, async (req, res) => {
  try {
    const { ai_provider, ai_api_key, ai_model } = req.body
    await pool.query(
      'UPDATE users SET ai_provider = $1, ai_api_key = $2, ai_model = $3 WHERE id = $4',
      [ai_provider || null, ai_api_key || null, ai_model || null, req.user.id]
    )
    res.json({ message: 'AI sozlamalari saqlandi' })
  } catch (err) {
    res.status(500).json({ message: 'Xatolik yuz berdi' })
  }
})

// AI sozlamalarini olish
router.get('/ai-settings', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT ai_provider, ai_api_key, ai_model FROM users WHERE id = $1',
      [req.user.id]
    )
    res.json(result.rows[0] || {})
  } catch (err) {
    res.status(500).json({ message: 'Xatolik yuz berdi' })
  }
})

module.exports = router
