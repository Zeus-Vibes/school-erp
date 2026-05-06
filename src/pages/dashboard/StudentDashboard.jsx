import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CalendarCheck, IndianRupee, Trophy, BookOpen, CreditCard } from 'lucide-react'
import StatCard from '../../components/ui/StatCard'
import AttendanceDonut from '../../components/charts/AttendanceDonut'
import Badge from '../../components/ui/Badge'
import Avatar from '../../components/ui/Avatar'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { feesData, attendanceData, results, notices, timetable, timeSlots, issuedBooks } from '../../data'
import { formatCurrency, formatDate, getGreeting, getDayOfWeek, getSubjectColor, getGradeColor, getPriorityColor, getCategoryColor } from '../../utils/helpers'

const StudentDashboard = () => {
  const { user } = useAuth()
  const { students } = useData()
  const navigate = useNavigate()

  const studentData = useMemo(
    () => students.find((s) => s.id === user?.id) || students[0],
    [user, students]
  )
  const studentFees = useMemo(
    () => feesData.filter((f) => f.studentId === studentData.id),
    [studentData]
  )
  const studentAttendance = useMemo(
    () => attendanceData.filter((a) => a.studentId === studentData.id),
    [studentData]
  )
  const studentResult = useMemo(
    () => results.find((r) => r.studentId === studentData.id),
    [studentData]
  )
  const studentBooks = useMemo(
    () => issuedBooks.filter((b) => b.studentId === studentData.id && !b.returned),
    [studentData]
  )

  const attendanceSummary = useMemo(() => ({
    present: studentAttendance.filter((a) => a.status === 'present').length,
    absent: studentAttendance.filter((a) => a.status === 'absent').length,
    late: studentAttendance.filter((a) => a.status === 'late').length,
  }), [studentAttendance])

  const attendancePercentage = useMemo(() => {
    const total = studentAttendance.length
    return total ? Math.round(((attendanceSummary.present + attendanceSummary.late) / total) * 100) : 0
  }, [studentAttendance, attendanceSummary])

  const feeStatus = studentFees.length > 0 ? studentFees[0] : null
  const classKey = `${studentData.class}${studentData.section}`
  const dayOfWeek = getDayOfWeek()
  const todaySchedule = timetable[classKey]?.[dayOfWeek] || []
  const latestNotices = notices.slice(0, 3)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-primary via-primary/90 to-primary/80 p-6 text-white">
        <div className="flex items-center gap-4">
          <Avatar name={studentData.name} size="lg" photoUrl={studentData.photoUrl} />
          <div>
            <h1 className="font-playfair text-2xl font-bold">{getGreeting()}, {studentData.name}! 👋</h1>
            <div className="mt-2 flex flex-wrap gap-4 text-sm text-white/70">
              <span>Class: {studentData.class}-{studentData.section}</span><span>|</span>
              <span>Roll: {studentData.id}</span><span>|</span>
              <span>Academic Year: 2024-25</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Attendance" value={`${attendancePercentage}%`} icon={CalendarCheck} color={attendancePercentage >= 85 ? 'green' : 'red'} delay={0} />
        <StatCard title="Fee Status" value={feeStatus?.paid ? 'Paid ✓' : 'Due ✗'} icon={IndianRupee} color={feeStatus?.paid ? 'green' : 'red'} delay={1} />
        <StatCard title="Class Rank" value={studentResult ? `${studentResult.rank}${['st', 'nd', 'rd'][studentResult.rank - 1] || 'th'}` : '—'} icon={Trophy} color="gold" delay={2} />
        <StatCard title="Books Issued" value={studentBooks.length} icon={BookOpen} color="primary" delay={3} />
      </div>

      {/* Download ID Card Action */}
      <motion.button
        whileHover={{ y: -2, boxShadow: '0 4px 20px rgba(30,58,95,0.12)' }}
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate('/dashboard/idcards')}
        className="flex w-full items-center gap-4 rounded-2xl border-2 border-dashed border-accent/40 bg-accent/5 p-5 hover:border-accent/60 transition-all"
        tabIndex={0}
        aria-label="Download My ID Card"
      >
        <div className="rounded-xl bg-accent/10 p-3">
          <CreditCard className="h-6 w-6 text-accent" />
        </div>
        <div className="text-left">
          <p className="text-sm font-semibold text-textPrimary">Download My ID Card</p>
          <p className="text-xs text-textMuted">View and download your student ID card as PDF</p>
        </div>
      </motion.button>

      {/* Timetable & Attendance */}
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h3 className="mb-4 text-base font-semibold text-textPrimary">Today&apos;s Timetable — {dayOfWeek}</h3>
          {todaySchedule.length > 0 ? (
            <div className="space-y-2">{todaySchedule.map((subject, index) => {
              const colors = getSubjectColor(subject)
              return (
                <div key={index} className={`flex items-center gap-3 rounded-lg px-4 py-2.5 ${colors.bg}`}>
                  <span className="text-xs font-medium text-textMuted w-24 shrink-0">{timeSlots[index]}</span>
                  <span className={`text-sm font-medium ${colors.text}`}>{subject}</span>
                </div>
              )
            })}</div>
          ) : <p className="text-sm text-textMuted">No classes today</p>}
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h3 className="mb-4 text-base font-semibold text-textPrimary">Attendance Summary</h3>
          <AttendanceDonut present={attendanceSummary.present} absent={attendanceSummary.absent} late={attendanceSummary.late} />
        </div>
      </div>

      {/* Fees & Results */}
      <div className="grid gap-6 xl:grid-cols-2">
        <div className={`rounded-2xl border p-6 shadow-card ${feeStatus?.paid ? 'border-secondary/30 bg-green-50/50' : 'border-highlight/30 bg-red-50/50'}`}>
          <h3 className="mb-3 text-base font-semibold text-textPrimary">{feeStatus?.paid ? '✓ Term 1 Fees Paid' : '⚠ Term 1 Fees Due'}</h3>
          {feeStatus && (
            <>
              <p className="text-sm text-textMuted">
                Amount: <span className="font-semibold text-textPrimary">{formatCurrency(feeStatus.amount)}</span>
              </p>
              <p className="text-sm text-textMuted">
                {feeStatus.paid ? `Paid on: ${formatDate(feeStatus.paymentDate)}` : `Due by: ${formatDate(feeStatus.dueDate)}`}
              </p>
            </>
          )}
        </div>

        {studentResult && (
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h3 className="mb-3 text-base font-semibold text-textPrimary">Recent Results</h3>
            <div className="space-y-2">{studentResult.subjects.map((sub) => (
              <div key={sub.name} className="flex items-center justify-between">
                <span className="text-sm text-textMuted">{sub.name}</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-24 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${sub.obtained}%`, backgroundColor: getGradeColor(sub.grade) }} />
                  </div>
                  <span className="text-xs font-medium w-8 text-right" style={{ color: getGradeColor(sub.grade) }}>{sub.obtained}</span>
                </div>
              </div>
            ))}</div>
            <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
              <span className="text-sm font-semibold text-textPrimary">Overall: {studentResult.percentage}%</span>
              <Badge label={`Rank #${studentResult.rank}`} color="gold" />
            </div>
          </div>
        )}
      </div>

      {/* Notices */}
      <div className="rounded-2xl border border-border bg-card shadow-card">
        <div className="border-b border-border px-6 py-4">
          <h3 className="text-base font-semibold text-textPrimary">Latest Notices</h3>
        </div>
        <div className="divide-y divide-border/50">{latestNotices.map((notice) => {
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
        })}</div>
      </div>
    </motion.div>
  )
}

export default StudentDashboard
