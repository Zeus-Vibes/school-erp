import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit, Trash2, BookOpen, User, Layers, ShieldCheck } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import DataTable from '../../components/ui/DataTable'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import { useData } from '../../context/DataContext'
import { getSchoolBrand } from '../../utils/schoolBrand'
import toast from 'react-hot-toast'
import ConfirmDialog from '../../components/shared/ConfirmDialog'
import SchoolBrandBadge from '../../components/shared/SchoolBrandBadge'
import EnrolledStudentsDrawer from '../../components/shared/EnrolledStudentsDrawer'

const INITIAL_FORM_STATE = {
  academicYearId: '',
  standard: 'LKG',
  medium: 'English',
  division: 'A',
  workingDays: 'Mon-Fri',
  room: '',
  maxCapacity: 30,
  classTeacherId: '',
  subjects: [],
}

const STANDARDS = ['LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8']
const MEDIUMS = ['English', 'Gujarati']
const DIVISIONS = ['A', 'B', 'C', 'D']
const WORKING_DAYS_OPTIONS = ['Mon-Fri', 'Mon-Sat']

const Classes = () => {
  const { 
    classes, 
    addClass, 
    updateClass, 
    deleteClass, 
    teachers, 
    students, 
    academicYears,
    getEnrolledCount
  } = useData()

  // State management
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('create') // 'create' | 'edit'
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState(INITIAL_FORM_STATE)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState(null)
  const [selectedClass, setSelectedClass] = useState(null)

  // Get active teachers for assignment
  const activeTeachers = useMemo(() => teachers.filter(t => t.isActive !== false), [teachers])

  // Get active academic year to default new records
  const activeYear = useMemo(() => academicYears.find(y => y.isActive) || academicYears[0], [academicYears])

  // Auto-calculated Brand based on Standard selection
  const computedBrand = useMemo(() => getSchoolBrand(formData.standard), [formData.standard])

  // Open modal for adding a new class
  const handleOpenAddModal = useCallback(() => {
    setModalMode('create')
    setEditingId(null)
    setFormData({
      ...INITIAL_FORM_STATE,
      academicYearId: activeYear?.id || '',
    })
    setShowModal(true)
  }, [activeYear])

  // Open modal for editing a class
  const handleOpenEditModal = useCallback((cls) => {
    setModalMode('edit')
    setEditingId(cls.id)
    setFormData({
      academicYearId: cls.academicYearId || '',
      standard: cls.standard || 'LKG',
      medium: cls.medium || 'English',
      division: cls.division || 'A',
      workingDays: cls.workingDays || 'Mon-Fri',
      room: cls.room || '',
      maxCapacity: cls.maxCapacity || 30,
      classTeacherId: cls.classTeacherId || '',
      subjects: cls.subjects ? [...cls.subjects] : [],
    })
    setShowModal(true)
  }, [])

  // Delete validation and execution
  const handleDelete = useCallback((id) => {
    const classRecord = classes.find(c => c.id === id)
    if (!classRecord) return

    // Check if any student belongs to this class standard+medium+division or matches classId
    const hasStudents = students.some(
      s => s.classId === id || 
      (s.standard === classRecord.standard && s.medium === classRecord.medium && s.division === classRecord.division)
    )

    if (hasStudents) {
      toast.error('Deletion blocked: This Class has students enrolled in it.')
      return
    }

    setDeleteTargetId(id)
    setShowDeleteConfirm(true)
  }, [classes, students])

  const handleConfirmDelete = useCallback(() => {
    if (deleteTargetId) {
      deleteClass(deleteTargetId)
      toast.success('Class deleted successfully')
    }
    setShowDeleteConfirm(false)
    setDeleteTargetId(null)
  }, [deleteClass, deleteTargetId])

  // Subjects dynamic fields management
  const handleAddSubjectField = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      subjects: [...prev.subjects, { name: '', syllabus: '' }]
    }))
  }, [])

  const handleRemoveSubjectField = useCallback((index) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.filter((_, i) => i !== index)
    }))
  }, [])

  const handleSubjectChange = useCallback((index, field, value) => {
    setFormData(prev => {
      const updated = [...prev.subjects]
      updated[index] = { ...updated[index], [field]: value }
      return { ...prev, subjects: updated }
    })
  }, [])

  // Handle Form Submission
  const handleSave = useCallback((event) => {
    event.preventDefault()

    // Validate subjects list is complete
    const incompleteSubject = formData.subjects.some(s => !s.name.trim())
    if (incompleteSubject) {
      toast.error('Please fill in the name for all subjects or remove empty rows.')
      return
    }

    if (modalMode === 'create') {
      // Check for class duplicate in standard + medium + division + academicYear
      const isDuplicate = classes.some(
        c => c.standard === formData.standard &&
             c.medium === formData.medium &&
             c.division === formData.division &&
             c.academicYearId === formData.academicYearId
      )

      if (isDuplicate) {
        toast.error('A class with this Standard, Medium, and Division already exists for this Academic Year.')
        return
      }

      addClass(formData)
      toast.success('Class created successfully')
    } else {
      updateClass(editingId, formData)
      toast.success('Class updated successfully')
    }

    setShowModal(false)
    setFormData(INITIAL_FORM_STATE)
  }, [modalMode, formData, classes, editingId, addClass, updateClass])

  // Table columns definition
  const columns = useMemo(() => [
    {
      accessorKey: 'standard',
      header: 'Standard',
      cell: ({ row }) => <span className="font-semibold text-textPrimary">Class {row.original.standard}</span>,
    },
    {
      accessorKey: 'medium',
      header: 'Medium',
      cell: ({ row }) => (
        <Badge 
          label={row.original.medium} 
          color={row.original.medium === 'English' ? 'navy' : 'olive'} 
        />
      ),
    },
    {
      accessorKey: 'division',
      header: 'Div',
      cell: ({ row }) => <span className="text-sm font-semibold text-textPrimary">{row.original.division}</span>,
    },
    {
      id: 'brand',
      header: 'School Brand',
      cell: ({ row }) => {
        const brandName = row.original.schoolBrand || getSchoolBrand(row.original.standard).name
        return <SchoolBrandBadge brand={brandName} />
      },
    },
    {
      accessorKey: 'classTeacherId',
      header: 'Class Teacher',
      cell: ({ row }) => {
        const teacher = teachers.find(t => t.id === row.original.classTeacherId || t.userId === row.original.classTeacherId)
        return (
          <div className="flex items-center gap-1.5 text-sm">
            <User className="h-3.5 w-3.5 text-textMuted" />
            <span className="text-textPrimary font-medium">{teacher ? teacher.name : 'Not Assigned'}</span>
          </div>
        )
      },
    },
    {
      id: 'studentsCount',
      header: 'Students',
      cell: ({ row }) => {
        const count = getEnrolledCount(row.original.id)
        return (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setSelectedClass(row.original)
            }}
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold hover:bg-green-200 transition-colors border border-green-200 cursor-pointer"
            tabIndex={0}
            aria-label={`${count} Enrolled. Click to view.`}
          >
            {count} Enrolled
          </button>
        )
      },
    },
    {
      accessorKey: 'room',
      header: 'Room',
      cell: ({ row }) => <span className="text-sm text-textMuted">{row.original.room || '—'}</span>,
    },
    {
      accessorKey: 'workingDays',
      header: 'Days',
      cell: ({ row }) => <Badge label={row.original.workingDays} color="gray" />,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleOpenEditModal(row.original)
            }}
            className="rounded-lg p-1.5 text-primary hover:bg-blue-50 cursor-pointer"
            tabIndex={0}
            aria-label={`Edit Class ${row.original.standard}-${row.original.division}`}
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleDelete(row.original.id)
            }}
            className="rounded-lg p-1.5 text-highlight hover:bg-red-50 cursor-pointer"
            tabIndex={0}
            aria-label={`Delete Class ${row.original.standard}-${row.original.division}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ], [teachers, students, getEnrolledCount, handleOpenEditModal, handleDelete])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader
        title="Classes"
        count={classes.length}
        actions={
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-button cursor-pointer"
            tabIndex={0}
            aria-label="Add Class"
          >
            <Plus className="h-4 w-4" />Add Class
          </motion.button>
        }
      />

      <DataTable data={classes} columns={columns} searchPlaceholder="Search classes..." onRowClick={setSelectedClass} />

      {/* Add/Edit Class Modal */}
      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        title={modalMode === 'create' ? 'Create New Class' : 'Edit Class Details'} 
        size="lg"
      >
        <form onSubmit={handleSave} className="space-y-6">
          
          {/* Section 1: Basic Info */}
          <div className="space-y-4">
            <h4 className="flex items-center gap-2 border-b border-border pb-1.5 text-sm font-bold text-primary">
              <Layers className="h-4 w-4" />
              Section 1: Basic Information
            </h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-textMuted">Academic Year *</label>
                <select
                  value={formData.academicYearId}
                  onChange={(e) => setFormData(prev => ({ ...prev, academicYearId: e.target.value }))}
                  required
                  className="w-full rounded-xl border border-border px-3 py-2.5 text-sm"
                >
                  <option value="">Select Academic Year</option>
                  {academicYears.map(y => (
                    <option key={y.id} value={y.id}>
                      {y.label} {y.isActive ? '(Active)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-textMuted">Standard *</label>
                <select
                  value={formData.standard}
                  onChange={(e) => setFormData(prev => ({ ...prev, standard: e.target.value }))}
                  required
                  className="w-full rounded-xl border border-border px-3 py-2.5 text-sm"
                >
                  {STANDARDS.map(s => (
                    <option key={s} value={s}>Class {s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-textMuted">Medium *</label>
                <select
                  value={formData.medium}
                  onChange={(e) => setFormData(prev => ({ ...prev, medium: e.target.value }))}
                  required
                  className="w-full rounded-xl border border-border px-3 py-2.5 text-sm"
                >
                  {MEDIUMS.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-textMuted">Division *</label>
                <select
                  value={formData.division}
                  onChange={(e) => setFormData(prev => ({ ...prev, division: e.target.value }))}
                  required
                  className="w-full rounded-xl border border-border px-3 py-2.5 text-sm"
                >
                  {DIVISIONS.map(d => (
                    <option key={d} value={d}>Division {d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-textMuted">Working Days *</label>
                <select
                  value={formData.workingDays}
                  onChange={(e) => setFormData(prev => ({ ...prev, workingDays: e.target.value }))}
                  required
                  className="w-full rounded-xl border border-border px-3 py-2.5 text-sm"
                >
                  {WORKING_DAYS_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-textMuted">Room Name/No.</label>
                <input
                  type="text"
                  placeholder="e.g. Room 102"
                  value={formData.room}
                  onChange={(e) => setFormData(prev => ({ ...prev, room: e.target.value }))}
                  className="w-full rounded-xl border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-textMuted">Max Student Capacity</label>
                <input
                  type="number"
                  value={formData.maxCapacity}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxCapacity: parseInt(e.target.value) || 0 }))}
                  min={1}
                  className="w-full rounded-xl border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* School Brand (live read-only status) */}
              <div>
                <label className="mb-1 block text-xs font-medium text-textMuted">School Brand (Auto)</label>
                <div className="h-[42px] flex items-center">
                  <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold ${computedBrand.badgeClass}`}>
                    {computedBrand.name}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Assignment */}
          <div className="space-y-4">
            <h4 className="flex items-center gap-2 border-b border-border pb-1.5 text-sm font-bold text-primary">
              <ShieldCheck className="h-4 w-4" />
              Section 2: Staff Assignment
            </h4>
            <div>
              <label className="mb-1 block text-xs font-medium text-textMuted">Class Teacher</label>
              <select
                value={formData.classTeacherId}
                onChange={(e) => setFormData(prev => ({ ...prev, classTeacherId: e.target.value }))}
                className="w-full rounded-xl border border-border px-3 py-2.5 text-sm"
              >
                <option value="">No Teacher Assigned</option>
                {activeTeachers.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.qualification})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 3: Subjects Dynamic List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-1.5">
              <h4 className="flex items-center gap-2 text-sm font-bold text-primary">
                <BookOpen className="h-4 w-4" />
                Section 3: Curriculum Subjects
              </h4>
              <button
                type="button"
                onClick={handleAddSubjectField}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Subject
              </button>
            </div>
            {formData.subjects.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-textMuted">
                No subjects added. Click "Add Subject" to begin.
              </div>
            ) : (
              <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1">
                {formData.subjects.map((sub, index) => (
                  <div key={index} className="grid grid-cols-12 gap-3 items-start bg-gray-50/50 p-3 rounded-xl border border-border/50">
                    {/* Subject Name — col 3 */}
                    <div className="col-span-3">
                      <input
                        type="text"
                        placeholder="Subject Name"
                        value={sub.name}
                        onChange={(e) => handleSubjectChange(index, 'name', e.target.value)}
                        required
                        className="w-full rounded-lg border border-border bg-white px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    {/* Assigned Teacher — col 4 */}
                    <div className="col-span-4">
                      <select
                        value={sub.assignedTeacherId || ''}
                        onChange={(e) => {
                          const tId = e.target.value
                          const teacherObj = activeTeachers.find(t => t.id === tId || t.userId === tId)
                          const tName = teacherObj ? teacherObj.name : ''
                          handleSubjectChange(index, 'assignedTeacherId', tId)
                          handleSubjectChange(index, 'assignedTeacherName', tName)
                        }}
                        className="w-full rounded-lg border border-border bg-white px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="">— Assign Teacher (optional) —</option>
                        {activeTeachers.map(t => (
                          <option key={t.id} value={t.id}>
                            {t.name || t.fullName} ({t.subjects?.join(', ') || ''})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Syllabus — col 4 */}
                    <div className="col-span-4">
                      <textarea
                        placeholder="Syllabus overview (optional)"
                        value={sub.syllabus || ''}
                        onChange={(e) => handleSubjectChange(index, 'syllabus', e.target.value)}
                        rows={1}
                        className="w-full rounded-lg border border-border bg-white px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                      />
                    </div>

                    {/* Remove — col 1 */}
                    <div className="col-span-1 flex justify-center pt-1.5">
                      <button
                        type="button"
                        onClick={() => handleRemoveSubjectField(index)}
                        className="rounded-lg p-1 text-highlight hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                        aria-label="Remove subject"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-textMuted hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              type="submit"
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-button cursor-pointer"
            >
              {modalMode === 'create' ? 'Create Class' : 'Save Changes'}
            </motion.button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Class"
        message="Are you sure you want to delete this class? This will permanently remove the class configuration."
        confirmLabel="Delete"
        isDanger={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setShowDeleteConfirm(false)
          setDeleteTargetId(null)
        }}
      />
      <AnimatePresence>
        {selectedClass && (
          <EnrolledStudentsDrawer
            cls={selectedClass}
            students={students.filter(s =>
              s.currentClassId === selectedClass.id || s.classId === selectedClass.id
            )}
            onClose={() => setSelectedClass(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default Classes
