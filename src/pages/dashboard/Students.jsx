import { useState, useMemo, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Eye, Edit, Trash2, Upload, Key, FileText, Copy, Check, Filter } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../../components/ui/PageHeader'
import DataTable from '../../components/ui/DataTable'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import { useData } from '../../context/DataContext'
import { getSchoolBrand } from '../../utils/schoolBrand'
import { formatDate } from '../../utils/helpers'
import toast from 'react-hot-toast'
import ConfirmDialog from '../../components/shared/ConfirmDialog'

const INITIAL_FORM_STATE = {
  // Personal Info
  name: '',
  dob: '',
  gender: 'Male',
  bloodGroup: 'O+',
  aadhar: '',
  address: '',
  photoUrl: null,

  // Academic Info
  grNumber: '',
  rollNumber: '',
  standard: 'LKG',
  medium: 'English',
  division: '',
  academicYearId: '',
  admissionDate: '',

  // House & Clubs
  house: 'Red',
  clubs: [],

  // Parent Details
  fatherName: '',
  fatherPhone: '',
  fatherOccupation: '',
  motherName: '',
  motherPhone: '',
  motherOccupation: '',
  parentEmail: '',

  // Status
  status: 'Active',
}

const STANDARDS = ['LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8']
const MEDIUMS = ['English', 'Gujarati']
const HOUSES = ['Red', 'Green', 'Blue', 'Yellow']
const CLUBS = ['Taekwondo', 'Chess', 'Art Club', 'Music Club']
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const STATUS_OPTIONS = ['Active', 'Left', 'Graduated', 'HeldBack']

// Helper to remove hyphen and compact year label
const getYearLabelCompact = (yearId, academicYears) => {
  const yearObj = academicYears.find(y => y.id === yearId)
  if (!yearObj) return '2425' // fallback
  const parts = yearObj.label.split('-')
  if (parts.length === 2) {
    const yr1 = parts[0].slice(-2)
    const yr2 = parts[1].slice(-2)
    return `${yr1}${yr2}`
  }
  return yearObj.label.replace(/\D/g, '')
}

