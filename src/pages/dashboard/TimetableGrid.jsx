import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Save, Eye, EyeOff, Plus, Trash2, ArrowLeft } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/shared/ConfirmDialog'
import { useData } from '../../context/DataContext'
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

const TimetableGrid = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { timetables, classes, teachers, updateTimetable, deleteTimetable } = useData()

  const timetable = useMemo(() => timetables.find((t) => t.id === id), [timetables, id])

  const classData = useMemo(() => {
    if (!timetable) return null
    return classes.find((c) => c.id === timetable.classId)
  }, [classes, timetable])

  // Local state for grid slots and breaks
  const [slots, setSlots] = useState(() => timetable?.slots || {})
  const [breaks, setBreaks] = useState(() => timetable?.breaks || [])
  const [isPublished, setIsPublished] = useState(() => timetable?.isPublished || false)

  // Modals state
  const [selectedCell, setSelectedCell] = useState(null) // { day, period }
  const [showCellModal, setShowCellModal] = useState(false)
  const [showBreakModal, setShowBreakModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Cell editor form state
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedTeacherId, setSelectedTeacherId] = useState('')

  // Break editor form state
  const [breakAfterPeriod, setBreakAfterPeriod] = useState(1)
  const [breakLabel, setBreakLabel] = useState('🍽 Lunch Break')

  if (!timetable || !classData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <h2 className="text-xl font-bold text-textPrimary mb-2">Timetable Not Found</h2>
        <button onClick={() => navigate('/dashboard/admin/timetable')} className="rounded-xl bg-primary px-5 py-2 text-sm text-white">
          Back to List
        </button>
      </div>
    )
  }

  const workingDays = timetable.workingDays === 'Mon-Sat' ? daysOfWeek : daysOfWeek.slice(0, 5)

  // Available subjects for the class
  const classSubjects = classData.subjects || []

  // Filtered teachers list based on selected subject
  const availableTeachers = teachers.filter((t) => {
    if (!t.isActive) return false
    return t.subjectClassMapping?.some(
      (m) => m.subject === selectedSubject && String(m.classId) === String(timetable.classId)
    )
  })

  const handleCellClick = (day, period) => {
    const currentSlot = slots[`${day}-${period}`] || { subject: '', teacherId: '' }
    setSelectedCell({ day, period })
    setSelectedSubject(currentSlot.subject)
    setSelectedTeacherId(currentSlot.teacherId)
    setShowCellModal(true)
  }

  const handleSubjectChange = (val) => {
    setSelectedSubject(val)
    // Auto-select first available teacher
    const matches = teachers.filter((t) => {
      if (!t.isActive) return false
      return t.subjectClassMapping?.some(
        (m) => m.subject === val && String(m.classId) === String(timetable.classId)
      )
    })
    setSelectedTeacherId(matches[0]?.id || '')
  }

  const handleSaveCell = () => {
    if (!selectedCell) return

    const cellKey = `${selectedCell.day}-${selectedCell.period}`

    if (!selectedSubject || !selectedTeacherId) {
      // Clear slot
      const updatedSlots = { ...slots }
      delete updatedSlots[cellKey]
      setSlots(updatedSlots)
      setShowCellModal(false)
      return
    }

    // Conflict Check
    const teacher = teachers.find((t) => t.id === selectedTeacherId)
    const otherConflict = timetables.find((otherTt) => {
      if (otherTt.id === timetable.id) return false
      const slot = otherTt.slots?.[cellKey]
      return slot && slot.teacherId === selectedTeacherId
    })

    if (otherConflict) {
      const otherClass = classes.find((c) => c.id === otherTt.classId)
      const classLabel = otherClass ? `${otherClass.standard}${otherClass.division}` : 'another class'
      toast(`⚠️ ${teacher?.name || 'Teacher'} is already in Class ${classLabel} at this slot. You can still proceed.`, {
        icon: '⚠️',
        style: {
          border: '1px solid #EAB308',
          padding: '16px',
          color: '#EAB308',
          background: '#FEF9C3'
        }
      })
    }

    setSlots((prev) => ({
      ...prev,
      [cellKey]: {
        subject: selectedSubject,
        teacherId: selectedTeacherId
      }
    }))

    setShowCellModal(false)
  }

  const handleAddBreak = () => {
    if (breaks.some((b) => b.afterPeriod === Number(breakAfterPeriod))) {
      toast.error('A break is already added after this period')
      return
    }

    const newBreak = {
      id: `break-${Date.now()}`,
      afterPeriod: Number(breakAfterPeriod),
      label: breakLabel
    }

    setBreaks((prev) => [...prev, newBreak].sort((a, b) => a.afterPeriod - b.afterPeriod))
    setShowBreakModal(false)
    toast.success('Break row added')
  }

  const handleRemoveBreak = (breakId) => {
    setBreaks((prev) => prev.filter((b) => b.id !== breakId))
    toast.success('Break row removed')
  }

  const handleSaveState = (publishedStatus = isPublished) => {
    const updated = {
      ...timetable,
      slots,
      breaks,
      isPublished: publishedStatus,
      lastUpdatedAt: new Date().toISOString()
    }
    updateTimetable(timetable.id, updated)
    setIsPublished(publishedStatus)
    toast.success(publishedStatus ? 'Timetable published successfully!' : 'Draft saved successfully!')
  }

  const handleDeleteTimetable = () => {
    deleteTimetable(timetable.id)
    toast.success('Timetable deleted')
    navigate('/dashboard/admin/timetable')
  }

  // Construct rows: interleave periods and breaks
  const rows = []
  for (let p = 1; p <= timetable.periodsPerDay; p++) {
    rows.push({ type: 'period', number: p, time: calculateTimeSlot(timetable.startTime, timetable.periodDuration, p - 1) })
    const foundBreak = breaks.find((b) => b.afterPeriod === p)
    if (foundBreak) {
      rows.push({ type: 'break', ...foundBreak })
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/dashboard/admin/timetable')}
          className="rounded-xl border border-border bg-white p-2.5 text-textMuted hover:bg-gray-50 transition-colors"
          tabIndex={0}
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <PageHeader
          title={`Edit Timetable — Class ${classData.standard}${classData.division} (${classData.medium})`}
          subtitle={`${timetable.academicYearId} | ${timetable.periodsPerDay} Periods/Day`}
        />
      </div>

      <div className="flex flex-wrap justify-between items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
            {isPublished ? '✅ Live / Published' : '⏳ Draft Mode'}
          </span>
          <span className="text-xs text-textMuted">
            Last Updated: {timetable.lastUpdatedAt ? new Date(timetable.lastUpdatedAt).toLocaleString() : 'Never'}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowBreakModal(true)}
            className="flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-semibold text-textMuted hover:bg-gray-50 transition-all"
            tabIndex={0}
          >
            <Plus className="h-4 w-4" /> Add Break Row
          </button>
          <button
            onClick={() => handleSaveState(false)}
            className="flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-semibold text-textMuted hover:bg-gray-50 transition-all"
            tabIndex={0}
          >
            <Save className="h-4 w-4" /> Save Draft
          </button>
          {isPublished ? (
            <button
              onClick={() => handleSaveState(false)}
              className="flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-button hover:bg-orange-700 transition-all"
              tabIndex={0}
            >
              <EyeOff className="h-4 w-4" /> Unpublish
            </button>
          ) : (
            <button
              onClick={() => handleSaveState(true)}
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-button hover:bg-primary/90 transition-all"
              tabIndex={0}
            >
              <Eye className="h-4 w-4" /> Publish Timetable
            </button>
          )}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 rounded-xl bg-highlight px-4 py-2.5 text-sm font-semibold text-white shadow-button hover:bg-highlight/95 transition-all"
            tabIndex={0}
          >
            <Trash2 className="h-4 w-4" /> Delete
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-card overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border bg-gray-50/50">
              <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-textMuted w-40 border-r border-border">Time Slot</th>
              {workingDays.map((day) => (
                <th key={day} className="px-4 py-4 text-center text-xs font-semibold uppercase text-textMuted border-r border-border">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => {
              if (row.type === 'break') {
                return (
                  <tr key={row.id} className="bg-blue-50/70 border-b border-border">
                    <td className="px-4 py-3 text-xs font-bold text-blue-700 border-r border-border text-center" colSpan={workingDays.length + 1}>
                      <div className="flex items-center justify-between px-4">
                        <span className="font-semibold">{row.label}</span>
                        <button
                          onClick={() => handleRemoveBreak(row.id)}
                          className="rounded-lg p-1 text-red-500 hover:bg-red-100 transition-colors"
                          tabIndex={0}
                          aria-label="Remove break row"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
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
                  {workingDays.map((day) => {
                    const slotKey = `${day}-${row.number}`
                    const slot = slots[slotKey]
                    const teacher = slot ? teachers.find((t) => t.id === slot.teacherId) : null

                    return (
                      <td
                        key={day}
                        onClick={() => handleCellClick(day, row.number)}
                        className="px-3 py-3 border-r border-border text-center cursor-pointer hover:bg-primary/5 transition-colors"
                      >
                        {slot ? (
                          <div className="inline-flex flex-col items-center justify-center p-2 rounded-xl bg-primary/10 border border-primary/20 w-full min-h-[55px]">
                            <span className="text-xs font-bold text-primary">{slot.subject}</span>
                            {teacher && (
                              <span className="text-[10px] text-textMuted mt-1 bg-white px-2 py-0.5 rounded border border-border shadow-sm">
                                {teacher.name}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="text-xs text-textMuted italic flex items-center justify-center min-h-[55px] border border-dashed border-border rounded-xl bg-gray-50/20 hover:border-primary/50 transition-all">
                            + Assign
                          </div>
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

      {/* Cell Editor Modal */}
      <Modal isOpen={showCellModal} onClose={() => setShowCellModal(false)} title={`Assign Slot — ${selectedCell?.day}, Period ${selectedCell?.period}`} size="sm">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-textMuted">Select Subject *</label>
            <select
              value={selectedSubject}
              onChange={(e) => handleSubjectChange(e.target.value)}
              className="w-full rounded-xl border border-border px-4 py-2.5 text-sm bg-white"
            >
              <option value="">-- Select Subject --</option>
              {classSubjects.map((sub) => (
                <option key={sub.name} value={sub.name}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-textMuted">Select Teacher *</label>
            <select
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
              disabled={!selectedSubject}
              className="w-full rounded-xl border border-border px-4 py-2.5 text-sm bg-white disabled:bg-gray-100"
            >
              <option value="">-- Select Teacher --</option>
              {availableTeachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            {!selectedSubject && (
              <p className="text-[10px] text-textMuted mt-1">Please select a subject first to filter teachers.</p>
            )}
            {selectedSubject && availableTeachers.length === 0 && (
              <p className="text-[10px] text-red-500 mt-1">No teachers are mapped to teach this subject in this class.</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => {
                // Remove assignment
                const cellKey = `${selectedCell.day}-${selectedCell.period}`
                setSlots((prev) => {
                  const updated = { ...prev }
                  delete updated[cellKey]
                  return updated
                })
                setShowCellModal(false)
              }}
              className="rounded-xl border border-border px-4 py-2 text-xs font-medium text-highlight hover:bg-red-50 mr-auto"
            >
              Clear Slot
            </button>
            <button
              onClick={() => setShowCellModal(false)}
              className="rounded-xl border border-border px-4 py-2 text-xs font-medium text-textMuted hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveCell}
              disabled={!selectedSubject || !selectedTeacherId}
              className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
            >
              Assign
            </button>
          </div>
        </div>
      </Modal>

      {/* Break Row Modal */}
      <Modal isOpen={showBreakModal} onClose={() => setShowBreakModal(false)} title="Add Break Row" size="sm">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-textMuted">Insert Break After Period *</label>
            <select
              value={breakAfterPeriod}
              onChange={(e) => setBreakAfterPeriod(e.target.value)}
              className="w-full rounded-xl border border-border px-4 py-2.5 text-sm bg-white"
            >
              {Array.from({ length: timetable.periodsPerDay - 1 }, (_, i) => i + 1).map((p) => (
                <option key={p} value={p}>
                  Period {p}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-textMuted">Break Label *</label>
            <input
              type="text"
              value={breakLabel}
              onChange={(e) => setBreakLabel(e.target.value)}
              className="w-full rounded-xl border border-border px-4 py-2.5 text-sm"
              required
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowBreakModal(false)}
              className="rounded-xl border border-border px-4 py-2 text-xs font-medium text-textMuted hover:bg-gray-50"
            >
              Cancel
            </button>
            <button onClick={handleAddBreak} className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white">
              Add Row
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Timetable"
        message="Are you sure you want to delete this timetable? This action cannot be undone."
        confirmLabel="Delete"
        isDanger={true}
        onConfirm={handleDeleteTimetable}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </motion.div>
  )
}

export default TimetableGrid
