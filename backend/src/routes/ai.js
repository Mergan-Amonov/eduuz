const express = require('express')
const router = express.Router()
const pool = require('../db')
const auth = require('../middleware/auth')

function getProviderUrl(provider) {
  switch (provider) {
    case 'groq': return 'https://api.groq.com/openai/v1'
    case 'openai': return 'https://api.openai.com/v1'
    case 'openrouter':
    default: return 'https://openrouter.ai/api/v1'
  }
}

function getDefaultModel(provider) {
  switch (provider) {
    case 'groq': return 'llama-3.3-70b-versatile'
    case 'openai': return 'gpt-4o-mini'
    case 'openrouter':
    default: return 'google/gemma-4-31b-it:free'
  }
}

router.post('/generate-quiz', auth, async (req, res) => {
  try {
    const { topic, count = 5 } = req.body
    const safeCount = Math.min(parseInt(count) || 5, 20)

    if (!topic) {
      return res.status(400).json({ message: 'Mavzu kiritilmagan' })
    }

    // Foydalanuvchining o'z AI sozlamalarini olish
    const userResult = await pool.query(
      'SELECT ai_provider, ai_api_key, ai_model FROM users WHERE id = $1',
      [req.user.id]
    )
    const u = userResult.rows[0] || {}

    const provider = u.ai_provider || 'openrouter'
    const apiKey = u.ai_api_key || process.env.OPENROUTER_API_KEY
    const model = u.ai_model || getDefaultModel(provider)
    const baseUrl = getProviderUrl(provider)

    if (!apiKey) {
      return res.status(500).json({ message: 'AI kaliti sozlanmagan. Profil > AI sozlamalari bo\'limiga kiring.' })
    }

    const prompt = `Sen ta'lim platformasi uchun test savollari yaratuvchi assistentsan. To'g'ri javobni A variantga qo'yma.

Mavzu: "${topic}"
Savollar soni: ${safeCount}

Quyidagi JSON formatda ${safeCount} ta test savoli yarat. Faqat sof JSON qaytargin, boshqa hech narsa yozma:
{"questions":[{"question":"Savol matni","options":["A variant","B variant","C variant","D variant"],"correct":0}]}`

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    }

    if (provider === 'openrouter') {
      headers['HTTP-Referer'] = 'https://eduuz.uz'
      headers['X-Title'] = 'EduUz'
    }

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 3000,
        temperature: 0.7
      })
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('AI xatosi:', data)
      return res.status(500).json({ message: 'AI xizmatida xatolik: ' + (data.error?.message || 'Noma\'lum') })
    }

    let text = data.choices[0].message.content
    text = text.replace(/```json|```/g, '').trim()

    const firstBrace = text.indexOf('{')
    const lastBrace = text.lastIndexOf('}')
    if (firstBrace !== -1 && lastBrace !== -1) {
      text = text.substring(firstBrace, lastBrace + 1)
    }

    const parsed = JSON.parse(text)
    console.log(`AI ishladi! ✅ ${safeCount} ta savol (${provider}/${model})`)
    res.json(parsed)

  } catch (err) {
    console.error('AI route xatosi:', err)
    res.status(500).json({ message: 'Xatolik: ' + err.message })
  }
})

module.exports = router
