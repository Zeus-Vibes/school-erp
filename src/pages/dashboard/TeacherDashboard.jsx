import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, CalendarCheck, Megaphone, Clock } from 'lucide-react'
import StatCard from '../../components/ui/StatCard'
import Avatar from '../../components/ui/Avatar'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { notices, timetable, timeSlots } from '../../data'
import { getGreeting, getDayOfWeek, getSubjectColor, formatDate, getPriorityColor, getCategoryColor } from '../../utils/helpers'
import toast from 'react-hot-toast'

const TeacherDashboard = () => {
  const { user } = useAuth()
  const { students, teachers } = useData()
  const teacherData = useMemo(
    () => teachers.find((t) => t.id === user?.id) || teachers[0],
    [user, teachers]
  )
  const dayOfWeek = getDayOfWeek()
  const latestNotices = notices.slice(0, 3)

  const myClasses = teacherData.classes || []
  const allClassStudents = useMemo(
    () => students.filter((s) => myClasses.some((cls) => cls === `${s.class}${s.section}`)),
    [students, myClasses]
  )
  const classStudents = useMemo(() => allClassStudents.slice(0, 5), [allClassStudents])

  const [attendanceMarks, setAttendanceMarks] = useState({})

  const handleMarkAttendance = (studentId, status) => {
    setAttendanceMarks((prev) => ({ ...prev, [studentId]: status }))
  }

  const handleSubmitAttendance = () => {
    toast.success('Attendance submitted successfully!')
    setAttendanceMarks({})
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-primary via-primary/90 to-primary/80 p-6 text-white">
        <div className="flex items-center gap-4">
          <Avatar name={teacherData.name} size="lg" photoUrl={teacherData.photoUrl} />
          <div>
            <h1 className="font-playfair text-2xl font-bold">{getGreeting()}, {teacherData.name}!</h1>
            <div className="mt-2 flex flex-wrap gap-4 text-sm text-white/70">
              <span>Subject: {teacherData.subject}</span><span>|</span>
              <span>Experience: {teacherData.experience} years</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="My Classes" value={myClasses.length} icon={Users} color="primary" delay={0} />
        <StatCard title="Total Students" value={allClassStudents.length} icon={Users} color="green" delay={1} />
        <StatCard title="Attendance Today" value="Pending" icon={CalendarCheck} color="gold" delay={2} />
        <StatCard title="Notices" value={notices.length} icon={Megaphone} color="red" delay={3} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h3 className="mb-4 text-base font-semibold text-textPrimary">Today&apos;s Schedule — {dayOfWeek}</h3>
          <div className="space-y-2">
            {timeSlots.map((slot, index) => (
              <div key={slot} className="flex items-center gap-3 rounded-lg bg-bg px-4 py-2.5">
                <span className="text-xs font-medium text-textMuted w-24 shrink-0">{slot}</span>
                <span className={`text-sm font-medium ${index === 3 ? 'text-gray-400' : 'text-textPrimary'}`}>
                  {index === 3 ? '--Lunch--' : `${teacherData.subject} — ${myClasses[index % myClasses.length] || 'Free'}`}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h3 className="mb-4 text-base font-semibold text-textPrimary">Quick Attendance</h3>
          <div className="space-y-3">
            {classStudents.map((student) => (
              <div key={student.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar name={student.name} size="sm" photoUrl={student.photoUrl} />
                  <span className="text-sm text-textPrimary">{student.name}</span>
                </div>
                <div className="flex gap-1">
                  {['present', 'absent'].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleMarkAttendance(student.id, status)}
                      className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                        attendanceMarks[student.id] === status
                          ? (status === 'present' ? 'bg-secondary text-white' : 'bg-highlight text-white')
                          : 'bg-gray-100 text-textMuted hover:bg-gray-200'
                      }`}
                      tabIndex={0}
                      aria-label={`Mark ${student.name} ${status}`}
                    >
                      {status === 'present' ? 'P' : 'A'}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmitAttendance}
            className="mt-4 w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-white shadow-button hover:bg-primary/90 transition-all"
            tabIndex={0}
            aria-label="Submit Attendance"
          >
            Submit Attendance
          </motion.button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-card">
        <div className="border-b border-border px-6 py-4">
          <h3 className="text-base font-semibold text-textPrimary">Latest Notices</h3>
        </div>
        <div className="divide-y divide-border/50">
          {latestNotices.map((notice) => {
            const catColor = getCategoryColor(notice.category)
            return (
              <div key={notice.id} className="px-6 py-4" style={{ borderLeftWidth: '3px', borderLeftColor: getPriorityColor(notice.priority) }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ backgroundColor: catColor.bg, color: catColor.text }}>{notice.category}</span>
                  <span className="text-xs text-textMuted">{formatDate(notice.date)}</span>
                </div>
                <p className="text-sm font-medium text-textPrimary">{notice.title}</p>
              </div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}

export default TeacherDashboard
