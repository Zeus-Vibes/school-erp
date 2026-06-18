import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { FileEdit, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import Avatar from '../../components/ui/Avatar'
import ConfirmDialog from '../../components/shared/ConfirmDialog'
import { useData } from '../../context/DataContext'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import EmptyState from '../../components/shared/EmptyState'

const MarksEntry = () => {
  const { user } = useAuth()
  const {
    exams,
    classes,
    teachers,
    students,
    examMarks,
    updateExam,
    addExamMark,
    updateExamMark
  } = useData()

  const currentTeacher = useMemo(() => {
    return teachers.find((t) => t.userId === user?.userId)
  }, [teachers, user])

  // --- Mapped classes and subjects for the teacher ---
  const teacherClassIds = useMemo(() => {
    if (!currentTeacher) return []
    return currentTeacher.subjectClassMapping?.map((m) => m.classId) || []
  }, [currentTeacher])

  // Filter exams that are in 'Marks Entry Open' status and belong to teacher's classes
  const availableExams = useMemo(() => {
    return exams.filter(
      (e) => e.status === 'Marks Entry Open' && teacherClassIds.includes(e.classId)
    )
  }, [exams, teacherClassIds])

  // Form State
  const [selectedExamId, setSelectedExamId] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  
  // Table marks local state
  const [studentMarks, setStudentMarks] = useState({}) // { [studentId]: { marks: '', isAbsent: false, isExempt: false } }
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)

  // Retrieve selected exam details
  const exam = useMemo(() => exams.find((e) => e.id === selectedExamId), [exams, selectedExamId])

  const classData = useMemo(() => {
    if (!exam) return null
    return classes.find((c) => c.id === exam.classId)
  }, [classes, exam])

  // Filter subjects for the selected exam that are mapped to this teacher
  const availableSubjects = useMemo(() => {
    if (!exam || !currentTeacher) return []
    return currentTeacher.subjectClassMapping
      ?.filter((m) => m.classId === exam.classId)
      ?.map((m) => m.subject) || []
  }, [exam, currentTeacher])

  // Get subject config (maxMarks, passingMarks) from the selected exam
  const subjectConfig = useMemo(() => {
    if (!exam || !selectedSubject) return null
    return exam.subjects?.find((s) => s.name === selectedSubject)
  }, [exam, selectedSubject])

  // Get students for selected exam class
  const classStudents = useMemo(() => {
    if (!exam) return []
    return students.filter((s) => s.classId === exam.classId && s.isActive)
  }, [students, exam])

  // Set default exam and subject on load
  useMemo(() => {
    if (availableExams.length > 0 && !selectedExamId) {
      setSelectedExamId(availableExams[0].id)
    }
  }, [availableExams, selectedExamId])

  useMemo(() => {
    if (availableSubjects.length > 0) {
      setSelectedSubject(availableSubjects[0])
    } else {
      setSelectedSubject('')
    }
  }, [availableSubjects])

  // Check if marks are already submitted for this subject in the selected exam
  const isSubmitted = useMemo(() => {
    return subjectConfig?.marksSubmitted || false
  }, [subjectConfig])

  // Load existing marks (Draft or Submitted)
  useMemo(() => {
    if (!selectedExamId || !selectedSubject || classStudents.length === 0) return

    const initialMarks = {}
    classStudents.forEach((std) => {
      const existing = examMarks.find(
        (m) => m.examId === selectedExamId && m.subjectName === selectedSubject && m.studentId === std.id
      )
      initialMarks[std.id] = {
        marks: existing ? String(existing.marks) : '',
        isAbsent: existing ? existing.isAbsent : false,
        isExempt: existing ? existing.isExempt : false
      }
    })
    setStudentMarks(initialMarks)
  }, [selectedExamId, selectedSubject, classStudents, examMarks])

  const handleMarkChange = (studentId, field, val) => {
    if (isSubmitted) return
    setStudentMarks((prev) => {
      const current = prev[studentId] || { marks: '', isAbsent: false, isExempt: false }
      const updated = { ...current, [field]: val }

      // Clear marks if absent or exempt checked
      if (field === 'isAbsent' && val) {
        updated.marks = '0'
        updated.isExempt = false
      } else if (field === 'isExempt' && val) {
        updated.marks = '0'
        updated.isAbsent = false
      }

      return {
        ...prev,
        [studentId]: updated
      }
    })
  }

  const findGrade = (obtained, max) => {
    if (!exam?.gradeRanges) return 'F'
    const pct = (obtained / max) * 100
    const match = exam.gradeRanges.find((r) => pct >= r.min && pct <= r.max)
    return match ? match.grade : 'F'
  }

  const handleSaveDraft = () => {
    if (!subjectConfig) return

    // Save individual student mark records
    Object.entries(studentMarks).forEach(([studentId, data]) => {
      const score = Number(data.marks) || 0
      const grade = findGrade(score, subjectConfig.maxMarks)

      const payload = {
        examId: selectedExamId,
        studentId,
        subjectName: selectedSubject,
        marks: score,
        isAbsent: data.isAbsent,
        isExempt: data.isExempt,
        grade,
        status: 'Draft',
        updatedAt: new Date().toISOString()
      }

      const existing = examMarks.find(
        (m) => m.examId === selectedExamId && m.subjectName === selectedSubject && m.studentId === studentId
      )

      if (existing) {
        updateExamMark(existing.id, payload)
      } else {
        addExamMark(payload)
      }
    })

    toast.success('Draft marks saved successfully')
  }

  const handleSubmitMarks = () => {
    // Validate that all marks are filled
    const incomplete = Object.entries(studentMarks).some(([_, data]) => {
      return !data.isAbsent && !data.isExempt && data.marks === ''
    })

    if (incomplete) {
      toast.error('Please fill in marks for all students or mark them as Absent/Exempt')
      return
    }

    setShowSubmitConfirm(true)
  }

  const handleConfirmSubmit = () => {
    // Save records as Submitted
    Object.entries(studentMarks).forEach(([studentId, data]) => {
      const score = Number(data.marks) || 0
      const grade = findGrade(score, subjectConfig.maxMarks)

      const payload = {
        examId: selectedExamId,
        studentId,
        subjectName: selectedSubject,
        marks: score,
        isAbsent: data.isAbsent,
        isExempt: data.isExempt,
        grade,
        status: 'Submitted',
        updatedAt: new Date().toISOString()
      }

      const existing = examMarks.find(
        (m) => m.examId === selectedExamId && m.subjectName === selectedSubject && m.studentId === studentId
      )

      if (existing) {
        updateExamMark(existing.id, payload)
      } else {
        addExamMark(payload)
      }
    })

    // Update Exam Subject status
    const updatedSubjects = exam.subjects.map((s) => {
      if (s.name === selectedSubject) {
        return {
          ...s,
          marksSubmitted: true,
          submittedAt: new Date().toISOString().split('T')[0]
        }
      }
      return s
    })

    updateExam(exam.id, {
      ...exam,
      subjects: updatedSubjects
    })

    setShowSubmitConfirm(false)
    toast.success(`Marks submitted and locked for ${selectedSubject}!`)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <PageHeader title="Marks Entry Portal" />

      {availableExams.length === 0 ? (
        <EmptyState
          title="No Marks Entry Pending"
          description="There are currently no active exams configured for Marks Entry in your assigned classes."
        />
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-4 bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="flex flex-col gap-1 w-60">
              <label className="text-xs font-medium text-textMuted">Select Examination</label>
              <select
                value={selectedExamId}
                onChange={(e) => setSelectedExamId(e.target.value)}
                className="rounded-xl border border-border bg-white px-4 py-2.5 text-sm"
              >
                {availableExams.map((e) => {
                  const cls = classes.find((c) => c.id === e.classId)
                  return (
                    <option key={e.id} value={e.id}>
                      {e.name} — Class {cls ? `${cls.standard}${cls.division}` : 'N/A'}
                    </option>
                  )
                })}
              </select>
            </div>

            <div className="flex flex-col gap-1 w-60">
              <label className="text-xs font-medium text-textMuted">Select Subject</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                disabled={!selectedExamId}
                className="rounded-xl border border-border bg-white px-4 py-2.5 text-sm disabled:bg-gray-100"
              >
                {availableSubjects.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            {subjectConfig && (
              <div className="ml-auto self-end flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 border border-border text-xs font-semibold text-textMuted">
                <span>Subject Max Marks: <strong className="text-textPrimary">{subjectConfig.maxMarks}</strong></span>
                <span className="text-gray-300">|</span>
                <span>Passing: <strong className="text-textPrimary">{subjectConfig.passingMarks}</strong></span>
              </div>
            )}
          </div>

          {isSubmitted && (
            <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 text-xs flex items-center gap-2 font-semibold shadow-sm">
              <ShieldCheck className="h-4 w-4 text-green-600" />
              <span>Marks have been submitted and locked for editing. Draft copies are read-only.</span>
            </div>
          )}

          {classStudents.length === 0 ? (
            <EmptyState title="No Students" description="No active students found in this class." />
          ) : (
            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border bg-gray-50/50">
                      <th className="px-6 py-4 text-xs font-semibold uppercase text-textMuted w-24">Roll No</th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase text-textMuted">Student Name</th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase text-textMuted w-48 text-center">Marks Obtained</th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase text-textMuted w-32 text-center">Absent (AB)</th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase text-textMuted w-32 text-center">Exempt (EX)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50 text-textPrimary">
                    {classStudents.map((std) => {
                      const data = studentMarks[std.id] || { marks: '', isAbsent: false, isExempt: false }
                      const inputDisabled = isSubmitted || data.isAbsent || data.isExempt

                      return (
                        <tr key={std.id} className="hover:bg-gray-50/20 transition-all">
                          <td className="px-6 py-4 font-semibold text-textMuted">{std.rollNumber}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Avatar name={std.name} size="sm" />
                              <span className="font-semibold">{std.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <input
                              type="number"
                              min={0}
                              max={subjectConfig?.maxMarks || 100}
                              value={data.marks}
                              disabled={inputDisabled}
                              onChange={(e) => handleMarkChange(std.id, 'marks', e.target.value)}
                              className="w-24 rounded-lg border border-border px-3 py-1.5 text-center text-sm font-bold bg-white disabled:bg-gray-100 disabled:text-textMuted focus:ring-1 focus:ring-primary focus:outline-none"
                              placeholder="Marks"
                            />
                          </td>
                          <td className="px-6 py-4 text-center">
                            <input
                              type="checkbox"
                              checked={data.isAbsent}
                              disabled={isSubmitted}
                              onChange={(e) => handleMarkChange(std.id, 'isAbsent', e.target.checked)}
                              className="rounded text-red-500 focus:ring-red-500 h-4 w-4 cursor-pointer disabled:cursor-not-allowed"
                            />
                          </td>
                          <td className="px-6 py-4 text-center">
                            <input
                              type="checkbox"
                              checked={data.isExempt}
                              disabled={isSubmitted}
                              onChange={(e) => handleMarkChange(std.id, 'isExempt', e.target.checked)}
                              className="rounded text-blue-500 focus:ring-blue-500 h-4 w-4 cursor-pointer disabled:cursor-not-allowed"
                            />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {!isSubmitted && (
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={handleSaveDraft}
                    className="rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-textMuted hover:bg-gray-50 transition-all"
                  >
                    Save Draft
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    onClick={handleSubmitMarks}
                    className="rounded-xl bg-highlight px-6 py-2.5 text-sm font-semibold text-white shadow-button"
                  >
                    Submit Marks
                  </motion.button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Confirm Submit Dialog */}
      <ConfirmDialog
        isOpen={showSubmitConfirm}
        title="Submit Marks"
        message="Are you sure you want to submit? Marks cannot be edited or modified after final submission."
        confirmLabel="Confirm Submission"
        isDanger={true}
        onConfirm={handleConfirmSubmit}
        onCancel={() => setShowSubmitConfirm(false)}
      />
    </motion.div>
  )
}

export default MarksEntry
