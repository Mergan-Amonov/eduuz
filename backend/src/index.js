const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')
require('dotenv').config()

// uploads/ papkasini avtomatik yaratish
const uploadsDir = path.join(__dirname, '../uploads')
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })

const authRoutes = require('./routes/auth')
const courseRoutes = require('./routes/courses')
const adminRoutes = require('./routes/admin')
const aiRoutes = require('./routes/ai')
const commentRoutes = require('./routes/comments')
const teacherRoutes = require('./routes/teacher')
const uploadRoutes = require('./routes/upload')

require('./db')

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

app.use(express.json())

app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

app.use('/api/upload', uploadRoutes)

app.get('/', (req, res) => {
  res.json({ message: 'EduUz API ishlamoqda!' })
})

app.use('/api/auth', authRoutes)
app.use('/api/courses', courseRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/comments', commentRoutes)
app.use('/api/teacher', teacherRoutes)

app.listen(PORT, () => {
  console.log(`Server ${PORT} portda ishlamoqda`)
})