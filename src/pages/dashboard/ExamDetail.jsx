import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, CheckCircle2, AlertCircle, FileSpreadsheet, Lock, Unlock, User } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import Badge from '../../components/ui/Badge'
import Avatar from '../../components/ui/Avatar'
import { useData } from '../../context/DataContext'
import toast from 'react-hot-toast'

const ExamDetail = () => {
  const { examId } = useParams()
  const navigate = useNavigate()
  const { exams, classes, teachers, students, examMarks } = useData()

  const exam = useMemo(() => exams.find((e) => e.id === examId), [exams, examId])

  const classData = useMemo(() => {
    if (!exam) return null
    return classes.find((c) => c.id === exam.classId)
  }, [classes, exam])

  // Get active students for this class
  const classStudents = useMemo(() => {
    if (!exam) return []
    return students.filter((s) => s.classId === exam.classId && s.isActive)
  }, [students, exam])

  const allSubmitted = useMemo(() => {
    if (!exam || !exam.subjects) return false
    return exam.subjects.every((s) => s.marksSubmitted === true)
  }, [exam])

  const pendingCount = useMemo(() => {
    if (!exam || !exam.subjects) return 0
    return exam.subjects.filter((s) => !s.marksSubmitted).length
  }, [exam])

  if (!exam || !classData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <h2 className="text-xl font-bold text-textPrimary mb-2">Examination Not Found</h2>
        <button onClick={() => navigate('/dashboard/admin/examinations')} className="rounded-xl bg-primary px-5 py-2 text-sm text-white">
          Back to List
        </button>
      </div>
    )
  }

  const handleBulkGenerate = () => {
    toast.success('Bulk report cards compiled and queued for download!', { icon: '📄' })
  }

  const handleDownloadSingleReport = (student) => {
    toast.success(`Report Card downloaded for ${student.name}`)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/dashboard/admin/examinations')}
          className="rounded-xl border border-border bg-white p-2.5 text-textMuted hover:bg-gray-50 transition-colors"
          tabIndex={0}
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <PageHeader
          title={`Examination Details — ${exam.name}`}
          subtitle={`Class ${classData.standard}${classData.division} (${classData.medium}) | ${exam.academicYearId}`}
        />
      </div>

      {/* Lock/Unlock Banner */}
      {allSubmitted ? (
        <div className="rounded-2xl bg-green-50 border border-green-200 p-5 text-green-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-green-100 rounded-full text-green-600">
              <Unlock className="h-5 w-5" />
            </div>
            <div>
              <p className="font-extrabold text-sm text-green-900">🔓 Report Cards UNLOCKED</p>
              <p className="text-xs text-green-700 mt-0.5">All subject marks have been submitted. Students and parents can now view report cards.</p>
            </div>
          </div>
          <button
            onClick={handleBulkGenerate}
            className="rounded-xl bg-green-700 px-5 py-2.5 text-xs font-semibold text-white shadow hover:bg-green-800 transition-colors"
          >
            Bulk Generate Report Cards
          </button>
        </div>
      ) : (
        <div className="rounded-2xl bg-orange-50 border border-orange-200 p-5 text-orange-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-100 rounded-full text-orange-600">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <p className="font-extrabold text-sm text-orange-900">🔒 Report Cards LOCKED</p>
              <p className="text-xs text-orange-700 mt-0.5">Report cards are currently locked. {pendingCount} subject(s) are pending marks submission.</p>
            </div>
          </div>
          <button
            disabled
            className="rounded-xl bg-gray-200 px-5 py-2.5 text-xs font-semibold text-gray-400 cursor-not-allowed"
          >
            Bulk Generate Report Cards (Locked)
          </button>
        </div>
      )}

      {/* Subject Tracking Table */}
      <div className="rounded-2xl border border-border bg-card shadow-card p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-textPrimary">Subject Marks Completion Tracker</h3>
          <span className="text-xs font-semibold text-textMuted bg-gray-100 px-2.5 py-1 rounded-full">
            {exam.subjects?.filter((s) => s.marksSubmitted).length} / {exam.subjects?.length} Mapped Subjects Done
          </span>
        </div>

        <div className="overflow-x-auto border border-border rounded-xl">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-gray-50/50">
                <th className="px-4 py-3 text-xs font-semibold uppercase text-textMuted">Subject Name</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-textMuted">Assigned Teacher</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-textMuted">Max / Passing Marks</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-textMuted text-right">Completion Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 text-textPrimary">
              {exam.subjects?.map((sub) => {
                const teacher = teachers.find((t) => t.id === sub.teacherId)
                return (
                  <tr key={sub.name} className="hover:bg-gray-50/20">
                    <td className="px-4 py-3.5 font-bold text-primary">{sub.name}</td>
                    <td className="px-4 py-3.5 text-textMuted">{teacher?.name || 'Unassigned'}</td>
                    <td className="px-4 py-3.5 font-medium text-textMuted">
                      {sub.maxMarks} / {sub.passingMarks}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {sub.marksSubmitted ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Submitted
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-yellow-700 bg-yellow-50 px-2.5 py-1 rounded-full border border-yellow-200">
                          <AlertCircle className="h-3.5 w-3.5" /> Pending
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Class Students Report Card Overview */}
      <div className="rounded-2xl border border-border bg-card shadow-card p-6 space-y-4">
        <h3 className="text-sm font-bold text-textPrimary">Student Performance & Report Cards</h3>
        <div className="overflow-x-auto border border-border rounded-xl">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-gray-50/50">
                <th className="px-4 py-3 text-xs font-semibold uppercase text-textMuted w-12">Roll</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-textMuted">Student Name</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-textMuted">GR Number</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-textMuted text-right font-bold">Report Card</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 text-textPrimary">
              {classStudents.map((student) => {
                return (
                  <tr key={student.id} className="hover:bg-gray-50/20">
                    <td className="px-4 py-3.5 font-semibold text-textMuted">{student.rollNumber}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <Avatar name={student.name} size="sm" />
                        <span className="font-semibold">{student.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-textMuted">{student.grNumber}</td>
                    <td className="px-4 py-3.5 text-right">
                      {allSubmitted ? (
                        <button
                          onClick={() => handleDownloadSingleReport(student)}
                          className="text-xs font-bold text-primary hover:underline"
                        >
                          Download PDF
                        </button>
                      ) : (
                        <span className="text-xs text-textMuted italic flex items-center justify-end gap-1">
                          <Lock className="h-3 w-3" /> Locked
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  )
}

export default ExamDetail
