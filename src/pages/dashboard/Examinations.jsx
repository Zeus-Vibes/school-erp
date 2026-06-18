import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Eye, Trash2, Calendar, Award, BookOpen } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/shared/EmptyState'
import ConfirmDialog from '../../components/shared/ConfirmDialog'
import { useData } from '../../context/DataContext'
import toast from 'react-hot-toast'

const defaultGradeRanges = [
  { min: 90, max: 100, grade: 'A+', remark: 'Outstanding' },
  { min: 75, max: 89, grade: 'A', remark: 'Excellent' },
  { min: 60, max: 74, grade: 'B', remark: 'Good' },
  { min: 45, max: 59, grade: 'C', remark: 'Satisfactory' },
  { min: 33, max: 44, grade: 'D', remark: 'Pass' },
  { min: 0, max: 32, grade: 'F', remark: 'Fail' }
]

const statusFlow = ['Draft', 'Active', 'Marks Entry Open', 'Completed']

const Examinations = () => {
  const navigate = useNavigate()
  const { exams, classes, academicYears, teachers, addExam, deleteExam, updateExam } = useData()

  // State
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedExamId, setSelectedExamId] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Form State
  const [examName, setExamName] = useState('Mid Term 1')
  const [selectedClassId, setSelectedClassId] = useState('')
  const [selectedYearId, setSelectedYearId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [subjectSettings, setSubjectSettings] = useState([])
  const [gradeRanges, setGradeRanges] = useState(defaultGradeRanges)

  // Initialize form options
  useMemo(() => {
    if (classes.length > 0 && !selectedClassId) {
      setSelectedClassId(classes[0].id)
    }
    if (academicYears.length > 0 && !selectedYearId) {
      setSelectedYearId(academicYears.find((y) => y.isActive)?.id || academicYears[0].id)
    }
  }, [classes, academicYears, selectedClassId, selectedYearId])

  // Auto-populate subject settings when class changes
  useMemo(() => {
    if (!selectedClassId) return
    const cls = classes.find((c) => c.id === selectedClassId)
    if (cls) {
      const settings = (cls.subjects || []).map((sub) => {
        // Find teacher mapped to this class+subject if any
        const teacher = teachers.find((t) =>
          t.subjectClassMapping?.some(
            (m) => m.subject === sub.name && String(m.classId) === String(selectedClassId)
          )
        )
        return {
          name: sub.name,
          maxMarks: 100,
          passingMarks: 33,
          teacherId: teacher?.id || ''
        }
      })
      setSubjectSettings(settings)
    }
  }, [selectedClassId, classes, teachers])

  const handleCreateExam = (e) => {
    e.preventDefault()
    if (!selectedClassId || !selectedYearId || !startDate || !endDate) {
      toast.error('All asterisk (*) fields are required')
      return
    }

    const newId = `exam-${String(Date.now()).slice(-6)}`
    const newExam = {
      id: newId,
      name: examName,
      classId: selectedClassId,
      academicYearId: selectedYearId,
      startDate,
      endDate,
      status: 'Draft',
      subjects: subjectSettings.map((sub) => ({
        ...sub,
        marksSubmitted: false,
        submittedAt: null
      })),
      gradeRanges
    }

    addExam(newExam)
    setShowCreateModal(false)
    toast.success('Examination scheduled successfully!')
    navigate(`/dashboard/admin/examinations/${newId}`)
  }

  const handleUpdateStatus = (exam, newStatus) => {
    updateExam(exam.id, {
      ...exam,
      status: newStatus
    })
    toast.success(`Exam status updated to ${newStatus}`)
  }

  const handleDeleteConfirm = (id) => {
    setSelectedExamId(id)
    setShowDeleteConfirm(true)
  }

  const handleDeleteExam = () => {
    deleteExam(selectedExamId)
    setShowDeleteConfirm(false)
    toast.success('Examination deleted')
  }

  const handleGradeRangeChange = (idx, field, val) => {
    const updated = [...gradeRanges]
    updated[idx][field] = field === 'grade' || field === 'remark' ? val : Number(val)
    setGradeRanges(updated)
  }

  const handleSubjectSettingChange = (idx, field, val) => {
    const updated = [...subjectSettings]
    updated[idx][field] = field === 'teacherId' || field === 'name' ? val : Number(val)
    setSubjectSettings(updated)
  }

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Draft':
        return 'bg-gray-100 text-gray-800'
      case 'Active':
        return 'bg-blue-100 text-blue-800'
      case 'Marks Entry Open':
        return 'bg-yellow-100 text-yellow-800'
      case 'Completed':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100'
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <PageHeader
        title="Examinations"
        actions={
          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={() => {
              setGradeRanges(defaultGradeRanges)
              setShowCreateModal(true)
            }}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-button"
            tabIndex={0}
            aria-label="Create Exam"
          >
            <Plus className="h-4 w-4" /> Create Exam
          </motion.button>
        }
      />

      {exams.length === 0 ? (
        <EmptyState
          title="No Scheduled Examinations"
          description="Create exam configurations, set grade ranges, and map subjects for teachers to enter marks."
          actionLabel="Create Exam"
          onAction={() => setShowCreateModal(true)}
        />
      ) : (
        <div className="rounded-2xl border border-border bg-card shadow-card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-gray-50/50">
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-textMuted">Exam Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-textMuted">Class</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-textMuted">Year</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-textMuted">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-textMuted">Subjects Submitted</th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase text-textMuted">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 text-sm">
              {exams.map((exam) => {
                const cls = classes.find((c) => c.id === exam.classId)
                const submittedCount = exam.subjects?.filter((s) => s.marksSubmitted).length || 0
                const totalCount = exam.subjects?.length || 0

                return (
                  <tr key={exam.id} className="hover:bg-gray-50/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-textPrimary">{exam.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-textMuted">
                      {cls ? `${cls.standard}${cls.division} (${cls.medium})` : '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-textMuted">{exam.academicYearId}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusBadgeColor(exam.status)}`}>
                        {exam.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-textPrimary">
                          {submittedCount} / {totalCount}
                        </span>
                        <div className="w-16 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: `${totalCount > 0 ? (submittedCount / totalCount) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex justify-end items-center gap-2">
                        <select
                          value={exam.status}
                          onChange={(e) => handleUpdateStatus(exam, e.target.value)}
                          className="rounded-lg border border-border px-2.5 py-1 text-xs bg-white text-textPrimary"
                          aria-label="Change exam status"
                        >
                          {statusFlow.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => navigate(`/dashboard/admin/examinations/${exam.id}`)}
                          className="flex items-center gap-1 rounded-lg border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10"
                          tabIndex={0}
                        >
                          <Eye className="h-3.5 w-3.5" /> View
                        </button>
                        <button
                          onClick={() => handleDeleteConfirm(exam.id)}
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

      {/* CREATE EXAM MODAL */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Examination Schedule" size="md">
        <form onSubmit={handleCreateExam} className="space-y-5 max-h-[75vh] overflow-y-auto pr-2">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-textMuted">Exam Name *</label>
              <select
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
                required
                className="w-full rounded-xl border border-border px-4 py-2.5 text-sm bg-white"
              >
                <option value="Mid Term 1">Mid Term 1</option>
                <option value="Mid Term 2">Mid Term 2</option>
                <option value="Final Exam">Final Exam</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-textMuted">Class *</label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                required
                className="w-full rounded-xl border border-border px-4 py-2.5 text-sm bg-white"
              >
                <option value="">-- Class --</option>
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
                value={selectedYearId}
                onChange={(e) => setSelectedYearId(e.target.value)}
                required
                className="w-full rounded-xl border border-border px-4 py-2.5 text-sm bg-white"
              >
                {academicYears.map((y) => (
                  <option key={y.id} value={y.id}>
                    {y.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-textMuted">Start Date *</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full rounded-xl border border-border px-4 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-textMuted">End Date *</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="w-full rounded-xl border border-border px-4 py-2.5 text-sm"
              />
            </div>
          </div>

          {/* Subject Marks Setup */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-textMuted flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5 text-accent" /> Subject Configuration
            </h4>
            {subjectSettings.length === 0 ? (
              <p className="text-xs text-textMuted">Please select a class to auto-load subjects.</p>
            ) : (
              <div className="space-y-3">
                {subjectSettings.map((sub, idx) => (
                  <div key={sub.name} className="flex flex-wrap items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3">
                    <span className="font-bold text-xs text-primary flex-1 min-w-[100px]">{sub.name}</span>
                    <div className="w-24">
                      <label className="text-[10px] text-textMuted block">Max Marks</label>
                      <input
                        type="number"
                        min={1}
                        value={sub.maxMarks}
                        onChange={(e) => handleSubjectSettingChange(idx, 'maxMarks', e.target.value)}
                        className="w-full rounded border border-border px-2 py-1 text-xs"
                      />
                    </div>
                    <div className="w-24">
                      <label className="text-[10px] text-textMuted block">Passing Marks</label>
                      <input
                        type="number"
                        min={1}
                        value={sub.passingMarks}
                        onChange={(e) => handleSubjectSettingChange(idx, 'passingMarks', e.target.value)}
                        className="w-full rounded border border-border px-2 py-1 text-xs"
                      />
                    </div>
                    <div className="flex-1 min-w-[150px]">
                      <label className="text-[10px] text-textMuted block">Assign Teacher</label>
                      <select
                        value={sub.teacherId}
                        onChange={(e) => handleSubjectSettingChange(idx, 'teacherId', e.target.value)}
                        className="w-full rounded border border-border px-2 py-1.5 text-xs bg-white"
                      >
                        <option value="">-- Select --</option>
                        {teachers.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Grade Ranges */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-textMuted flex items-center gap-1">
              <Award className="h-3.5 w-3.5 text-accent" /> Grade Ranges
            </h4>
            <div className="space-y-2.5">
              {gradeRanges.map((range, idx) => (
                <div key={range.grade} className="flex items-center gap-3 text-xs bg-white/5 border border-white/10 rounded-xl p-2.5">
                  <span className="font-extrabold text-primary w-8 text-center">{range.grade}</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={range.min}
                      onChange={(e) => handleGradeRangeChange(idx, 'min', e.target.value)}
                      className="w-16 rounded border border-border px-2 py-1"
                      placeholder="Min"
                    />
                    <span className="text-textMuted">—</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={range.max}
                      onChange={(e) => handleGradeRangeChange(idx, 'max', e.target.value)}
                      className="w-16 rounded border border-border px-2 py-1"
                      placeholder="Max"
                    />
                  </div>
                  <input
                    type="text"
                    value={range.remark}
                    onChange={(e) => handleGradeRangeChange(idx, 'remark', e.target.value)}
                    className="flex-1 rounded border border-border px-3 py-1"
                    placeholder="Remark"
                  />
                </div>
              ))}
            </div>
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
              Schedule Exam
            </motion.button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Examination"
        message="Are you sure you want to delete this examination schedule? All marks entered for this exam will be deleted permanently."
        confirmLabel="Delete"
        isDanger={true}
        onConfirm={handleDeleteExam}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </motion.div>
  )
}

export default Examinations
