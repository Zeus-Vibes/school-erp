import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Eye, Edit, Trash2, Calendar, Clock, BookOpen, User } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/shared/EmptyState'
import ConfirmDialog from '../../components/shared/ConfirmDialog'
import { useData } from '../../context/DataContext'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

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

const Timetable = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
    timetables,
    classes,
    teachers,
    students,
    academicYears,
    addTimetable,
    deleteTimetable,
    updateTimetable
  } = useData()

  // Role Checks
  const isAdmin = user?.role === 'admin'
  const isTeacher = user?.role === 'teacher'
  const isStudent = user?.role === 'student'

  // Admin states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedTimetableId, setSelectedTimetableId] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Setup form states
  const [classId, setClassId] = useState('')
  const [academicYearId, setAcademicYearId] = useState('')
  const [workingDays, setWorkingDays] = useState('Mon-Fri')
  const [periodsPerDay, setPeriodsPerDay] = useState(6)
  const [periodDuration, setPeriodDuration] = useState(45)
  const [startTime, setStartTime] = useState('08:00')

  // Find current teacher or student
  const currentTeacher = useMemo(() => {
    if (!isTeacher) return null
    return teachers.find((t) => t.userId === user?.userId)
  }, [teachers, isTeacher, user])

  const currentStudent = useMemo(() => {
    if (!isStudent) return null
    return students.find((s) => s.userId === user?.userId)
  }, [students, isStudent, user])

  // Get student's class timetable
  const studentTimetable = useMemo(() => {
    if (!isStudent || !currentStudent) return null
    return timetables.find((t) => t.classId === currentStudent.classId && t.isPublished)
  }, [timetables, isStudent, currentStudent])

  const studentClassData = useMemo(() => {
    if (!studentTimetable) return null
    return classes.find((c) => c.id === studentTimetable.classId)
  }, [classes, studentTimetable])

  // Admin: create timetable submission
  const handleCreateTimetable = (e) => {
    e.preventDefault()
    if (!classId || !academicYearId) {
      toast.error('Please select both Class and Academic Year')
      return
    }

    // Check if timetable already exists for this class and year
    const exists = timetables.some((t) => t.classId === classId && t.academicYearId === academicYearId)
    if (exists) {
      toast.error('A timetable already exists for this class and academic year')
      return
    }

    const newId = `tt-${String(Date.now()).slice(-6)}`
    addTimetable({
      id: newId,
      classId,
      academicYearId,
      workingDays,
      periodsPerDay: Number(periodsPerDay),
      periodDuration: Number(periodDuration),
      startTime,
      breaks: [
        { id: `break-${Date.now()}`, afterPeriod: 3, label: '🍽 Lunch Break' } // default break
      ],
      slots: {},
      isPublished: false,
      lastUpdatedAt: new Date().toISOString()
    })

    setShowCreateModal(false)
    toast.success('Timetable template created!')
    navigate(`/dashboard/admin/timetable/${newId}/edit`)
  }

  // Publish/Unpublish toggle
  const handleTogglePublish = (tt) => {
    const updated = {
      ...tt,
      isPublished: !tt.isPublished,
      lastUpdatedAt: new Date().toISOString()
    }
    updateTimetable(tt.id, updated)
    toast.success(updated.isPublished ? 'Timetable is now live!' : 'Timetable unpublished.')
  }

  const handleDeleteConfirm = (id) => {
    setSelectedTimetableId(id)
    setShowDeleteConfirm(true)
  }

  const handleDeleteTimetable = () => {
    deleteTimetable(selectedTimetableId)
    setShowDeleteConfirm(false)
    toast.success('Timetable deleted')
  }

  // Teacher timetable aggregation
  const teacherTimetableSlots = useMemo(() => {
    if (!isTeacher || !currentTeacher) return []
    // Look through all published timetables for assignments for this teacher
    const list = []
    const publishedTimetables = timetables.filter((t) => t.isPublished)

    daysOfWeek.forEach((day) => {
      // Find max periods in any published timetable to show a uniform schedule
      const maxPeriods = publishedTimetables.reduce((max, t) => Math.max(max, t.periodsPerDay), 6)

      for (let p = 1; p <= maxPeriods; p++) {
        let assigned = null
        publishedTimetables.forEach((tt) => {
          const slot = tt.slots?.[`${day}-${p}`]
          if (slot && slot.teacherId === currentTeacher.id) {
            const cls = classes.find((c) => c.id === tt.classId)
            assigned = {
              subject: slot.subject,
              classLabel: cls ? `${cls.standard}${cls.division}` : 'Unknown Class',
              room: cls?.room || 'N/A',
              time: calculateTimeSlot(tt.startTime, tt.periodDuration, p - 1),
              lastUpdated: tt.lastUpdatedAt
            }
          }
        })

        list.push({
          day,
          period: p,
          assigned
        })
      }
    })

    return list
  }, [timetables, isTeacher, currentTeacher, classes])

  // Get most recent update timestamp for teacher's timetable
  const teacherLastUpdated = useMemo(() => {
    const published = timetables.filter((t) => t.isPublished)
    if (published.length === 0) return null
    const times = published
      .map((t) => new Date(t.lastUpdatedAt).getTime())
      .filter((time) => !isNaN(time))
    if (times.length === 0) return null
    return new Date(Math.max(...times)).toLocaleString()
  }, [timetables])

  // RENDER: Admin view
  if (isAdmin) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <PageHeader
          title="Timetable Management"
          actions={
            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={() => {
                setClassId(classes[0]?.id || '')
                setAcademicYearId(academicYears.find((y) => y.isActive)?.id || academicYears[0]?.id || '')
                setShowCreateModal(true)
              }}
              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-button"
              tabIndex={0}
              aria-label="Create Timetable"
            >
              <Plus className="h-4 w-4" /> Create Timetable
            </motion.button>
          }
        />

        {timetables.length === 0 ? (
          <EmptyState
            title="No Timetables Available"
            description="Create a timetable template for a class to configure periods, subjects, and teachers."
            actionLabel="Create Timetable"
            onAction={() => setShowCreateModal(true)}
          />
        ) : (
          <div className="rounded-2xl border border-border bg-card shadow-card overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-gray-50/50">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-textMuted">Class</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-textMuted">Academic Year</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-textMuted">Periods/Day</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-textMuted">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-textMuted">Last Updated</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase text-textMuted">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {timetables.map((tt) => {
                  const cls = classes.find((c) => c.id === tt.classId)
                  return (
                    <tr key={tt.id} className="hover:bg-gray-50/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-semibold text-textPrimary">
                          {cls ? `${cls.standard}${cls.division} (${cls.medium})` : 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-textMuted">{tt.academicYearId}</td>
                      <td className="px-6 py-4 text-sm text-textPrimary font-medium">{tt.periodsPerDay}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${tt.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {tt.isPublished ? '✅ Live' : '⏳ Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-textMuted">
                        {tt.lastUpdatedAt ? new Date(tt.lastUpdatedAt).toLocaleString() : '—'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleTogglePublish(tt)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-medium border ${tt.isPublished ? 'border-orange-200 text-orange-600 hover:bg-orange-50' : 'border-green-200 text-green-600 hover:bg-green-50'}`}
                            tabIndex={0}
                          >
                            {tt.isPublished ? 'Unpublish' : 'Publish'}
                          </button>
                          <button
                            onClick={() => navigate(`/dashboard/admin/timetable/${tt.id}/edit`)}
                            className="flex items-center gap-1 rounded-lg border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10"
                            tabIndex={0}
                          >
                            <Edit className="h-3.5 w-3.5" /> Edit Grid
                          </button>
                          <button
                            onClick={() => handleDeleteConfirm(tt.id)}
                            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-highlight hover:bg-red-50"
                            tabIndex={0}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Create Timetable Template Setup Modal */}
        <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Setup Timetable Template" size="md">
          <form onSubmit={handleCreateTimetable} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-textMuted">Class *</label>
                <select
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                  required
                  className="w-full rounded-xl border border-border px-4 py-2.5 text-sm bg-white"
                >
                  <option value="">-- Select Class --</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.standard}{c.division} ({c.medium})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-textMuted">Academic Year *</label>
                <select
                  value={academicYearId}
                  onChange={(e) => setAcademicYearId(e.target.value)}
                  required
                  className="w-full rounded-xl border border-border px-4 py-2.5 text-sm bg-white"
                >
                  <option value="">-- Select Year --</option>
                  {academicYears.map((y) => (
                    <option key={y.id} value={y.id}>
                      {y.label} {y.isActive ? '(Active)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-textMuted">Working Days *</label>
                <select
                  value={workingDays}
                  onChange={(e) => setWorkingDays(e.target.value)}
                  className="w-full rounded-xl border border-border px-4 py-2.5 text-sm bg-white"
                >
                  <option value="Mon-Fri">Mon - Fri</option>
                  <option value="Mon-Sat">Mon - Sat</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-textMuted">Periods/Day *</label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={periodsPerDay}
                  onChange={(e) => setPeriodsPerDay(e.target.value)}
                  required
                  className="w-full rounded-xl border border-border px-4 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-textMuted">Period Duration (mins) *</label>
                <input
                  type="number"
                  min={10}
                  max={120}
                  value={periodDuration}
                  onChange={(e) => setPeriodDuration(e.target.value)}
                  required
                  className="w-full rounded-xl border border-border px-4 py-2.5 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-textMuted">Start Time *</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="w-full rounded-xl border border-border px-4 py-2.5 text-sm"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="rounded-xl border border-border px-5 py-2.5 text-sm text-textMuted"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                type="submit"
                className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-button"
              >
                Create Template
              </motion.button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirm */}
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          title="Delete Timetable"
          message="Are you sure you want to delete this timetable template? This will remove all cell data."
          confirmLabel="Delete"
          isDanger={true}
          onConfirm={handleDeleteTimetable}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      </motion.div>
    )
  }

  // RENDER: Teacher schedule view
  if (isTeacher) {
    // Group slots by Day
    const teacherDays = currentTeacher?.subjectClassMapping?.length > 0 ? daysOfWeek : []

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <PageHeader title="My Teaching Timetable" />

        {teacherDays.length === 0 ? (
          <EmptyState
            title="No Class Mappings Assigned"
            description="You do not have any subjects or classes mapped in your profile. Please contact the Admin."
          />
        ) : (
          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-card shadow-card p-5">
              <div className="mb-4 flex flex-wrap justify-between items-center gap-2">
                <h3 className="text-sm font-bold text-textPrimary">Weekly Schedule Grid</h3>
                {teacherLastUpdated && (
                  <span className="text-xs text-textMuted">Last Updated: {teacherLastUpdated}</span>
                )}
              </div>

              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-gray-50/50">
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-textMuted w-32 border-r border-border">Time / Period</th>
                      {daysOfWeek.map((day) => (
                        <th key={day} className="px-4 py-3 text-center text-xs font-semibold uppercase text-textMuted border-r border-border">
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 7 }, (_, i) => i + 1).map((p) => (
                      <tr key={p} className="border-b border-border hover:bg-gray-50/30 transition-colors">
                        <td className="px-4 py-3 border-r border-border font-bold text-xs text-textPrimary bg-gray-50/30">
                          Period {p}
                        </td>
                        {daysOfWeek.map((day) => {
                          const slot = teacherTimetableSlots.find((s) => s.day === day && s.period === p)
                          return (
                            <td key={day} className="px-3 py-3 border-r border-border text-center">
                              {slot?.assigned ? (
                                <div className="p-2 rounded-xl bg-green-50 border border-green-200 text-center">
                                  <div className="text-xs font-bold text-green-700">{slot.assigned.subject}</div>
                                  <div className="text-[10px] text-green-600 mt-0.5 font-medium">Class: {slot.assigned.classLabel}</div>
                                  <div className="text-[9px] text-textMuted mt-0.5 flex items-center justify-center gap-1">
                                    <Clock className="h-2.5 w-2.5" /> {slot.assigned.time}
                                  </div>
                                  <div className="text-[9px] text-textMuted mt-0.5">Room: {slot.assigned.room}</div>
                                </div>
                              ) : (
                                <span className="text-xs text-textMuted/65 font-medium bg-gray-100/50 px-2.5 py-1 rounded-full border border-gray-100">
                                  Free
                                </span>
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    )
  }

  // RENDER: Student timetable view
  if (isStudent) {
    if (!studentTimetable) {
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <PageHeader title="Class Timetable" />
          <EmptyState
            title="Timetable Not Published"
            description="The timetable for your class is either not generated or currently in draft mode. Please check back later."
          />
        </motion.div>
      )
    }

    const studentWorkingDays = studentTimetable.workingDays === 'Mon-Sat' ? daysOfWeek : daysOfWeek.slice(0, 5)

    // Build row indices
    const studentRows = []
    for (let p = 1; p <= studentTimetable.periodsPerDay; p++) {
      studentRows.push({ type: 'period', number: p, time: calculateTimeSlot(studentTimetable.startTime, studentTimetable.periodDuration, p - 1) })
      const foundBreak = studentTimetable.breaks?.find((b) => b.afterPeriod === p)
      if (foundBreak) {
        studentRows.push({ type: 'break', ...foundBreak })
      }
    }

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <PageHeader
          title={`Timetable — Class ${studentClassData ? `${studentClassData.standard}${studentClassData.division}` : 'N/A'}`}
          subtitle={`${studentTimetable.academicYearId} | Room: ${studentClassData?.room || 'N/A'}`}
        />

        <div className="rounded-2xl border border-border bg-card shadow-card p-5">
          <div className="mb-4 flex flex-wrap justify-between items-center gap-2">
            <span className="text-xs text-textMuted">
              Last Updated: {new Date(studentTimetable.lastUpdatedAt).toLocaleString()}
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border bg-gray-50/50">
                  <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase text-textMuted w-40 border-r border-border">Time Slot</th>
                  {studentWorkingDays.map((day) => (
                    <th key={day} className="px-4 py-3.5 text-center text-xs font-semibold uppercase text-textMuted border-r border-border">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {studentRows.map((row, idx) => {
                  if (row.type === 'break') {
                    return (
                      <tr key={row.id} className="bg-blue-50/70 border-b border-border">
                        <td className="px-4 py-3.5 text-xs font-bold text-blue-700 border-r border-border text-center" colSpan={studentWorkingDays.length + 1}>
                          <span className="font-semibold">{row.label}</span>
                        </td>
                      </tr>
                    )
                  }

                  return (
                    <tr key={`p-${row.number}`} className="border-b border-border hover:bg-gray-50/30 transition-colors">
                      <td className="px-4 py-4 border-r border-border font-medium text-xs text-textMuted bg-gray-50/30">
                        <div className="font-bold text-textPrimary">Period {row.number}</div>
                        <div className="text-[10px] mt-0.5 whitespace-nowrap">{row.time}</div>
                      </td>
                      {studentWorkingDays.map((day) => {
                        const slotKey = `${day}-${row.number}`
                        const slot = studentTimetable.slots?.[slotKey]
                        const teacher = slot ? teachers.find((t) => t.id === slot.teacherId) : null

                        return (
                          <td key={day} className="px-3 py-3 border-r border-border text-center">
                            {slot ? (
                              <div className="inline-flex flex-col items-center justify-center p-2 rounded-xl bg-primary/10 border border-primary/20 w-full min-h-[55px]">
                                <span className="text-xs font-bold text-primary">{slot.subject}</span>
                                {teacher && (
                                  <span className="text-[10px] text-textMuted mt-1 bg-white px-2.5 py-0.5 rounded border border-border shadow-sm">
                                    {teacher.name}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-textMuted/65 italic">No Class</span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    )
  }

  return null
}

export default Timetable