const Students = () => {
  const navigate = useNavigate()
  const {
    students,
    addStudent,
    updateStudent,
    deleteStudent,
    classes,
    academicYears
  } = useData()

  // Filters State
  const [filterStd, setFilterStd] = useState('All')
  const [filterMed, setFilterMed] = useState('All')
  const [filterDiv, setFilterDiv] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')

  // Modals & Forms State
  const [showAddModal, setShowAddModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showCredModal, setShowCredModal] = useState(false)
  const [modalMode, setModalMode] = useState('create') // 'create' | 'edit'
  const [editingId, setEditingId] = useState(null)

  const [selectedStudent, setSelectedStudent] = useState(null)
  const [formData, setFormData] = useState(INITIAL_FORM_STATE)
  const [copiedField, setCopiedField] = useState(null) // 'user' | 'pass'
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState(null)
  const [savedCredentials, setSavedCredentials] = useState(null) // { userId, password }

  const activeYear = useMemo(() => academicYears.find(y => y.isActive) || academicYears[0], [academicYears])

  // Populate Division dropdown dynamically based on Standard + Medium from Classes
  const availableDivisions = useMemo(() => {
    if (!formData.standard || !formData.medium) return []
    const filtered = classes.filter(
      c => c.standard === formData.standard && c.medium === formData.medium
    )
    return [...new Set(filtered.map(c => c.division))].sort()
  }, [classes, formData.standard, formData.medium])

  // Auto-select first division if available division changes and current is invalid
  useEffect(() => {
    if (availableDivisions.length > 0) {
      if (!formData.division || !availableDivisions.includes(formData.division)) {
        setFormData(p => ({ ...p, division: availableDivisions[0] }))
      }
    } else {
      setFormData(p => ({ ...p, division: '' }))
    }
  }, [availableDivisions, formData.division])

  // Compute live credentials
  const liveYearLabelCompact = useMemo(() => {
    return getYearLabelCompact(formData.academicYearId || activeYear?.id, academicYears)
  }, [formData.academicYearId, activeYear, academicYears])

  const computedUserId = useMemo(() => {
    const std = formData.standard || ''
    const div = formData.division || ''
    const roll = String(formData.rollNumber || '').padStart(2, '0')
    return `SB-${liveYearLabelCompact}-${std}${div}-${roll}`.toUpperCase()
  }, [liveYearLabelCompact, formData.standard, formData.division, formData.rollNumber])

  const computedPassword = useMemo(() => {
    const std = formData.standard || ''
    const div = formData.division || ''
    const roll = String(formData.rollNumber || '').padStart(2, '0')
    return `SBIS@${std}${div}${roll}`.toUpperCase()
  }, [formData.standard, formData.division, formData.rollNumber])

  const computedBrand = useMemo(() => {
    return getSchoolBrand(formData.standard)
  }, [formData.standard])

  // Filter students based on selection dropdowns
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchStd = filterStd === 'All' || s.standard === filterStd
      const matchMed = filterMed === 'All' || s.medium === filterMed
      const matchDiv = filterDiv === 'All' || s.division === filterDiv

      const sStatus = s.isActive ? 'Active' : (s.status || 'Left')
      const matchStatus = filterStatus === 'All' || sStatus === filterStatus
      return matchStd && matchMed && matchDiv && matchStatus
    })
  }, [students, filterStd, filterMed, filterDiv, filterStatus])

  // Photo Upload Handler
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

  // Copy to Clipboard Helper
  const handleCopy = useCallback((text, field) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopiedField(null), 2000)
  }, [])

  // Delete Handler
  const handleDelete = useCallback((id) => {
    setDeleteTargetId(id)
    setShowDeleteConfirm(true)
  }, [])

  const handleConfirmDelete = useCallback(() => {
    if (deleteTargetId) {
      deleteStudent(deleteTargetId)
      toast.success('Student record deleted successfully')
    }
    setShowDeleteConfirm(false)
    setDeleteTargetId(null)
  }, [deleteStudent, deleteTargetId])

  // Open Modal for Create
  const handleOpenAddModal = useCallback(() => {
    setModalMode('create')
    setEditingId(null)
    setFormData({
      ...INITIAL_FORM_STATE,
      academicYearId: activeYear?.id || '',
      admissionDate: new Date().toISOString().split('T')[0],
    })
    setShowAddModal(true)
  }, [activeYear])

  // Open Modal for Edit
  const handleOpenEditModal = useCallback((student) => {
    setModalMode('edit')
    setEditingId(student.id)
    setFormData({
      name: student.name || '',
      dob: student.dob || '',
      gender: student.gender || 'Male',
      bloodGroup: student.bloodGroup || 'O+',
      aadhar: student.aadhar || '',
      address: student.address || '',
      photoUrl: student.photoUrl || null,

      grNumber: student.grNumber || '',
      rollNumber: student.rollNumber || '',
      standard: student.standard || 'LKG',
      medium: student.medium || 'English',
      division: student.division || '',
      academicYearId: student.academicYearId || activeYear?.id || '',
      admissionDate: student.admissionDate || '',

      house: student.house || 'Red',
      clubs: student.clubs ? [...student.clubs] : [],

      fatherName: student.father?.name || '',
      fatherPhone: student.father?.phone || '',
      fatherOccupation: student.father?.occupation || '',
      motherName: student.mother?.name || '',
      motherPhone: student.mother?.phone || '',
      motherOccupation: student.mother?.occupation || '',
      parentEmail: student.parentEmail || '',
      status: student.isActive ? 'Active' : (student.status || 'Left'),
    })
    setShowAddModal(true)
  }, [activeYear])

  // Save student handler
  const handleSave = useCallback((event) => {
    event.preventDefault()

    // Uniqueness validation on GR Number
    const duplicateGR = students.some(
      s => s.grNumber.toLowerCase().trim() === formData.grNumber.toLowerCase().trim() && s.id !== editingId
    )
    if (duplicateGR) {
      toast.error('GR Number must be unique! This GR Number is already assigned.')
      return
    }

    if (!formData.division) {
      toast.error('Please configure a Class for this Standard + Medium combination first.')
      return
    }

    // Find classId
    const matchingClass = classes.find(
      c => c.standard === formData.standard && c.medium === formData.medium && c.division === formData.division
    )

    const finalStudentData = {
      name: formData.name,
      dob: formData.dob,
      gender: formData.gender,
      bloodGroup: formData.bloodGroup,
      aadhar: formData.aadhar,
      address: formData.address,
      photoUrl: formData.photoUrl,

      grNumber: formData.grNumber,
      rollNumber: parseInt(formData.rollNumber),
      standard: formData.standard,
      medium: formData.medium,
      division: formData.division,
      classId: matchingClass?.id || `class-${formData.standard.toLowerCase()}-${formData.division.toLowerCase()}`,
      academicYearId: formData.academicYearId,
      admissionDate: formData.admissionDate,

      house: formData.house,
      clubs: formData.clubs,

      father: {
        name: formData.fatherName,
        phone: formData.fatherPhone,
        occupation: formData.fatherOccupation
      },
      mother: {
        name: formData.motherName,
        phone: formData.motherPhone,
        occupation: formData.motherOccupation
      },
      parentEmail: formData.parentEmail,
      isActive: formData.status === 'Active',
      status: formData.status,
    }

    if (modalMode === 'create') {
      const generatedUid = computedUserId
      const generatedPwd = computedPassword

      const newStudent = addStudent({
        ...finalStudentData,
        id: generatedUid,
        userId: generatedUid,
        password: generatedPwd,
      })

      // Store for Credential Modal display
      setSavedCredentials({
        userId: generatedUid,
        password: generatedPwd
      })
      setShowCredModal(true)
    } else {
      updateStudent(editingId, finalStudentData)
      toast.success('Student details updated successfully')
    }

    setShowAddModal(false)
    setFormData(INITIAL_FORM_STATE)
  }, [modalMode, formData, students, classes, editingId, addStudent, updateStudent, computedUserId, computedPassword])

  // Reset Password Action
  const handleResetPassword = useCallback((studentId) => {
    const student = students.find(s => s.id === studentId)
    if (!student) return

    const std = student.standard || ''
    const div = student.division || ''
    const roll = String(student.rollNumber || '').padStart(2, '0')
    const resetPwd = `SBIS@${std}${div}${roll}`.toUpperCase()

    updateStudent(studentId, { password: resetPwd })
    toast.success(`Password reset to default: ${resetPwd}`, { duration: 4000 })
  }, [students, updateStudent])

  // View Student details
  const handleViewStudent = useCallback((student) => {
    setSelectedStudent(student)
    setShowViewModal(true)
  }, [])

  // Table columns definition
  const columns = useMemo(() => [
    {
      accessorKey: 'grNumber',
      header: 'GR Number',
      cell: ({ row }) => <span className="font-semibold text-textPrimary">{row.original.grNumber}</span>,
    },
    {
      accessorKey: 'name',
      header: 'Student',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Avatar name={row.original.name} size="sm" photoUrl={row.original.photoUrl} />
          <div>
            <p className="text-sm font-medium text-textPrimary">{row.original.name}</p>
            <p className="text-[10px] text-textMuted">{row.original.parentEmail || 'No Email'}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'rollNumber',
      header: 'Roll No',
      cell: ({ row }) => <span className="text-sm text-textMuted font-mono">{String(row.original.rollNumber).padStart(2, '0')}</span>,
    },
    {
      id: 'classDetail',
      header: 'Class',
      cell: ({ row }) => <Badge label={`${row.original.standard}-${row.original.division} (${row.original.medium})`} color="blue" />,
    },
    {
      id: 'brand',
      header: 'School Brand',
      cell: ({ row }) => {
        const brand = getSchoolBrand(row.original.standard)
        return (
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${brand.badgeClass}`}>
            {brand.name}
          </span>
        )
      },
    },
    {
      accessorKey: 'house',
      header: 'House',
      cell: ({ row }) => {
        const houseColor = {
          Red: 'bg-red-500',
          Green: 'bg-green-500',
          Blue: 'bg-blue-500',
          Yellow: 'bg-amber-400',
        }[row.original.house] || 'bg-gray-400'
        return (
          <div className="flex items-center gap-1 text-xs text-textPrimary">
            <span className={`inline-block h-2 w-2 rounded-full ${houseColor}`} />
            {row.original.house}
          </div>
        )
      },
    },
    {
      id: 'statusBadge',
      header: 'Status',
      cell: ({ row }) => {
        const isAct = row.original.isActive
        const label = isAct ? 'Active' : (row.original.status || 'Left')
        const color = isAct ? 'green' : (label === 'Left' ? 'red' : 'gold')
        return <Badge label={label} color={color} />
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-1">
          <button
            onClick={() => handleViewStudent(row.original)}
            className="rounded-lg p-1.5 text-primary hover:bg-blue-50 cursor-pointer"
            tabIndex={0}
            aria-label={`View details of ${row.original.name}`}
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleOpenEditModal(row.original)}
            className="rounded-lg p-1.5 text-accent hover:bg-amber-50 cursor-pointer"
            tabIndex={0}
            aria-label={`Edit ${row.original.name}`}
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(row.original.id)}
            className="rounded-lg p-1.5 text-highlight hover:bg-red-50 cursor-pointer"
            tabIndex={0}
            aria-label={`Delete ${row.original.name}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ], [handleViewStudent, handleOpenEditModal, handleDelete])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader
        title="Students"
        count={filteredStudents.length}
        actions={
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-button cursor-pointer"
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
        searchPlaceholder="Search by name, GR No..."
        filters={
          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex items-center gap-1 text-xs font-semibold text-textMuted mr-1">
              <Filter className="h-3.5 w-3.5" /> Filters:
            </div>

            {/* Standard Filter */}
            <select
              value={filterStd}
              onChange={(e) => setFilterStd(e.target.value)}
              className="rounded-xl border border-border bg-white px-3 py-2 text-xs"
              aria-label="Filter by Standard"
            >
              <option value="All">All Standards</option>
              {STANDARDS.map(s => (
                <option key={s} value={s}>Class {s}</option>
              ))}
            </select>

            {/* Medium Filter */}
            <select
              value={filterMed}
              onChange={(e) => setFilterMed(e.target.value)}
              className="rounded-xl border border-border bg-white px-3 py-2 text-xs"
              aria-label="Filter by Medium"
            >
              <option value="All">All Mediums</option>
              {MEDIUMS.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            {/* Division Filter */}
            <select
              value={filterDiv}
              onChange={(e) => setFilterDiv(e.target.value)}
              className="rounded-xl border border-border bg-white px-3 py-2 text-xs"
              aria-label="Filter by Division"
            >
              <option value="All">All Divisions</option>
              {['A', 'B', 'C', 'D'].map(d => (
                <option key={d} value={d}>Div {d}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-xl border border-border bg-white px-3 py-2 text-xs"
              aria-label="Filter by Status"
            >
              <option value="All">All Statuses</option>
              {STATUS_OPTIONS.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>
        }
      />

      {/* Add / Edit Student Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={modalMode === 'create' ? 'Register New Student' : 'Edit Student Details'}
        size="lg"
      >
        <form onSubmit={handleSave} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">

          {/* Section 1: Personal Info */}
          <div className="space-y-4">
            <h4 className="border-b border-border pb-1.5 text-sm font-bold text-primary">
              Section 1: Personal Information
            </h4>
            <div className="flex items-center gap-4">
              <div className="relative">
                {formData.photoUrl ? (
                  <img
                    src={formData.photoUrl}
                    alt="Preview"
                    className="h-20 w-20 rounded-full object-cover border-2 border-border"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-section border-2 border-dashed border-border text-textMuted">
                    <Upload className="h-6 w-6" />
                  </div>
                )}
              </div>
              <div>
                <label
                  htmlFor="student-photo-upload"
                  className="cursor-pointer rounded-lg bg-primary/10 px-4 py-2 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
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
              <div>
                <label className="mb-1 block text-xs font-medium text-textMuted">Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                  required
                  placeholder="Student's Full Name"
                  className="w-full rounded-xl border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-textMuted">Date of Birth *</label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData(p => ({ ...p, dob: e.target.value }))}
                  required
                  className="w-full rounded-xl border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-textMuted">Gender *</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData(p => ({ ...p, gender: e.target.value }))}
                  required
                  className="w-full rounded-xl border border-border px-3 py-2.5 text-sm"
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-textMuted">Blood Group *</label>
                <select
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData(p => ({ ...p, bloodGroup: e.target.value }))}
                  required
                  className="w-full rounded-xl border border-border px-3 py-2.5 text-sm"
                >
                  {BLOOD_GROUPS.map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-textMuted">Aadhar Number (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 1234-5678-9012"
                  value={formData.aadhar}
                  onChange={(e) => setFormData(p => ({ ...p, aadhar: e.target.value }))}
                  className="w-full rounded-xl border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-textMuted">Residential Address *</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData(p => ({ ...p, address: e.target.value }))}
                  required
                  rows={2}
                  placeholder="Full Residential Address"
                  className="w-full rounded-xl border border-border px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Academic Info */}
          <div className="space-y-4">
            <h4 className="border-b border-border pb-1.5 text-sm font-bold text-primary">
              Section 2: Academic Information
            </h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-textMuted">Academic Year *</label>
                <select
                  value={formData.academicYearId}
                  onChange={(e) => setFormData(p => ({ ...p, academicYearId: e.target.value }))}
                  required
                  className="w-full rounded-xl border border-border px-3 py-2.5 text-sm"
                >
                  {academicYears.map(y => (
                    <option key={y.id} value={y.id}>{y.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-textMuted">GR Number * (Manual, Unique)</label>
                <input
                  type="text"
                  placeholder="e.g. GR-1004"
                  value={formData.grNumber}
                  onChange={(e) => setFormData(p => ({ ...p, grNumber: e.target.value }))}
                  required
                  className="w-full rounded-xl border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-textMuted">Roll Number *</label>
                <input
                  type="number"
                  placeholder="e.g. 5"
                  value={formData.rollNumber}
                  onChange={(e) => setFormData(p => ({ ...p, rollNumber: e.target.value }))}
                  required
                  min={1}
                  className="w-full rounded-xl border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-textMuted">Standard *</label>
                <select
                  value={formData.standard}
                  onChange={(e) => setFormData(p => ({ ...p, standard: e.target.value }))}
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
                  onChange={(e) => setFormData(p => ({ ...p, medium: e.target.value }))}
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
                  onChange={(e) => setFormData(p => ({ ...p, division: e.target.value }))}
                  required
                  disabled={availableDivisions.length === 0}
                  className="w-full rounded-xl border border-border px-3 py-2.5 text-sm disabled:opacity-60"
                >
                  {availableDivisions.length === 0 ? (
                    <option value="">No classes configured</option>
                  ) : (
                    availableDivisions.map(d => (
                      <option key={d} value={d}>Division {d}</option>
                    ))
                  )}
                </select>
                {availableDivisions.length === 0 && (
                  <p className="mt-1 text-[10px] text-highlight font-medium">⚠️ Please configure standard + medium in Classes page first.</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-textMuted">Admission Date *</label>
                <input
                  type="date"
                  value={formData.admissionDate}
                  onChange={(e) => setFormData(p => ({ ...p, admissionDate: e.target.value }))}
                  required
                  className="w-full rounded-xl border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Status Selector - Only for Edit Mode */}
              {modalMode === 'edit' && (
                <div>
                  <label className="mb-1 block text-xs font-medium text-textMuted">Status *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(p => ({ ...p, status: e.target.value }))}
                    className="w-full rounded-xl border border-border px-3 py-2.5 text-sm"
                  >
                    {STATUS_OPTIONS.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Read-Only Credentials Info Box (Live Calculation) */}
            <div className="rounded-xl border border-border bg-gray-50/50 p-4 space-y-2">
              <span className="text-xs font-bold text-textMuted block uppercase tracking-wider">Computed Credentials & Branding</span>
              <div className="grid gap-4 sm:grid-cols-3 text-xs">
                <div>
                  <span className="text-textMuted block">School Brand:</span>
                  <span className="font-semibold text-textPrimary">{computedBrand.name}</span>
                </div>
                <div>
                  <span className="text-textMuted block">Generated User ID:</span>
                  <span className="font-mono font-semibold text-textPrimary">{computedUserId || 'Pending'}</span>
                </div>
                <div>
                  <span className="text-textMuted block">Generated Password:</span>
                  <span className="font-mono font-semibold text-textPrimary">{computedPassword || 'Pending'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: House & Clubs */}
          <div className="space-y-4">
            <h4 className="border-b border-border pb-1.5 text-sm font-bold text-primary">
              Section 3: House & Extracurricular Clubs
            </h4>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-medium text-textMuted">Allotted House *</label>
                <div className="flex gap-4">
                  {HOUSES.map(h => (
                    <label key={h} className="flex items-center gap-1.5 text-sm text-textPrimary cursor-pointer">
                      <input
                        type="radio"
                        name="house"
                        value={h}
                        checked={formData.house === h}
                        onChange={(e) => setFormData(p => ({ ...p, house: e.target.value }))}
                        className="h-4 w-4 accent-primary"
                      />
                      {h}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-textMuted">Select Clubs</label>
                <div className="grid grid-cols-2 gap-2">
                  {CLUBS.map(club => (
                    <label key={club} className="flex items-center gap-1.5 text-xs text-textPrimary cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.clubs.includes(club)}
                        onChange={(e) => {
                          const checked = e.target.checked
                          setFormData(p => ({
                            ...p,
                            clubs: checked ? [...p.clubs, club] : p.clubs.filter(c => c !== club)
                          }))
                        }}
                        className="h-4 w-4 rounded border-border accent-primary"
                      />
                      {club}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Parent Details */}
          <div className="space-y-4">
            <h4 className="border-b border-border pb-1.5 text-sm font-bold text-primary">
              Section 4: Guardian & Parent Details
            </h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-textMuted">Father's Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Father's Full Name"
                  value={formData.fatherName}
                  onChange={(e) => setFormData(p => ({ ...p, fatherName: e.target.value }))}
                  className="w-full rounded-xl border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-textMuted">Father's Phone *</label>
                <input
                  type="tel"
                  required
                  placeholder="10-digit number"
                  value={formData.fatherPhone}
                  onChange={(e) => setFormData(p => ({ ...p, fatherPhone: e.target.value }))}
                  className="w-full rounded-xl border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-textMuted">Father's Occupation</label>
                <input
                  type="text"
                  placeholder="e.g. Engineer"
                  value={formData.fatherOccupation}
                  onChange={(e) => setFormData(p => ({ ...p, fatherOccupation: e.target.value }))}
                  className="w-full rounded-xl border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-textMuted">Mother's Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Mother's Full Name"
                  value={formData.motherName}
                  onChange={(e) => setFormData(p => ({ ...p, motherName: e.target.value }))}
                  className="w-full rounded-xl border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-textMuted">Mother's Phone</label>
                <input
                  type="tel"
                  placeholder="10-digit number"
                  value={formData.motherPhone}
                  onChange={(e) => setFormData(p => ({ ...p, motherPhone: e.target.value }))}
                  className="w-full rounded-xl border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-textMuted">Mother's Occupation</label>
                <input
                  type="text"
                  placeholder="e.g. Doctor"
                  value={formData.motherOccupation}
                  onChange={(e) => setFormData(p => ({ ...p, motherOccupation: e.target.value }))}
                  className="w-full rounded-xl border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-textMuted">Primary Contact Email *</label>
                <input
                  type="email"
                  required
                  placeholder="parent@example.com"
                  value={formData.parentEmail}
                  onChange={(e) => setFormData(p => ({ ...p, parentEmail: e.target.value }))}
                  className="w-full rounded-xl border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
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
              {modalMode === 'create' ? 'Register Student' : 'Save Details'}
            </motion.button>
          </div>
        </form>
      </Modal>

      {/* Credential Card Modal (On Save display) */}
      <Modal
        isOpen={showCredModal}
        onClose={() => setShowCredModal(false)}
        title="Student Registration Successful"
        size="md"
      >
        {savedCredentials && (
          <div className="space-y-6 text-center py-2">
            <div className="flex justify-center">
              <div className="rounded-full bg-green-100 p-3 text-green-600">
                <Check className="h-8 w-8" />
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-textPrimary">Student Registered Successfully!</h3>
              <p className="text-xs text-textMuted">Login credentials have been computed below.</p>
            </div>

            {/* Credential Card Display */}
            <div className="rounded-2xl border border-border bg-gray-50 p-6 space-y-4 max-w-xs mx-auto shadow-sm">
              <div className="text-left space-y-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-textMuted tracking-wider block">User ID</span>
                  <div className="flex justify-between items-center bg-white border border-border rounded-xl px-3 py-2 mt-1">
                    <span className="font-mono font-bold text-sm text-textPrimary">{savedCredentials.userId}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(savedCredentials.userId, 'user')}
                      className="text-primary hover:text-primary-dark cursor-pointer"
                      aria-label="Copy User ID"
                    >
                      {copiedField === 'user' ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-textMuted tracking-wider block">Default Password</span>
                  <div className="flex justify-between items-center bg-white border border-border rounded-xl px-3 py-2 mt-1">
                    <span className="font-mono font-bold text-sm text-textPrimary">{savedCredentials.password}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(savedCredentials.password, 'pass')}
                      className="text-primary hover:text-primary-dark cursor-pointer"
                      aria-label="Copy Password"
                    >
                      {copiedField === 'pass' ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowCredModal(false)}
                className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-white shadow-button cursor-pointer"
              >
                Close & Continue
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* View Student Details Modal */}
      <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title="Student Comprehensive Record" size="lg">
        {selectedStudent && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 border-b border-border pb-4">
              <Avatar name={selectedStudent.name} size="lg" photoUrl={selectedStudent.photoUrl} />
              <div className="text-center sm:text-left space-y-1">
                <h3 className="text-xl font-bold text-textPrimary">{selectedStudent.name}</h3>
                <div className="flex flex-wrap justify-center sm:justify-start gap-1.5 items-center text-xs text-textMuted">
                  <span>GR No: <strong className="text-textPrimary font-mono">{selectedStudent.grNumber}</strong></span>
                  <span>•</span>
                  <span>Roll No: <strong className="text-textPrimary font-mono">{selectedStudent.rollNumber}</strong></span>
                  <span>•</span>
                  <span>Class: <Badge label={`${selectedStudent.standard}-${selectedStudent.division} (${selectedStudent.medium})`} color="blue" /></span>
                </div>
                <div className="mt-1.5 flex justify-center sm:justify-start">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${getSchoolBrand(selectedStudent.standard).badgeClass}`}>
                    {getSchoolBrand(selectedStudent.standard).name}
                  </span>
                </div>
              </div>
            </div>

            {/* 2-column detailed fields */}
            <div className="grid gap-6 md:grid-cols-2 text-sm">
              {/* Personal */}
              <div className="space-y-2.5 bg-gray-50/50 p-4 rounded-xl border border-border/50">
                <h5 className="font-bold text-primary text-xs uppercase tracking-wider">Personal Information</h5>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-textMuted block">Gender</span>
                    <span className="font-semibold text-textPrimary">{selectedStudent.gender}</span>
                  </div>
                  <div>
                    <span className="text-textMuted block">Date of Birth</span>
                    <span className="font-semibold text-textPrimary">{formatDate(selectedStudent.dob)}</span>
                  </div>
                  <div>
                    <span className="text-textMuted block">Blood Group</span>
                    <span className="font-semibold text-textPrimary">{selectedStudent.bloodGroup}</span>
                  </div>
                  <div>
                    <span className="text-textMuted block">Aadhar Card</span>
                    <span className="font-semibold text-textPrimary">{selectedStudent.aadhar || '—'}</span>
                  </div>
                  <div className="col-span-2 mt-1">
                    <span className="text-textMuted block">Residential Address</span>
                    <span className="font-semibold text-textPrimary block max-w-sm whitespace-pre-wrap">{selectedStudent.address}</span>
                  </div>
                </div>
              </div>

              {/* Academic & House */}
              <div className="space-y-2.5 bg-gray-50/50 p-4 rounded-xl border border-border/50">
                <h5 className="font-bold text-primary text-xs uppercase tracking-wider">Academic & Social Details</h5>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-textMuted block">Admission Date</span>
                    <span className="font-semibold text-textPrimary">{formatDate(selectedStudent.admissionDate)}</span>
                  </div>
                  <div>
                    <span className="text-textMuted block">Allotted House</span>
                    <span className="font-semibold text-textPrimary">{selectedStudent.house} House</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-textMuted block">Enrolled Clubs</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedStudent.clubs && selectedStudent.clubs.length > 0 ? (
                        selectedStudent.clubs.map(c => <Badge key={c} label={c} color="gray" />)
                      ) : (
                        <span className="text-textMuted font-medium italic">No clubs enrolled</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-textMuted block">Enrollment Status</span>
                    <Badge
                      label={selectedStudent.isActive ? 'Active' : (selectedStudent.status || 'Left')}
                      color={selectedStudent.isActive ? 'green' : (selectedStudent.status === 'Left' ? 'red' : 'gold')}
                    />
                  </div>
                </div>
              </div>

              {/* Parents Details */}
              <div className="space-y-2.5 bg-gray-50/50 p-4 rounded-xl border border-border/50 md:col-span-2">
                <h5 className="font-bold text-primary text-xs uppercase tracking-wider">Guardian & Parent Information</h5>
                <div className="grid gap-4 sm:grid-cols-2 text-xs">
                  <div>
                    <span className="text-textMuted block">Father's Profile</span>
                    <span className="font-semibold text-textPrimary block">{selectedStudent.father?.name}</span>
                    <span className="text-textMuted block mt-0.5">Phone: <strong className="text-textPrimary">{selectedStudent.father?.phone}</strong></span>
                    {selectedStudent.father?.occupation && <span className="text-textMuted block">Occupation: <strong className="text-textPrimary">{selectedStudent.father?.occupation}</strong></span>}
                  </div>

                  <div>
                    <span className="text-textMuted block">Mother's Profile</span>
                    <span className="font-semibold text-textPrimary block">{selectedStudent.mother?.name}</span>
                    <span className="text-textMuted block mt-0.5">Phone: <strong className="text-textPrimary">{selectedStudent.mother?.phone || '—'}</strong></span>
                    {selectedStudent.mother?.occupation && <span className="text-textMuted block">Occupation: <strong className="text-textPrimary">{selectedStudent.mother?.occupation}</strong></span>}
                  </div>

                  <div className="sm:col-span-2 border-t border-border/40 pt-2">
                    <span className="text-textMuted block">Contact Email</span>
                    <span className="font-semibold text-textPrimary block">{selectedStudent.parentEmail}</span>
                  </div>
                </div>
              </div>

              {/* Credentials Section */}
              <div className="space-y-2.5 bg-primary/5 p-4 rounded-xl border border-primary/20 md:col-span-2">
                <div className="flex justify-between items-center">
                  <h5 className="font-bold text-primary text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Key className="h-3.5 w-3.5" />
                    Security Credentials
                  </h5>
                  <button
                    onClick={() => handleResetPassword(selectedStudent.id)}
                    className="text-xs font-semibold text-highlight hover:underline cursor-pointer"
                  >
                    Reset Password
                  </button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 text-xs">
                  <div>
                    <span className="text-textMuted block">User ID (Login Username)</span>
                    <span className="font-mono font-bold text-textPrimary block mt-0.5">{selectedStudent.userId}</span>
                  </div>
                  <div>
                    <span className="text-textMuted block">Password</span>
                    <span className="font-mono font-semibold text-textPrimary block mt-0.5">{selectedStudent.password || 'Student@123'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* LC Action Area */}
            <div className="border-t border-border pt-4 flex justify-between items-center">
              <div>
                {!selectedStudent.isActive && selectedStudent.lcId && (
                  <Badge label={`LC Issued: ${selectedStudent.lcId}`} color="red" />
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="rounded-xl border border-border px-5 py-2.5 text-xs font-semibold text-textMuted hover:bg-gray-50 cursor-pointer"
                >
                  Close
                </button>
                {selectedStudent.isActive && (
                  <button
                    onClick={() => {
                      setShowViewModal(false)
                      navigate(`/dashboard/admin/lc?studentId=${selectedStudent.id}`)
                    }}
                    className="flex items-center gap-1.5 rounded-xl bg-highlight px-5 py-2.5 text-xs font-semibold text-white shadow-button cursor-pointer"
                  >
                    <FileText className="h-4 w-4" />
                    Issue LC
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Student Record"
        message="Are you sure you want to delete this student record permanently? This will remove all academic history, fee records, and portal login."
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

export default Students
