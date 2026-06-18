import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Lock, Unlock, FileText, Download, Award } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/shared/EmptyState'
import { useData } from '../../context/DataContext'
import { useAuth } from '../../context/AuthContext'
import ReportCard from '../../components/dashboard/ReportCard'
import toast from 'react-hot-toast'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

const ReportCards = () => {
  const { user } = useAuth()
  const { exams, classes, students, examMarks, attendanceRecords } = useData()

  const [selectedExam, setSelectedExam] = useState(null)
  const [showReportModal, setShowReportModal] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  // Find current student
  const currentStudent = useMemo(() => {
    return students.find((s) => s.userId === user?.userId || s.id === user?.userId)
  }, [students, user])

  const studentClass = useMemo(() => {
    if (!currentStudent) return null
    return classes.find((c) => c.id === currentStudent.classId)
  }, [classes, currentStudent])

  // Get all exams for student's class
  const studentExams = useMemo(() => {
    if (!currentStudent) return []
    return exams.filter((e) => e.classId === currentStudent.classId)
  }, [exams, currentStudent])

  // Attendance rate for this student
  const studentAttendancePercent = useMemo(() => {
    if (!currentStudent) return 100
    const records = attendanceRecords.filter((r) => r.studentId === currentStudent.id)
    if (records.length === 0) return 100
    const present = records.filter((r) => ['present', 'late', 'medical_leave'].includes(r.status)).length
    return Math.round((present / records.length) * 100)
  }, [attendanceRecords, currentStudent])

  // Helper: check if marks are fully submitted for all subjects
  const isExamUnlocked = (exam) => {
    if (exam.status === 'Completed') return true
    return exam.subjects?.every((s) => s.marksSubmitted) || false
  }

  // Calculate student marks for a given exam
  const getStudentMarksForExam = (examId) => {
    if (!currentStudent) return []
    return examMarks.filter((m) => m.examId === examId && m.studentId === currentStudent.id)
  }

  // Calculate overall performance summary
  const getExamStats = (exam) => {
    const marks = getStudentMarksForExam(exam.id)
    const totalObtained = marks.reduce((sum, m) => sum + (m.isAbsent ? 0 : m.marks), 0)
    const totalMax = exam.subjects?.reduce((sum, s) => sum + s.maxMarks, 0) || 1
    const percentage = Math.round((totalObtained / totalMax) * 100)
    const grade = exam.gradeRanges?.find((r) => percentage >= r.min && percentage <= r.max)?.grade || 'F'

    return { percentage, grade, totalObtained }
  }

  // Calculate rank dynamically
  const getClassRank = (exam) => {
    if (!currentStudent) return '—'
    const studentScores = students
      .filter((s) => s.classId === exam.classId && s.isActive)
      .map((std) => {
        const marks = examMarks.filter((m) => m.examId === exam.id && m.studentId === std.id)
        const obt = marks.reduce((sum, m) => sum + (m.isAbsent ? 0 : m.marks), 0)
        return { studentId: std.id, score: obt }
      })
    const sorted = studentScores.sort((a, b) => b.score - a.score)
    const rankIndex = sorted.findIndex((s) => s.studentId === currentStudent.id)
    return rankIndex > -1 ? rankIndex + 1 : '—'
  }

  // Modal actions
  const handleOpenModal = (exam) => {
    setSelectedExam(exam)
    setShowReportModal(true)
  }

  // PDF report card download generator using html2canvas + jsPDF
  const handleDownloadPDF = async (targetExam) => {
    if (!currentStudent) return
    setIsDownloading(true)
    toast.loading('Generating Report Card PDF...')

    // Wait for DOM
    await new Promise((resolve) => setTimeout(resolve, 500))

    const element = document.getElementById(`report-card-capture-${targetExam.id}`)
    if (!element) {
      toast.dismiss()
      toast.error('Failed to locate report card render')
      setIsDownloading(false)
      return
    }

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#FAF9F6',
        logging: false
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const imgWidth = 210
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
      pdf.save(`ReportCard_${currentStudent.name.replace(/\s+/g, '_')}_${targetExam.name.replace(/\s+/g, '_')}.pdf`)

      toast.dismiss()
      toast.success('Report card PDF downloaded!')
    } catch (error) {
      console.error(error)
      toast.dismiss()
      toast.error('Failed to generate PDF')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <PageHeader title="My Report Cards" />

      {studentExams.length === 0 ? (
        <EmptyState
          title="No Report Cards Scheduled"
          description="Your class currently does not have any scheduled examinations."
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {studentExams.map((exam) => {
            const unlocked = isExamUnlocked(exam)

            if (!unlocked) {
              return (
                <div
                  key={exam.id}
                  className="rounded-2xl border border-border bg-gray-50/50 p-6 flex flex-col items-center justify-center text-center space-y-3 min-h-[220px]"
                >
                  <div className="p-3 bg-gray-100 rounded-full text-textMuted shadow-inner">
                    <Lock className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-textPrimary">{exam.name}</h4>
                    <p className="text-xs text-textMuted mt-1">Results Pending — Marks being entered...</p>
                  </div>
                </div>
              )
            }

            // Unlocked state calculations
            const { percentage, grade } = getExamStats(exam)
            const rank = getClassRank(exam)

            return (
              <motion.div
                key={exam.id}
                whileHover={{ y: -4 }}
                className="rounded-2xl border border-border bg-card shadow-card p-6 flex flex-col justify-between min-h-[220px] relative overflow-hidden"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-base font-bold text-textPrimary">{exam.name}</h4>
                      <p className="text-xs text-textMuted mt-0.5">{exam.academicYearId}</p>
                    </div>
                    <span className="p-2 bg-green-50 rounded-xl text-green-600 border border-green-200 shadow-sm">
                      <Unlock className="h-4 w-4" />
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 border-t border-border pt-4 text-center">
                    <div>
                      <span className="text-[10px] text-textMuted font-bold uppercase block">Percentage</span>
                      <span className="text-lg font-black text-primary mt-0.5 block">{percentage}%</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-textMuted font-bold uppercase block">Grade</span>
                      <span className="text-lg font-black text-green-600 mt-0.5 block">{grade}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-textMuted font-bold uppercase block">Class Rank</span>
                      <span className="text-lg font-black text-textPrimary mt-0.5 block">#{rank}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 border-t border-border pt-4 mt-4">
                  <button
                    onClick={() => handleOpenModal(exam)}
                    className="flex-1 rounded-xl border border-border bg-white py-2.5 text-xs font-bold text-textMuted hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5"
                    tabIndex={0}
                  >
                    <FileText className="h-3.5 w-3.5" /> View Full Card
                  </button>
                  <button
                    onClick={() => handleDownloadPDF(exam)}
                    disabled={isDownloading}
                    className="flex-1 rounded-xl bg-primary py-2.5 text-xs font-bold text-white shadow-button hover:bg-primary/95 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                    tabIndex={0}
                  >
                    <Download className="h-3.5 w-3.5" /> Download PDF
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Hidden container for rendering ReportCards for PDF capture */}
      <div className="absolute left-[-9999px] top-[-9999px] space-y-10">
        {studentExams.filter(isExamUnlocked).map((exam) => (
          <div key={`capture-${exam.id}`} id={`report-card-capture-${exam.id}`} className="bg-white p-4">
            <ReportCard
              student={currentStudent}
              exam={exam}
              studentMarks={getStudentMarksForExam(exam.id)}
              attendancePercent={studentAttendancePercent}
              teacherRemarks={exam.teacherRemarks || ''}
              principalRemarks={exam.principalRemarks || ''}
            />
          </div>
        ))}
      </div>

      {/* VIEW REPORT CARD MODAL */}
      <Modal isOpen={showReportModal} onClose={() => setShowReportModal(false)} title="Student Report Card" size="md">
        {selectedExam && currentStudent && (
          <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
            <div className="border border-border rounded-xl p-4 bg-gray-50 overflow-x-auto">
              <ReportCard
                student={currentStudent}
                exam={selectedExam}
                studentMarks={getStudentMarksForExam(selectedExam.id)}
                attendancePercent={studentAttendancePercent}
                teacherRemarks={selectedExam.teacherRemarks || ''}
                principalRemarks={selectedExam.principalRemarks || ''}
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowReportModal(false)}
                className="rounded-xl border border-border px-5 py-2.5 text-xs font-semibold text-textMuted hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => handleDownloadPDF(selectedExam)}
                className="rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-white shadow"
              >
                Download PDF
              </button>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  )
}

export default ReportCards
