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
import { getStageBadgeColor } from '../../utils/helpers'
import toast from 'react-hot-toast'

const INITIAL_FORM_STATE = {
  name: '',
  class: '6',
  section: 'A',
  roll: '',
  gender: 'Male',
  dob: '',
  phone: '',
  email: '',
  fatherName: '',
  address: '',
  bloodGroup: 'O+',
  medium: 'English',
  board: 'CBSE',
  stream: '',
  photoUrl: null,
}

const Students = () => {
  const { students, addStudent, deleteStudent } = useData()
  const { registerUser } = useAuth()
  const [classFilter, setClassFilter] = useState('All')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [formData, setFormData] = useState(INITIAL_FORM_STATE)

  const filteredStudents = useMemo(
    () => classFilter === 'All'
      ? students
      : students.filter((s) => s.class === classFilter),
    [students, classFilter]
  )

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
    if (!window.confirm('Are you sure you want to delete this student?')) return
    deleteStudent(id)
    toast.success('Student deleted successfully')
  }, [deleteStudent])

  const handleAdd = useCallback((event) => {
    event.preventDefault()
    const newStudent = addStudent(formData)

    const studentEmail = formData.email || `${formData.name.toLowerCase().replace(/\s+/g, '.')}@student.demo.com`
    registerUser({
      email: studentEmail,
      password: 'Demo@1234',
      role: 'student',
      name: formData.name,
      id: newStudent.id,
    })

    setShowAddModal(false)
    setFormData(INITIAL_FORM_STATE)
    toast.success(
      `Student added! Login: ${studentEmail} / Demo@1234`,
      { duration: 5000 }
    )
  }, [formData, addStudent, registerUser])

  const handleViewStudent = useCallback((student) => {
    setSelectedStudent(student)
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
      header: 'Student',
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
      accessorKey: 'class',
      header: 'Class',
      cell: ({ row }) => <Badge label={`${row.original.class}-${row.original.section}`} color="blue" />,
    },
    {
      accessorKey: 'stage',
      header: 'Stage',
      cell: ({ row }) => {
        const stageColors = getStageBadgeColor(row.original.stage)
        return (
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-medium"
            style={{ backgroundColor: stageColors.bg, color: stageColors.text }}
          >
            {row.original.stage}
          </span>
        )
      },
    },
    {
      accessorKey: 'medium',
      header: 'Medium',
      cell: ({ row }) => (
        <Badge label={row.original.medium} color={row.original.medium === 'English' ? 'navy' : 'olive'} />
      ),
    },
    {
      accessorKey: 'gender',
      header: 'Gender',
      cell: ({ row }) => (
        <Badge label={row.original.gender} color={row.original.gender === 'Male' ? 'blue' : 'pink'} />
      ),
    },
    { accessorKey: 'phone', header: 'Phone' },
    {
      accessorKey: 'bloodGroup',
      header: 'Blood',
      cell: ({ row }) => <Badge label={row.original.bloodGroup} color="gray" />,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-1">
          <button
            onClick={() => handleViewStudent(row.original)}
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
  ], [handleDelete, handleViewStudent])

  const textFields = [
    { label: 'Full Name', name: 'name', type: 'text', required: true },
    { label: 'Email', name: 'email', type: 'email' },
    { label: 'Phone', name: 'phone', type: 'tel' },
    { label: 'Date of Birth', name: 'dob', type: 'date' },
    { label: 'Roll No', name: 'roll', type: 'number' },
    { label: "Father's Name", name: 'fatherName', type: 'text' },
  ]

  const detailFields = selectedStudent ? [
    ['Email', selectedStudent.email],
    ['Phone', selectedStudent.phone],
    ['DOB', selectedStudent.dob],
    ['Gender', selectedStudent.gender],
    ['Blood Group', selectedStudent.bloodGroup],
    ["Father's Name", selectedStudent.fatherName],
    ['Medium', selectedStudent.medium],
    ['Board', selectedStudent.board],
    ['Stage', selectedStudent.stage],
    ['Stream', selectedStudent.stream || '—'],
    ['Admission Year', selectedStudent.admissionYear],
    ['Address', selectedStudent.address],
  ] : []

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader
        title="Students"
        count={filteredStudents.length}
        actions={
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-button"
            tabIndex={0}
            aria-label="Add Student"
          >
            <Plus className="h-4 w-4" />Add Student
          </motion.button>
        }
      />

      <DataTable
        data={filteredStudents}
        columns={columns}
        searchPlaceholder="Search students..."
        filters={
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="rounded-xl border border-border bg-white px-3 py-2.5 text-sm"
            aria-label="Filter by class"
          >
            <option value="All">All Classes</option>
            {['6', '7', '8', '9', '10', '11', '12'].map((c) => (
              <option key={c} value={c}>Class {c}</option>
            ))}
          </select>
        }
      />

      {/* Add Student Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Student" size="lg">
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
                htmlFor="student-photo-upload"
                className="cursor-pointer rounded-lg bg-primary/10 px-4 py-2 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
              >
                Upload Photo
              </label>
              <input
                id="student-photo-upload"
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <p className="mt-1 text-[10px] text-textMuted">JPG, PNG under 2MB</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {textFields.map(({ label, name, type, required }) => (
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
            <div>
              <label className="mb-1 block text-xs font-medium text-textMuted">Class *</label>
              <select
                value={formData.class}
                onChange={(e) => setFormData((p) => ({ ...p, class: e.target.value }))}
                className="w-full rounded-xl border border-border px-3 py-2.5 text-sm"
              >
                {['6', '7', '8', '9', '10', '11', '12'].map((c) => (
                  <option key={c} value={c}>Class {c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-textMuted">Section</label>
              <select
                value={formData.section}
                onChange={(e) => setFormData((p) => ({ ...p, section: e.target.value }))}
                className="w-full rounded-xl border border-border px-3 py-2.5 text-sm"
              >
                <option>A</option>
                <option>B</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-textMuted">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData((p) => ({ ...p, gender: e.target.value }))}
                className="w-full rounded-xl border border-border px-3 py-2.5 text-sm"
              >
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-textMuted">Medium</label>
              <select
                value={formData.medium}
                onChange={(e) => setFormData((p) => ({ ...p, medium: e.target.value }))}
                className="w-full rounded-xl border border-border px-3 py-2.5 text-sm"
              >
                <option>English</option>
                <option>Gujarati</option>
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-textMuted">Address</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))}
              rows={2}
              className="w-full rounded-xl border border-border px-3 py-2.5 text-sm resize-none"
            />
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
              Add Student
            </motion.button>
          </div>
        </form>
      </Modal>

      {/* View Student Modal */}
      <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title="Student Details" size="md">
        {selectedStudent && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar name={selectedStudent.name} size="lg" photoUrl={selectedStudent.photoUrl} />
              <div>
                <h3 className="text-lg font-bold text-textPrimary">{selectedStudent.name}</h3>
                <p className="text-sm text-textMuted">
                  Class {selectedStudent.class}-{selectedStudent.section} | {selectedStudent.id}
                </p>
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

export default Students
