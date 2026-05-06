import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Download, CreditCard } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import { useData } from '../../context/DataContext'
import { useAuth } from '../../context/AuthContext'
import { getStreamBadgeColor, formatDate } from '../../utils/helpers'
import { generateIdCardPdf } from '../../utils/idCardGenerator'
import toast from 'react-hot-toast'

const VerticalIDCard = ({ student, id = 'id-card-preview' }) => {
  if (!student) return null
  const streamColor = student.stream ? getStreamBadgeColor(student.stream) : null

  const detailRows = [
    ['Class', `${student.class}-${student.section}`],
    ['D.O.B', formatDate(student.dob)],
    ['Blood Group', student.bloodGroup],
    ["Father's Name", student.fatherName],
    ['Phone', student.phone],
  ]
  if (student.medium) {
    detailRows.push(['Medium', student.medium])
  }

  return (
    <div
      id={id}
      className="mx-auto overflow-hidden bg-white"
      style={{ width: '260px', borderRadius: '16px', border: '1.5px solid #E8E8E5' }}
    >
      {/* School Header */}
      <div style={{ backgroundColor: '#1E3A5F', padding: '14px 16px 12px', textAlign: 'center' }}>
        <p style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '1.5px', textTransform: 'uppercase', lineHeight: 1.2, fontFamily: 'Inter, sans-serif' }}>
          Shree Bala International School
        </p>
        <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', marginTop: '3px', fontFamily: 'Inter, sans-serif' }}>
          Shiv Dhara Educational Charitable Trust
        </p>
        <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', marginTop: '2px', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>
          Academic Year 2024–25
        </p>
      </div>

      {/* Accent Bar */}
      <div style={{ height: '4px', background: 'linear-gradient(to right, #C49A1A, #6B8E23, #C49A1A)' }} />

      {/* Student Photo */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 16px 8px' }}>
        {student.photoUrl ? (
          <img
            src={student.photoUrl}
            alt={student.name}
            style={{ width: '88px', height: '88px', borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(30,58,95,0.2)', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
          />
        ) : (
          <Avatar name={student.name} size="xl" className="border-[3px] border-primary/20 shadow-md" />
        )}
        {student.stream && (
          <span
            style={{ marginTop: '8px', borderRadius: '999px', padding: '2px 10px', fontSize: '10px', fontWeight: 600, fontFamily: 'Inter, sans-serif', backgroundColor: streamColor?.bg, color: streamColor?.text }}
          >
            {student.stream}
          </span>
        )}
      </div>

      {/* Student Name */}
      <div style={{ padding: '0 16px 10px', textAlign: 'center' }}>
        <p style={{ fontSize: '16px', fontWeight: 700, color: '#1A1A1A', lineHeight: 1.2, fontFamily: 'Inter, sans-serif' }}>
          {student.name}
        </p>
        <p style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px', fontFamily: 'Inter, sans-serif' }}>
          {student.id}
        </p>
      </div>

      {/* Student Details */}
      <div style={{ margin: '0 10px', borderRadius: '10px', backgroundColor: '#F4F3EF', padding: '10px 14px' }}>
        {detailRows.map(([label, value]) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '3.5px 0', fontSize: '11px', fontFamily: 'Inter, sans-serif', gap: '8px' }}>
            <span style={{ fontWeight: 600, color: '#6B7280', flexShrink: 0 }}>{label}</span>
            <span style={{ fontWeight: 500, color: '#1A1A1A', textAlign: 'right' }}>{value}</span>
          </div>
        ))}
      </div>

      {/* School Footer */}
      <div style={{ marginTop: '10px', borderTop: '1px solid #E8E8E5', padding: '10px 14px 12px', textAlign: 'center' }}>
        <p style={{ fontSize: '9px', color: '#6B7280', lineHeight: 1.5, fontFamily: 'Inter, sans-serif' }}>
          Near Suramya Heights, Eklingji Bopal Road, Sanand – Ahmedabad
        </p>
        <p style={{ fontSize: '9px', color: '#6B7280', marginTop: '2px', fontWeight: 500, fontFamily: 'Inter, sans-serif' }}>
          Ph: +91 84888 87896 &nbsp;|&nbsp; Valid Till: March 2025
        </p>
      </div>
    </div>
  )
}

