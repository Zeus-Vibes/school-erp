import { useState } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Home, 
  Users, 
  GraduationCap, 
  CalendarCheck, 
  IndianRupee, 
  CreditCard, 
  Megaphone, 
  BarChart3, 
  Clock, 
  Settings, 
  LogOut, 
  X,
  Calendar,
  Layers,
  FileText,
  User
} from 'lucide-react'
import clsx from 'clsx'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import Avatar from '../ui/Avatar'
import Badge from '../ui/Badge'
import logoImg from '../../assets/images/logo.jpeg'

const adminNavItems = [
  { label: 'Dashboard', icon: Home, path: '/dashboard/admin' },
  { label: 'Classes', icon: Layers, path: '/dashboard/admin/classes' },
  { label: 'Academic Years', icon: Calendar, path: '/dashboard/admin/academic-years' },
  { label: 'Students', icon: Users, path: '/dashboard/admin/students' },
  { label: 'Teachers', icon: GraduationCap, path: '/dashboard/admin/teachers' },
  { label: 'Timetable', icon: Clock, path: '/dashboard/admin/timetable' },
  { label: 'Attendance', icon: CalendarCheck, path: '/dashboard/admin/attendance' },
  { label: 'Fees', icon: IndianRupee, path: '/dashboard/admin/fees' },
  { label: 'Examinations', icon: BarChart3, path: '/dashboard/admin/examinations' },
  { label: 'Notice Board', icon: Megaphone, path: '/dashboard/admin/notices' },
  { label: 'ID Cards', icon: CreditCard, path: '/dashboard/admin/id-cards' },
  { label: 'LC Generator', icon: FileText, path: '/dashboard/admin/lc' },
  { label: 'Calendar', icon: Calendar, path: '/dashboard/admin/calendar' }
]

const teacherNavItems = [
  { label: 'Dashboard', icon: Home, path: '/dashboard/teacher' },
  { label: 'Timetable', icon: Clock, path: '/dashboard/teacher/timetable' },
  { label: 'Classes', icon: Layers, path: '/dashboard/teacher/classes' },
  { label: 'Students', icon: Users, path: '/dashboard/teacher/students' },
  { label: 'Attendance', icon: CalendarCheck, path: '/dashboard/teacher/attendance' },
  { label: 'Marks Entry', icon: BarChart3, path: '/dashboard/teacher/marks' },
  { label: 'Notices', icon: Megaphone, path: '/dashboard/teacher/notices' },
  { label: 'Calendar', icon: Calendar, path: '/dashboard/teacher/calendar' },
  { label: 'Profile', icon: User, path: '/dashboard/teacher/profile' }
]

const studentNavItems = [
  { label: 'Dashboard', icon: Home, path: '/dashboard/student' },
  { label: 'Timetable', icon: Clock, path: '/dashboard/student/timetable' },
  { label: 'Attendance', icon: CalendarCheck, path: '/dashboard/student/attendance' },
  { label: 'Report Cards', icon: BarChart3, path: '/dashboard/student/report-cards' },
  { label: 'Fees', icon: IndianRupee, path: '/dashboard/student/fees' },
  { label: 'ID Card', icon: CreditCard, path: '/dashboard/student/id-card' },
  { label: 'Notices', icon: Megaphone, path: '/dashboard/student/notices' },
  { label: 'Calendar', icon: Calendar, path: '/dashboard/student/calendar' },
  { label: 'Profile', icon: User, path: '/dashboard/student/profile' }
]

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const navItems = user?.role === 'admin' ? adminNavItems : user?.role === 'teacher' ? teacherNavItems : studentNavItems
  const roleColor = user?.role === 'admin' ? 'red' : user?.role === 'teacher' ? 'gold' : 'green'

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/login', { replace: true })
  }

  const handleSettingsClick = () => {
    if (user?.role === 'admin') {
      navigate('/dashboard/admin/settings')
    } else {
      toast('Coming Soon!', { icon: '⚙️' })
    }
    onClose()
  }

  const sidebarContent = (
    <div className="flex h-full flex-col bg-primary">
      <div className="flex items-center justify-between px-5 py-5">
        <div className="flex items-center gap-3">
          <Link to="/">
            <img src={logoImg} alt="Logo" className="h-8 w-8 rounded-lg object-cover" />
          </Link>
          <div>
            <span className="text-sm font-semibold text-white block leading-tight">Shree Bala Int.</span>
            <span className="text-[8px] text-white/40">Shiv Dhara Edu. Trust</span>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="text-white/60 hover:text-white lg:hidden cursor-pointer" 
          aria-label="Close sidebar" 
          tabIndex={0}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="mx-5 mb-5 rounded-xl bg-white/10 p-3">
        <div className="flex items-center gap-3">
          <Avatar name={user?.name || 'User'} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{user?.name}</p>
            <Badge label={user?.role} color={roleColor} className="mt-0.5 text-[10px]" />
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 space-y-1">
        {navItems.map(({ label, icon: Icon, path }) => (
          <NavLink 
            key={path} 
            to={path} 
            onClick={onClose}
            className={({ isActive }) => clsx(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all cursor-pointer',
              isActive ? 'bg-white/15 text-white border-l-[3px] border-accent' : 'text-white/60 hover:bg-white/8 hover:text-white hover:translate-x-0.5'
            )}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 px-3 py-3 space-y-1">
        <button 
          onClick={handleSettingsClick}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/60 hover:bg-white/8 hover:text-white transition-all cursor-pointer text-left" 
          tabIndex={0} 
          aria-label="Settings"
        >
          <Settings className="h-5 w-5" />
          Settings
        </button>
        <button 
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-highlight/80 hover:bg-highlight/10 hover:text-highlight transition-all cursor-pointer text-left" 
          tabIndex={0} 
          aria-label="Logout"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  )

  return (
    <>
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-sidebar lg:flex-col shadow-sidebar">
        {sidebarContent}
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="fixed inset-0 z-40 bg-black/50 lg:hidden" 
              onClick={onClose} 
            />
            <motion.div 
              initial={{ x: -260 }} 
              animate={{ x: 0 }} 
              exit={{ x: -260 }} 
              transition={{ type: 'spring', damping: 25, stiffness: 300 }} 
              className="fixed inset-y-0 left-0 z-50 w-sidebar lg:hidden"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default Sidebar
