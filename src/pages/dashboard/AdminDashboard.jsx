import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Users, GraduationCap, IndianRupee, CalendarCheck, Plus, CheckCircle, Megaphone, ArrowRight } from 'lucide-react'
import StatCard from '../../components/ui/StatCard'
import FeeBarChart from '../../components/charts/FeeBarChart'
import AttendanceDonut from '../../components/charts/AttendanceDonut'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { feesData, attendanceData, notices } from '../../data'
import { formatCurrency, formatDate, getGreeting, getPriorityColor, getCategoryColor } from '../../utils/helpers'
import toast from 'react-hot-toast'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { students, teachers } = useData()

  const totalFeeCollected = useMemo(
    () => feesData.filter((f) => f.paid).reduce((sum, f) => sum + f.amount, 0),
    []
  )
  const attendanceSummary = useMemo(() => {
    const present = attendanceData.filter((a) => a.status === 'present').length
    const absent = attendanceData.filter((a) => a.status === 'absent').length
    const late = attendanceData.filter((a) => a.status === 'late').length
    return { present, absent, late }
  }, [])
  const avgAttendance = useMemo(
    () => Math.round(((attendanceSummary.present + attendanceSummary.late) / attendanceData.length) * 100),
    [attendanceSummary]
  )

  const feeChartData = useMemo(() => {
    const classes = ['6', '7', '8', '9', '10']
    return classes.map((cls) => {
      const classRecords = feesData.filter((f) => f.class.startsWith(cls))
      return {
        class: `Class ${cls}`,
        collected: classRecords.filter((f) => f.paid).reduce((s, f) => s + f.amount, 0),
        pending: classRecords.filter((f) => !f.paid).reduce((s, f) => s + f.amount, 0),
      }
    })
  }, [])

  const recentPayments = useMemo(() => feesData.filter((f) => f.paid).slice(0, 5), [])
  const pendingDues = useMemo(() => feesData.filter((f) => !f.paid), [])
  const latestNotices = notices.slice(0, 3)

  const quickActions = [
    { icon: Plus, label: 'Add Student', color: 'bg-blue-50 text-primary', action: () => navigate('/dashboard/students') },
    { icon: CheckCircle, label: 'Mark Attendance', color: 'bg-green-50 text-secondary', action: () => navigate('/dashboard/attendance') },
    { icon: IndianRupee, label: 'Collect Fee', color: 'bg-amber-50 text-accent', action: () => navigate('/dashboard/fees') },
    { icon: Megaphone, label: 'Add Notice', color: 'bg-red-50 text-highlight', action: () => navigate('/dashboard/notices') },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-primary via-primary/90 to-primary/80 p-6 text-white">
        <h1 className="font-playfair text-2xl font-bold">{getGreeting()}, {user?.name || 'Admin'}! 👋</h1>
        <p className="mt-1 text-sm text-white/70">Welcome to the School ERP Admin Panel. Here&apos;s your overview for today.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Students" value={students.length} icon={Users} color="primary" delay={0} trend={5} />
        <StatCard title="Total Teachers" value={teachers.length} icon={GraduationCap} color="green" delay={1} trend={2} />
        <StatCard title="Fees Collected" value={formatCurrency(totalFeeCollected)} icon={IndianRupee} color="gold" delay={2} />
        <StatCard title="Avg Attendance" value={`${avgAttendance}%`} icon={CalendarCheck} color="red" delay={3} trend={-3} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h3 className="mb-4 text-base font-semibold text-textPrimary">Fee Collection Overview</h3>
          <FeeBarChart data={feeChartData} />
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h3 className="mb-4 text-base font-semibold text-textPrimary">Overall Attendance — April 2024</h3>
          <AttendanceDonut present={attendanceSummary.present} absent={attendanceSummary.absent} late={attendanceSummary.late} />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-card">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h3 className="text-base font-semibold text-textPrimary">Recent Fee Payments</h3>
          <button onClick={() => navigate('/dashboard/fees')} className="text-xs font-medium text-primary hover:underline" tabIndex={0} aria-label="View all fees">View All →</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-gray-50/50">
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-textMuted">#</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-textMuted">Student</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-textMuted">Class</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-textMuted">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-textMuted">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-textMuted">Method</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-textMuted">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentPayments.map((fee, index) => (
                <tr key={fee.id} className="border-b border-border/50 hover:bg-blue-50/30 transition-colors">
                  <td className="px-6 py-3 text-sm text-textMuted">{index + 1}</td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar name={fee.studentName} size="sm" />
                      <span className="text-sm font-medium text-textPrimary">{fee.studentName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-sm text-textMuted">{fee.class}</td>
                  <td className="px-6 py-3 text-sm font-medium text-textPrimary">{formatCurrency(fee.amount)}</td>
                  <td className="px-6 py-3 text-sm text-textMuted">{formatDate(fee.paymentDate)}</td>
                  <td className="px-6 py-3 text-sm text-textMuted">{fee.method}</td>
                  <td className="px-6 py-3"><Badge label="Paid" color="green" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {quickActions.map(({ icon: Icon, label, color, action }) => (
          <motion.button
            key={label}
            whileHover={{ y: -2, boxShadow: '0 4px 20px rgba(30,58,95,0.12)' }}
            whileTap={{ scale: 0.98 }}
            onClick={action}
            className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border bg-card p-6 hover:border-primary/30 transition-all"
            tabIndex={0}
            aria-label={label}
          >
            <div className={`rounded-xl p-3 ${color}`}><Icon className="h-6 w-6" /></div>
            <span className="text-sm font-medium text-textPrimary">{label}</span>
          </motion.button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card shadow-card">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h3 className="text-base font-semibold text-textPrimary">Pending Dues</h3>
            <button onClick={() => navigate('/dashboard/fees')} className="text-xs font-medium text-primary hover:underline" tabIndex={0} aria-label="View all dues">View All →</button>
          </div>
          <div className="divide-y divide-border/50">
            {pendingDues.map((fee) => (
              <div key={fee.id} className="flex items-center justify-between px-6 py-3">
                <div className="flex items-center gap-3">
                  <Avatar name={fee.studentName} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-textPrimary">{fee.studentName}</p>
                    <p className="text-xs text-textMuted">{fee.class}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-highlight">{formatCurrency(fee.amount)}</span>
                  <Badge label="Overdue" color="red" />
                  <button
                    onClick={() => toast.success(`Reminder sent to ${fee.studentName}`)}
                    className="text-xs text-primary hover:underline"
                    tabIndex={0}
                    aria-label={`Remind ${fee.studentName}`}
                  >
                    Remind
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card shadow-card">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h3 className="text-base font-semibold text-textPrimary">Latest Notices</h3>
            <button onClick={() => navigate('/dashboard/notices')} className="text-xs font-medium text-primary hover:underline" tabIndex={0} aria-label="View all notices">View All →</button>
          </div>
          <div className="divide-y divide-border/50">
            {latestNotices.map((notice) => {
              const catColor = getCategoryColor(notice.category)
              return (
                <div key={notice.id} className="px-6 py-4" style={{ borderLeftWidth: '3px', borderLeftColor: getPriorityColor(notice.priority) }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ backgroundColor: catColor.bg, color: catColor.text }}>{notice.category}</span>
                    <span className="text-xs text-textMuted">{formatDate(notice.date)}</span>
                  </div>
                  <p className="text-sm font-medium text-textPrimary">{notice.title}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default AdminDashboard
