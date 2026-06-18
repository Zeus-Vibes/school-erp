import { useMemo } from 'react'
import { useData } from '../../context/DataContext'
import { formatDate } from '../../utils/helpers'
import { getSchoolBrand } from '../../utils/schoolBrand'

const LCDocument = ({ student, lcData = {}, id = 'lc-document-print' }) => {
  const { settings, attendanceRecords } = useData()

  const brand = useMemo(() => {
    if (!student) return null
    return getSchoolBrand(student.standard)
  }, [student])

  // Attendance metrics
  const attendanceMetrics = useMemo(() => {
    if (!student) return { total: 0, present: 0, percentage: 0 }
    const studentRecords = attendanceRecords.filter((r) => r.studentId === student.id)
    const total = studentRecords.length || 180
    const present = studentRecords.length
      ? studentRecords.filter((r) => ['present', 'late', 'medical_leave'].includes(r.status)).length
      : 172
    const percentage = Math.round((present / total) * 100)
    return { total, present, percentage }
  }, [student, attendanceRecords])

  if (!student || !brand) return null

  const displayDate = lcData.leavingDate ? formatDate(lcData.leavingDate) : formatDate(new Date().toISOString().split('T')[0])
  const issueDate = lcData.issuedAt ? formatDate(lcData.issuedAt) : formatDate(new Date().toISOString().split('T')[0])

  return (
    <div
      id={id}
      className="mx-auto bg-amber-50/10 border-8 border-double border-primary/30 p-10 text-textPrimary shadow-xl max-w-[800px] w-full font-serif"
      style={{ minHeight: '1000px', backgroundColor: '#FAF9F6' }}
    >
      {/* Header */}
      <div className="text-center border-b border-primary/20 pb-5">
        <h1 className="text-3xl font-extrabold text-primary tracking-wide uppercase font-playfair mb-1">
          {brand.name}
        </h1>
        <p className="text-xs text-textMuted font-sans italic mb-2">
          Shiv Dhara Educational Charitable Trust
        </p>
        <p className="text-sm text-textPrimary font-sans leading-relaxed">
          {settings.address}
        </p>
        <p className="text-xs text-textMuted font-sans mt-1">
          Ph: {settings.phone} &nbsp;|&nbsp; Email: {settings.email}
        </p>
      </div>

      {/* Title */}
      <div className="text-center my-6">
        <div className="text-lg font-bold text-primary tracking-widest uppercase">
          ════════ School Leaving Certificate ════════
        </div>
      </div>

      {/* Main Body */}
      <div className="space-y-6 text-sm leading-loose">
        <div className="flex justify-between font-sans text-xs border-b border-gray-200 pb-3">
          <div>
            <span className="font-bold text-textMuted uppercase">Certificate No:</span>
            <span className="ml-1.5 font-bold text-primary text-sm">
              {lcData.lcNumber || 'LC-SBIS-2425-XXXX'}
            </span>
          </div>
          <div>
            <span className="font-bold text-textMuted uppercase">Date of Issue:</span>
            <span className="ml-1.5 font-bold text-textPrimary text-sm">
              {issueDate}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-y-4 pt-4 border-b border-gray-100 pb-6">
          <div>
            <span className="text-textMuted font-sans text-xs uppercase block">Name of Student</span>
            <strong className="text-base text-textPrimary">{student.name}</strong>
          </div>
          <div>
            <span className="text-textMuted font-sans text-xs uppercase block">GR Number / Roll Number</span>
            <strong className="text-base text-textPrimary">
              {student.grNumber || '—'} &nbsp;/&nbsp; #{student.rollNumber}
            </strong>
          </div>

          <div>
            <span className="text-textMuted font-sans text-xs uppercase block">Father's Name</span>
            <strong className="text-textPrimary">{student.father?.name || '—'}</strong>
          </div>
          <div>
            <span className="text-textMuted font-sans text-xs uppercase block">Mother's Name</span>
            <strong className="text-textPrimary">{student.mother?.name || '—'}</strong>
          </div>

          <div>
            <span className="text-textMuted font-sans text-xs uppercase block">Date of Birth</span>
            <strong className="text-textPrimary">{formatDate(student.dob)}</strong>
          </div>
          <div>
            <span className="text-textMuted font-sans text-xs uppercase block">Blood Group</span>
            <strong className="text-textPrimary">{student.bloodGroup || '—'}</strong>
          </div>

          <div>
            <span className="text-textMuted font-sans text-xs uppercase block">Class & Medium Joined</span>
            <strong className="text-textPrimary">
              Class {student.standard}{student.division} &nbsp;({student.medium})
            </strong>
          </div>
          <div>
            <span className="text-textMuted font-sans text-xs uppercase block">Date of Admission</span>
            <strong className="text-textPrimary">
              {student.admissionDate ? formatDate(student.admissionDate) : '—'}
            </strong>
          </div>

          <div className="col-span-2">
            <span className="text-textMuted font-sans text-xs uppercase block">Residential Address</span>
            <strong className="text-textPrimary font-sans">{student.address || '—'}</strong>
          </div>
        </div>

        {/* Leaving Details */}
        <div className="space-y-4 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-primary font-sans border-b border-primary/10 pb-1.5">
            Leaving Details
          </h3>

          <div className="grid grid-cols-2 gap-y-4 border-b border-gray-100 pb-6">
            <div>
              <span className="text-textMuted font-sans text-xs uppercase block">Last Class Attended</span>
              <strong className="text-textPrimary">Class {student.standard}</strong>
            </div>
            <div>
              <span className="text-textMuted font-sans text-xs uppercase block">Date of Leaving School</span>
              <strong className="text-textPrimary">{displayDate}</strong>
            </div>

            <div className="col-span-2">
              <span className="text-textMuted font-sans text-xs uppercase block">Reason for Leaving School</span>
              <strong className="text-textPrimary text-base">
                {lcData.reason === 'Other' ? lcData.otherReason : lcData.reason || '—'}
              </strong>
            </div>

            <div className="col-span-2">
              <span className="text-textMuted font-sans text-xs uppercase block">Conduct and Character</span>
              <p className="text-textPrimary font-medium italic mt-1 bg-white border border-gray-100 rounded-lg p-3 leading-relaxed">
                "{lcData.conduct || 'Good'}"
              </p>
            </div>
          </div>
        </div>

        {/* Fees and Attendance Summary */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 pt-2 font-sans text-xs font-semibold">
          <div className="rounded-xl border border-gray-200 bg-white/60 p-4 flex justify-between items-center">
            <div>
              <span className="text-textMuted block">All Dues Cleared</span>
              <span className="text-textPrimary text-sm font-bold mt-0.5 block">
                {lcData.feesCleared ? 'Yes' : 'No'}
              </span>
            </div>
            <span className={`h-3 w-3 rounded-full ${lcData.feesCleared ? 'bg-green-500' : 'bg-red-500'}`} />
          </div>

          <div className="rounded-xl border border-gray-200 bg-white/60 p-4">
            <span className="text-textMuted block">School Attendance Summary</span>
            <div className="flex gap-4 mt-1">
              <div>
                <span className="text-textMuted text-[10px] block">Present / Total</span>
                <span className="text-textPrimary text-sm font-extrabold">
                  {attendanceMetrics.present} / {attendanceMetrics.total} Days
                </span>
              </div>
              <div className="border-l border-gray-200 pl-3">
                <span className="text-textMuted text-[10px] block">Percentage</span>
                <span className="text-primary text-sm font-extrabold">
                  {attendanceMetrics.percentage}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Signature Section */}
      <div className="mt-20 flex justify-between items-end px-5 font-sans relative">
        <div className="text-center w-40">
          <div className="border-t border-textPrimary/40 pt-2 text-xs font-bold text-textPrimary">
            Registrar Signature
          </div>
        </div>

        {/* Stamp Seal Circle */}
        <div className="absolute left-1/2 bottom-2 -translate-x-1/2 flex items-center justify-center">
          <div className="w-24 h-24 rounded-full border-2 border-dashed border-primary/20 flex flex-col items-center justify-center text-[8px] text-primary/30 uppercase tracking-widest font-bold font-sans">
            <span>School Seal</span>
            <span className="mt-1 font-normal scale-75">○</span>
          </div>
        </div>

        <div className="text-center w-40">
          <div className="border-t border-textPrimary/40 pt-2 text-xs font-bold text-textPrimary">
            Principal Signature
          </div>
        </div>
      </div>
    </div>
  )
}

export default LCDocument
