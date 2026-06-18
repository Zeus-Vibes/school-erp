import { useState, useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import { Download, CreditCard, Layers, Users, ShieldAlert, Check } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import { useData } from '../../context/DataContext'
import { useAuth } from '../../context/AuthContext'
import { formatDate } from '../../utils/helpers'
import { getSchoolBrand } from '../../utils/schoolBrand'
import { generateIdCardPdf, generateBulkIdCards } from '../../utils/idCardGenerator'
import toast from 'react-hot-toast'

const CARD_WIDTH_MM = 63.5
const CARD_HEIGHT_MM = 100.0

// Base Card Wrapper matching exactly 63.5mm x 100mm aspect ratio (254px x 400px)
const CardWrapper = ({ id, children }) => (
  <div
    id={id}
    className="overflow-hidden bg-white text-textPrimary select-none shadow-lg relative flex flex-col justify-between"
    style={{
      width: '254px',
      height: '400px',
      minWidth: '254px',
      minHeight: '400px',
      borderRadius: '12px',
      border: '1.5px solid #E5E7EB',
      fontFamily: 'Inter, sans-serif'
    }}
  >
    {children}
  </div>
)

// Monogram fallback helper
const InitialFallback = ({ name, size = 'h-16 w-16' }) => {
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '?'
  return (
    <div className={`${size} rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary font-bold text-lg`}>
      {initials}
    </div>
  )
}

// 1. Student ID Card
const StudentIDCard = ({ student, isEnglishMedium, settings, id = 'student-card-preview' }) => {
  if (!student) return null

  const brand = getSchoolBrand(student.standard)
  // Header color: English medium -> Blue (#1A5276), Gujarati medium -> Red (#922B21)
  const headerBg = isEnglishMedium ? '#1A5276' : '#922B21'
  const houseColor = student.house === 'Red' ? '#EF4444' : student.house === 'Blue' ? '#3B82F6' : student.house === 'Green' ? '#10B981' : '#F59E0B'

  return (
    <CardWrapper id={id}>
      {/* Header */}
      <div style={{ backgroundColor: headerBg, padding: '12px 10px 8px', textAlign: 'center' }} className="text-white">
        <p className="text-[10px] font-black tracking-wider uppercase leading-tight">
          {brand.name}
        </p>
        <p className="text-[7px] text-white/60 mt-0.5">
          Shiv Dhara Educational Charitable Trust
        </p>
        <p className="text-[8px] font-semibold text-white/85 mt-1">
          Academic Year {student.academicYearId || '2024-25'}
        </p>
      </div>

      {/* Profile Photo */}
      <div className="flex flex-col items-center pt-3">
        {student.photoUrl ? (
          <img
            src={student.photoUrl}
            alt={student.name}
            className="h-16 w-16 rounded-full object-cover border-2 border-primary/20 shadow-sm"
          />
        ) : (
          <InitialFallback name={student.name} />
        )}
        <h4 className="text-xs font-extrabold text-textPrimary text-center mt-2 px-3 truncate max-w-full leading-tight">
          {student.name}
        </h4>
        <p className="text-[9px] text-textMuted font-mono">
          GR: {student.grNumber || '—'}
        </p>
      </div>

      {/* Details Container (Cream Background) */}
      <div className="mx-2.5 my-1.5 rounded-lg p-2.5 space-y-1 text-[9px]" style={{ backgroundColor: '#FDFEFE' }}>
        <div className="flex justify-between">
          <span className="text-textMuted font-medium">Roll No:</span>
          <span className="font-bold">#{student.rollNumber}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-textMuted font-medium">Class & Div:</span>
          <span className="font-bold">{student.standard} - {student.division}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-textMuted font-medium">D.O.B:</span>
          <span className="font-bold">{formatDate(student.dob)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-textMuted font-medium">Blood Group:</span>
          <span className="font-bold">{student.bloodGroup || '—'}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-textMuted font-medium">House:</span>
          <div className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: houseColor }} />
            <span className="font-bold">{student.house || '—'}</span>
          </div>
        </div>
        <div className="flex justify-between truncate">
          <span className="text-textMuted font-medium mr-1">Phone:</span>
          <span className="font-bold">{student.father?.phone || student.mother?.phone || '—'}</span>
        </div>
      </div>

      {/* Signature & Seal Footer */}
      <div className="border-t border-gray-100 px-3 py-1.5 flex justify-between items-end bg-gray-50/50">
        <div className="text-center w-24">
          <div className="h-4 border-b border-gray-300" />
          <p className="text-[7px] text-textMuted font-bold mt-0.5">Registrar</p>
        </div>
        <div className="w-8 h-8 rounded-full border border-dashed border-gray-300 flex items-center justify-center text-[5px] text-textMuted font-semibold scale-90">
          Seal
        </div>
      </div>
    </CardWrapper>
  )
}

