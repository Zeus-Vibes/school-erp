import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, Search, LogOut, User, Shield } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Avatar from '../ui/Avatar'
import Badge from '../ui/Badge'
import toast from 'react-hot-toast'

const Topbar = ({ onMenuClick, pageTitle }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showProfile, setShowProfile] = useState(false)
  const profileRef = useRef(null)

  const roleColor = user?.role === 'admin' ? 'red' : user?.role === 'teacher' ? 'gold' : 'green'
  const roleLabel = user?.role === 'admin' ? 'Administrator' : user?.role === 'teacher' ? 'Teacher' : 'Student'

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) setShowProfile(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/login', { replace: true })
  }

  return (
    <div className="sticky top-0 z-30 flex h-topbar items-center justify-between border-b border-border bg-white px-6 shadow-sm">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="rounded-lg p-1.5 text-textMuted hover:bg-gray-100 lg:hidden" aria-label="Open menu" tabIndex={0}>
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold text-textPrimary font-inter">{pageTitle}</h1>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={() => toast('Search feature coming soon!', { icon: '🔍' })} className="rounded-lg p-2 text-textMuted hover:bg-gray-100 transition-colors" aria-label="Search" tabIndex={0}>
          <Search className="h-5 w-5" />
        </button>

        <div className="relative" ref={profileRef}>
          <button onClick={() => setShowProfile(!showProfile)} className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-gray-100 transition-colors" aria-label="Profile menu" tabIndex={0}>
            <Avatar name={user?.name || 'User'} size="sm" />
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-textPrimary leading-tight">{user?.name}</p>
              <p className="text-[10px] text-textMuted capitalize">{user?.role}</p>
            </div>
          </button>

          <AnimatePresence>
            {showProfile && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                className="absolute right-0 top-12 w-64 rounded-2xl border border-border bg-white shadow-modal overflow-hidden">
                <div className="bg-primary/5 px-4 py-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <Avatar name={user?.name || 'User'} size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-textPrimary truncate">{user?.name}</p>
                      <p className="text-xs text-textMuted truncate">{user?.email}</p>
                      <Badge label={roleLabel} color={roleColor} className="mt-1" />
                    </div>
                  </div>
                </div>
                <div className="py-1">
                  <button onClick={() => { setShowProfile(false); navigate(`/dashboard/${user?.role}/profile`) }}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-textPrimary hover:bg-gray-50 transition-colors" tabIndex={0} aria-label="My Profile">
                    <User className="h-4 w-4 text-textMuted" />My Profile
                  </button>
                  <button onClick={() => { setShowProfile(false); toast('Role info coming soon!', { icon: '🛡️' }) }}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-textPrimary hover:bg-gray-50 transition-colors" tabIndex={0} aria-label="Role Info">
                    <Shield className="h-4 w-4 text-textMuted" />Role: {roleLabel}
                  </button>
                </div>
                <div className="border-t border-border">
                  <button onClick={handleLogout} className="flex w-full items-center gap-2.5 px-4 py-3 text-sm text-highlight hover:bg-red-50 transition-colors" tabIndex={0} aria-label="Logout">
                    <LogOut className="h-4 w-4" />Logout
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default Topbar
