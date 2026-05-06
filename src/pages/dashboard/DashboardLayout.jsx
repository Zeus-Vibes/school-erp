import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../../components/layout/Sidebar'
import Topbar from '../../components/layout/Topbar'

const pageTitles = {
  '/dashboard/admin': 'Admin Dashboard',
  '/dashboard/students': 'Students',
  '/dashboard/teachers': 'Teachers',
  '/dashboard/attendance': 'Attendance',
  '/dashboard/fees': 'Fee Management',
  '/dashboard/idcards': 'ID Cards',
  '/dashboard/notices': 'Notice Board',
  '/dashboard/results': 'Exam Results',
  '/dashboard/timetable': 'Timetable',
  '/dashboard/library': 'Library',
  '/dashboard/student-portal': 'Student Portal',
  '/dashboard/teacher-portal': 'Teacher Portal',
}

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const location = useLocation()
  const pageTitle = pageTitles[location.pathname] || 'Dashboard'

  return (
    <div className="min-h-screen bg-bg">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="lg:pl-sidebar">
        <Topbar onMenuClick={() => setIsSidebarOpen(true)} pageTitle={pageTitle} />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