// 2. Faculty ID Card
const FacultyIDCard = ({ teacher, settings, id = 'faculty-card-preview' }) => {
  if (!teacher) return null

  return (
    <CardWrapper id={id}>
      {/* Header */}
      <div className="border-b border-gray-100 py-3 text-center bg-white">
        <p className="text-[10px] font-black tracking-wider uppercase text-primary leading-tight">
          Shree Bala International School
        </p>
        <p className="text-[7px] text-textMuted mt-0.5">
          Shiv Dhara Educational Charitable Trust
        </p>
        <p className="text-[8px] font-bold text-accent mt-1 tracking-widest uppercase">
          FACULTY CARD
        </p>
      </div>

      {/* Profile Photo */}
      <div className="flex flex-col items-center pt-3">
        {teacher.photoUrl ? (
          <img
            src={teacher.photoUrl}
            alt={teacher.name}
            className="h-16 w-16 rounded-full object-cover border-2 border-primary/20 shadow-sm"
          />
        ) : (
          <InitialFallback name={teacher.name} />
        )}
        <h4 className="text-xs font-extrabold text-textPrimary text-center mt-2 px-3 truncate max-w-full leading-tight">
          {teacher.name}
        </h4>
        <p className="text-[9px] text-textMuted font-mono">
          Emp ID: {teacher.employeeId || '—'}
        </p>
      </div>

      {/* Details Container (Cream Background) */}
      <div className="mx-2.5 my-1.5 rounded-lg p-2.5 space-y-1 text-[9px]" style={{ backgroundColor: '#FDFEFE' }}>
        <div className="flex justify-between">
          <span className="text-textMuted font-medium">D.O.B:</span>
          <span className="font-bold">{formatDate(teacher.dob)}</span>
        </div>
        <div className="flex justify-between truncate">
          <span className="text-textMuted font-medium mr-1">Subjects:</span>
          <span className="font-bold truncate">{teacher.subjects?.join(', ') || '—'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-textMuted font-medium">Phone:</span>
          <span className="font-bold">{teacher.phone || '—'}</span>
        </div>
        <div className="flex justify-between truncate">
          <span className="text-textMuted font-medium mr-1">Email:</span>
          <span className="font-bold truncate">{teacher.email || '—'}</span>
        </div>
      </div>

      {/* Signature & Seal Footer */}
      <div className="border-t border-gray-100 px-3 py-1.5 flex justify-between items-end bg-gray-50/50">
        <div className="text-center w-24">
          <div className="h-4 border-b border-gray-300" />
          <p className="text-[7px] text-textMuted font-bold mt-0.5">Registrar</p>
        </div>
        <div className="w-8 h-8 rounded-full border border-dashed border-gray-300 flex items-center justify-center text-[5px] text-textMuted font-semibold scale-90">
          Seal
        </div>
      </div>
    </CardWrapper>
  )
}

// 3. Guardian Escort Pass
const GuardianEscortPass = ({ student, settings, id = 'escort-card-preview' }) => {
  if (!student) return null

  return (
    <CardWrapper id={id}>
      {/* Header */}
      <div style={{ backgroundColor: '#1E8449', padding: '12px 10px 8px', textAlign: 'center' }} className="text-white">
        <p className="text-[10px] font-black tracking-wider uppercase leading-tight">
          GUARDIAN ESCORT PASS
        </p>
        <p className="text-[7px] text-white/70 mt-0.5">
          Shree Bala International School
        </p>
        <p className="text-[8px] font-semibold text-white/85 mt-1">
          Valid for Academic Year {student.academicYearId || '2024-25'}
        </p>
      </div>

      {/* Student Photo & Info */}
      <div className="flex flex-col items-center pt-3">
        {student.photoUrl ? (
          <img
            src={student.photoUrl}
            alt={student.name}
            className="h-16 w-16 rounded-full object-cover border-2 border-primary/20 shadow-sm"
          />
        ) : (
          <InitialFallback name={student.name} />
        )}
        <h4 className="text-xs font-extrabold text-textPrimary text-center mt-2 px-3 truncate max-w-full leading-tight">
          {student.name}
        </h4>
        <p className="text-[9px] text-textMuted font-semibold">
          Class: {student.standard} - {student.division}
        </p>
      </div>

      {/* Details Container (Cream Background) */}
      <div className="mx-2.5 my-1.5 rounded-lg p-2.5 space-y-1.5 text-[9px]" style={{ backgroundColor: '#FDFEFE' }}>
        <div className="flex justify-between">
          <span className="text-textMuted font-medium">D.O.B:</span>
          <span className="font-bold">{formatDate(student.dob)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-textMuted font-medium">Father Name:</span>
          <span className="font-bold">{student.father?.name || '—'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-textMuted font-medium">Mother Name:</span>
          <span className="font-bold">{student.mother?.name || '—'}</span>
        </div>
      </div>

      {/* Signature & Seal Footer */}
      <div className="border-t border-gray-100 px-3 py-1.5 flex justify-between items-end bg-gray-50/50">
        <div className="text-center w-24">
          <div className="h-4 border-b border-gray-300" />
          <p className="text-[7px] text-textMuted font-bold mt-0.5">Registrar</p>
        </div>
        <div className="w-8 h-8 rounded-full border border-dashed border-gray-300 flex items-center justify-center text-[5px] text-textMuted font-semibold scale-90">
          Seal
        </div>
      </div>
    </CardWrapper>
  )
}

const IDCards = () => {
  const { students, teachers, settings } = useData()
  const { user, isStudent } = useAuth()

  // 1. Tabs state: 'student' | 'faculty' | 'escort'
  const [activeTab, setActiveTab] = useState(isStudent ? 'student' : 'student')

  // 2. Student ID Medium toggle state
  const [isEnglishMedium, setIsEnglishMedium] = useState(true)

  // 3. Admin filters
  const [selectedClassId, setSelectedClassId] = useState(students[0]?.classId || '')
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '')
  const [selectedTeacherId, setSelectedTeacherId] = useState(teachers[0]?.id || '')

  // 4. Bulk progress status
  const [isBulkGenerating, setIsBulkGenerating] = useState(false)
  const [bulkProgress, setBulkProgress] = useState(0)
  const [bulkTotal, setBulkTotal] = useState(0)

  // Find student if current user is student
  const studentForCard = useMemo(() => {
    if (isStudent) {
      return students.find((s) => s.userId === user?.userId) || students[0]
    }
    return null
  }, [isStudent, user, students])

  // Get list of unique class IDs for selection
  const uniqueClassList = useMemo(() => {
    const ids = [...new Set(students.map((s) => s.classId))]
    return ids.map((id) => {
      const match = students.find((s) => s.classId === id)
      return { id, label: `${match?.standard}${match?.division} (${match?.medium})` }
    })
  }, [students])

  // Filter students by selected class
  const classStudents = useMemo(() => {
    if (!selectedClassId) return []
    return students.filter((s) => s.classId === selectedClassId && s.isActive)
  }, [students, selectedClassId])

  // Set selected student based on class change
  useMemo(() => {
    if (classStudents.length > 0 && !isStudent) {
      const currentExists = classStudents.some((s) => s.id === selectedStudentId)
      if (!currentExists) {
        setSelectedStudentId(classStudents[0].id)
      }
    }
  }, [classStudents, selectedStudentId, isStudent])

  // Selected Student Object
  const currentStudent = useMemo(() => {
    if (isStudent && studentForCard) {
      return studentForCard
    }
    return students.find((s) => s.id === selectedStudentId)
  }, [students, selectedStudentId, isStudent, studentForCard])

  // Selected Teacher Object
  const currentTeacher = useMemo(() => {
    return teachers.find((t) => t.id === selectedTeacherId)
  }, [teachers, selectedTeacherId])

  const handleDownloadSingle = async () => {
    toast.loading('Generating Card PDF...')
    if (activeTab === 'student' && currentStudent) {
      await generateIdCardPdf('student-card-preview', currentStudent.name, currentStudent.id)
    } else if (activeTab === 'faculty' && currentTeacher) {
      await generateIdCardPdf('faculty-card-preview', currentTeacher.name, currentTeacher.id)
    } else if (activeTab === 'escort' && currentStudent) {
      await generateIdCardPdf('escort-card-preview', `Escort_${currentStudent.name}`, currentStudent.id)
    }
    toast.dismiss()
    toast.success('Card PDF downloaded')
  }

  const handleDownloadBulk = async () => {
    if (activeTab === 'student') {
      const list = classStudents.map((std) => ({
        elementId: `bulk-student-${std.id}`,
        name: std.name,
        id: std.id
      }))
      if (list.length === 0) {
        toast.error('No active students in class')
        return
      }
      setIsBulkGenerating(true)
      setBulkProgress(0)
      setBulkTotal(list.length)
      toast.loading('Starting Bulk Generation...')

      await new Promise((resolve) => setTimeout(resolve, 500))
      toast.dismiss()

      await generateBulkIdCards(list, (current, total) => {
        setBulkProgress(current)
      })

      setIsBulkGenerating(false)
      toast.success(`Generated ${list.length} student cards`)
    } else if (activeTab === 'escort') {
      const list = classStudents.map((std) => ({
        elementId: `bulk-escort-${std.id}`,
        name: std.name,
        id: std.id
      }))
      if (list.length === 0) {
        toast.error('No active students in class')
        return
      }
      setIsBulkGenerating(true)
      setBulkProgress(0)
      setBulkTotal(list.length)
      toast.loading('Starting Bulk Generation...')

      await new Promise((resolve) => setTimeout(resolve, 500))
      toast.dismiss()

      await generateBulkIdCards(list, (current, total) => {
        setBulkProgress(current)
      })

      setIsBulkGenerating(false)
      toast.success(`Generated ${list.length} escort passes`)
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <PageHeader
        title={isStudent ? 'My ID Card' : 'ID Card Overhaul'}
        actions={
          !isStudent && (
            <div className="flex items-center gap-2 text-sm text-textMuted">
              <CreditCard className="h-4 w-4" />
              <span>{students.length} students | {teachers.length} teachers available</span>
            </div>
          )
        }
      />

      {/* Main Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('student')}
          className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition-all ${activeTab === 'student' ? 'bg-primary text-white shadow-button' : 'bg-white text-textMuted border border-border hover:bg-gray-50'}`}
          tabIndex={0}
        >
          Student ID
        </button>
        {!isStudent && (
          <button
            onClick={() => setActiveTab('faculty')}
            className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition-all ${activeTab === 'faculty' ? 'bg-primary text-white shadow-button' : 'bg-white text-textMuted border border-border hover:bg-gray-50'}`}
            tabIndex={0}
          >
            Faculty ID
          </button>
        )}
        <button
          onClick={() => setActiveTab('escort')}
          className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition-all ${activeTab === 'escort' ? 'bg-primary text-white shadow-button' : 'bg-white text-textMuted border border-border hover:bg-gray-50'}`}
          tabIndex={0}
        >
          Escort Pass
        </button>
      </div>

      {/* Grid panels */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Selection panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-4">
            <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider">Card Controls</h3>

            {/* Student ID sub-toggle */}
            {activeTab === 'student' && (
              <div>
                <label className="mb-2 block text-xs font-semibold text-textMuted uppercase">Language (Theme Color)</label>
                <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setIsEnglishMedium(true)}
                    className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${isEnglishMedium ? 'bg-white text-primary shadow-sm' : 'text-textMuted hover:text-textPrimary'}`}
                  >
                    English (Blue)
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEnglishMedium(false)}
                    className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${!isEnglishMedium ? 'bg-white text-highlight shadow-sm' : 'text-textMuted hover:text-textPrimary'}`}
                  >
                    Gujarati (Red)
                  </button>
                </div>
              </div>
            )}

            {isStudent ? (
              // Student Role Display info
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-3.5 space-y-1">
                <p className="text-xs text-textMuted">Cardholder Name:</p>
                <p className="text-sm font-bold text-textPrimary">{studentForCard?.name}</p>
                <p className="text-xs text-textMuted mt-1">Class / Roll:</p>
                <p className="text-xs font-semibold text-textPrimary">
                  Class {studentForCard?.standard} - {studentForCard?.division} &nbsp;|&nbsp; #{studentForCard?.rollNumber}
                </p>
              </div>
            ) : (
              // Admin Role dropdowns
              <div className="space-y-3">
                {(activeTab === 'student' || activeTab === 'escort') && (
                  <>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-textMuted">Select Class</label>
                      <select
                        value={selectedClassId}
                        onChange={(e) => setSelectedClassId(e.target.value)}
                        className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm"
                        aria-label="Select class"
                      >
                        {uniqueClassList.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-textMuted">Select Student</label>
                      <select
                        value={selectedStudentId}
                        onChange={(e) => setSelectedStudentId(e.target.value)}
                        className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm"
                        aria-label="Select student"
                        disabled={classStudents.length === 0}
                      >
                        {classStudents.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} (Roll: #{s.rollNumber})
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                {activeTab === 'faculty' && (
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-textMuted">Select Faculty</label>
                    <select
                      value={selectedTeacherId}
                      onChange={(e) => setSelectedTeacherId(e.target.value)}
                      className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm"
                      aria-label="Select teacher"
                    >
                      {teachers.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} (Emp ID: {t.employeeId})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handleDownloadSingle}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-white shadow-button hover:bg-primary/95 transition-all mt-4"
              tabIndex={0}
              aria-label="Download Single PDF"
            >
              <Download className="h-4 w-4" /> Download PDF
            </button>

            {!isStudent && (activeTab === 'student' || activeTab === 'escort') && (
              <button
                onClick={handleDownloadBulk}
                disabled={isBulkGenerating}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/5 py-3 text-sm font-semibold text-primary hover:bg-primary/10 transition-all disabled:opacity-50"
                tabIndex={0}
                aria-label="Download All in Class"
              >
                <Download className="h-4 w-4" />
                {isBulkGenerating ? `Generating (${bulkProgress}/${bulkTotal})...` : `Bulk Download (Class)`}
              </button>
            )}
          </div>

          {/* Bulk generating progress banner */}
          {isBulkGenerating && (
            <div className="rounded-xl bg-orange-50 border border-orange-200 p-4 text-xs text-orange-800 space-y-1">
              <p className="font-bold">Generating Bulk ID Cards PDF...</p>
              <p>Please wait. Processing page {bulkProgress} of {bulkTotal}.</p>
              <div className="w-full h-1.5 rounded-full bg-gray-200 overflow-hidden mt-1.5">
                <div
                  className="h-full bg-orange-500 transition-all duration-300"
                  style={{ width: `${(bulkProgress / bulkTotal) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Live Preview Panel */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card flex flex-col items-center">
            <p className="mb-4 text-xs font-medium uppercase tracking-wider text-textMuted">
              Live Preview — {CARD_WIDTH_MM}mm × {CARD_HEIGHT_MM}mm Aspect Ratio
            </p>
            <div className="flex justify-center border border-gray-100 rounded-2xl p-6 bg-gray-50/50 shadow-inner">
              {activeTab === 'student' && currentStudent && (
                <StudentIDCard
                  student={currentStudent}
                  isEnglishMedium={isStudent ? (currentStudent.medium === 'English') : isEnglishMedium}
                  settings={settings}
                />
              )}

              {activeTab === 'faculty' && currentTeacher && (
                <FacultyIDCard teacher={currentTeacher} settings={settings} />
              )}

              {activeTab === 'escort' && currentStudent && (
                <GuardianEscortPass student={currentStudent} settings={settings} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hidden bulk rendering container for html2canvas */}
      {!isStudent && (
        <div className="absolute left-[-9999px] top-[-9999px] space-y-10 bg-white">
          {classStudents.map((std) => (
            <div key={std.id} className="p-4 bg-white border border-gray-100 inline-block">
              {activeTab === 'student' && (
                <StudentIDCard
                  id={`bulk-student-${std.id}`}
                  student={std}
                  isEnglishMedium={std.medium === 'English'}
                  settings={settings}
                />
              )}
              {activeTab === 'escort' && (
                <GuardianEscortPass
                  id={`bulk-escort-${std.id}`}
                  student={std}
                  settings={settings}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

export default IDCards
