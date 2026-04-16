-- EduUz Database Schema
-- Run: psql -U postgres -d eduuz -f schema.sql

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'student',
  ai_provider VARCHAR(50),
  ai_api_key VARCHAR(255),
  ai_model VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS courses (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  daraja VARCHAR(100),
  emoji VARCHAR(10) DEFAULT '📚',
  description TEXT DEFAULT '',
  about TEXT DEFAULT '',
  lessons JSONB DEFAULT '[]',
  darslar INTEGER DEFAULT 0,
  teacher_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS enrollments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  course_id VARCHAR(50) REFERENCES courses(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

CREATE TABLE IF NOT EXISTS lesson_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  course_id VARCHAR(50),
  lesson_index INTEGER,
  completed BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, course_id, lesson_index)
);

CREATE TABLE IF NOT EXISTS teacher_requests (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  full_name VARCHAR(255),
  subject VARCHAR(255),
  experience TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  course_id VARCHAR(50),
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
