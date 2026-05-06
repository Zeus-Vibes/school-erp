import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { IndianRupee, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import DataTable from '../../components/ui/DataTable'
import StatCard from '../../components/ui/StatCard'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import { feesData as initialFees } from '../../data'
import { useData } from '../../context/DataContext'
import { formatCurrency, formatDate } from '../../utils/helpers'
import { generateFeeReceipt } from '../../utils/feeReceiptGenerator'
import toast from 'react-hot-toast'

const Fees = () => {
  const { students } = useData()
  const [fees, setFees] = useState(initialFees)
  const [statusFilter, setStatusFilter] = useState('All')
  const [showCollectModal, setShowCollectModal] = useState(false)
  const [selectedFee, setSelectedFee] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('UPI')

  const filtered = useMemo(() => statusFilter === 'All' ? fees : statusFilter === 'Paid' ? fees.filter((f) => f.paid) : fees.filter((f) => !f.paid), [fees, statusFilter])

  const totalDue = useMemo(() => fees.reduce((s, f) => s + f.amount, 0), [fees])
  const collected = useMemo(() => fees.filter((f) => f.paid).reduce((s, f) => s + f.amount, 0), [fees])
  const pending = totalDue - collected
  const rate = totalDue > 0 ? ((collected / totalDue) * 100).toFixed(1) : 0

  const handleCollect = () => {
    const receiptNo = `RCP${String(fees.filter((f) => f.paid).length + 1).padStart(3, '0')}`
    setFees((prev) => prev.map((f) => f.id === selectedFee.id ? { ...f, paid: true, paymentDate: new Date().toISOString().split('T')[0], method: paymentMethod, receiptNo } : f))
    const updatedFee = { ...selectedFee, paid: true, paymentDate: new Date().toISOString().split('T')[0], method: paymentMethod, receiptNo }
    const studentData = students.find((s) => s.id === selectedFee.studentId)
    generateFeeReceipt(updatedFee, studentData)
    setShowCollectModal(false)
    toast.success(`Fee collected & receipt generated for ${selectedFee.studentName}`)
  }

  const handleDownloadReceipt = (fee) => {
    const studentData = students.find((s) => s.id === fee.studentId)
    generateFeeReceipt(fee, studentData)
    toast.success('Receipt downloaded!')
  }

  const columns = useMemo(() => [
    { accessorKey: 'id', header: '#', cell: ({ row }) => <span className="text-textMuted">{row.index + 1}</span>, size: 50 },
    { accessorKey: 'studentName', header: 'Student', cell: ({ row }) => <div className="flex items-center gap-2"><Avatar name={row.original.studentName} size="sm" /><span className="text-sm font-medium">{row.original.studentName}</span></div> },
    { accessorKey: 'class', header: 'Class', cell: ({ row }) => <Badge label={row.original.class} color="blue" /> },
    { accessorKey: 'term', header: 'Term' },
    { accessorKey: 'amount', header: 'Amount', cell: ({ row }) => <span className="font-medium">{formatCurrency(row.original.amount)}</span> },
    { accessorKey: 'paid', header: 'Status', cell: ({ row }) => <Badge label={row.original.paid ? 'Paid' : 'Pending'} color={row.original.paid ? 'green' : 'red'} /> },
    { accessorKey: 'dueDate', header: 'Due Date', cell: ({ row }) => formatDate(row.original.dueDate) },
    { accessorKey: 'method', header: 'Method', cell: ({ row }) => row.original.method || '—' },
    { id: 'actions', header: 'Actions', cell: ({ row }) => row.original.paid ? (
      <button onClick={() => handleDownloadReceipt(row.original)} className="text-xs font-medium text-primary hover:underline" tabIndex={0} aria-label="Download receipt">Receipt ↓</button>
    ) : (
      <div className="flex gap-2"><button onClick={() => { setSelectedFee(row.original); setShowCollectModal(true) }} className="rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-white hover:bg-secondary/90" tabIndex={0} aria-label="Collect fee">Collect</button>
        <button onClick={() => toast.success(`Reminder sent to ${row.original.studentName}`)} className="text-xs text-primary hover:underline" tabIndex={0} aria-label="Send reminder">Remind</button></div>
    ) },
  ], [])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <PageHeader title="Fee Management" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Fees Due" value={formatCurrency(totalDue)} icon={IndianRupee} color="primary" />
        <StatCard title="Collected" value={formatCurrency(collected)} icon={CheckCircle} color="green" />
        <StatCard title="Pending" value={formatCurrency(pending)} icon={AlertCircle} color="red" />
        <StatCard title="Collection Rate" value={`${rate}%`} icon={TrendingUp} color="gold" />
      </div>

      <DataTable data={filtered} columns={columns} searchPlaceholder="Search by student..."
        filters={<select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-xl border border-border bg-white px-3 py-2.5 text-sm" aria-label="Filter by status">
          <option value="All">All Status</option><option value="Paid">Paid</option><option value="Pending">Pending</option></select>} />

      <Modal isOpen={showCollectModal} onClose={() => setShowCollectModal(false)} title="Collect Fee" size="sm">
        {selectedFee && (
          <div className="space-y-4">
            <div className="rounded-xl bg-bg p-4"><p className="text-sm font-medium text-textPrimary">{selectedFee.studentName}</p><p className="text-xs text-textMuted">Class: {selectedFee.class} | {selectedFee.term}</p><p className="mt-2 text-xl font-bold text-primary">{formatCurrency(selectedFee.amount)}</p></div>
            <div><label className="mb-1 block text-xs font-medium text-textMuted">Payment Method</label>
              <div className="flex gap-2">{['UPI', 'Cash', 'NEFT', 'Cheque'].map((method) => (
                <button key={method} onClick={() => setPaymentMethod(method)} className={`rounded-lg px-4 py-2 text-xs font-medium transition-all ${paymentMethod === method ? 'bg-primary text-white' : 'bg-gray-100 text-textMuted hover:bg-gray-200'}`} tabIndex={0}>{method}</button>
              ))}</div></div>
            <motion.button whileHover={{ scale: 1.02 }} onClick={handleCollect} className="w-full rounded-xl bg-secondary py-3 text-sm font-semibold text-white shadow-button" tabIndex={0} aria-label="Collect and generate receipt">Collect & Generate Receipt</motion.button>
          </div>
        )}
      </Modal>
    </motion.div>
  )
}

export default Fees
