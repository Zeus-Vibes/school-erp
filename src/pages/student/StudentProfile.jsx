import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { User, Phone, Mail, MapPin, Calendar, Award, BookOpen, Key, Users } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import Avatar from '../../components/ui/Avatar'
import SchoolBrandBadge from '../../components/shared/SchoolBrandBadge'
import { getSchoolBrand } from '../../utils/schoolBrand'
import toast from 'react-hot-toast'

const houseColors = {
  Red: 'bg-red-500 text-red-700',
  Blue: 'bg-blue-500 text-blue-700',
  Green: 'bg-green-500 text-green-700',
  Yellow: 'bg-yellow-500 text-yellow-750'
}

const StudentProfile = () => {
  const { user } = useAuth()
  const { students, updateStudent } = useData()

  // Form states for password change
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  // Find the logged-in student
  const currentStudent = useMemo(() => {
    return students.find(s => s.id === user?.userId || s.userId === user?.userId)
  }, [students, user])

  const schoolBrandName = useMemo(() => {
    if (!currentStudent) return ''
    return currentStudent.schoolBrand || getSchoolBrand(currentStudent.standard).name
  }, [currentStudent])

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match')
      return
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long')
      return
    }

    setIsUpdating(true)
    // Simulate updating password
    await new Promise(resolve => setTimeout(resolve, 800))
    updateStudent(currentStudent.id, {
      password: newPassword
    })

    setIsUpdating(false)
    toast.success('Password updated successfully')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  if (!currentStudent) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-sm font-semibold text-textMuted">
        Student record not found.
      </div>
    )
  }

  const houseColorClass = houseColors[currentStudent.house] || 'bg-gray-400 text-gray-700'

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 max-w-4xl mx-auto">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-textPrimary">My Profile</h2>
        <p className="text-xs text-textMuted mt-1">View your academic details and manage your account credentials.</p>
      </div>

      {/* Profile Card Header */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-card flex flex-col sm:flex-row items-center gap-6">
        <Avatar name={currentStudent.name} size="xl" photoUrl={currentStudent.photoUrl} className="ring-4 ring-primary/10" />
        <div className="text-center sm:text-left space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h3 className="text-xl font-bold text-textPrimary">{currentStudent.name}</h3>
            <div>
              <SchoolBrandBadge brand={schoolBrandName} />
            </div>
          </div>
          <div className="flex flex-wrap justify-center sm:justify-start gap-3 text-xs font-semibold text-textMuted">
            <span>Class: {currentStudent.standard}</span>
            <span className="text-gray-300">|</span>
            <span>Division: {currentStudent.division}</span>
            <span className="text-gray-300">|</span>
            <span>Roll No: {currentStudent.rollNumber || currentStudent.roll || 'N/A'}</span>
          </div>
          <div className="pt-1 flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-1 text-xs text-textMuted">
            <span><strong>GR Number:</strong> {currentStudent.grNumber || 'N/A'}</span>
            <span className="hidden sm:inline text-gray-300">|</span>
            <span><strong>User ID:</strong> {currentStudent.userId || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Info Sections */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Academic Info */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-4">
          <h4 className="text-sm font-bold text-primary border-b border-border pb-2 flex items-center gap-2">
            <BookOpen className="h-4 w-4" /> Academic Information
          </h4>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-textMuted font-medium">Medium</span>
              <span className="text-textPrimary font-semibold">{currentStudent.medium || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-textMuted font-medium">House</span>
              <span className="text-textPrimary font-semibold flex items-center gap-1.5">
                <span className={`h-2.5 w-2.5 rounded-full ${houseColorClass.split(' ')[0]}`} />
                {currentStudent.house || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-textMuted font-medium">School Clubs</span>
              <span className="text-textPrimary font-semibold">
                {currentStudent.clubs?.join(', ') || 'None'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-textMuted font-medium">Admission Date</span>
              <span className="text-textPrimary font-semibold">{currentStudent.admissionDate || '—'}</span>
            </div>
          </div>
        </div>

        {/* Personal Info */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-4">
          <h4 className="text-sm font-bold text-primary border-b border-border pb-2 flex items-center gap-2">
            <User className="h-4 w-4" /> Personal Information
          </h4>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-textMuted font-medium">Date of Birth</span>
              <span className="text-textPrimary font-semibold">{currentStudent.dob || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-textMuted font-medium">Gender</span>
              <span className="text-textPrimary font-semibold">{currentStudent.gender || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-textMuted font-medium">Blood Group</span>
              <span className="text-textPrimary font-semibold">{currentStudent.bloodGroup || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-textMuted font-medium">Aadhar Number</span>
              <span className="text-textPrimary font-semibold">{currentStudent.aadhar || '—'}</span>
            </div>
            <div className="flex justify-between flex-col gap-1">
              <span className="text-textMuted font-medium">Address</span>
              <span className="text-textPrimary font-semibold leading-relaxed">{currentStudent.address || '—'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Parent / Guardian Information */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-4">
        <h4 className="text-sm font-bold text-primary border-b border-border pb-2 flex items-center gap-2">
          <Users className="h-4 w-4" /> Parent / Guardian Information
        </h4>
        <div className="grid gap-6 sm:grid-cols-2 text-xs">
          {/* Father Details */}
          <div className="space-y-3 border-r border-border/55 pr-4 last:border-r-0">
            <h5 className="font-bold text-textPrimary text-xs uppercase tracking-wider text-primary/80">Father Details</h5>
            <div className="flex justify-between">
              <span className="text-textMuted font-medium">Name</span>
              <span className="text-textPrimary font-semibold">{currentStudent.father?.name || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-textMuted font-medium">Phone Number</span>
              <span className="text-textPrimary font-semibold">{currentStudent.father?.phone || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-textMuted font-medium">Occupation</span>
              <span className="text-textPrimary font-semibold">{currentStudent.father?.occupation || '—'}</span>
            </div>
          </div>

          {/* Mother Details */}
          <div className="space-y-3">
            <h5 className="font-bold text-textPrimary text-xs uppercase tracking-wider text-primary/80">Mother Details</h5>
            <div className="flex justify-between">
              <span className="text-textMuted font-medium">Name</span>
              <span className="text-textPrimary font-semibold">{currentStudent.mother?.name || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-textMuted font-medium">Phone Number</span>
              <span className="text-textPrimary font-semibold">{currentStudent.mother?.phone || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-textMuted font-medium">Occupation</span>
              <span className="text-textPrimary font-semibold">{currentStudent.mother?.occupation || '—'}</span>
            </div>
          </div>

          <div className="sm:col-span-2 border-t border-border pt-4 flex flex-col sm:flex-row justify-between gap-2">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-textMuted" />
              <span className="text-textMuted font-medium">Parent Email:</span>
            </div>
            <span className="text-textPrimary font-semibold">{currentStudent.parentEmail || '—'}</span>
          </div>
        </div>
      </div>

      {/* Change Password Card */}
      <div id="change-password" className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-4">
        <h4 className="text-sm font-bold text-primary border-b border-border pb-2 flex items-center gap-2">
          <Key className="h-4 w-4" /> Change Password
        </h4>

        <form onSubmit={handlePasswordChange} className="grid gap-4 sm:grid-cols-3 items-end">
          <div>
            <label className="mb-1 block text-xs font-semibold text-textMuted">Current Password *</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full rounded-xl border border-border px-4 py-2.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-textMuted">New Password *</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full rounded-xl border border-border px-4 py-2.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-textMuted">Confirm Password *</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full rounded-xl border border-border px-4 py-2.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="sm:col-span-3 flex justify-end pt-2">
            <button
              type="submit"
              disabled={isUpdating || !currentPassword || !newPassword || !confirmPassword}
              className="rounded-xl bg-primary hover:bg-primary/95 text-white text-xs font-bold px-6 py-2.5 shadow disabled:opacity-50 transition-colors cursor-pointer"
              tabIndex={0}
              aria-label="Update Password"
            >
              {isUpdating ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  )
}

export default StudentProfile
