import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { CalendarCheck, UserCheck, UserX, Clock, AlertTriangle, ChevronLeft, ChevronRight, FileText } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import StatCard from '../../components/ui/StatCard'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/shared/EmptyState'
import { useData } from '../../context/DataContext'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const Attendance = () => {
  const { user } = useAuth()
  const {
    students,
    classes,
    teachers,
    attendanceRecords,
    holidays,
    saveAttendanceBatch
  } = useData()

  // Role flags
  const isAdmin = user?.role === 'admin'
  const isTeacher = user?.role === 'teacher'
  const isStudent = user?.role === 'student'

  const currentTeacher = useMemo(() => {
    if (!isTeacher) return null
    return teachers.find((t) => t.userId === user?.userId)
  }, [teachers, isTeacher, user])

  const currentStudent = useMemo(() => {
    if (!isStudent) return null
    return students.find((s) => s.userId === user?.userId)
  }, [students, isStudent, user])

  // --- ADMIN / TEACHER PORTAL STATE ---
  const [activeTab, setActiveTab] = useState(isAdmin ? 'overview' : 'mark')
  const [selectedClassId, setSelectedClassId] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0])
  const [marks, setMarks] = useState({}) // { [studentId]: 'present' | 'absent' | 'late' | 'medical_leave' }
  const [showEditReasonModal, setShowEditReasonModal] = useState(false)
  const [editReason, setEditReason] = useState('')

  // Filtered classes for marking dropdown
  const availableClasses = useMemo(() => {
    if (isAdmin) return classes
    if (isTeacher && currentTeacher) {
      const classIds = currentTeacher.subjectClassMapping?.map((m) => m.classId) || []
      return classes.filter((c) => classIds.includes(c.id))
    }
    return []
  }, [classes, isAdmin, isTeacher, currentTeacher])

  // Set default class on load
  useMemo(() => {
    if (availableClasses.length > 0 && !selectedClassId) {
      setSelectedClassId(availableClasses[0].id)
    }
  }, [availableClasses, selectedClassId])

  // Filtered subjects for selected class
  const availableSubjects = useMemo(() => {
    if (!selectedClassId) return []
    const cls = classes.find((c) => c.id === selectedClassId)
    if (!cls) return []

    if (isAdmin) {
      return cls.subjects?.map((s) => s.name) || []
    }
    if (isTeacher && currentTeacher) {
      return currentTeacher.subjectClassMapping
        ?.filter((m) => m.classId === selectedClassId)
        ?.map((m) => m.subject) || []
    }
    return []
  }, [classes, selectedClassId, isAdmin, isTeacher, currentTeacher])

  // Set default subject on class/load change
  useMemo(() => {
    if (availableSubjects.length > 0) {
      setSelectedSubject(availableSubjects[0])
    } else {
      setSelectedSubject('')
    }
  }, [availableSubjects])

  // Active students in class
  const classStudents = useMemo(() => {
    if (!selectedClassId) return []
    return students.filter((s) => s.classId === selectedClassId && s.isActive === true)
  }, [students, selectedClassId])

  // Check if attendance exists for selected Date + Class + Subject
  const existingRecords = useMemo(() => {
    if (!selectedClassId || !selectedSubject || !selectedDate) return []
    return attendanceRecords.filter(
      (r) => r.classId === selectedClassId && r.subject === selectedSubject && r.date === selectedDate
    )
  }, [attendanceRecords, selectedClassId, selectedSubject, selectedDate])

  const isEditingPast = existingRecords.length > 0

  // Populate marks form when selections or existing records change
  useMemo(() => {
    const initialMarks = {}
    classStudents.forEach((s) => {
      const match = existingRecords.find((r) => r.studentId === s.id)
      initialMarks[s.id] = match ? match.status : 'present'
    })
    setMarks(initialMarks)
  }, [classStudents, existingRecords])

  const handleMark = (studentId, status) => {
    setMarks((prev) => ({ ...prev, [studentId]: status }))
  }

  const handleMarkAllPresent = () => {
    const allPresent = {}
    classStudents.forEach((s) => {
      allPresent[s.id] = 'present'
    })
    setMarks(allPresent)
    toast.success('All students marked present')
  }

  const handleSubmitAttendance = (e) => {
    e.preventDefault()
    if (isEditingPast) {
      // Show Reason Modal
      setEditReason('')
      setShowEditReasonModal(true)
    } else {
      // Direct Save
      saveBatch([])
    }
  }

  const saveBatch = (reason = '') => {
    const batchData = Object.entries(marks).map(([studentId, status]) => ({
      studentId,
      status
    }))

    saveAttendanceBatch(
      selectedDate,
      selectedClassId,
      selectedSubject,
      batchData,
      isEditingPast
        ? {
            userId: user.userId,
            name: user.name,
            reason
          }
        : null
    )

    setShowEditReasonModal(false)
    toast.success(isEditingPast ? 'Attendance updated successfully' : 'Attendance submitted successfully')
  }

  // --- ADMIN OVERVIEW DATA ---
  const lowAttendanceThreshold = 75

  const adminStats = useMemo(() => {
    if (!isAdmin) return null
    // All attendance records
    const total = attendanceRecords.length
    if (total === 0) return { todayPercent: 0, monthPercent: 0, lowCount: 0, workingDays: 0 }

    const presentCount = attendanceRecords.filter((r) => r.status === 'present' || r.status === 'present').length
    const lateCount = attendanceRecords.filter((r) => r.status === 'late').length
    const mlCount = attendanceRecords.filter((r) => r.status === 'medical_leave').length

    // Today's Date
    const todayStr = new Date().toISOString().split('T')[0]
    const todayRecords = attendanceRecords.filter((r) => r.date === todayStr)
    const todayPresent = todayRecords.filter((r) => r.status === 'present').length
    const todayPercent = todayRecords.length > 0 ? Math.round((todayPresent / todayRecords.length) * 100) : 0

    // Overall attendance %
    const overallPercent = Math.round(((presentCount + lateCount + mlCount) / total) * 100)

    // Calculate low attendance students count
    const activeStudents = students.filter((s) => s.isActive)
    let lowCount = 0
    activeStudents.forEach((s) => {
      const records = attendanceRecords.filter((r) => r.studentId === s.id)
      if (records.length > 0) {
        const present = records.filter((r) => r.status === 'present' || r.status === 'late' || r.status === 'medical_leave').length
        const pct = (present / records.length) * 100
        if (pct < lowAttendanceThreshold) {
          lowCount++
        }
      }
    })

    // Working days (unique dates in records or holidays count)
    const uniqueDates = [...new Set(attendanceRecords.map((r) => r.date))]

    return {
      todayPercent,
      overallPercent,
      lowCount,
      workingDays: uniqueDates.length
    }
  }, [attendanceRecords, students, isAdmin])

  const classWiseReport = useMemo(() => {
    if (!isAdmin) return []
    return classes.map((cls) => {
      const clsStudents = students.filter((s) => s.classId === cls.id && s.isActive)
      const studentIds = clsStudents.map((s) => s.id)

      const clsRecords = attendanceRecords.filter((r) => studentIds.includes(r.studentId))
      const total = clsRecords.length
      const present = clsRecords.filter((r) => r.status === 'present').length
      const absent = clsRecords.filter((r) => r.status === 'absent').length
      const late = clsRecords.filter((r) => r.status === 'late').length
      const ml = clsRecords.filter((r) => r.status === 'medical_leave').length

      const percent = total > 0 ? Math.round(((present + late + ml) / total) * 100) : 0

      return {
        id: cls.id,
        name: `${cls.standard}${cls.division}`,
        medium: cls.medium,
        totalStudents: clsStudents.length,
        present,
        absent,
        late,
        ml,
        percent
      }
    })
  }, [classes, students, attendanceRecords, isAdmin])

  const lowAttendanceList = useMemo(() => {
    if (!isAdmin) return []
    const list = []
    const activeStudents = students.filter((s) => s.isActive)

    activeStudents.forEach((s) => {
      const records = attendanceRecords.filter((r) => r.studentId === s.id)
      if (records.length > 0) {
        const present = records.filter((r) => r.status === 'present' || r.status === 'late' || r.status === 'medical_leave').length
        const pct = Math.round((present / records.length) * 100)
        if (pct < lowAttendanceThreshold) {
          const cls = classes.find((c) => c.id === s.classId)
          list.push({
            id: s.id,
            name: s.name,
            classLabel: cls ? `${cls.standard}${cls.division}` : 'N/A',
            percent: pct
          })
        }
      }
    })
    return list.sort((a, b) => a.percent - b.percent)
  }, [students, attendanceRecords, classes, isAdmin])

  // --- STUDENT CALENDAR STATE & DATA ---
  const [currentMonth, setCurrentMonth] = useState(() => new Date())

  const studentStats = useMemo(() => {
    if (!isStudent || !currentStudent) return null

    const records = attendanceRecords.filter((r) => r.studentId === currentStudent.id)
    const total = records.length
    if (total === 0) return { percent: 0, present: 0, absent: 0, late: 0, ml: 0, subjects: [] }

    const present = records.filter((r) => r.status === 'present').length
    const absent = records.filter((r) => r.status === 'absent').length
    const late = records.filter((r) => r.status === 'late').length
    const ml = records.filter((r) => r.status === 'medical_leave').length

    const percent = Math.round(((present + late + ml) / total) * 100)

    // Subject breakdown
    const subjectMap = {}
    records.forEach((r) => {
      if (!r.subject) return
      if (!subjectMap[r.subject]) {
        subjectMap[r.subject] = { total: 0, present: 0, absent: 0, late: 0, ml: 0 }
      }
      subjectMap[r.subject].total++
      if (r.status === 'present') subjectMap[r.subject].present++
      else if (r.status === 'absent') subjectMap[r.subject].absent++
      else if (r.status === 'late') subjectMap[r.subject].late++
      else if (r.status === 'medical_leave') subjectMap[r.subject].ml++
    })

    const subjects = Object.entries(subjectMap).map(([subject, stats]) => ({
      name: subject,
      total: stats.total,
      present: stats.present,
      absent: stats.absent,
      late: stats.late,
      ml: stats.ml,
      percent: Math.round(((stats.present + stats.late + stats.ml) / stats.total) * 100)
    }))

    return {
      percent,
      present,
      absent,
      late,
      ml,
      subjects
    }
  }, [attendanceRecords, isStudent, currentStudent])

  const calendarDays = useMemo(() => {
    if (!isStudent) return []
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()

    const firstDay = new Date(year, month, 1)
    const startOffset = firstDay.getDay() // 0 is Sunday, 1 is Monday...
    const numDays = new Date(year, month + 1, 0).getDate()

    const list = []

    // Empty cells before the 1st
    for (let i = 0; i < startOffset; i++) {
      list.push({ isEmpty: true })
    }

    // Days of the month
    for (let day = 1; day <= numDays; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const isSunday = new Date(year, month, day).getDay() === 0
      const holiday = holidays.find((h) => h.date === dateStr)

      // Find attendance status
      const studentRecs = attendanceRecords.filter(
        (r) => r.studentId === currentStudent?.id && r.date === dateStr
      )

      let status = 'none'
      if (studentRecs.length > 0) {
        // Severe status calculation
        if (studentRecs.some((r) => r.status === 'absent')) status = 'absent'
        else if (studentRecs.some((r) => r.status === 'medical_leave')) status = 'medical_leave'
        else if (studentRecs.some((r) => r.status === 'late')) status = 'late'
        else if (studentRecs.some((r) => r.status === 'present')) status = 'present'
      }

      list.push({
        day,
        dateStr,
        isSunday,
        holidayName: holiday?.name || null,
        status
      })
    }

    return list
  }, [currentMonth, holidays, attendanceRecords, isStudent, currentStudent])

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  // RENDER: Admin or Teacher
  if (isAdmin || isTeacher) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <PageHeader title="Attendance Management" />

        <div className="flex gap-2">
          {isAdmin && (
            <button
              onClick={() => setActiveTab('overview')}
              className={`rounded-xl px-5 py-2.5 text-sm font-medium transition-all ${activeTab === 'overview' ? 'bg-primary text-white shadow-button' : 'bg-white text-textMuted border border-border hover:bg-gray-50'}`}
              tabIndex={0}
            >
              Overview
            </button>
          )}
          <button
            onClick={() => setActiveTab('mark')}
            className={`rounded-xl px-5 py-2.5 text-sm font-medium transition-all ${activeTab === 'mark' ? 'bg-primary text-white shadow-button' : 'bg-white text-textMuted border border-border hover:bg-gray-50'}`}
            tabIndex={0}
          >
            Mark Attendance
          </button>
        </div>

        {activeTab === 'overview' && isAdmin && adminStats && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard title="Today's Attendance" value={`${adminStats.todayPercent}%`} icon={CalendarCheck} color="primary" />
              <StatCard title="Overall Rate" value={`${adminStats.overallPercent}%`} icon={UserCheck} color="green" />
              <StatCard title="Low Attendance Students" value={adminStats.lowCount} icon={UserX} color="red" />
              <StatCard title="Marked Working Days" value={adminStats.workingDays} icon={Clock} color="gold" />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 rounded-2xl border border-border bg-card shadow-card p-6 overflow-x-auto">
                <h3 className="text-sm font-bold text-textPrimary mb-4">Class-wise Overview</h3>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="pb-3 text-xs font-semibold uppercase text-textMuted">Class</th>
                      <th className="pb-3 text-xs font-semibold uppercase text-textMuted">Medium</th>
                      <th className="pb-3 text-xs font-semibold uppercase text-textMuted">Students</th>
                      <th className="pb-3 text-xs font-semibold uppercase text-textMuted">Present</th>
                      <th className="pb-3 text-xs font-semibold uppercase text-textMuted">Absent</th>
                      <th className="pb-3 text-xs font-semibold uppercase text-textMuted">Medical Leave</th>
                      <th className="pb-3 text-xs font-semibold uppercase text-textMuted">Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50 text-sm">
                    {classWiseReport.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50/20">
                        <td className="py-3 font-medium text-textPrimary">{row.name}</td>
                        <td className="py-3 text-textMuted">{row.medium}</td>
                        <td className="py-3 font-semibold text-textPrimary">{row.totalStudents}</td>
                        <td className="py-3 text-green-600 font-semibold">{row.present}</td>
                        <td className="py-3 text-red-600 font-semibold">{row.absent}</td>
                        <td className="py-3 text-blue-600 font-semibold">{row.ml}</td>
                        <td className="py-3">
                          <span className={`font-bold ${row.percent >= 75 ? 'text-primary' : 'text-highlight'}`}>
                            {row.percent}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="rounded-2xl border border-border bg-card shadow-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="h-5 w-5 text-highlight" />
                  <h3 className="text-sm font-bold text-textPrimary">Low Attendance Alert</h3>
                </div>
                {lowAttendanceList.length === 0 ? (
                  <p className="text-xs text-textMuted">No student is currently below the {lowAttendanceThreshold}% threshold.</p>
                ) : (
                  <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
                    {lowAttendanceList.map((std) => (
                      <div key={std.id} className="flex justify-between items-center p-3 rounded-xl bg-highlight/5 border border-highlight/10">
                        <div>
                          <div className="text-xs font-bold text-textPrimary">{std.name}</div>
                          <div className="text-[10px] text-textMuted mt-0.5">Class: {std.classLabel}</div>
                        </div>
                        <span className="rounded-full bg-highlight/10 px-2.5 py-0.5 text-xs font-bold text-highlight">
                          {std.percent}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'mark' && (
          <form onSubmit={handleSubmitAttendance} className="space-y-6">
            <div className="flex flex-wrap gap-4 bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="flex flex-col gap-1 w-48">
                <label className="text-xs font-medium text-textMuted">Class</label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="rounded-xl border border-border bg-white px-4 py-2.5 text-sm"
                  required
                >
                  <option value="">-- Class --</option>
                  {availableClasses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.standard}{c.division} ({c.medium})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1 w-48">
                <label className="text-xs font-medium text-textMuted">Subject</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="rounded-xl border border-border bg-white px-4 py-2.5 text-sm"
                  required
                  disabled={!selectedClassId}
                >
                  <option value="">-- Subject --</option>
                  {availableSubjects.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1 w-48">
                <label className="text-xs font-medium text-textMuted">Date</label>
                <input
                  type="date"
                  max={new Date().toISOString().split('T')[0]}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="rounded-xl border border-border bg-white px-4 py-2.5 text-sm"
                  required
                />
              </div>

              <button
                type="button"
                onClick={handleMarkAllPresent}
                disabled={classStudents.length === 0}
                className="ml-auto self-end rounded-xl bg-secondary px-4 py-2.5 text-sm font-semibold text-white shadow-button disabled:opacity-50 hover:bg-secondary/90 transition-all"
                tabIndex={0}
              >
                Mark All Present
              </button>
            </div>

            {isEditingPast && (
              <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                <span>You are editing past attendance records. A reason for edit will be required upon saving.</span>
              </div>
            )}

            {classStudents.length === 0 ? (
              <EmptyState title="No Students Found" description="Select a class to load active students for marking attendance." />
            ) : (
              <div className="space-y-4">
                <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
                  <div className="divide-y divide-border/50">
                    {classStudents.map((student) => {
                      const status = marks[student.id] || 'present'
                      return (
                        <div key={student.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/20 transition-all">
                          <div className="flex items-center gap-3">
                            <Avatar name={student.name} size="sm" />
                            <div>
                              <p className="text-sm font-semibold text-textPrimary">{student.name}</p>
                              <p className="text-xs text-textMuted mt-0.5">Roll No: {student.rollNumber} | GR: {student.grNumber}</p>
                            </div>
                          </div>

                          <div className="flex gap-1.5">
                            {[
                              { key: 'present', label: 'P', activeClass: 'bg-green-600 text-white shadow', inactiveClass: 'bg-gray-100 hover:bg-gray-200 text-textMuted' },
                              { key: 'absent', label: 'A', activeClass: 'bg-red-600 text-white shadow', inactiveClass: 'bg-gray-100 hover:bg-gray-200 text-textMuted' },
                              { key: 'late', label: 'L', activeClass: 'bg-yellow-500 text-white shadow', inactiveClass: 'bg-gray-100 hover:bg-gray-200 text-textMuted' },
                              { key: 'medical_leave', label: 'ML', activeClass: 'bg-blue-600 text-white shadow', inactiveClass: 'bg-gray-100 hover:bg-gray-200 text-textMuted' }
                            ].map((opt) => (
                              <button
                                key={opt.key}
                                type="button"
                                onClick={() => handleMark(student.id, opt.key)}
                                className={`rounded-xl h-10 w-11 flex items-center justify-center text-xs font-bold transition-all ${status === opt.key ? opt.activeClass : opt.inactiveClass}`}
                                tabIndex={0}
                                aria-label={`Mark ${student.name} ${opt.key}`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    type="submit"
                    className="rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-white shadow-button"
                    tabIndex={0}
                  >
                    {isEditingPast ? 'Save Changes' : 'Submit Attendance'}
                  </motion.button>
                </div>
              </div>
            )}
          </form>
        )}

        {/* Reason for Edit Modal */}
        <Modal isOpen={showEditReasonModal} onClose={() => setShowEditReasonModal(false)} title="Reason for Edit Required" size="sm">
          <div className="space-y-4">
            <p className="text-xs text-textMuted leading-relaxed">
              You are modifying attendance records that have already been submitted. Please provide an edit reason for the history logs.
            </p>
            <div>
              <label className="mb-1 block text-xs font-medium text-textMuted">Reason *</label>
              <textarea
                value={editReason}
                onChange={(e) => setEditReason(e.target.value)}
                placeholder="Explain why the attendance was modified (e.g. Student marked absent by mistake)..."
                rows={3}
                required
                className="w-full rounded-xl border border-border px-4 py-2.5 text-sm resize-none"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowEditReasonModal(false)}
                className="rounded-xl border border-border px-4 py-2 text-xs font-medium text-textMuted hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => saveBatch(editReason)}
                disabled={!editReason.trim()}
                className="rounded-xl bg-primary px-5 py-2 text-xs font-semibold text-white disabled:opacity-50"
              >
                Save Changes
              </button>
            </div>
          </div>
        </Modal>
      </motion.div>
    )
  }

  // RENDER: Student view
  if (isStudent && studentStats) {
    const isBelowThreshold = studentStats.percent < lowAttendanceThreshold

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <PageHeader title="My Attendance Report" />

        {isBelowThreshold && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-800 text-xs flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-highlight flex-shrink-0 animate-bounce" />
            <div>
              <p className="font-bold">⚠️ Low Attendance Warning</p>
              <p className="mt-0.5 text-red-600">Your overall attendance is {studentStats.percent}%, which is below the minimum required {lowAttendanceThreshold}%.</p>
            </div>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <div className="xl:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-card flex items-center gap-4">
            <div className={`p-4 rounded-full ${isBelowThreshold ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              <CalendarCheck className="h-8 w-8" />
            </div>
            <div>
              <p className="text-xs font-semibold text-textMuted uppercase tracking-wide">Overall Attendance</p>
              <p className={`text-3xl font-extrabold mt-1 ${isBelowThreshold ? 'text-highlight' : 'text-green-700'}`}>
                {studentStats.percent}%
              </p>
            </div>
          </div>

          {[
            { label: 'Present', val: studentStats.present, color: 'text-green-600', icon: UserCheck },
            { label: 'Absent', val: studentStats.absent, color: 'text-red-600', icon: UserX },
            { label: 'Late', val: studentStats.late, color: 'text-yellow-600', icon: Clock },
            { label: 'Medical Leave', val: studentStats.ml, color: 'text-blue-600', icon: FileText }
          ].map((card) => (
            <div key={card.label} className="rounded-2xl border border-border bg-card p-5 shadow-card flex items-center gap-3">
              <div className={`${card.color} bg-gray-50 p-2.5 rounded-xl border border-border`}>
                <card.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-textMuted">{card.label}</p>
                <p className="text-xl font-bold mt-0.5 text-textPrimary">{card.val} Days</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Calendar View */}
          <div className="lg:col-span-2 rounded-2xl border border-border bg-card shadow-card p-6">
            <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
              <h3 className="text-sm font-bold text-textPrimary flex items-center gap-2">
                <CalendarCheck className="h-4 w-4 text-primary" /> Monthly Tracker
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevMonth}
                  className="rounded-lg p-1.5 hover:bg-gray-100 border border-border"
                  tabIndex={0}
                  aria-label="Previous month"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm font-bold text-textPrimary whitespace-nowrap min-w-[100px] text-center">
                  {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </span>
                <button
                  onClick={handleNextMonth}
                  className="rounded-lg p-1.5 hover:bg-gray-100 border border-border"
                  tabIndex={0}
                  aria-label="Next month"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold mb-2 text-textMuted uppercase">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className="py-1">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((cell, idx) => {
                if (cell.isEmpty) {
                  return <div key={`empty-${idx}`} className="aspect-square bg-gray-50/20 rounded-xl" />
                }

                // Determine styling
                let cellClass = 'bg-gray-50 border border-border hover:bg-gray-100/50'
                let dotClass = 'hidden'

                if (cell.isSunday) {
                  cellClass = 'bg-gray-100 border border-border/70 text-textMuted font-normal'
                } else if (cell.holidayName) {
                  cellClass = 'bg-red-50 border border-red-200 text-red-800 font-semibold'
                } else {
                  if (cell.status === 'present') dotClass = 'bg-green-600'
                  else if (cell.status === 'absent') dotClass = 'bg-red-600'
                  else if (cell.status === 'late') dotClass = 'bg-yellow-500'
                  else if (cell.status === 'medical_leave') dotClass = 'bg-blue-600'
                }

                return (
                  <div
                    key={cell.dateStr}
                    title={cell.holidayName ? `Holiday: ${cell.holidayName}` : `Date: ${cell.dateStr}`}
                    className={`aspect-square rounded-xl flex flex-col items-center justify-between p-2 cursor-pointer transition-all relative ${cellClass}`}
                  >
                    <span className="text-xs font-bold text-textPrimary">{cell.day}</span>
                    <span className={`h-2 w-2 rounded-full absolute bottom-1.5 left-1/2 -translate-x-1/2 ${dotClass}`} />
                  </div>
                )
              })}
            </div>

            {/* Legend */}
            <div className="mt-6 flex flex-wrap gap-4 text-xs font-semibold border-t border-border pt-4 text-textMuted">
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-green-600" /> Present (P)
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-red-600" /> Absent (A)
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-yellow-500" /> Late (L)
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-blue-600" /> Medical Leave (ML)
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded border border-border bg-gray-100 w-3 h-3" /> Sunday / Holiday
              </div>
            </div>
          </div>

          {/* Subject-wise breakdown */}
          <div className="rounded-2xl border border-border bg-card shadow-card p-6 overflow-x-auto">
            <h3 className="text-sm font-bold text-textPrimary mb-4">Subject breakdown</h3>
            {studentStats.subjects.length === 0 ? (
              <p className="text-xs text-textMuted">No subject attendance marked yet.</p>
            ) : (
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-border text-textMuted uppercase">
                    <th className="pb-2">Subject</th>
                    <th className="pb-2 text-center">Classes</th>
                    <th className="pb-2 text-center text-green-600">P</th>
                    <th className="pb-2 text-center text-red-600">A</th>
                    <th className="pb-2 text-center text-yellow-500">L</th>
                    <th className="pb-2 text-center text-blue-600">ML</th>
                    <th className="pb-2 text-right">Percent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 text-textPrimary">
                  {studentStats.subjects.map((sub) => (
                    <tr key={sub.name}>
                      <td className="py-2.5 font-bold text-primary">{sub.name}</td>
                      <td className="py-2.5 text-center font-medium">{sub.total}</td>
                      <td className="py-2.5 text-center font-semibold text-green-600">{sub.present}</td>
                      <td className="py-2.5 text-center font-semibold text-red-600">{sub.absent}</td>
                      <td className="py-2.5 text-center font-semibold text-yellow-600">{sub.late}</td>
                      <td className="py-2.5 text-center font-semibold text-blue-600">{sub.ml}</td>
                      <td className="py-2.5 text-right font-extrabold">{sub.percent}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </motion.div>
    )
  }

  return null
}

export default Attendance
