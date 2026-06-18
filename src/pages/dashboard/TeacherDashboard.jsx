import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, CalendarCheck, Megaphone, Clock, BarChart3, AlertCircle } from 'lucide-react'
import StatCard from '../../components/ui/StatCard'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { getGreeting, getDayOfWeek, formatDate, getPriorityColor, getCategoryColor } from '../../utils/helpers'
import toast from 'react-hot-toast'

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

const TeacherDashboard = () => {
  const { user } = useAuth()
  const { students, teachers, timetables, classes, exams, notices } = useData()

  // Selected teacher
  const teacherData = useMemo(
    () => teachers.find((t) => t.userId === user?.userId || t.id === user?.userId) || teachers[0],
    [user, teachers]
  )

  const dayOfWeek = getDayOfWeek()
  const latestNotices = notices.slice(0, 3)

  const myClassIds = useMemo(() => {
    return teacherData.subjectClassMapping?.map((m) => m.classId) || []
  }, [teacherData])

  const allClassStudents = useMemo(() => {
    return students.filter((s) => myClassIds.includes(s.classId) && s.isActive)
  }, [students, myClassIds])

  const classStudentsPreview = useMemo(() => {
    return allClassStudents.slice(0, 5)
  }, [allClassStudents])

  // 1. Dynamic Schedule filtering from published timetables for current day
  const todaySchedule = useMemo(() => {
    if (!teacherData) return []
    const list = []
    const published = timetables.filter((t) => t.isPublished)
    const day = getDayOfWeek()

    // Find max periods
    const maxPeriods = published.reduce((max, t) => Math.max(max, t.periodsPerDay), 6)

    for (let p = 1; p <= maxPeriods; p++) {
      let assigned = null
      published.forEach((tt) => {
        const slot = tt.slots?.[`${day}-${p}`]
        if (slot && (slot.teacherId === teacherData.id || slot.teacherId === teacherData.userId)) {
          const cls = classes.find((c) => c.id === tt.classId)
          assigned = {
            subject: slot.subject,
            classLabel: cls ? `${cls.standard}${cls.division}` : 'Class',
            time: calculateTimeSlot(tt.startTime, tt.periodDuration, p - 1)
          }
        }
      })

      list.push({
        period: p,
        assigned
      })
    }

    return list
  }, [timetables, teacherData, classes])

  // 2. Pending Marks Entry Count Card
  const pendingMarksCount = useMemo(() => {
    if (!teacherData) return 0
    let count = 0
    exams.forEach((exam) => {
      if (exam.status === 'Marks Entry Open') {
        exam.subjects?.forEach((sub) => {
          const isMySubject = sub.teacherId === teacherData.id || sub.teacherId === teacherData.userId
          if (isMySubject && !sub.marksSubmitted) {
            count++
          }
        })
      }
    })
    return count
  }, [exams, teacherData])

  // 3. Upcoming exams for teacher's classes
  const upcomingExams = useMemo(() => {
    if (!teacherData) return []
    return exams.filter(
      (e) => (e.status === 'Active' || e.status === 'Marks Entry Open') && myClassIds.includes(e.classId)
    )
  }, [exams, teacherData, myClassIds])

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
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-primary via-primary/90 to-primary/80 p-6 text-white shadow-md">
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

      {/* Grid containing the stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="My Mapped Classes" value={myClassIds.length} icon={Users} color="primary" delay={0} />
        <StatCard title="Total Students" value={allClassStudents.length} icon={Users} color="green" delay={1} />
        <StatCard title="Pending Marks Entry" value={pendingMarksCount} icon={BarChart3} color="red" delay={2} />
        <StatCard title="Notice Bulletins" value={notices.length} icon={Megaphone} color="gold" delay={3} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Dynamic Timetable Schedule */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card flex flex-col justify-between">
          <div>
            <h3 className="mb-4 text-sm font-bold text-textPrimary uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-primary" /> Today&apos;s Schedule — {dayOfWeek}
            </h3>
            <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
              {todaySchedule.map((slot) => (
                <div key={slot.period} className="flex items-center justify-between gap-3 rounded-xl bg-gray-50 border border-border/40 px-4 py-3">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-primary">Period {slot.period}</span>
                    <span className="text-[10px] text-textMuted mt-0.5 font-semibold">
                      {slot.assigned?.time || '—'}
                    </span>
                  </div>
                  {slot.assigned ? (
                    <div className="text-right">
                      <span className="text-sm font-extrabold text-textPrimary block">{slot.assigned.subject}</span>
                      <span className="text-[9px] font-bold text-accent bg-accent/5 border border-accent/15 rounded px-1.5 py-0.5 inline-block mt-0.5">
                        Class {slot.assigned.classLabel}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-textMuted/60 font-semibold italic bg-white border border-gray-100 px-3 py-1 rounded-lg">
                      Free Period
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Attendance Widget */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card flex flex-col justify-between">
          <div>
            <h3 className="mb-4 text-sm font-bold text-textPrimary uppercase tracking-wider flex items-center gap-1.5">
              <CalendarCheck className="h-4 w-4 text-primary" /> Quick Attendance
            </h3>
            {classStudentsPreview.length === 0 ? (
              <p className="text-xs text-textMuted italic">No students assigned to your classes</p>
            ) : (
              <div className="space-y-3">
                {classStudentsPreview.map((student) => (
                  <div key={student.id} className="flex items-center justify-between py-1.5 border-b border-border/40 last:border-0">
                    <div className="flex items-center gap-2">
                      <Avatar name={student.name} size="sm" photoUrl={student.photoUrl} />
                      <span className="text-xs font-bold text-textPrimary">{student.name}</span>
                    </div>
                    <div className="flex gap-1.5">
                      {['present', 'absent'].map((status) => (
                        <button
                          key={status}
                          onClick={() => handleMarkAttendance(student.id, status)}
                          className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                            attendanceMarks[student.id] === status
                              ? (status === 'present' ? 'bg-secondary text-white shadow-sm' : 'bg-highlight text-white shadow-sm')
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
            )}
          </div>
          {classStudentsPreview.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmitAttendance}
              className="mt-6 w-full rounded-xl bg-primary py-3 text-xs font-bold text-white shadow-button hover:bg-primary/95 transition-all"
              tabIndex={0}
              aria-label="Submit Attendance"
            >
              Submit Attendance
            </motion.button>
          )}
        </div>
      </div>

      {/* Grid for notices and exams */}
      <div className="grid gap-6 xl:grid-cols-2">
        {/* Upcoming Exams */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-4">
          <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider flex items-center gap-1.5 border-b border-border pb-3">
            <AlertCircle className="h-4.5 w-4.5 text-highlight" /> Upcoming Examinations
          </h3>
          {upcomingExams.length === 0 ? (
            <p className="text-xs text-textMuted italic">No exams scheduled for your classes.</p>
          ) : (
            <div className="space-y-3">
              {upcomingExams.map((exam) => {
                const cls = classes.find((c) => c.id === exam.classId)
                return (
                  <div key={exam.id} className="rounded-xl border border-border p-3.5 bg-gray-50 flex justify-between items-center">
                    <div>
                      <h4 className="text-xs font-bold text-textPrimary">{exam.name}</h4>
                      <p className="text-[10px] text-textMuted mt-0.5">
                        Class: {cls ? `${cls.standard}${cls.division}` : 'N/A'} | Year: {exam.academicYearId}
                      </p>
                      <p className="text-[10px] text-textMuted mt-0.5">
                        Dates: {formatDate(exam.startDate)} to {formatDate(exam.endDate)}
                      </p>
                    </div>
                    <Badge label={exam.status} color={exam.status === 'Completed' ? 'green' : 'yellow'} />
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Notices list */}
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

export default TeacherDashboard
