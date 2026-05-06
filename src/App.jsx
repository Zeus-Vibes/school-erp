import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, ProtectedRoute } from './context/AuthContext'
import { DataProvider } from './context/DataContext'
import LandingPage from './pages/public/LandingPage'
import LoginPage from './pages/auth/LoginPage'
import DashboardLayout from './pages/dashboard/DashboardLayout'
import AdminDashboard from './pages/dashboard/AdminDashboard'
import StudentDashboard from './pages/dashboard/StudentDashboard'
import TeacherDashboard from './pages/dashboard/TeacherDashboard'
import Students from './pages/dashboard/Students'
import Teachers from './pages/dashboard/Teachers'
import Attendance from './pages/dashboard/Attendance'
import Fees from './pages/dashboard/Fees'
import IDCards from './pages/dashboard/IDCards'
import Notices from './pages/dashboard/Notices'
import Results from './pages/dashboard/Results'
import Timetable from './pages/dashboard/Timetable'
import Library from './pages/dashboard/Library'

const App = () => (
  <AuthProvider>
    <DataProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '12px',
            background: '#2C2C2C',
            color: '#fff',
            fontSize: '14px',
          },
        }}
      />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="students" element={<Students />} />
          <Route path="teachers" element={<Teachers />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="fees" element={<Fees />} />
          <Route path="idcards" element={<IDCards />} />
          <Route path="notices" element={<Notices />} />
          <Route path="results" element={<Results />} />
          <Route path="timetable" element={<Timetable />} />
          <Route path="library" element={<Library />} />
          <Route path="student-portal" element={<StudentDashboard />} />
          <Route path="teacher-portal" element={<TeacherDashboard />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </DataProvider>
  </AuthProvider>
)

export default App
