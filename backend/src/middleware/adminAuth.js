const jwt = require('jsonwebtoken')

const adminAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ message: 'Token yo\'q' })
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@eduuz.uz'
    if (decoded.email !== adminEmail) {
      return res.status(403).json({ message: 'Ruxsat yo\'q' })
    }
    req.user = decoded
    next()
  } catch {
    res.status(401).json({ message: 'Token noto\'g\'ri' })
  }
}

module.exports = adminAuth
