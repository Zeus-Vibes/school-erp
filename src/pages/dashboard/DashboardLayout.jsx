import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../../components/layout/Sidebar'
import Topbar from '../../components/layout/Topbar'

const pageTitles = {
  '/dashboard/admin': 'Admin Dashboard',
  '/dashboard/admin/classes': 'Classes Management',
  '/dashboard/admin/academic-years': 'Academic Years',
  '/dashboard/admin/students': 'Students List',
  '/dashboard/admin/teachers': 'Teachers Directory',
  '/dashboard/admin/timetable': 'School Timetable',
  '/dashboard/admin/attendance': 'Student Attendance',
  '/dashboard/admin/fees': 'Fee Management',
  '/dashboard/admin/examinations': 'Examinations',
  '/dashboard/admin/notices': 'School Notices',
  '/dashboard/admin/id-cards': 'ID Cards Generator',
  '/dashboard/admin/lc': 'Leaving Certificates',
  '/dashboard/admin/bulk-promotion': 'Student Promotion',
  '/dashboard/admin/calendar': 'Event Calendar',
  '/dashboard/admin/settings': 'System Settings',
  
  '/dashboard/teacher': 'Teacher Dashboard',
  '/dashboard/teacher/timetable': 'My Timetable',
  '/dashboard/teacher/classes': 'My Classes',
  '/dashboard/teacher/students': 'My Students',
  '/dashboard/teacher/attendance': 'Mark Attendance',
  '/dashboard/teacher/marks': 'Marks Entry',
  '/dashboard/teacher/notices': 'School Notices',
  '/dashboard/teacher/calendar': 'School Calendar',
  '/dashboard/teacher/profile': 'My Profile',
  
  '/dashboard/student': 'Student Dashboard',
  '/dashboard/student/timetable': 'My Timetable',
  '/dashboard/student/attendance': 'My Attendance',
  '/dashboard/student/report-cards': 'My Report Cards',
  '/dashboard/student/fees': 'My Fees Structure',
  '/dashboard/student/id-card': 'My ID Card',
  '/dashboard/student/notices': 'School Notices',
  '/dashboard/student/calendar': 'School Calendar',
  '/dashboard/student/profile': 'My Profile'
}

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const location = useLocation()
  
  // Clean up paths containing parameters (e.g. /dashboard/admin/timetable/123/edit)
  const getCleanPath = (path) => {
    if (path.includes('/timetable/') && path.endsWith('/edit')) return '/dashboard/admin/timetable'
    if (path.includes('/examinations/')) return '/dashboard/admin/examinations'
    return path
  }

  const pageTitle = pageTitles[getCleanPath(location.pathname)] || 'Dashboard'

  const handleMenuClick = () => {
    setIsSidebarOpen(true)
  }

  const handleSidebarClose = () => {
    setIsSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-bg">
      <Sidebar isOpen={isSidebarOpen} onClose={handleSidebarClose} />
      <div className="lg:pl-sidebar">
        <Topbar onMenuClick={handleMenuClick} pageTitle={pageTitle} />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
