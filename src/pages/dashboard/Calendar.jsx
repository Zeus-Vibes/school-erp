import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, Edit, Trash2, CalendarCheck, AlertTriangle } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/shared/ConfirmDialog'
import EmptyState from '../../components/shared/EmptyState'
import { useData } from '../../context/DataContext'
import { useAuth } from '../../context/AuthContext'
import { formatDate } from '../../utils/helpers'
import toast from 'react-hot-toast'

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const Calendar = () => {
  const { user, isAdmin } = useAuth()
  const { holidays, addHoliday, deleteHoliday, updateHoliday } = useData()

  // Calendar Date State
  const [currentMonth, setCurrentMonth] = useState(() => new Date())

  // Modal & Form State
  const [showModal, setShowModal] = useState(false)
  const [editingHoliday, setEditingHoliday] = useState(null)
  const [holidayDate, setHolidayDate] = useState('')
  const [holidayName, setHolidayName] = useState('')
  const [holidayDesc, setHolidayDesc] = useState('')

  // Delete Confirm State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteRecordId, setDeleteRecordId] = useState(null)

  // Calculate calendar days
  const calendarCells = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()

    const firstDay = new Date(year, month, 1)
    const startOffset = firstDay.getDay()
    const numDays = new Date(year, month + 1, 0).getDate()

    const cells = []

    // Pre-month empty padding cells
    for (let i = 0; i < startOffset; i++) {
      cells.push({ isEmpty: true })
    }

    // Month days
    for (let day = 1; day <= numDays; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const isSunday = new Date(year, month, day).getDay() === 0
      const holiday = holidays.find((h) => h.date === dateStr)

      cells.push({
        day,
        dateStr,
        isSunday,
        holiday
      })
    }

    return cells
  }, [currentMonth, holidays])

  // Sort upcoming holidays
  const upcomingHolidays = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0]
    return [...holidays]
      .filter((h) => h.date >= todayStr)
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [holidays])

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  const handleOpenAddModal = () => {
    setEditingHoliday(null)
    setHolidayDate(new Date().toISOString().split('T')[0])
    setHolidayName('')
    setHolidayDesc('')
    setShowModal(true)
  }

  const handleOpenEditModal = (h) => {
    setEditingHoliday(h)
    setHolidayDate(h.date)
    setHolidayName(h.name)
    setHolidayDesc(h.description || '')
    setShowModal(true)
  }

  const handleSaveHoliday = (e) => {
    e.preventDefault()
    if (!holidayDate || !holidayName.trim()) {
      toast.error('Date and Name are required')
      return
    }

    const holidayData = {
      date: holidayDate,
      name: holidayName,
      description: holidayDesc
    }

    if (editingHoliday) {
      updateHoliday(editingHoliday.id, holidayData)
      toast.success('Holiday updated successfully!')
    } else {
      addHoliday(holidayData)
      toast.success('Holiday added successfully!')
    }

    setShowModal(false)
  }

  const handleTriggerDelete = (id) => {
    setDeleteRecordId(id)
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = () => {
    if (!deleteRecordId) return
    deleteHoliday(deleteRecordId)
    setShowDeleteConfirm(false)
    toast.success('Holiday removed')
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <PageHeader
        title="School Calendar"
        actions={
          isAdmin && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={handleOpenAddModal}
              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-button"
              tabIndex={0}
              aria-label="Add Holiday"
            >
              <Plus className="h-4 w-4" /> Add Holiday
            </motion.button>
          )
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Side: Calendar Grid */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h3 className="text-sm font-bold text-textPrimary flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 text-primary" />
              Monthly Schedule Tracker
            </h3>

            {/* Navigation controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevMonth}
                className="rounded-lg p-2 hover:bg-gray-50 border border-border transition-colors cursor-pointer"
                aria-label="Previous Month"
                tabIndex={0}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm font-extrabold text-textPrimary whitespace-nowrap min-w-[120px] text-center">
                {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </span>
              <button
                onClick={handleNextMonth}
                className="rounded-lg p-2 hover:bg-gray-50 border border-border transition-colors cursor-pointer"
                aria-label="Next Month"
                tabIndex={0}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-textMuted uppercase py-1">
            {daysOfWeek.map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          {/* Calendar Grid Cells */}
          <div className="grid grid-cols-7 gap-2">
            {calendarCells.map((cell, idx) => {
              if (cell.isEmpty) {
                return (
                  <div
                    key={`empty-${idx}`}
                    className="aspect-square bg-gray-50/20 rounded-xl border border-transparent"
                  />
                )
              }

              // Apply colors: holidays in red, sundays in grey
              let cellBg = 'bg-white hover:bg-gray-50/50 text-textPrimary border-border'
              let dotColor = null

              if (cell.isSunday) {
                cellBg = 'bg-gray-100/60 text-textMuted border-border/70 font-normal'
              }

              if (cell.holiday) {
                cellBg = 'bg-red-50 border-red-200 hover:bg-red-100/50 text-highlight font-semibold'
                dotColor = 'bg-red-600'
              }

              return (
                <div
                  key={cell.dateStr}
                  onClick={() => cell.holiday && isAdmin && handleOpenEditModal(cell.holiday)}
                  title={cell.holiday ? `${cell.holiday.name}: ${cell.holiday.description || 'No description'}` : cell.dateStr}
                  className={`aspect-square rounded-xl border flex flex-col items-center justify-between p-2 cursor-pointer transition-all relative ${cellBg}`}
                  tabIndex={cell.holiday ? 0 : -1}
                >
                  <span className="text-xs font-bold">{cell.day}</span>
                  {cell.holiday && (
                    <div className="text-center w-full truncate mt-1">
                      <span className="text-[7px] block font-sans truncate max-w-full leading-tight text-highlight uppercase font-bold">
                        {cell.holiday.name}
                      </span>
                    </div>
                  )}
                  {dotColor && (
                    <span className={`h-1.5 w-1.5 rounded-full absolute bottom-1.5 left-1/2 -translate-x-1/2 ${dotColor}`} />
                  )}
                </div>
              )
            })}
          </div>

          {/* Color Legend */}
          <div className="flex gap-4 text-xs font-semibold text-textMuted border-t border-border pt-4">
            <div className="flex items-center gap-1.5">
              <span className="h-3.5 w-3.5 rounded-xl border border-red-200 bg-red-50" />
              School Holiday
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3.5 w-3.5 rounded-xl border border-gray-200 bg-gray-100" />
              Sunday (Rest Day)
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3.5 w-3.5 rounded-xl border border-gray-200 bg-white" />
              Regular Working Day
            </div>
          </div>
        </div>

        {/* Right Side: Holiday list */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-4 flex flex-col">
          <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider flex items-center gap-1.5">
            <CalendarIcon className="h-5 w-5 text-accent" />
            Upcoming Holidays
          </h3>

          {upcomingHolidays.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-xs text-textMuted italic">No upcoming holidays scheduled</p>
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-[450px] pr-1 flex-1">
              {upcomingHolidays.map((h) => (
                <div
                  key={h.id}
                  className="rounded-xl border border-border p-3.5 bg-white/40 hover:bg-white transition-colors flex justify-between items-start gap-2"
                >
                  <div className="space-y-1 min-w-0">
                    <span className="text-[9px] font-bold text-highlight bg-red-50 border border-red-200 rounded px-1.5 py-0.5">
                      {formatDate(h.date)}
                    </span>
                    <h4 className="text-xs font-bold text-textPrimary truncate">{h.name}</h4>
                    {h.description && (
                      <p className="text-[10px] text-textMuted line-clamp-2 leading-relaxed">
                        {h.description}
                      </p>
                    )}
                  </div>

                  {isAdmin && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleOpenEditModal(h)}
                        className="rounded-lg p-1.5 text-textMuted hover:text-primary hover:bg-gray-100 transition-colors"
                        aria-label="Edit Holiday"
                        tabIndex={0}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleTriggerDelete(h.id)}
                        className="rounded-lg p-1.5 text-textMuted hover:text-highlight hover:bg-red-50 transition-colors"
                        aria-label="Delete Holiday"
                        tabIndex={0}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ADD / EDIT HOLIDAY MODAL */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingHoliday ? 'Edit School Holiday' : 'Add School Holiday'}
        size="sm"
      >
        <form onSubmit={handleSaveHoliday} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-textMuted">Holiday Date *</label>
            <input
              type="date"
              value={holidayDate}
              onChange={(e) => setHolidayDate(e.target.value)}
              required
              className="w-full rounded-xl border border-border px-4 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-textMuted">Holiday Name *</label>
            <input
              type="text"
              value={holidayName}
              onChange={(e) => setHolidayName(e.target.value)}
              placeholder="e.g. Diwali Break, Independence Day..."
              required
              className="w-full rounded-xl border border-border px-4 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-textMuted">Description (Optional)</label>
            <textarea
              value={holidayDesc}
              onChange={(e) => setHolidayDesc(e.target.value)}
              placeholder="Describe the holiday details..."
              rows={3}
              className="w-full rounded-xl border border-border px-4 py-2.5 text-sm resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-textMuted hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-white shadow"
            >
              Save Holiday
            </button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRM DIALOG */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Remove Holiday?"
        message={
          <div className="space-y-1.5 text-xs text-textMuted">
            <p>Are you sure you want to remove this holiday from the schedule?</p>
            <p className="text-highlight font-bold flex items-center gap-1.5 uppercase text-[10px]">
              <AlertTriangle className="h-4 w-4" /> This will restore regular school session rates.
            </p>
          </div>
        }
        confirmLabel="Remove"
        isDanger={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </motion.div>
  )
}

export default Calendar
