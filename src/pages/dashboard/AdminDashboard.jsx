import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  Users, 
  GraduationCap, 
  IndianRupee, 
  CalendarCheck, 
  Plus, 
  Megaphone, 
  FileText, 
  UserPlus, 
  ShieldAlert, 
  ChevronRight 
} from 'lucide-react'
import StatCard from '../../components/ui/StatCard'
import FeeBarChart from '../../components/charts/FeeBarChart'
import AttendanceDonut from '../../components/charts/AttendanceDonut'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { attendanceData, notices } from '../../data'
import { mockDashboardStats } from '../../data/mockDashboard'
import { formatCurrency, formatDate, getGreeting, getPriorityColor, getCategoryColor } from '../../utils/helpers'
import toast from 'react-hot-toast'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { students, teachers, feePayments } = useData()

  // Row 1 values
  const totalFeeCollected = useMemo(
    () => feePayments.filter((f) => f.paid).reduce((sum, f) => sum + f.amount, 0),
    [feePayments]
  )
  const totalPendingFees = useMemo(
    () => feePayments.filter((f) => !f.paid).reduce((sum, f) => sum + f.amount, 0),
    [feePayments]
  )
  const overdueCount = useMemo(
    () => Array.from(new Set(feePayments.filter((f) => !f.paid).map((f) => f.studentId))).length,
    [feePayments]
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
    const activeStandards = Array.from(new Set(feePayments.map((f) => {
      const match = f.class.match(/^([0-9]+|LKG|UKG|Nursery)/i)
      return match ? match[1] : f.class
    })))
    const order = ['Nursery', 'LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
    activeStandards.sort((a, b) => order.indexOf(a) - order.indexOf(b))

    return activeStandards.map((std) => {
      const classRecords = feePayments.filter((f) => f.class.startsWith(std))
      return {
        class: `Class ${std}`,
        collected: classRecords.filter((f) => f.paid).reduce((s, f) => s + f.amount, 0),
        pending: classRecords.filter((f) => !f.paid).reduce((s, f) => s + f.amount, 0),
      }
    })
  }, [feePayments])

  const recentPayments = useMemo(() => {
    return [...feePayments]
      .filter((f) => f.paid)
      .sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate))
      .slice(0, 5)
  }, [feePayments])

  const pendingDues = useMemo(() => feePayments.filter((f) => !f.paid), [feePayments])

  const alerts = useMemo(() => {
    return [
      { id: 'alert-1', type: 'warning', text: 'Classes without published timetable: 0', link: '/dashboard/admin/timetable' },
      { id: 'alert-2', type: 'danger', text: `Students with overdue fees: ${overdueCount}`, link: '/dashboard/admin/fees' },
      { id: 'alert-3', type: 'warning', text: 'Exams with incomplete marks: 2', link: '/dashboard/admin/examinations' },
      { id: 'alert-4', type: 'info', text: 'Students below 75% attendance: 18', link: '/dashboard/admin/attendance' }
    ]
  }, [overdueCount])

  const latestNotices = notices.slice(0, 3)

  const quickActions = [
    { icon: Plus, label: 'Add Student', color: 'bg-blue-50 text-primary', action: () => navigate('/dashboard/admin/students') },
    { icon: FileText, label: 'Generate LC', color: 'bg-green-50 text-secondary', action: () => navigate('/dashboard/admin/lc') },
    { icon: IndianRupee, label: 'Collect Fee', color: 'bg-amber-50 text-accent', action: () => navigate('/dashboard/admin/fees') },
    { icon: Megaphone, label: 'Add Notice', color: 'bg-red-50 text-highlight', action: () => navigate('/dashboard/admin/notices') },
  ]

  // Alert colors helper
  const getAlertColorClasses = (type) => {
    switch (type) {
      case 'danger':
        return 'border-l-red-500 bg-red-50/40 text-red-900 border-l-4 hover:bg-red-50'
      case 'warning':
        return 'border-l-amber-500 bg-amber-50/40 text-amber-900 border-l-4 hover:bg-amber-50'
      case 'info':
      default:
        return 'border-l-blue-500 bg-blue-50/40 text-blue-900 border-l-4 hover:bg-blue-50'
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-primary via-primary/90 to-primary/80 p-6 text-white shadow-lg">
        <h1 className="font-playfair text-2xl font-bold">{getGreeting()}, {user?.name || 'Admin'}! 👋</h1>
        <p className="mt-1 text-sm text-white/70">Welcome to the School ERP Admin Panel. Here&apos;s your overview for today.</p>
      </div>

      {/* Row 1 Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Students" value={students.length} icon={Users} color="primary" delay={0} />
        <StatCard title="Total Teachers" value={teachers.length} icon={GraduationCap} color="green" delay={1} />
        <StatCard title="Fees Collected" value={formatCurrency(totalFeeCollected)} icon={IndianRupee} color="gold" delay={2} />
        <StatCard title="Avg Attendance" value={`${avgAttendance}%`} icon={CalendarCheck} color="red" delay={3} />
      </div>

      {/* Row 2 Stats - House Counts */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-textMuted">House Representation</h3>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Red House" value={mockDashboardStats.houses.Red} icon={Users} color="red" delay={0} />
          <StatCard title="Green House" value={mockDashboardStats.houses.Green} icon={Users} color="green" delay={1} />
          <StatCard title="Blue House" value={mockDashboardStats.houses.Blue} icon={Users} color="primary" delay={2} />
          <StatCard title="Yellow House" value={mockDashboardStats.houses.Yellow} icon={Users} color="gold" delay={3} />
        </div>
      </div>

      {/* Row 3 Stats - Admissions, LC, Pending Fees, Today Attendance */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-textMuted">Monthly & Daily Indicators</h3>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard title="New Admissions" subtitle="This Month" value={mockDashboardStats.newAdmissionsThisMonth} icon={UserPlus} color="green" delay={0} />
          <StatCard title="LC Issued" subtitle="This Month" value={mockDashboardStats.lcIssuedThisMonth} icon={FileText} color="red" delay={1} />
          <StatCard title="Pending Fees" value={formatCurrency(totalPendingFees)} icon={IndianRupee} color="gold" delay={2} />
          <StatCard title="Today Attendance" value={`${mockDashboardStats.todayAttendancePercentage}%`} icon={CalendarCheck} color="primary" delay={3} />
        </div>
      </div>

      {/* Charts Grid */}
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

      {/* Recent Payments Table */}
      <div className="rounded-2xl border border-border bg-card shadow-card">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h3 className="text-base font-semibold text-textPrimary">Recent Fee Payments</h3>
          <button onClick={() => navigate('/dashboard/admin/fees')} className="text-xs font-medium text-primary hover:underline cursor-pointer" tabIndex={0} aria-label="View all fees">View All →</button>
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

      {/* Quick Actions Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {quickActions.map(({ icon: Icon, label, color, action }) => (
          <motion.button
            key={label}
            whileHover={{ y: -2, boxShadow: '0 4px 20px rgba(30,58,95,0.12)' }}
            whileTap={{ scale: 0.98 }}
            onClick={action}
            className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border bg-card p-6 hover:border-primary/30 transition-all cursor-pointer w-full text-center"
            tabIndex={0}
            aria-label={label}
          >
            <div className={`rounded-xl p-3 ${color}`}><Icon className="h-6 w-6" /></div>
            <span className="text-sm font-medium text-textPrimary">{label}</span>
          </motion.button>
        ))}
      </div>

      {/* Alerts & Notices Section */}
      <div className="grid gap-6 xl:grid-cols-2">
        {/* Pending Alerts Panel */}
        <div className="rounded-2xl border border-border bg-card shadow-card">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-highlight" />
              <h3 className="text-base font-semibold text-textPrimary">Pending Alerts</h3>
            </div>
          </div>
          <div className="p-4 space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                onClick={() => navigate(alert.link)}
                className={`flex items-center justify-between rounded-xl p-4 transition-all duration-200 cursor-pointer shadow-sm border ${getAlertColorClasses(alert.type)}`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-current" />
                  <span className="text-sm font-medium">{alert.text}</span>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 opacity-70" />
              </div>
            ))}
          </div>
        </div>

        {/* Latest Notices */}
        <div className="rounded-2xl border border-border bg-card shadow-card">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h3 className="text-base font-semibold text-textPrimary">Latest Notices</h3>
            <button onClick={() => navigate('/dashboard/admin/notices')} className="text-xs font-medium text-primary hover:underline cursor-pointer" tabIndex={0} aria-label="View all notices">View All →</button>
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
