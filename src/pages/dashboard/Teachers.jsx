import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Plus, Eye, Edit, UserX, UserCheck, Trash2, Upload, Copy, Check, Filter, Layers, BookOpen, Key, DollarSign } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import DataTable from '../../components/ui/DataTable'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import { useData } from '../../context/DataContext'
import { formatDate, formatCurrency } from '../../utils/helpers'
import { getSchoolBrand } from '../../utils/schoolBrand'
import toast from 'react-hot-toast'
import ConfirmDialog from '../../components/shared/ConfirmDialog'

const INITIAL_FORM_STATE = {
  // Personal Info
  name: '',
  dob: '',
  gender: 'Female',
  phone: '',
  email: '',
  address: '',
  photoUrl: null,

  // Professional
  qualification: '',
  experience: '',
  joiningDate: '',
  salary: '',

  // Teaching Assignment
  subjects: [], // array of strings
  subjectClassMapping: [], // array of { subject, classId }

  // Class Teacher assignment
  classTeacherOf: '', // classId or '' (None)
}

const GENDERS = ['Female', 'Male', 'Other']

const Teachers = () => {
  const {
    teachers,
    addTeacher,
    updateTeacher,
    deleteTeacher,
    classes,
    academicYears
  } = useData()

  // State
  const [showAddModal, setShowAddModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showCredModal, setShowCredModal] = useState(false)
  const [modalMode, setModalMode] = useState('create') // 'create' | 'edit'
  const [editingId, setEditingId] = useState(null)

  const [selectedTeacher, setSelectedTeacher] = useState(null)
  const [formData, setFormData] = useState(INITIAL_FORM_STATE)
  const [subjectInput, setSubjectInput] = useState('')
  const [copiedField, setCopiedField] = useState(null) // 'user' | 'pass'
  const [savedCredentials, setSavedCredentials] = useState(null) // { userId, password }
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState(null)

  const activeYear = useMemo(() => academicYears.find(y => y.isActive) || academicYears[0], [academicYears])

  // Get active year label compact
  const liveYearLabelCompact = useMemo(() => {
    if (!activeYear) return '2425'
    const parts = activeYear.label.split('-')
    if (parts.length === 2) {
      return `${parts[0].slice(-2)}${parts[1].slice(-2)}`
    }
    return activeYear.label.replace(/\D/g, '')
  }, [activeYear])

  // Auto-increment Teacher ID calculations
  const teacherNumber = useMemo(() => {
    let maxNum = 0
    teachers.forEach(t => {
      const match = t.employeeId?.match(/TCH-(\d+)/)
      if (match) {
        const num = parseInt(match[1])
        if (num > maxNum) maxNum = num
      }
    })
    return maxNum + 1
  }, [teachers])

  const computedEmployeeId = useMemo(() => {
    const numStr = String(teacherNumber).padStart(3, '0')
    return `SBIS-TCH-${numStr}`
  }, [teacherNumber])

  const computedUserId = useMemo(() => {
    const numStr = String(teacherNumber).padStart(3, '0')
    return `SBIS-TCH-${liveYearLabelCompact}-${numStr}`
  }, [teacherNumber, liveYearLabelCompact])

  const computedPassword = useMemo(() => {
    const numStr = String(teacherNumber).padStart(3, '0')
    return `SBIS@TCH${numStr}`
  }, [teacherNumber])

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

  // Subject Tags Input
  const handleAddSubjectTag = useCallback(() => {
    const val = subjectInput.trim()
    if (!val) return
    if (formData.subjects.includes(val)) {
      toast.error('Subject already added')
      return
    }
    setFormData(prev => ({
      ...prev,
      subjects: [...prev.subjects, val]
    }))
    setSubjectInput('')
  }, [subjectInput, formData.subjects])

  const handleRemoveSubjectTag = useCallback((tag) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.filter(s => s !== tag),
      // Clean up mapping if matching subject is removed
      subjectClassMapping: prev.subjectClassMapping.filter(m => m.subject !== tag)
    }))
  }, [])

  // Dynamic Mapping Handlers
  const handleAddMappingRow = useCallback(() => {
    if (formData.subjects.length === 0) {
      toast.error('Please define at least one subject in Section 3 first.')
      return
    }
    setFormData(prev => ({
      ...prev,
      subjectClassMapping: [...prev.subjectClassMapping, { subject: prev.subjects[0], classId: classes[0]?.id || '' }]
    }))
  }, [formData.subjects, classes])

  const handleRemoveMappingRow = useCallback((index) => {
    setFormData(prev => ({
      ...prev,
      subjectClassMapping: prev.subjectClassMapping.filter((_, i) => i !== index)
    }))
  }, [])

  const handleMappingChange = useCallback((index, field, value) => {
    setFormData(prev => {
      const updated = [...prev.subjectClassMapping]
      updated[index] = { ...updated[index], [field]: value }
      return { ...prev, subjectClassMapping: updated }
    })
  }, [])

  // Copy helper
  const handleCopy = useCallback((text, field) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopiedField(null), 2000)
  }, [])

  // Delete Action
  const handleDelete = useCallback((id) => {
    setDeleteTargetId(id)
    setShowDeleteConfirm(true)
  }, [])

  const handleConfirmDelete = useCallback(() => {
    if (deleteTargetId) {
      deleteTeacher(deleteTargetId)
      toast.success('Teacher deleted successfully')
    }
    setShowDeleteConfirm(false)
    setDeleteTargetId(null)
  }, [deleteTeacher, deleteTargetId])

  // Deactivate / Activate Toggle Action
  const handleToggleStatus = useCallback((teacher) => {
    const isCurrentlyActive = teacher.isActive !== false
    const newStatus = !isCurrentlyActive
    updateTeacher(teacher.id, { isActive: newStatus })
    toast.success(`Teacher account ${newStatus ? 'Activated' : 'Deactivated'} successfully`)
  }, [updateTeacher])

  // Open Create
  const handleOpenAddModal = useCallback(() => {
    setModalMode('create')
    setEditingId(null)
    setFormData({
      ...INITIAL_FORM_STATE,
      joiningDate: new Date().toISOString().split('T')[0],
    })
    setSubjectInput('')
    setShowAddModal(true)
  }, [])

  // Open Edit
  const handleOpenEditModal = useCallback((teacher) => {
    setModalMode('edit')
    setEditingId(teacher.id)
    setFormData({
      name: teacher.name || '',
      dob: teacher.dob || '',
      gender: teacher.gender || 'Female',
      phone: teacher.phone || '',
      email: teacher.email || '',
      address: teacher.address || '',
      photoUrl: teacher.photoUrl || null,

      qualification: teacher.qualification || '',
      experience: teacher.experience || '',
      joiningDate: teacher.joiningDate || '',
      salary: teacher.salary || '',

      subjects: teacher.subjects ? [...teacher.subjects] : [],
      subjectClassMapping: teacher.subjectClassMapping ? [...teacher.subjectClassMapping] : [],
      classTeacherOf: teacher.classTeacherOf || '',
    })
    setSubjectInput('')
    setShowAddModal(true)
  }, [])

  // Save handler
  const handleSave = useCallback((event) => {
    event.preventDefault()

    // Validate email uniqueness (excluding current)
    const duplicateEmail = teachers.some(
      t => t.email.toLowerCase().trim() === formData.email.toLowerCase().trim() && t.id !== editingId
    )
    if (duplicateEmail) {
      toast.error('Email address must be unique!')
      return
    }

    const finalTeacherData = {
      name: formData.name,
      dob: formData.dob,
      gender: formData.gender,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      photoUrl: formData.photoUrl,

      qualification: formData.qualification,
      experience: parseInt(formData.experience) || 0,
      joiningDate: formData.joiningDate,
      salary: parseFloat(formData.salary) || 0,

      subjects: formData.subjects,
      subjectClassMapping: formData.subjectClassMapping,
      classTeacherOf: formData.classTeacherOf || null,
    }

    if (modalMode === 'create') {
      const generatedUid = computedUserId
      const generatedPwd = computedPassword
      const generatedEmp = computedEmployeeId

      addTeacher({
        ...finalTeacherData,
        id: generatedUid,
        employeeId: generatedEmp,
        userId: generatedUid,
        password: generatedPwd,
        isActive: true
      })

      // Show credentials
      setSavedCredentials({
        userId: generatedUid,
        password: generatedPwd
      })
      setShowCredModal(true)
    } else {
      updateTeacher(editingId, finalTeacherData)
      toast.success('Teacher records updated successfully')
    }

    setShowAddModal(false)
    setFormData(INITIAL_FORM_STATE)
  }, [modalMode, formData, teachers, editingId, addTeacher, updateTeacher, computedUserId, computedPassword, computedEmployeeId])

  // View details
  const handleViewTeacher = useCallback((teacher) => {
    setSelectedTeacher(teacher)
    setShowViewModal(true)
  }, [])

  // Table columns definition
  const columns = useMemo(() => [
    {
      accessorKey: 'employeeId',
      header: 'Employee ID',
      cell: ({ row }) => <span className="font-semibold text-textPrimary">{row.original.employeeId}</span>,
    },
    {
      accessorKey: 'name',
      header: 'Teacher',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Avatar name={row.original.name} size="sm" photoUrl={row.original.photoUrl} />
          <div>
            <p className="text-sm font-medium text-textPrimary">{row.original.name}</p>
            <p className="text-[10px] text-textMuted">{row.original.email}</p>
          </div>
        </div>
      ),
    },
    {
      id: 'subjectsList',
      header: 'Subjects',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {row.original.subjects && row.original.subjects.length > 0 ? (
            row.original.subjects.map(sub => (
              <Badge key={sub} label={sub} color="blue" className="text-[10px] py-0 px-2" />
            ))
          ) : (
            <span className="text-xs text-textMuted italic">None</span>
          )}
        </div>
      ),
    },
    {
      id: 'classTeacherBadge',
      header: 'Class Teacher Of',
      cell: ({ row }) => {
        const cls = classes.find(c => c.id === row.original.classTeacherOf)
        if (!cls) return <span className="text-xs text-textMuted italic">None</span>
        const brand = getSchoolBrand(cls.standard)
        return (
          <div className="space-y-1">
            <Badge label={`${cls.standard}-${cls.division} (${cls.medium})`} color="green" />
            <span className={`block text-[9px] font-semibold ${brand.badgeClass} rounded px-1.5 py-0.2 w-max`}>
              {brand.name}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: 'experience',
      header: 'Experience',
      cell: ({ row }) => <span className="text-sm text-textPrimary">{row.original.experience} Years</span>,
    },
    {
      id: 'statusBadge',
      header: 'Status',
      cell: ({ row }) => {
        const active = row.original.isActive !== false
        return <Badge label={active ? 'Active' : 'Inactive'} color={active ? 'green' : 'red'} />
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-1">
          <button
            onClick={() => handleViewTeacher(row.original)}
            className="rounded-lg p-1.5 text-primary hover:bg-blue-50 cursor-pointer"
            tabIndex={0}
            aria-label={`View teacher details for ${row.original.name}`}
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
            onClick={() => handleToggleStatus(row.original)}
            className={`rounded-lg p-1.5 cursor-pointer ${row.original.isActive !== false ? 'text-highlight hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
            tabIndex={0}
            aria-label={row.original.isActive !== false ? `Deactivate ${row.original.name}` : `Activate ${row.original.name}`}
          >
            {row.original.isActive !== false ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
          </button>
        </div>
      ),
    },
  ], [classes, handleViewTeacher, handleOpenEditModal, handleToggleStatus])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader
        title="Teachers"
        count={teachers.length}
        actions={
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-button cursor-pointer"
            tabIndex={0}
            aria-label="Add Teacher"
          >
            <Plus className="h-4 w-4" />Add Teacher
          </motion.button>
        }
      />

      <DataTable data={teachers} columns={columns} searchPlaceholder="Search by name, ID, qualification..." />

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={modalMode === 'create' ? 'Register New Teacher' : 'Edit Teacher Profile'}
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
                  htmlFor="teacher-photo-upload"
                  className="cursor-pointer rounded-lg bg-primary/10 px-4 py-2 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
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
              <div>
                <label className="mb-1 block text-xs font-medium text-textMuted">Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                  required
                  placeholder="Teacher's Full Name"
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
                  {GENDERS.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-textMuted">Contact Phone *</label>
                <input
                  type="tel"
                  placeholder="10-digit number"
                  value={formData.phone}
                  onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                  required
                  className="w-full rounded-xl border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-textMuted">Email Address *</label>
                <input
                  type="email"
                  placeholder="teacher@school.com"
                  value={formData.email}
                  onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                  required
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

          {/* Section 2: Professional Details */}
          <div className="space-y-4">
            <h4 className="border-b border-border pb-1.5 text-sm font-bold text-primary">
              Section 2: Professional Details & Salary
            </h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-textMuted">Qualification *</label>
                <input
                  type="text"
                  placeholder="e.g. M.Sc Mathematics, B.Ed"
                  value={formData.qualification}
                  onChange={(e) => setFormData(p => ({ ...p, qualification: e.target.value }))}
                  required
                  className="w-full rounded-xl border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-textMuted">Experience (Years) *</label>
                <input
                  type="number"
                  placeholder="e.g. 5"
                  value={formData.experience}
                  onChange={(e) => setFormData(p => ({ ...p, experience: e.target.value }))}
                  required
                  min={0}
                  className="w-full rounded-xl border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-textMuted">Joining Date *</label>
                <input
                  type="date"
                  value={formData.joiningDate}
                  onChange={(e) => setFormData(p => ({ ...p, joiningDate: e.target.value }))}
                  required
                  className="w-full rounded-xl border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-textMuted">Monthly Salary (Stored Privately) *</label>
                <input
                  type="number"
                  placeholder="e.g. 45000"
                  value={formData.salary}
                  onChange={(e) => setFormData(p => ({ ...p, salary: e.target.value }))}
                  required
                  min={1}
                  className="w-full rounded-xl border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Read-Only computed credentials (Live Calculation) */}
            {modalMode === 'create' && (
              <div className="rounded-xl border border-border bg-gray-50/50 p-4 space-y-2">
                <span className="text-xs font-bold text-textMuted block uppercase tracking-wider">Computed Credentials & Employee ID</span>
                <div className="grid gap-4 sm:grid-cols-3 text-xs">
                  <div>
                    <span className="text-textMuted block">Employee ID:</span>
                    <span className="font-mono font-bold text-textPrimary">{computedEmployeeId}</span>
                  </div>
                  <div>
                    <span className="text-textMuted block">Login User ID:</span>
                    <span className="font-mono font-bold text-textPrimary">{computedUserId}</span>
                  </div>
                  <div>
                    <span className="text-textMuted block">Login Password:</span>
                    <span className="font-mono font-bold text-textPrimary">{computedPassword}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Teaching Assignment */}
          <div className="space-y-4">
            <h4 className="border-b border-border pb-1.5 text-sm font-bold text-primary flex justify-between items-center">
              <span>Section 3: Teaching Assignments</span>
            </h4>

            {/* Subjects Tags Input */}
            <div className="space-y-2 bg-gray-50/40 p-4 rounded-xl border border-border/50">
              <label className="block text-xs font-semibold text-textMuted">Define Taught Subjects *</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type subject (e.g. Science) and click Add"
                  value={subjectInput}
                  onChange={(e) => setSubjectInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddSubjectTag()
                    }
                  }}
                  className="flex-1 rounded-lg border border-border bg-white px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={handleAddSubjectTag}
                  className="rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-white hover:bg-primary-dark transition-colors cursor-pointer"
                >
                  Add
                </button>
              </div>

              {/* Badges list */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {formData.subjects.length === 0 ? (
                  <span className="text-xs text-textMuted italic">No subjects added yet.</span>
                ) : (
                  formData.subjects.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveSubjectTag(tag)}
                        className="font-bold text-blue-500 hover:text-blue-800 cursor-pointer text-[10px] ml-1"
                        aria-label={`Remove subject ${tag}`}
                      >
                        ×
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Subject-Class mapping table */}
            <div className="space-y-2 bg-gray-50/40 p-4 rounded-xl border border-border/50">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-textMuted">Subject-Class Mappings</label>
                <button
                  type="button"
                  onClick={handleAddMappingRow}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline cursor-pointer"
                >
                  <Plus className="h-3 w-3" /> Add Mapping
                </button>
              </div>

              {formData.subjectClassMapping.length === 0 ? (
                <div className="text-center p-3 rounded-lg border border-dashed border-border/80 text-xs text-textMuted bg-white">
                  No class mappings defined. Click "Add Mapping" above.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
                  {formData.subjectClassMapping.map((map, index) => (
                    <div key={index} className="flex gap-2 items-center bg-white p-2 rounded-lg border border-border">
                      {/* Subject selection */}
                      <div className="flex-1">
                        <select
                          value={map.subject}
                          onChange={(e) => handleMappingChange(index, 'subject', e.target.value)}
                          className="w-full rounded-md border border-border px-2 py-1 text-xs"
                          aria-label="Mapping Subject"
                        >
                          {formData.subjects.map(sub => (
                            <option key={sub} value={sub}>{sub}</option>
                          ))}
                        </select>
                      </div>

                      {/* Class selection */}
                      <div className="flex-1">
                        <select
                          value={map.classId}
                          onChange={(e) => handleMappingChange(index, 'classId', e.target.value)}
                          className="w-full rounded-md border border-border px-2 py-1 text-xs"
                          aria-label="Mapping Class"
                        >
                          {classes.map(c => {
                            const brand = getSchoolBrand(c.standard)
                            return (
                              <option key={c.id} value={c.id}>
                                Std {c.standard}-{c.division} ({c.medium}) - {brand.name.split(' ')[0]}
                              </option>
                            )
                          })}
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveMappingRow(index)}
                        className="text-highlight hover:text-red-700 p-1 cursor-pointer"
                        aria-label="Remove mapping"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Class Teacher assignment */}
          <div className="space-y-4">
            <h4 className="border-b border-border pb-1.5 text-sm font-bold text-primary">
              Section 4: Class Teacher Assignment
            </h4>
            <div>
              <label className="mb-1 block text-xs font-medium text-textMuted">Class Teacher Of</label>
              <select
                value={formData.classTeacherOf}
                onChange={(e) => setFormData(p => ({ ...p, classTeacherOf: e.target.value }))}
                className="w-full rounded-xl border border-border px-3 py-2.5 text-sm"
              >
                <option value="">None (Subject Teacher Only)</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>
                    Class {c.standard}-{c.division} ({c.medium})
                  </option>
                ))}
              </select>
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
              {modalMode === 'create' ? 'Register Teacher' : 'Save Profiles'}
            </motion.button>
          </div>
        </form>
      </Modal>

      {/* Credentials display modal */}
      <Modal
        isOpen={showCredModal}
        onClose={() => setShowCredModal(false)}
        title="Teacher Registration Successful"
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
              <h3 className="text-lg font-bold text-textPrimary">Teacher Registered Successfully!</h3>
              <p className="text-xs text-textMuted">Security access credentials have been initialized.</p>
            </div>

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
                  <span className="text-[10px] uppercase font-bold text-textMuted tracking-wider block">Password</span>
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

      {/* View Modal */}
      <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title="Teacher Comprehensive Profile" size="lg">
        {selectedTeacher && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 border-b border-border pb-4">
              <Avatar name={selectedTeacher.name} size="lg" photoUrl={selectedTeacher.photoUrl} />
              <div className="text-center sm:text-left space-y-1">
                <h3 className="text-xl font-bold text-textPrimary">{selectedTeacher.name}</h3>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2 items-center text-xs text-textMuted">
                  <span>Employee ID: <strong className="text-textPrimary font-mono">{selectedTeacher.employeeId}</strong></span>
                  <span>•</span>
                  <span>Qualification: <strong className="text-textPrimary">{selectedTeacher.qualification}</strong></span>
                </div>
                <div className="mt-1 flex justify-center sm:justify-start">
                  <Badge
                    label={selectedTeacher.isActive !== false ? 'Active Faculty' : 'Inactive Faculty'}
                    color={selectedTeacher.isActive !== false ? 'green' : 'red'}
                  />
                </div>
              </div>
            </div>

            {/* 2-column detailed fields */}
            <div className="grid gap-6 md:grid-cols-2 text-sm">

              {/* Personal */}
              <div className="space-y-2.5 bg-gray-50/50 p-4 rounded-xl border border-border/50">
                <h5 className="font-bold text-primary text-xs uppercase tracking-wider">Personal Details</h5>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-textMuted block">Gender</span>
                    <span className="font-semibold text-textPrimary">{selectedTeacher.gender || 'Female'}</span>
                  </div>
                  <div>
                    <span className="text-textMuted block">Date of Birth</span>
                    <span className="font-semibold text-textPrimary">{formatDate(selectedTeacher.dob)}</span>
                  </div>
                  <div>
                    <span className="text-textMuted block">Contact Number</span>
                    <span className="font-semibold text-textPrimary">{selectedTeacher.phone || '—'}</span>
                  </div>
                  <div>
                    <span className="text-textMuted block">Email Address</span>
                    <span className="font-semibold text-textPrimary block truncate">{selectedTeacher.email}</span>
                  </div>
                  <div className="col-span-2 mt-1">
                    <span className="text-textMuted block">Residential Address</span>
                    <span className="font-semibold text-textPrimary block max-w-sm whitespace-pre-wrap">{selectedTeacher.address}</span>
                  </div>
                </div>
              </div>

              {/* Professional */}
              <div className="space-y-2.5 bg-gray-50/50 p-4 rounded-xl border border-border/50">
                <h5 className="font-bold text-primary text-xs uppercase tracking-wider">Employment & Salary</h5>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-textMuted block">Experience (Years)</span>
                    <span className="font-semibold text-textPrimary">{selectedTeacher.experience} Years</span>
                  </div>
                  <div>
                    <span className="text-textMuted block">Joining Date</span>
                    <span className="font-semibold text-textPrimary">{formatDate(selectedTeacher.joiningDate)}</span>
                  </div>

                  {/* Salary Visibility Rule: ONLY visible inside details modal */}
                  <div className="col-span-2 pt-1.5 border-t border-border/40 flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <div>
                      <span className="text-textMuted block">Monthly Base Salary</span>
                      <span className="font-extrabold text-sm text-green-700 font-inter">
                        {formatCurrency(selectedTeacher.salary || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assignments & Mapping */}
              <div className="space-y-2.5 bg-gray-50/50 p-4 rounded-xl border border-border/50 md:col-span-2">
                <h5 className="font-bold text-primary text-xs uppercase tracking-wider">Teaching Assignments</h5>
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-textMuted block mb-1">Subjects Handled:</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedTeacher.subjects && selectedTeacher.subjects.length > 0 ? (
                        selectedTeacher.subjects.map(s => <Badge key={s} label={s} color="blue" />)
                      ) : (
                        <span className="text-textMuted font-medium italic">None</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-textMuted block mb-1">Class Mappings:</span>
                    {selectedTeacher.subjectClassMapping && selectedTeacher.subjectClassMapping.length > 0 ? (
                      <div className="grid gap-2 sm:grid-cols-2 mt-1.5">
                        {selectedTeacher.subjectClassMapping.map((m, idx) => {
                          const clsObj = classes.find(c => c.id === m.classId)
                          const clsLabel = clsObj ? `${clsObj.standard}-${clsObj.division} (${clsObj.medium})` : 'Unknown Class'
                          const schoolBrand = clsObj ? getSchoolBrand(clsObj.standard).name : ''
                          return (
                            <div key={idx} className="bg-white border border-border/80 rounded-xl p-2.5 flex justify-between items-center shadow-sm">
                              <div>
                                <span className="font-bold text-textPrimary block">{m.subject}</span>
                                <span className="text-[10px] text-textMuted block mt-0.5">{schoolBrand}</span>
                              </div>
                              <Badge label={clsLabel} color="green" />
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <span className="text-textMuted font-medium italic">No class mappings configured.</span>
                    )}
                  </div>

                  <div className="border-t border-border/40 pt-2.5">
                    <span className="text-textMuted block">Assigned Class Teacher Of:</span>
                    {selectedTeacher.classTeacherOf ? (
                      (() => {
                        const targetClass = classes.find(c => c.id === selectedTeacher.classTeacherOf)
                        if (!targetClass) return <span className="text-textPrimary font-semibold">Unknown class id: {selectedTeacher.classTeacherOf}</span>
                        const brand = getSchoolBrand(targetClass.standard)
                        return (
                          <div className="mt-1.5 flex items-center gap-2">
                            <Badge label={`Class ${targetClass.standard}-${targetClass.division} (${targetClass.medium})`} color="green" />
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${brand.badgeClass}`}>
                              {brand.name}
                            </span>
                          </div>
                        )
                      })()
                    ) : (
                      <span className="text-textMuted font-medium italic">Not assigned as Class Teacher</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Login IDs */}
              <div className="space-y-2.5 bg-primary/5 p-4 rounded-xl border border-primary/20 md:col-span-2">
                <h5 className="font-bold text-primary text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Key className="h-3.5 w-3.5" />
                  Faculty Portal Access Credentials
                </h5>
                <div className="grid gap-4 sm:grid-cols-2 text-xs">
                  <div>
                    <span className="text-textMuted block">Portal Username / User ID</span>
                    <span className="font-mono font-bold text-textPrimary block mt-0.5">{selectedTeacher.userId}</span>
                  </div>
                  <div>
                    <span className="text-textMuted block">Current Password</span>
                    <span className="font-mono font-semibold text-textPrimary block mt-0.5">{selectedTeacher.password || 'Teacher@123'}</span>
                  </div>
                </div>
              </div>

            </div>

            <div className="border-t border-border pt-4 flex justify-end">
              <button
                onClick={() => setShowViewModal(false)}
                className="rounded-xl border border-border px-5 py-2.5 text-xs font-semibold text-textMuted hover:bg-gray-50 cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Teacher"
        message="Are you sure you want to delete this teacher permanently? All subject and class mappings will be removed."
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

export default Teachers
