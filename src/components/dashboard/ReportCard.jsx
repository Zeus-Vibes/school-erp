import { useMemo } from 'react'
import { useData } from '../../context/DataContext'
import { getSchoolBrand } from '../../utils/schoolBrand'

const ReportCard = ({
  student,
  exam,
  studentMarks = [],
  attendancePercent = 100,
  teacherRemarks = '',
  principalRemarks = '',
  onRemarksChange = null,
  isEditable = false,
  id = 'report-card-print'
}) => {
  const { settings } = useData()

  const brand = useMemo(() => {
    if (!student) return null
    return getSchoolBrand(student.standard)
  }, [student])

  // Calculation of marks totals
  const summary = useMemo(() => {
    if (!exam || !exam.subjects) return { totalMax: 0, totalObtained: 0, percentage: 0, finalGrade: 'F', resultStatus: 'PASSED' }

    let totalObtained = 0
    let totalMax = 0
    let resultStatus = 'PASSED'

    exam.subjects.forEach((sub) => {
      const match = studentMarks.find((m) => m.subjectName === sub.name)
      const obtained = match ? (match.isAbsent ? 0 : match.marks) : 0
      const isExempt = match ? match.isExempt : false
      const statusText = match
        ? match.isAbsent
          ? 'Absent'
          : match.isExempt
          ? 'Exempt'
          : obtained >= sub.passingMarks
          ? 'Pass'
          : 'Fail'
        : 'Fail'

      if (statusText === 'Fail') {
        resultStatus = 'HELD BACK'
      }

      totalObtained += match?.isAbsent || isExempt ? 0 : obtained
      totalMax += isExempt ? 0 : sub.maxMarks
    })

    const percentage = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0
    const finalGrade = exam.gradeRanges?.find((r) => percentage >= r.min && percentage <= r.max)?.grade || 'F'

    return { totalMax, totalObtained, percentage, finalGrade, resultStatus }
  }, [exam, studentMarks])

  if (!student || !exam || !brand) return null

  return (
    <div
      id={id}
      className="mx-auto border-[10px] border-double border-primary/25 p-8 text-textPrimary shadow-xl max-w-[800px] w-full font-serif"
      style={{ minHeight: '1000px', backgroundColor: '#FAF9F6' }}
    >
      {/* Header Branding */}
      <div className="text-center border-b border-primary/20 pb-4">
        <h1 className="text-2xl font-black text-primary uppercase tracking-wide font-playfair mb-1">
          {brand.name}
        </h1>
        <p className="text-[10px] text-textMuted font-sans italic mb-1.5">
          Shiv Dhara Educational Charitable Trust
        </p>
        <p className="text-xs text-textPrimary font-sans">
          {settings.address}
        </p>
        <p className="text-[10px] text-textMuted font-sans mt-0.5">
          Ph: {settings.phone} &nbsp;|&nbsp; Email: {settings.email}
        </p>
      </div>

      <div className="text-center my-5">
        <h2 className="text-base font-extrabold text-primary tracking-widest uppercase font-sans">
          PROGRESS REPORT CARD
        </h2>
        <p className="text-xs text-textMuted font-sans mt-0.5 uppercase tracking-wider">
          {exam.name} &nbsp;({exam.academicYearId})
        </p>
      </div>

      {/* Student Details Grid */}
      <div className="grid gap-4 grid-cols-2 bg-white border border-gray-200 rounded-xl p-4 text-xs font-sans mb-6">
        <div className="space-y-1.5">
          <div>
            <span className="text-textMuted font-bold uppercase block text-[9px]">Student Name</span>
            <strong className="text-sm text-textPrimary">{student.name}</strong>
          </div>
          <div>
            <span className="text-textMuted font-bold uppercase block text-[9px]">GR Number / Roll No</span>
            <strong className="text-textPrimary text-xs">{student.grNumber || '—'} / #{student.rollNumber}</strong>
          </div>
          <div>
            <span className="text-textMuted font-bold uppercase block text-[9px]">Class & Division</span>
            <strong className="text-textPrimary text-xs">{student.standard} - {student.division} ({student.medium})</strong>
          </div>
        </div>

        <div className="space-y-1.5">
          <div>
            <span className="text-textMuted font-bold uppercase block text-[9px]">Academic Year</span>
            <strong className="text-textPrimary text-xs">{exam.academicYearId}</strong>
          </div>
          <div>
            <span className="text-textMuted font-bold uppercase block text-[9px]">Attendance summary</span>
            <strong className="text-textPrimary text-xs">{attendancePercent}% Attendance Rate</strong>
          </div>
          <div>
            <span className="text-textMuted font-bold uppercase block text-[9px]">Result Status</span>
            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${summary.resultStatus === 'PASSED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {summary.resultStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Marks Table */}
      <div className="space-y-3 mb-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-primary font-sans border-b border-primary/10 pb-1">
          Academic Performance Record
        </h3>

        <div className="overflow-hidden border border-gray-200 rounded-xl bg-white">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50 text-textMuted font-bold uppercase text-[9px]">
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3 text-center">Max Marks</th>
                <th className="px-4 py-3 text-center">Passing Marks</th>
                <th className="px-4 py-3 text-center">Marks Obtained</th>
                <th className="px-4 py-3 text-center">%</th>
                <th className="px-4 py-3 text-center">Grade</th>
                <th className="px-4 py-3 text-right">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-textPrimary">
              {exam.subjects?.map((sub) => {
                const match = studentMarks.find((m) => m.subjectName === sub.name)
                const obtained = match ? (match.isAbsent ? 0 : match.marks) : 0
                const isAbsent = match ? match.isAbsent : false
                const isExempt = match ? match.isExempt : false
                const grade = match ? match.grade : 'F'
                const pct = isExempt ? '—' : isAbsent ? '0%' : `${Math.round((obtained / sub.maxMarks) * 100)}%`
                
                let remarkText = 'Satisfactory'
                if (obtained >= 90) remarkText = 'Outstanding'
                else if (obtained >= 75) remarkText = 'Excellent'
                else if (obtained >= 60) remarkText = 'Good'
                else if (obtained < sub.passingMarks) remarkText = 'Needs Improvement'

                if (isAbsent) remarkText = 'Absent'
                if (isExempt) remarkText = 'Exempt'

                return (
                  <tr key={sub.name} className="hover:bg-gray-50/20">
                    <td className="px-4 py-2.5 font-bold text-primary">{sub.name}</td>
                    <td className="px-4 py-2.5 text-center">{isExempt ? '—' : sub.maxMarks}</td>
                    <td className="px-4 py-2.5 text-center">{isExempt ? '—' : sub.passingMarks}</td>
                    <td className="px-4 py-2.5 text-center font-bold text-sm">
                      {isAbsent ? 'AB' : isExempt ? 'EX' : obtained}
                    </td>
                    <td className="px-4 py-2.5 text-center font-medium">{pct}</td>
                    <td className="px-4 py-2.5 text-center font-extrabold text-green-700">{isExempt ? '—' : grade}</td>
                    <td className="px-4 py-2.5 text-right text-textMuted text-[10px]">{remarkText}</td>
                  </tr>
                )
              })}

              {/* Total Row */}
              <tr className="bg-gray-50/80 border-t border-gray-200 font-extrabold text-sm text-primary">
                <td className="px-4 py-3 uppercase">AGGREGATE TOTAL</td>
                <td className="px-4 py-3 text-center">{summary.totalMax}</td>
                <td className="px-4 py-3 text-center">—</td>
                <td className="px-4 py-3 text-center font-black text-base">{summary.totalObtained}</td>
                <td className="px-4 py-3 text-center">{summary.percentage}%</td>
                <td className="px-4 py-3 text-center text-green-800">{summary.finalGrade}</td>
                <td className="px-4 py-3 text-right text-[10px] text-textMuted uppercase">Overall Class Rank</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Remarks Section */}
      <div className="space-y-4 font-sans text-xs border border-gray-200 rounded-xl bg-white p-4 mb-8">
        <div>
          <label className="text-[10px] text-textMuted font-bold uppercase block mb-1">Class Teacher Remarks</label>
          {isEditable ? (
            <textarea
              value={teacherRemarks}
              onChange={(e) => onRemarksChange && onRemarksChange('teacher', e.target.value)}
              placeholder="Enter teacher comments on academic progression..."
              rows={2}
              className="w-full rounded-lg border border-border px-3 py-1.5 text-xs resize-none"
            />
          ) : (
            <p className="text-textPrimary font-medium italic bg-gray-50/50 p-2.5 border border-gray-100 rounded-lg">
              {teacherRemarks || 'Satisfactory progress and consistent performance. Hard worker.'}
            </p>
          )}
        </div>

        <div>
          <label className="text-[10px] text-textMuted font-bold uppercase block mb-1">Principal Remarks</label>
          {isEditable ? (
            <textarea
              value={principalRemarks}
              onChange={(e) => onRemarksChange && onRemarksChange('principal', e.target.value)}
              placeholder="Enter principal comments..."
              rows={2}
              className="w-full rounded-lg border border-border px-3 py-1.5 text-xs resize-none"
            />
          ) : (
            <p className="text-textPrimary font-medium italic bg-gray-50/50 p-2.5 border border-gray-100 rounded-lg">
              {principalRemarks || `Promoted to next grade. Keep up the positive attitude.`}
            </p>
          )}
        </div>
      </div>

      {/* Footer Signatures */}
      <div className="mt-14 flex justify-between items-end px-5 font-sans">
        <div className="text-center w-40">
          <div className="h-6 border-b border-gray-300" />
          <p className="text-xs font-bold text-textPrimary mt-1.5">Class Teacher</p>
        </div>

        <div className="text-center w-40">
          <div className="h-6 border-b border-gray-300" />
          <p className="text-xs font-bold text-textPrimary mt-1.5">Principal</p>
          <p className="text-[8px] text-textMuted mt-0.5">{settings.principalName}</p>
        </div>
      </div>
    </div>
  )
}

export default ReportCard
