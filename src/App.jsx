import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { DataProvider } from './context/DataContext'
import ProtectedRoute from './components/ProtectedRoute'
import LandingPage from './pages/public/LandingPage'
import LoginPage from './pages/auth/LoginPage'
import DashboardLayout from './pages/dashboard/DashboardLayout'
import AdminDashboard from './pages/dashboard/AdminDashboard'
import StudentDashboard from './pages/dashboard/StudentDashboard'
import TeacherDashboard from './pages/dashboard/TeacherDashboard'
import Students from './pages/dashboard/Students'
import Teachers from './pages/dashboard/Teachers'
import AcademicYears from './pages/dashboard/AcademicYears'
import Classes from './pages/dashboard/Classes'
import Attendance from './pages/dashboard/Attendance'
import Fees from './pages/dashboard/Fees'
import IDCards from './pages/dashboard/IDCards'
import Notices from './pages/dashboard/Notices'
import Timetable from './pages/dashboard/Timetable'
import TimetableGrid from './pages/dashboard/TimetableGrid'
import Examinations from './pages/dashboard/Examinations'
import ExamDetail from './pages/dashboard/ExamDetail'
import MarksEntry from './pages/dashboard/MarksEntry'
import ReportCards from './pages/dashboard/ReportCards'
import LCGenerator from './pages/dashboard/LCGenerator'
import BulkPromotion from './pages/dashboard/BulkPromotion'
import Calendar from './pages/dashboard/Calendar'
import Settings from './pages/dashboard/Settings'
import {
  ClassesPagePlaceholder,
  ProfilePagePlaceholder
} from './pages/dashboard/Placeholders'

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
            fontSize: '14px'
          }
        }}
      />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        
        {/* Admin Portal Group */}
        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute allowedRole="admin">
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="classes" element={<Classes />} />
          <Route path="academic-years" element={<AcademicYears />} />
          <Route path="students" element={<Students />} />
          <Route path="teachers" element={<Teachers />} />
          <Route path="timetable" element={<Timetable />} />
          <Route path="timetable/:id/edit" element={<TimetableGrid />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="fees" element={<Fees />} />
          <Route path="examinations" element={<Examinations />} />
          <Route path="examinations/:examId" element={<ExamDetail />} />
          <Route path="notices" element={<Notices />} />
          <Route path="id-cards" element={<IDCards />} />
          <Route path="lc" element={<LCGenerator />} />
          <Route path="bulk-promotion" element={<BulkPromotion />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Teacher Portal Group */}
        <Route
          path="/dashboard/teacher"
          element={
            <ProtectedRoute allowedRole="teacher">
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<TeacherDashboard />} />
          <Route path="timetable" element={<Timetable />} />
          <Route path="classes" element={<ClassesPagePlaceholder />} />
          <Route path="students" element={<Students />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="marks" element={<MarksEntry />} />
          <Route path="notices" element={<Notices />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="profile" element={<ProfilePagePlaceholder />} />
        </Route>

        {/* Student Portal Group */}
        <Route
          path="/dashboard/student"
          element={
            <ProtectedRoute allowedRole="student">
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<StudentDashboard />} />
          <Route path="timetable" element={<Timetable />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="report-cards" element={<ReportCards />} />
          <Route path="fees" element={<Fees />} />
          <Route path="id-card" element={<IDCards />} />
          <Route path="notices" element={<Notices />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="profile" element={<ProfilePagePlaceholder />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </DataProvider>
  </AuthProvider>
)

export default App
