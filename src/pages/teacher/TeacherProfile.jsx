import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { User, Phone, Mail, MapPin, Calendar, Briefcase, Award, ShieldAlert, Key } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import Avatar from '../../components/ui/Avatar'
import toast from 'react-hot-toast'

const TeacherProfile = () => {
  const { user } = useAuth()
  const { teachers, classes, updateTeacher } = useData()

  // Form states for password change
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  // Find the logged-in teacher
  const currentTeacher = useMemo(() => {
    return teachers.find(t => t.id === user?.userId || t.userId === user?.userId)
  }, [teachers, user])

  // Get class teacher details
  const classTeacherOfName = useMemo(() => {
    if (!currentTeacher || !currentTeacher.classTeacherOf) return 'Not Assigned'
    const cls = classes.find(c => c.id === currentTeacher.classTeacherOf)
    return cls ? `Class ${cls.standard}${cls.division} (${cls.medium})` : 'Not Assigned'
  }, [currentTeacher, classes])

  // Get subject mapping list
  const teachingAssignments = useMemo(() => {
    if (!currentTeacher || !currentTeacher.subjectClassMapping) return []
    return currentTeacher.subjectClassMapping.map(mapping => {
      const cls = classes.find(c => c.id === mapping.classId)
      return {
        subject: mapping.subject,
        classLabel: cls ? `Class ${cls.standard}${cls.division} (${cls.medium})` : 'N/A',
        year: cls ? cls.academicYearId : 'N/A'
      }
    })
  }, [currentTeacher, classes])

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
    updateTeacher(currentTeacher.id, {
      password: newPassword
    })

    setIsUpdating(false)
    toast.success('Password updated successfully')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  if (!currentTeacher) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-sm font-semibold text-textMuted">
        Teacher record not found.
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 max-w-4xl mx-auto">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-textPrimary">My Profile</h2>
        <p className="text-xs text-textMuted mt-1">View your personal details, assignments, and manage your account.</p>
      </div>

      {/* Profile Card Header */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-card flex flex-col sm:flex-row items-center gap-6">
        <Avatar name={currentTeacher.name} size="xl" photoUrl={currentTeacher.photoUrl} className="ring-4 ring-primary/10" />
        <div className="text-center sm:text-left space-y-1">
          <h3 className="text-xl font-bold text-textPrimary">{currentTeacher.name}</h3>
          <p className="text-sm font-semibold text-accent dark:text-yellow-600">Designation: Teacher</p>
          <div className="pt-2 flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-1 text-xs text-textMuted">
            <span><strong>Employee ID:</strong> {currentTeacher.employeeId || 'N/A'}</span>
            <span className="hidden sm:inline text-gray-300">|</span>
            <span><strong>User ID:</strong> {currentTeacher.userId || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Info Sections */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Info */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-4">
          <h4 className="text-sm font-bold text-primary border-b border-border pb-2 flex items-center gap-2">
            <User className="h-4 w-4" /> Personal Information
          </h4>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-textMuted font-medium">Date of Birth</span>
              <span className="text-textPrimary font-semibold">{currentTeacher.dob || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-textMuted font-medium">Gender</span>
              <span className="text-textPrimary font-semibold">{currentTeacher.gender || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-textMuted font-medium">Phone Number</span>
              <span className="text-textPrimary font-semibold">{currentTeacher.phone || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-textMuted font-medium">Email Address</span>
              <span className="text-textPrimary font-semibold">{currentTeacher.email || '—'}</span>
            </div>
            <div className="flex justify-between flex-col gap-1">
              <span className="text-textMuted font-medium">Residential Address</span>
              <span className="text-textPrimary font-semibold leading-relaxed">{currentTeacher.address || '—'}</span>
            </div>
          </div>
        </div>

        {/* Professional Info */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-4">
          <h4 className="text-sm font-bold text-primary border-b border-border pb-2 flex items-center gap-2">
            <Briefcase className="h-4 w-4" /> Professional Information
          </h4>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-textMuted font-medium">Qualification</span>
              <span className="text-textPrimary font-semibold">{currentTeacher.qualification || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-textMuted font-medium">Years of Experience</span>
              <span className="text-textPrimary font-semibold">{currentTeacher.experience} Years</span>
            </div>
            <div className="flex justify-between">
              <span className="text-textMuted font-medium">Date of Joining</span>
              <span className="text-textPrimary font-semibold">{currentTeacher.joiningDate || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-textMuted font-medium">Class Teacher Of</span>
              <span className="text-accent font-semibold dark:text-yellow-600">{classTeacherOfName}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Teaching Assignments */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-4">
        <h4 className="text-sm font-bold text-primary border-b border-border pb-2 flex items-center gap-2">
          <Award className="h-4 w-4" /> Teaching Assignments
        </h4>

        {teachingAssignments.length === 0 ? (
          <p className="text-xs text-textMuted italic">No teaching assignments mapped.</p>
        ) : (
          <div className="overflow-x-auto border border-border/60 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border bg-gray-50/50 text-textMuted font-semibold uppercase">
                  <th className="px-5 py-3">Class</th>
                  <th className="px-5 py-3">Subject</th>
                  <th className="px-5 py-3">Academic Year</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 text-textPrimary">
                {teachingAssignments.map((assign, index) => (
                  <tr key={index} className="hover:bg-gray-50/20 font-medium">
                    <td className="px-5 py-3">{assign.classLabel}</td>
                    <td className="px-5 py-3">{assign.subject}</td>
                    <td className="px-5 py-3 text-textMuted">{assign.year}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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

export default TeacherProfile
