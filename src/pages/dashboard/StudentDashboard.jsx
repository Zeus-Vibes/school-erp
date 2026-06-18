import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CalendarCheck, IndianRupee, Trophy, CreditCard, AlertTriangle, BookOpen, Clock, Megaphone } from 'lucide-react'
import StatCard from '../../components/ui/StatCard'
import AttendanceDonut from '../../components/charts/AttendanceDonut'
import Badge from '../../components/ui/Badge'
import Avatar from '../../components/ui/Avatar'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { formatCurrency, formatDate, getGreeting, getDayOfWeek, getPriorityColor, getCategoryColor } from '../../utils/helpers'

const calculateTimeSlot = (startTime, duration, periodIndex) => {
  if (!startTime) return ''
  const [h, m] = startTime.split(':').map(Number)
  const startTotal = h * 60 + m + periodIndex * duration
  const endTotal = startTotal + duration

  const formatTime = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60) % 24
    const mins = totalMinutes % 60
    const ampm = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours % 12 || 12
    return `${String(displayHours).padStart(2, '0')}:${String(mins).padStart(2, '0')} ${ampm}`
  }

  return `${formatTime(startTotal)} – ${formatTime(endTotal)}`
}

const StudentDashboard = () => {
  const { user } = useAuth()
  const { students, timetables, attendanceRecords, feePayments, exams, examMarks, classes, settings, notices } = useData()
  const navigate = useNavigate()

  // Selected student
  const studentData = useMemo(
    () => students.find((s) => s.userId === user?.userId || s.id === user?.userId) || students[0],
    [user, students]
  )

  const dayOfWeek = getDayOfWeek()

  // 1. Real Attendance Rate & Summaries
  const studentAttendance = useMemo(
    () => attendanceRecords.filter((a) => a.studentId === studentData?.id),
    [attendanceRecords, studentData]
  )

  const attendanceSummary = useMemo(() => {
    return {
      present: studentAttendance.filter((a) => a.status === 'present').length,
      absent: studentAttendance.filter((a) => a.status === 'absent').length,
      late: studentAttendance.filter((a) => a.status === 'late').length,
      ml: studentAttendance.filter((a) => a.status === 'medical_leave').length
    }
  }, [studentAttendance])

  const attendancePercentage = useMemo(() => {
    const total = studentAttendance.length
    if (total === 0) return 100
    const activeDays = attendanceSummary.present + attendanceSummary.late + attendanceSummary.ml
    return Math.round((activeDays / total) * 100)
  }, [studentAttendance, attendanceSummary])

  // Low attendance warning threshold
  const threshold = settings.lowAttendanceThreshold || 75
  const isBelowThreshold = attendancePercentage < threshold

  // 2. Fee Status Card: Current Month Dues Check
  const currentMonthFeePaid = useMemo(() => {
    if (!studentData) return true
    const currentMonthEnd = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
    // Find if there is any unpaid fee due on or before the current month
    const unpaidPayments = feePayments.filter(
      (p) => p.studentId === studentData.id && !p.paid && new Date(p.dueDate) <= currentMonthEnd
    )
    return unpaidPayments.length === 0
  }, [feePayments, studentData])

  // 3. Class Rank - Calculated dynamically based on latest completed exam
  const classRankInfo = useMemo(() => {
    if (!studentData) return { rank: '—', suffix: '', examName: '' }

    const completedExams = exams.filter((e) => e.classId === studentData.classId && e.status === 'Completed')
    if (completedExams.length === 0) return { rank: '—', suffix: '', examName: '' }

    // Sort to find latest completed exam
    const latestExam = [...completedExams].sort((a, b) => b.endDate.localeCompare(a.endDate))[0]

    // Calculate score totals for all active class students
    const classScores = students
      .filter((s) => s.classId === latestExam.classId && s.isActive)
      .map((std) => {
        const marks = examMarks.filter((m) => m.examId === latestExam.id && m.studentId === std.id)
        const totalObt = marks.reduce((sum, m) => sum + (m.isAbsent ? 0 : m.marks), 0)
        return { studentId: std.id, score: totalObt }
      })

    const sorted = classScores.sort((a, b) => b.score - a.score)
    const rankIndex = sorted.findIndex((s) => s.studentId === studentData.id)
    const rank = rankIndex > -1 ? rankIndex + 1 : '—'
    const suffix = rank !== '—' ? (['st', 'nd', 'rd'][rank - 1] || 'th') : ''

    return { rank, suffix, examName: latestExam.name }
  }, [exams, examMarks, students, studentData])

  // 4. Timetable widget - filters today's slots from student's published timetable
  const todaySchedule = useMemo(() => {
    if (!studentData || !timetables) return []
    const tt = timetables.find((t) => t.classId === studentData.classId && t.isPublished)
    if (!tt) return []

    const list = []
    const workingDays = tt.workingDays === 'Mon-Sat' ? 6 : 5
    const isWorkingDayToday = workingDays === 6 ? dayOfWeek !== 'Sunday' : !['Saturday', 'Sunday'].includes(dayOfWeek)

    if (!isWorkingDayToday) return []

    for (let p = 1; p <= tt.periodsPerDay; p++) {
      const slot = tt.slots?.[`${dayOfWeek}-${p}`]
      const time = calculateTimeSlot(tt.startTime, tt.periodDuration, p - 1)
      const foundBreak = tt.breaks?.find((b) => b.afterPeriod === p)

      list.push({
        period: p,
        subject: slot?.subject || 'Free',
        time
      })

      if (foundBreak) {
        list.push({
          isBreak: true,
          label: foundBreak.label
        })
      }
    }
    return list
  }, [studentData, timetables, dayOfWeek])

  // 5. Upcoming Exams for student's class
  const upcomingExams = useMemo(() => {
    if (!studentData) return []
    return exams.filter(
      (e) => (e.status === 'Active' || e.status === 'Marks Entry Open') && e.classId === studentData.classId
    )
  }, [exams, studentData])

  const latestNotices = notices.slice(0, 3)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Low Attendance Warning Banner */}
      {isBelowThreshold && (
        <div className="rounded-2xl border border-red-200 bg-red-50/50 p-4 text-xs text-red-800 flex items-center gap-3 shadow-sm">
          <AlertTriangle className="h-5 w-5 text-highlight flex-shrink-0 animate-bounce" />
          <div>
            <p className="font-bold">⚠️ Low Attendance Alert</p>
            <p className="mt-0.5 text-red-700">
              Your overall attendance is <strong>{attendancePercentage}%</strong>, which is below the minimum required <strong>{threshold}%</strong> threshold. Please contact your Class Teacher.
            </p>
          </div>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-primary via-primary/90 to-primary/80 p-6 text-white shadow-md">
        <div className="flex items-center gap-4">
          <Avatar name={studentData.name} size="lg" photoUrl={studentData.photoUrl} />
          <div>
            <h1 className="font-playfair text-2xl font-bold">{getGreeting()}, {studentData.name}! 👋</h1>
            <div className="mt-2 flex flex-wrap gap-4 text-sm text-white/70">
              <span>Class: {studentData.standard}-{studentData.division} ({studentData.medium})</span><span>|</span>
              <span>Roll: #{studentData.rollNumber}</span><span>|</span>
              <span>GR Number: {studentData.grNumber}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Widgets */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="My Attendance"
          value={`${attendancePercentage}%`}
          icon={CalendarCheck}
          color={attendancePercentage >= 85 ? 'green' : 'red'}
          delay={0}
        />
        <StatCard
          title="Current Fee Status"
          value={currentMonthFeePaid ? 'Paid ✓' : 'Due ✗'}
          icon={IndianRupee}
          color={currentMonthFeePaid ? 'green' : 'red'}
          delay={1}
        />
        <StatCard
          title="Class Rank"
          value={classRankInfo.rank !== '—' ? `${classRankInfo.rank}${classRankInfo.suffix}` : '—'}
          icon={Trophy}
          color="gold"
          delay={2}
        />
      </div>

      {/* Quick ID Card Action */}
      <motion.button
        whileHover={{ y: -2, boxShadow: '0 4px 20px rgba(30,58,95,0.12)' }}
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate('/dashboard/student/id-card')}
        className="flex w-full items-center gap-4 rounded-2xl border border-dashed border-accent/40 bg-accent/5 p-4 hover:border-accent/60 transition-all cursor-pointer text-left"
        tabIndex={0}
        aria-label="Download My ID Card"
      >
        <div className="rounded-xl bg-accent/10 p-3">
          <CreditCard className="h-6 w-6 text-accent" />
        </div>
        <div>
          <p className="text-sm font-semibold text-textPrimary">Download My ID Card / Escort Pass</p>
          <p className="text-xs text-textMuted mt-0.5">View and download your digital ID card and Guardian Escort Pass as PDFs</p>
        </div>
      </motion.button>

      {/* Timetable & Attendance Charts */}
      <div className="grid gap-6 xl:grid-cols-2">
        {/* Today's Timetable */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card flex flex-col justify-between">
          <div>
            <h3 className="mb-4 text-sm font-bold text-textPrimary uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-primary" /> Today&apos;s Timetable — {dayOfWeek}
            </h3>
            {todaySchedule.length > 0 ? (
              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                {todaySchedule.map((slot, idx) => {
                  if (slot.isBreak) {
                    return (
                      <div key={`break-${idx}`} className="py-1.5 bg-blue-50/50 border border-blue-100 rounded-xl text-center text-xs font-bold text-blue-700">
                        {slot.label}
                      </div>
                    )
                  }
                  return (
                    <div key={`slot-${idx}`} className="flex items-center justify-between gap-3 rounded-xl bg-gray-50 border border-border/40 px-4 py-2.5">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-textPrimary">Period {slot.period}</span>
                        <span className="text-[10px] text-textMuted mt-0.5 font-semibold">{slot.time}</span>
                      </div>
                      <span className={`text-sm font-extrabold px-3 py-1 rounded-lg ${slot.subject === 'Free' ? 'text-gray-400 italic bg-white border border-gray-100' : 'text-primary bg-primary/5 border border-primary/10'}`}>
                        {slot.subject}
                      </span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-xs text-textMuted italic py-4">No classes scheduled today.</p>
            )}
          </div>
        </div>

        {/* Attendance Summary */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h3 className="mb-4 text-sm font-bold text-textPrimary uppercase tracking-wider flex items-center gap-1.5">
            <CalendarCheck className="h-4 w-4 text-primary" /> Attendance Summary
          </h3>
          <AttendanceDonut
            present={attendanceSummary.present}
            absent={attendanceSummary.absent}
            late={attendanceSummary.late}
          />
        </div>
      </div>

      {/* Upcoming Exams & Notices */}
      <div className="grid gap-6 xl:grid-cols-2">
        {/* Upcoming Exams */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-4">
          <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider flex items-center gap-1.5 border-b border-border pb-3">
            <BookOpen className="h-4.5 w-4.5 text-highlight" /> Upcoming Examinations
          </h3>
          {upcomingExams.length === 0 ? (
            <p className="text-xs text-textMuted italic">No upcoming examinations scheduled.</p>
          ) : (
            <div className="space-y-3">
              {upcomingExams.map((exam) => (
                <div key={exam.id} className="rounded-xl border border-border p-3.5 bg-gray-50 flex justify-between items-center">
                  <div>
                    <h4 className="text-xs font-bold text-textPrimary">{exam.name}</h4>
                    <p className="text-[10px] text-textMuted mt-0.5">
                      Dates: {formatDate(exam.startDate)} to {formatDate(exam.endDate)}
                    </p>
                  </div>
                  <Badge label={exam.status} color={exam.status === 'Completed' ? 'green' : 'yellow'} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notices */}
        <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
          <div className="border-b border-border px-6 py-4">
            <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider flex items-center gap-1.5">
              <Megaphone className="h-4 w-4 text-accent" /> Latest Notices
            </h3>
          </div>
          <div className="divide-y divide-border/50 bg-white/40">
            {latestNotices.map((notice) => {
              const catColor = getCategoryColor(notice.category)
              return (
                <div key={notice.id} className="px-6 py-4" style={{ borderLeftWidth: '3.5px', borderLeftColor: getPriorityColor(notice.priority) }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="rounded-full px-2.5 py-0.5 text-[9px] font-bold" style={{ backgroundColor: catColor.bg, color: catColor.text }}>
                      {notice.category}
                    </span>
                    <span className="text-[10px] text-textMuted font-medium">{formatDate(notice.date)}</span>
                  </div>
                  <p className="text-xs font-bold text-textPrimary leading-relaxed">{notice.title}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default StudentDashboard
