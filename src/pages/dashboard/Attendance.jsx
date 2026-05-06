import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import PageHeader from '../../components/ui/PageHeader'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import StatCard from '../../components/ui/StatCard'
import { CalendarCheck, UserCheck, UserX, Clock } from 'lucide-react'
import { students, attendanceData, workingDays } from '../../data'
import { calculateAttendancePercentage } from '../../utils/helpers'
import toast from 'react-hot-toast'

const Attendance = () => {
  const [activeTab, setActiveTab] = useState('mark')
  const [selectedClass, setSelectedClass] = useState('10A')
  const [marks, setMarks] = useState({})

  const classStudents = useMemo(() => students.filter((s) => `${s.class}${s.section}` === selectedClass), [selectedClass])

  const handleMark = (studentId, status) => {
    setMarks((prev) => ({ ...prev, [studentId]: status }))
  }

  const handleMarkAllPresent = () => {
    const allPresent = {}
    classStudents.forEach((s) => { allPresent[s.id] = 'present' })
    setMarks(allPresent)
    toast.success('All marked present')
  }

  const handleSubmit = () => {
    toast.success(`Attendance submitted for ${selectedClass}!`)
    setMarks({})
  }

  const reportData = useMemo(() => students.map((student) => {
    const records = attendanceData.filter((a) => a.studentId === student.id)
    const present = records.filter((r) => r.status === 'present').length
    const absent = records.filter((r) => r.status === 'absent').length
    const late = records.filter((r) => r.status === 'late').length
    const percentage = calculateAttendancePercentage(records)
    return { ...student, present, absent, late, percentage }
  }), [])

  const totalPresent = useMemo(() => attendanceData.filter((a) => a.status === 'present').length, [])
  const totalAbsent = useMemo(() => attendanceData.filter((a) => a.status === 'absent').length, [])
  const totalLate = useMemo(() => attendanceData.filter((a) => a.status === 'late').length, [])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <PageHeader title="Attendance" />

      <div className="flex gap-2">
        {['mark', 'report'].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`rounded-xl px-5 py-2.5 text-sm font-medium transition-all ${activeTab === tab ? 'bg-primary text-white shadow-button' : 'bg-white text-textMuted border border-border hover:bg-gray-50'}`} tabIndex={0} aria-label={`${tab} tab`}>
            {tab === 'mark' ? 'Mark Attendance' : 'Attendance Report'}
          </button>
        ))}
      </div>

      {activeTab === 'mark' ? (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <select value={selectedClass} onChange={(e) => { setSelectedClass(e.target.value); setMarks({}) }} className="rounded-xl border border-border bg-white px-4 py-2.5 text-sm" aria-label="Select class">
              {['10A','10B','9A','9B','8A','8B','7A','7B','6A','6B'].map((c) => <option key={c} value={c}>Class {c}</option>)}
            </select>
            <input type="date" defaultValue="2024-04-26" className="rounded-xl border border-border bg-white px-4 py-2.5 text-sm" aria-label="Select date" />
            <motion.button whileHover={{ scale: 1.02 }} onClick={handleMarkAllPresent} className="rounded-xl bg-secondary px-4 py-2.5 text-sm font-medium text-white" tabIndex={0} aria-label="Mark all present">Mark All Present</motion.button>
          </div>

          <div className="rounded-2xl border border-border bg-card shadow-card">
            <div className="divide-y divide-border/50">
              {classStudents.map((student) => (
                <div key={student.id} className="flex items-center justify-between px-6 py-3">
                  <div className="flex items-center gap-3"><Avatar name={student.name} size="sm" /><div><p className="text-sm font-medium text-textPrimary">{student.name}</p><p className="text-xs text-textMuted">Roll: {student.roll}</p></div></div>
                  <div className="flex gap-2">
                    {[{ status: 'present', label: 'Present', active: 'bg-secondary text-white' },{ status: 'absent', label: 'Absent', active: 'bg-highlight text-white' },{ status: 'late', label: 'Late', active: 'bg-accent text-white' }].map(({ status, label, active }) => (
                      <button key={status} onClick={() => handleMark(student.id, status)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${marks[student.id] === status ? active : 'bg-gray-100 text-textMuted hover:bg-gray-200'}`} tabIndex={0} aria-label={`Mark ${student.name} ${label}`}>{label}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSubmit} className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-button" tabIndex={0} aria-label="Submit Attendance">Submit Attendance</motion.button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Working Days" value={workingDays.length} icon={CalendarCheck} color="primary" />
            <StatCard title="Total Present" value={totalPresent} icon={UserCheck} color="green" />
            <StatCard title="Total Absent" value={totalAbsent} icon={UserX} color="red" />
            <StatCard title="Total Late" value={totalLate} icon={Clock} color="gold" />
          </div>
          <div className="rounded-2xl border border-border bg-card shadow-card overflow-x-auto">
            <table className="w-full"><thead><tr className="border-b border-border bg-gray-50/50">
              {['#','Student','Class','Present','Absent','Late','%','Status'].map((h) => <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase text-textMuted">{h}</th>)}
            </tr></thead><tbody>
              {reportData.map((s, i) => (
                <tr key={s.id} className="border-b border-border/50 hover:bg-blue-50/30">
                  <td className="px-4 py-3 text-sm text-textMuted">{i + 1}</td>
                  <td className="px-4 py-3"><div className="flex items-center gap-2"><Avatar name={s.name} size="sm" /><span className="text-sm font-medium">{s.name}</span></div></td>
                  <td className="px-4 py-3 text-sm">{s.class}-{s.section}</td>
                  <td className="px-4 py-3 text-sm text-secondary font-medium">{s.present}</td>
                  <td className="px-4 py-3 text-sm text-highlight font-medium">{s.absent}</td>
                  <td className="px-4 py-3 text-sm text-accent font-medium">{s.late}</td>
                  <td className="px-4 py-3 text-sm font-bold">{s.percentage}%</td>
                  <td className="px-4 py-3"><Badge label={s.percentage >= 85 ? 'Good' : s.percentage >= 75 ? 'Average' : 'Low'} color={s.percentage >= 85 ? 'green' : s.percentage >= 75 ? 'gold' : 'red'} /></td>
                </tr>
              ))}
            </tbody></table>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default Attendance