const IDCards = () => {
  const { students } = useData()
  const { user, isStudent } = useAuth()
  const [isGenerating, setIsGenerating] = useState(false)

  const studentForCard = useMemo(() => {
    if (isStudent) {
      return students.find((s) => s.id === user?.id) || students[0]
    }
    return null
  }, [isStudent, user, students])

  const [selectedStudentId, setSelectedStudentId] = useState(
    studentForCard?.id || students[0]?.id || ''
  )

  const selectedStudent = useMemo(
    () => students.find((s) => s.id === (isStudent ? studentForCard?.id : selectedStudentId)),
    [students, selectedStudentId, isStudent, studentForCard]
  )

  const handleGenerate = async () => {
    if (!selectedStudent) return
    setIsGenerating(true)
    toast.loading('Generating ID Card...')
    await new Promise((resolve) => setTimeout(resolve, 500))
    await generateIdCardPdf('id-card-preview', selectedStudent.name, selectedStudent.id)
    toast.dismiss()
    toast.success(`ID Card downloaded for ${selectedStudent.name}`)
    setIsGenerating(false)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <PageHeader
        title={isStudent ? 'My ID Card' : 'ID Card Generator'}
        actions={
          isStudent ? null : (
            <div className="flex items-center gap-2 text-sm text-textMuted">
              <CreditCard className="h-4 w-4" />
              <span>{students.length} students available</span>
            </div>
          )
        }
      />

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Controls Panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            {isStudent ? (
              <>
                <p className="mb-2 text-sm font-medium text-textPrimary">Your ID Card</p>
                {selectedStudent && (
                  <div className="flex items-center gap-3 rounded-xl bg-bg p-3">
                    <Avatar name={selectedStudent.name} size="md" photoUrl={selectedStudent.photoUrl} />
                    <div>
                      <p className="text-sm font-medium text-textPrimary">{selectedStudent.name}</p>
                      <div className="flex gap-2 mt-0.5">
                        <Badge label={`${selectedStudent.class}-${selectedStudent.section}`} color="blue" />
                        {selectedStudent.stream && <Badge label={selectedStudent.stream} color="gold" />}
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <label className="mb-2 block text-sm font-medium text-textPrimary">Select Student</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm"
                  aria-label="Select student"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} — Class {s.class}-{s.section}
                    </option>
                  ))}
                </select>
                {selectedStudent && (
                  <div className="mt-4 flex items-center gap-3 rounded-xl bg-bg p-3">
                    <Avatar name={selectedStudent.name} size="md" photoUrl={selectedStudent.photoUrl} />
                    <div>
                      <p className="text-sm font-medium text-textPrimary">{selectedStudent.name}</p>
                      <div className="flex gap-2 mt-0.5">
                        <Badge label={`${selectedStudent.class}-${selectedStudent.section}`} color="blue" />
                        {selectedStudent.stream && <Badge label={selectedStudent.stream} color="gold" />}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGenerate}
              disabled={isGenerating}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 text-sm font-semibold text-white shadow-button hover:bg-accent/90 disabled:opacity-70 transition-all"
              tabIndex={0}
              aria-label="Download PDF"
            >
              <Download className="h-4 w-4" />
              {isGenerating ? 'Generating...' : 'Download PDF'}
            </motion.button>

            <button
              onClick={() => toast('Coming Soon!', { icon: '🖨️' })}
              className="mt-2 w-full rounded-xl border border-border py-3 text-sm font-medium text-textMuted hover:bg-gray-50 transition-all"
              tabIndex={0}
              aria-label="Print preview"
            >
              Print Preview
            </button>
          </div>
        </div>

        {/* Card Preview */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <p className="mb-4 text-xs font-medium uppercase tracking-wider text-textMuted">
              Live Preview — Vertical Format
            </p>
            <div className="flex justify-center">
              <VerticalIDCard student={selectedStudent} />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default IDCards
