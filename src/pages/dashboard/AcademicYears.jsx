import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, Calendar, CheckCircle } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import DataTable from '../../components/ui/DataTable'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import { useData } from '../../context/DataContext'
import { formatDate } from '../../utils/helpers'
import toast from 'react-hot-toast'
import ConfirmDialog from '../../components/shared/ConfirmDialog'

const INITIAL_FORM_STATE = {
  label: '',
  startDate: '',
  endDate: '',
}

const AcademicYears = () => {
  const { 
    academicYears, 
    addAcademicYear, 
    deleteAcademicYear, 
    setActiveAcademicYear,
    classes,
    students
  } = useData()

  const [showAddModal, setShowAddModal] = useState(false)
  const [formData, setFormData] = useState(INITIAL_FORM_STATE)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState(null)

  // Handle active status toggle
  const handleSetActive = useCallback((id) => {
    setActiveAcademicYear(id)
    toast.success(`Academic year successfully set to active.`)
  }, [setActiveAcademicYear])

  // Handle delete validation
  const handleDelete = useCallback((id) => {
    // Check if any classes are linked
    const hasClasses = classes.some((c) => c.academicYearId === id)
    // Check if any students are linked
    const hasStudents = students.some((s) => s.academicYearId === id)

    if (hasClasses || hasStudents) {
      toast.error('Deletion blocked: This Academic Year has classes or students linked to it.')
      return
    }

    setDeleteTargetId(id)
    setShowDeleteConfirm(true)
  }, [classes, students])

  const handleConfirmDelete = useCallback(() => {
    if (deleteTargetId) {
      deleteAcademicYear(deleteTargetId)
      toast.success('Academic Year deleted successfully.')
    }
    setShowDeleteConfirm(false)
    setDeleteTargetId(null)
  }, [deleteAcademicYear, deleteTargetId])

  // Handle form submission
  const handleAdd = useCallback((event) => {
    event.preventDefault()
    if (!formData.label.trim()) {
      toast.error('Label is required')
      return
    }

    // Check if label already exists
    const exists = academicYears.some(
      (y) => y.label.toLowerCase().trim() === formData.label.toLowerCase().trim()
    )
    if (exists) {
      toast.error('An Academic Year with this label already exists.')
      return
    }

    const newYear = {
      ...formData,
      id: formData.label.trim(),
      isActive: false, // Default newly created years to inactive
    }

    addAcademicYear(newYear)
    setShowAddModal(false)
    setFormData(INITIAL_FORM_STATE)
    toast.success('Academic Year added successfully')
  }, [formData, academicYears, addAcademicYear])

  // Table columns definition
  const columns = useMemo(() => [
    {
      accessorKey: 'id',
      header: '#',
      cell: ({ row }) => <span className="text-textMuted">{row.index + 1}</span>,
      size: 50,
    },
    {
      accessorKey: 'label',
      header: 'Academic Year',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          <span className="font-semibold text-textPrimary">{row.original.label}</span>
        </div>
      ),
    },
    {
      accessorKey: 'startDate',
      header: 'Start Date',
      cell: ({ row }) => <span className="text-textPrimary">{formatDate(row.original.startDate)}</span>,
    },
    {
      accessorKey: 'endDate',
      header: 'End Date',
      cell: ({ row }) => <span className="text-textPrimary">{formatDate(row.original.endDate)}</span>,
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <Badge
          label={row.original.isActive ? 'Active' : 'Past / Inactive'}
          color={row.original.isActive ? 'green' : 'gray'}
        />
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {!row.original.isActive ? (
            <button
              onClick={() => handleSetActive(row.original.id)}
              className="inline-flex items-center gap-1 rounded-lg border border-primary/20 bg-primary/5 px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary hover:text-white transition-colors cursor-pointer"
              tabIndex={0}
              aria-label={`Set active ${row.original.label}`}
            >
              <CheckCircle className="h-3.5 w-3.5" />
              Set Active
            </button>
          ) : (
            <span className="text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-lg border border-green-200">
              Current Active
            </span>
          )}
          <button
            onClick={() => handleDelete(row.original.id)}
            className="rounded-lg p-1.5 text-highlight hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
            tabIndex={0}
            aria-label={`Delete ${row.original.label}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ], [handleSetActive, handleDelete])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader
        title="Academic Years"
        count={academicYears.length}
        actions={
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-button cursor-pointer"
            tabIndex={0}
            aria-label="Add Academic Year"
          >
            <Plus className="h-4 w-4" />Add Year
          </motion.button>
        }
      />

      <DataTable data={academicYears} columns={columns} searchPlaceholder="Search academic years..." />

      {/* Add Year Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Academic Year" size="md">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-textMuted">Year Label *</label>
            <input
              type="text"
              placeholder="e.g. 2024-25"
              value={formData.label}
              onChange={(e) => setFormData((prev) => ({ ...prev, label: e.target.value }))}
              required
              className="w-full rounded-xl border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-textMuted">Start Date *</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
              required
              className="w-full rounded-xl border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-textMuted">End Date *</label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
              required
              className="w-full rounded-xl border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-textMuted hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              type="submit"
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-button cursor-pointer"
            >
              Save Year
            </motion.button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Academic Year"
        message="Are you sure you want to delete this academic year? This will permanently remove the record."
        confirmLabel="Delete"
        isDanger={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setShowDeleteConfirm(false)
          setDeleteTargetId(null)
        }}
      />
    </motion.div>
  )
}

export default AcademicYears
