# EduUz — O'zbek Ta'lim Platformasi

O'zbek tilida onlayn kurslar, AI-quiz va sertifikat beruvchi to'liq stack veb-platforma.

**Live sayt:** https://frontend-lake-chi-19.vercel.app  
**API:** https://eduuz-backend-production.up.railway.app

---

## Imkoniyatlar

- Ro'yxatdan o'tish va login (JWT)
- Kurslar ro'yxati, batafsil sahifa, dars ko'rish
- Kursga yozilish va progress kuzatish
- AI bilan test savollari (OpenRouter / Groq / OpenAI)
- Foydalanuvchi o'z AI API kalitini qo'yishi mumkin
- O'qituvchi ariza topshirish + admin tasdiqlash
- Admin panel (kurs qo'shish, statistika, arizalar)
- Izohlar tizimi
- Video yuklash
- Sertifikat (kurs tugatgandan so'ng)

---

## Texnologiyalar

| Qism | Texnologiya |
|------|-------------|
| Frontend | React 18, Vite, React Router |
| Backend | Node.js, Express |
| Ma'lumotlar bazasi | PostgreSQL |
| Autentifikatsiya | JWT |
| AI | OpenRouter (bepul model bilan) |
| Deploy (backend) | Railway |
| Deploy (frontend) | Vercel |

---

## Loyiha tuzilmasi

```
eduuz/
├── backend/
│   ├── src/
│   │   ├── index.js          # Express server
│   │   ├── db.js             # PostgreSQL ulanish
│   │   ├── middleware/
│   │   │   ├── auth.js       # JWT tekshirish
│   │   │   └── adminAuth.js  # Admin tekshirish
│   │   └── routes/
│   │       ├── auth.js       # Ro'yxatdan o'tish, login, AI sozlamalari
│   │       ├── courses.js    # Kurslar, yozilish, progress
│   │       ├── admin.js      # Admin panel
│   │       ├── ai.js         # AI quiz yaratish
│   │       ├── comments.js   # Izohlar
│   │       ├── teacher.js    # O'qituvchi arizalari va kurslar
│   │       └── upload.js     # Video yuklash
│   ├── schema.sql            # Ma'lumotlar bazasi sxemasi
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── pages/            # Sahifalar
    │   ├── components/       # Qayta ishlatiladigan komponentlar
    │   ├── styles/           # CSS fayllar
    │   └── App.jsx
    ├── .env.example
    └── package.json
```

---

## Local ishga tushirish

### Talablar
- Node.js 18+
- PostgreSQL

### Backend

```bash
cd backend
npm install
cp .env.example .env
# .env faylini to'ldiring (quyida)
npm run dev
```

**.env fayli:**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/eduuz
JWT_SECRET=sizning_maxfiy_kalitingiz
ADMIN_EMAIL=admin@eduuz.uz
OPENROUTER_API_KEY=sk-or-v1-...
PORT=5000
```

**Ma'lumotlar bazasini yaratish:**
```bash
psql -U postgres -c "CREATE DATABASE eduuz;"
psql -U postgres -d eduuz < schema.sql
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
# VITE_API_URL=http://localhost:5000
npm run dev
```

---

## API hujjatlari

### Autentifikatsiya

| Method | URL | Tavsif |
|--------|-----|--------|
| POST | `/api/auth/register` | Ro'yxatdan o'tish |
| POST | `/api/auth/login` | Login |
| PUT | `/api/auth/update-name` | Ismni o'zgartirish |
| PUT | `/api/auth/update-password` | Parolni o'zgartirish |
| GET | `/api/auth/ai-settings` | AI sozlamalarini olish |
| PUT | `/api/auth/ai-settings` | AI sozlamalarini saqlash |

**Register / Login javobi:**
```json
{
  "token": "eyJhbGci...",
  "user": { "id": 1, "name": "Ism", "email": "email@test.uz" }
}
```

---

### Kurslar

| Method | URL | Tavsif | Auth |
|--------|-----|--------|------|
| GET | `/api/admin/courses` | Barcha kurslar | — |
| GET | `/api/courses/my` | Yozilgan kurslarim | ✅ |
| POST | `/api/courses/enroll` | Kursga yozilish | ✅ |
| POST | `/api/courses/progress` | Progress yangilash | ✅ |
| GET | `/api/courses/progress/:id` | Dars progressini olish | ✅ |

---

### AI Quiz

| Method | URL | Tavsif | Auth |
|--------|-----|--------|------|
| POST | `/api/ai/generate-quiz` | Test savollar yaratish | ✅ |

**So'rov:**
```json
{ "topic": "Python dasturlash", "count": 5 }
```

**Javob:**
```json
{
  "questions": [
    {
      "question": "Python qanday til?",
      "options": ["Kompilyatsiya", "Interpretatsiya", "Assamblerlik", "Mashina"],
      "correct": 1
    }
  ]
}
```

Foydalanuvchi profilda o'z AI kalitini qo'yishi mumkin (OpenRouter, Groq yoki OpenAI). Bo'sh qoldirilsa, platformaning bepul modeli ishlatiladi.

---

### O'qituvchi

| Method | URL | Tavsif | Auth |
|--------|-----|--------|------|
| POST | `/api/teacher/apply` | O'qituvchi ariza | ✅ |
| GET | `/api/teacher/my-status` | Ariza holati | ✅ |
| POST | `/api/teacher/save-course` | Kurs saqlash | ✅ Teacher |
| GET | `/api/teacher/my-courses` | O'z kurslari | ✅ Teacher |
| GET | `/api/teacher/all-courses` | Barcha kurslar | — |

---

### Admin

| Method | URL | Tavsif | Auth |
|--------|-----|--------|------|
| GET | `/api/admin/stats` | Statistika | ✅ Admin |
| GET | `/api/admin/courses` | Barcha kurslar | ✅ Admin |
| POST | `/api/admin/courses` | Kurslar yangilash | ✅ Admin |
| GET | `/api/teacher/requests` | O'qituvchi arizalari | ✅ Admin |
| PUT | `/api/teacher/requests/:id` | Ariza tasdiqlash/rad | ✅ Admin |

---

### Izohlar

| Method | URL | Tavsif | Auth |
|--------|-----|--------|------|
| GET | `/api/comments/:course_id` | Kurs izohlari | — |
| POST | `/api/comments` | Izoh qo'shish | ✅ |
| DELETE | `/api/comments/:id` | Izoh o'chirish | ✅ |

---

### Yuklash

| Method | URL | Tavsif | Auth |
|--------|-----|--------|------|
| POST | `/api/upload/video` | Video yuklash | ✅ |

Javob: `{ "filename": "video-1234567890.mp4" }`  
Video URL: `https://backend-url/uploads/filename.mp4`

---

## Ma'lumotlar bazasi sxemasi

```sql
users          -- Foydalanuvchilar (student / teacher / admin)
courses        -- Kurslar (title, category, daraja, lessons JSON)
enrollments    -- Kursga yozilishlar (user_id, course_id, progress)
lesson_progress -- Dars progressi (user_id, course_id, lesson_index)
teacher_requests -- O'qituvchi arizalari
comments       -- Izohlar
```

To'liq sxema: [`backend/schema.sql`](backend/schema.sql)

---

## Deploy qilish

### Railway (backend)

```bash
npm install -g @railway/cli
railway login
cd backend
railway init
railway add --database postgres
railway variables set DATABASE_URL="..." JWT_SECRET="..." ADMIN_EMAIL="..." OPENROUTER_API_KEY="..."
railway up
railway domain
```

### Vercel (frontend)

```bash
npm install -g vercel
vercel login
cd frontend
vercel --build-env VITE_API_URL=https://your-backend.railway.app
vercel env add VITE_API_URL production
```

---

## Admin bo'lish

1. Saytda ro'yxatdan o'ting
2. Railway'da `ADMIN_EMAIL` ni o'sha emailga o'rnating:
   ```bash
   railway variables set ADMIN_EMAIL="sizning@email.uz"
   ```
3. O'sha email bilan kirganingizda admin panel ochiladi

---

## Rollar

| Rol | Imkoniyat |
|-----|-----------|
| `student` | Kurs ko'rish, yozilish, izoh, AI quiz |
| `teacher` | + Kurs qo'shish, o'z kurslarini boshqarish |
| `admin` | + Barcha kurslar, statistika, o'qituvchi arizalari |

---

## Litsenziya

MIT
