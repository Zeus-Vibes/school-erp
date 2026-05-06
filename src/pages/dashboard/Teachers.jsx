import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Plus, Eye, Trash2, Upload } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import DataTable from '../../components/ui/DataTable'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import { useData } from '../../context/DataContext'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const INITIAL_FORM_STATE = {
  name: '',
  subject: '',
  email: '',
  phone: '',
  qualification: '',
  experience: '',
  joiningDate: '',
  classes: '',
  salary: '',
  photoUrl: null,
}

const Teachers = () => {
  const { teachers, addTeacher, deleteTeacher } = useData()
  const { registerUser } = useAuth()
  const [showAddModal, setShowAddModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState(null)
  const [formData, setFormData] = useState(INITIAL_FORM_STATE)

  const handlePhotoUpload = useCallback((event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Photo must be under 2MB')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, photoUrl: reader.result }))
    }
    reader.readAsDataURL(file)
  }, [])

  const handleDelete = useCallback((id) => {
    if (!window.confirm('Are you sure you want to delete this teacher?')) return
    deleteTeacher(id)
    toast.success('Teacher deleted successfully')
  }, [deleteTeacher])

  const handleAdd = useCallback((event) => {
    event.preventDefault()
    const newTeacher = addTeacher(formData)

    const teacherEmail = formData.email || `${formData.name.toLowerCase().replace(/\s+/g, '.')}@teacher.demo.com`
    registerUser({
      email: teacherEmail,
      password: 'Demo@1234',
      role: 'teacher',
      name: formData.name,
      id: newTeacher.id,
    })

    setShowAddModal(false)
    setFormData(INITIAL_FORM_STATE)
    toast.success(
      `Teacher added! Login: ${teacherEmail} / Demo@1234`,
      { duration: 5000 }
    )
  }, [formData, addTeacher, registerUser])

  const handleViewTeacher = useCallback((teacher) => {
    setSelectedTeacher(teacher)
    setShowViewModal(true)
  }, [])

  const columns = useMemo(() => [
    {
      accessorKey: 'id',
      header: '#',
      cell: ({ row }) => <span className="text-textMuted">{row.index + 1}</span>,
      size: 50,
    },
    {
      accessorKey: 'name',
      header: 'Teacher',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Avatar name={row.original.name} size="sm" photoUrl={row.original.photoUrl} />
          <div>
            <p className="text-sm font-medium text-textPrimary">{row.original.name}</p>
            <p className="text-xs text-textMuted">{row.original.email}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'subject',
      header: 'Subject',
      cell: ({ row }) => <Badge label={row.original.subject} color="blue" />,
    },
    { accessorKey: 'qualification', header: 'Qualification' },
    {
      accessorKey: 'experience',
      header: 'Experience',
      cell: ({ row }) => <span>{row.original.experience} yrs</span>,
    },
    {
      accessorKey: 'classes',
      header: 'Classes',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {(row.original.classes || []).map((c) => (
            <Badge key={c} label={c} color="gray" />
          ))}
        </div>
      ),
    },
    { accessorKey: 'phone', header: 'Phone' },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-1">
          <button
            onClick={() => handleViewTeacher(row.original)}
            className="rounded-lg p-1.5 text-primary hover:bg-blue-50"
            tabIndex={0}
            aria-label={`View ${row.original.name}`}
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(row.original.id)}
            className="rounded-lg p-1.5 text-highlight hover:bg-red-50"
            tabIndex={0}
            aria-label={`Delete ${row.original.name}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ], [handleDelete, handleViewTeacher])

  const formFields = [
    { label: 'Full Name', name: 'name', type: 'text', required: true },
    { label: 'Email', name: 'email', type: 'email', required: true },
    { label: 'Phone', name: 'phone', type: 'tel' },
    { label: 'Subject', name: 'subject', type: 'text', required: true },
    { label: 'Qualification', name: 'qualification', type: 'text' },
    { label: 'Experience (years)', name: 'experience', type: 'number' },
    { label: 'Joining Date', name: 'joiningDate', type: 'date' },
    { label: 'Classes (comma-separated)', name: 'classes', type: 'text' },
    { label: 'Salary', name: 'salary', type: 'number' },
  ]

  const detailFields = selectedTeacher ? [
    ['Email', selectedTeacher.email],
    ['Phone', selectedTeacher.phone],
    ['Subject', selectedTeacher.subject],
    ['Qualification', selectedTeacher.qualification],
    ['Experience', `${selectedTeacher.experience} years`],
    ['Joining Date', selectedTeacher.joiningDate],
    ['Classes', (selectedTeacher.classes || []).join(', ')],
    ['Salary', selectedTeacher.salary ? `₹${Number(selectedTeacher.salary).toLocaleString('en-IN')}` : '—'],
  ] : []

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader
        title="Teachers"
        count={teachers.length}
        actions={
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-button"
            tabIndex={0}
            aria-label="Add Teacher"
          >
            <Plus className="h-4 w-4" />Add Teacher
          </motion.button>
        }
      />

      <DataTable data={teachers} columns={columns} searchPlaceholder="Search teachers..." />

      {/* Add Teacher Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Teacher" size="lg">
        <form onSubmit={handleAdd} className="space-y-4">
          {/* Photo Upload */}
          <div className="flex items-center gap-4">
            <div className="relative">
              {formData.photoUrl ? (
                <img
                  src={formData.photoUrl}
                  alt="Preview"
                  className="h-20 w-20 rounded-full object-cover border-2 border-border"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-section border-2 border-dashed border-border">
                  <Upload className="h-6 w-6 text-textMuted" />
                </div>
              )}
            </div>
            <div>
              <label
                htmlFor="teacher-photo-upload"
                className="cursor-pointer rounded-lg bg-primary/10 px-4 py-2 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
              >
                Upload Photo
              </label>
              <input
                id="teacher-photo-upload"
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <p className="mt-1 text-[10px] text-textMuted">JPG, PNG under 2MB</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {formFields.map(({ label, name, type, required }) => (
              <div key={name}>
                <label className="mb-1 block text-xs font-medium text-textMuted">
                  {label} {required && '*'}
                </label>
                <input
                  type={type}
                  value={formData[name]}
                  onChange={(e) => setFormData((p) => ({ ...p, [name]: e.target.value }))}
                  required={required}
                  className="w-full rounded-xl border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-textMuted hover:bg-gray-50"
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              type="submit"
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-button"
            >
              Add Teacher
            </motion.button>
          </div>
        </form>
      </Modal>

      {/* View Teacher Modal */}
      <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title="Teacher Details" size="md">
        {selectedTeacher && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar name={selectedTeacher.name} size="lg" photoUrl={selectedTeacher.photoUrl} />
              <div>
                <h3 className="text-lg font-bold text-textPrimary">{selectedTeacher.name}</h3>
                <p className="text-sm text-textMuted">{selectedTeacher.subject} | {selectedTeacher.id}</p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {detailFields.map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs font-medium text-textMuted">{label}</p>
                  <p className="text-sm text-textPrimary">{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  )
}

export default Teachers
