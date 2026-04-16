import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/home'
import Login from './pages/login'
import Register from './pages/register'
import Courses from './pages/courses'
import CourseDetail from './pages/coursedetail'
import Dashboard from './pages/dashboard'
import Certificate from './pages/certificate'
import Admin from './pages/admin'
import Profile from './pages/profile'
import Footer from './components/Footer'
import NotFound from './pages/NotFound'
import Lesson from './pages/Lesson'
import AIQuiz from './pages/AIQuiz'
import TeacherApply from './pages/TeacherApply'
import TeacherDashboard from './pages/TeacherDashboard'

function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:id" element={<CourseDetail />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/certificate/:id" element={<Certificate />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/courses/:courseId/lessons/:lessonIndex" element={<Lesson />} />
            <Route path="/ai-quiz" element={<AIQuiz />} />
            <Route path="/teacher/apply" element={<TeacherApply />} />
            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App