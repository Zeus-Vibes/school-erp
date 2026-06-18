import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { IndianRupee, TrendingUp, AlertCircle, CheckCircle, Plus, FileText, Trash2, ShieldAlert } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import DataTable from '../../components/ui/DataTable'
import StatCard from '../../components/ui/StatCard'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import { useData } from '../../context/DataContext'
import { useAuth } from '../../context/AuthContext'
import { formatCurrency, formatDate } from '../../utils/helpers'
import { generateFeeReceipt } from '../../utils/feeReceiptGenerator'
import toast from 'react-hot-toast'
import EmptyState from '../../components/shared/EmptyState'

const feeTypes = ['Tuition', 'Annual', 'Exam', 'Sports', 'Other']
const frequencies = ['Monthly', 'Quarterly', 'Annually', 'OneTime']

const Fees = () => {
  const { user } = useAuth()
  const {
    students,
    classes,
    academicYears,
    feeStructures,
    feePayments,
    customInstallmentPlans,
    addFeeStructure,
    updateFeeStructure,
    deleteFeeStructure,
    addFeePayment,
    updateFeePayment,
    addCustomInstallmentPlan,
    updateCustomInstallmentPlan
  } = useData()

  // Role Checks
  const isAdmin = user?.role === 'admin'
  const isTeacher = user?.role === 'teacher'
  const isStudent = user?.role === 'student'

  const currentStudent = useMemo(() => {
    if (!isStudent) return null
    return students.find((s) => s.userId === user?.userId)
  }, [students, isStudent, user])

  // --- STATE ---
  const [activeTab, setActiveTab] = useState(isStudent ? 'history' : 'payments')
  const [statusFilter, setStatusFilter] = useState('All')
  const [selectedClassFilter, setSelectedClassFilter] = useState('All')

  // Collection modal
  const [showCollectModal, setShowCollectModal] = useState(false)
  const [selectedFee, setSelectedFee] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('UPI')

  // Student details modal
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [detailedStudent, setDetailedStudent] = useState(null)

  // Custom Plan Modal
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [planTotal, setPlanTotal] = useState(0)
  const [planReason, setPlanReason] = useState('')
  const [planCount, setPlanCount] = useState(3)
  const [planInstallments, setPlanInstallments] = useState([])

  // Fee Structure form states
  const [selectedStructureClass, setSelectedStructureClass] = useState('')
  const [selectedStructureYear, setSelectedStructureYear] = useState('')
  const [structureItems, setStructureItems] = useState([
    { type: 'Tuition', amount: 15000, frequency: 'Quarterly', dueDay: 10 }
  ])
  const [lateFineActive, setLateFineActive] = useState(false)
  const [lateFineAmount, setLateFineAmount] = useState(100)

  // Load active structure if exists
  const loadedStructure = useMemo(() => {
    if (!selectedStructureClass || !selectedStructureYear) return null
    return feeStructures.find(
      (fs) => fs.classId === selectedStructureClass && fs.academicYearId === selectedStructureYear
    )
  }, [feeStructures, selectedStructureClass, selectedStructureYear])

  useMemo(() => {
    if (loadedStructure) {
      setStructureItems(loadedStructure.items)
      setLateFineActive(loadedStructure.lateFineActive)
      setLateFineAmount(loadedStructure.lateFineAmount || 100)
    }
  }, [loadedStructure])

  // Set default structure selectors
  useMemo(() => {
    if (classes.length > 0 && !selectedStructureClass) {
      setSelectedStructureClass(classes[0].id)
    }
    if (academicYears.length > 0 && !selectedStructureYear) {
      setSelectedStructureYear(academicYears.find((y) => y.isActive)?.id || academicYears[0].id)
    }
  }, [classes, academicYears, selectedStructureClass, selectedStructureYear])

  // --- FILTERS & COMPUTED DATA ---
  const displayedPayments = useMemo(() => {
    let list = feePayments

    // If student, filter own records
    if (isStudent && currentStudent) {
      list = feePayments.filter((f) => f.studentId === currentStudent.id)
    } else {
      if (selectedClassFilter !== 'All') {
        list = list.filter((f) => f.class === selectedClassFilter)
      }
    }

    if (statusFilter === 'Paid') {
      list = list.filter((f) => f.paid)
    } else if (statusFilter === 'Pending') {
      list = list.filter((f) => !f.paid)
    }

    return list
  }, [feePayments, isStudent, currentStudent, selectedClassFilter, statusFilter])

  // Stats
  const stats = useMemo(() => {
    const targetList = isStudent && currentStudent
      ? feePayments.filter((f) => f.studentId === currentStudent.id)
      : feePayments

    const totalDue = targetList.reduce((sum, f) => sum + f.amount, 0)
    const collected = targetList.filter((f) => f.paid).reduce((sum, f) => sum + f.amount, 0)
    const pending = totalDue - collected
    const rate = totalDue > 0 ? ((collected / totalDue) * 100).toFixed(1) : 0

    return { totalDue, collected, pending, rate }
  }, [feePayments, isStudent, currentStudent])

  // --- ACTIONS ---
  const handleOpenDetails = (studentId) => {
    const std = students.find((s) => s.id === studentId)
    setDetailedStudent(std)
    setShowDetailsModal(true)
  }

  const handleDownloadReceipt = (fee) => {
    const studentData = students.find((s) => s.id === fee.studentId)
    // Check if this payment is a custom installment
    const activePlan = customInstallmentPlans.find(
      (p) => p.studentId === fee.studentId && !p.isCompleted
    )

    let customInfo = null
    if (activePlan) {
      // Find which installment this matches
      const instIndex = activePlan.installments.findIndex((i) => i.receiptNo === fee.receiptNo)
      if (instIndex > -1) {
        const inst = activePlan.installments[instIndex]
        const remaining = activePlan.installments
          .slice(instIndex + 1)
          .reduce((sum, i) => sum + i.amount, 0)
        const nextInst = activePlan.installments.find((i, idx) => idx > instIndex && !i.paid)

        customInfo = {
          installmentNo: inst.installmentNo,
          totalInstallments: activePlan.installments.length,
          remainingBalance: remaining,
          nextDueDate: nextInst?.dueDate || null
        }
      }
    }

    generateFeeReceipt(fee, studentData, customInfo)
    toast.success('Receipt downloaded!')
  }

  const handleCollectClick = (fee) => {
    const plan = customInstallmentPlans.find((p) => p.studentId === fee.studentId && !p.isCompleted)
    if (plan) {
      // If student is on a custom plan, force collection through the details modal
      const std = students.find((s) => s.id === fee.studentId)
      setDetailedStudent(std)
      setShowDetailsModal(true)
      toast('Please collect custom installments directly from the student details view.', { icon: 'ℹ️' })
      return
    }

    setSelectedFee(fee)
    setPaymentMethod('UPI')
    setShowCollectModal(true)
  }

  const handleCollectPayment = () => {
    if (!selectedFee) return

    // Generate custom receipt number
    const currentYear = new Date().getFullYear()
    const studentData = students.find((s) => s.id === selectedFee.studentId)
    const standard = studentData?.standard || '1'
    const serial = String(feePayments.filter((f) => f.paid).length + 1).padStart(4, '0')
    const isLkgUkg = standard === 'LKG' || standard === 'UKG'
    const receiptNo = isLkgUkg
      ? `RCP-SDS-${currentYear}-${parseInt(serial, 10)}`
      : `RCP-SBIS-${currentYear}-${serial}`

    const updated = {
      ...selectedFee,
      paid: true,
      paymentDate: new Date().toISOString().split('T')[0],
      method: paymentMethod,
      receiptNo
    }

    updateFeePayment(selectedFee.id, updated)
    generateFeeReceipt(updated, studentData)
    
    setShowCollectModal(false)
    toast.success(`Fee collected & receipt generated for ${selectedFee.studentName}`)
  }

  // --- CUSTOM INSTALLMENT PLANS ---
  const handleOpenPlanSetup = () => {
    // Calculate total unpaid fees
    const unpaid = feePayments
      .filter((f) => f.studentId === detailedStudent.id && !f.paid)
      .reduce((sum, f) => sum + f.amount, 0)

    setPlanTotal(unpaid)
    setPlanReason('')
    setPlanCount(3)
    
    // Generate initial installment rows
    const count = 3
    const baseAmt = Math.floor(unpaid / count)
    const arr = Array.from({ length: count }, (_, i) => {
      const date = new Date()
      date.setMonth(date.getMonth() + i + 1)
      return {
        installmentNo: i + 1,
        amount: i === count - 1 ? unpaid - baseAmt * (count - 1) : baseAmt,
        dueDate: date.toISOString().split('T')[0]
      }
    })
    setPlanInstallments(arr)
    setShowPlanModal(true)
  }

  const handlePlanCountChange = (countVal) => {
    const count = Number(countVal)
    setPlanCount(count)
    const baseAmt = Math.floor(planTotal / count)
    const arr = Array.from({ length: count }, (_, i) => {
      const date = new Date()
      date.setMonth(date.getMonth() + i + 1)
      return {
        installmentNo: i + 1,
        amount: i === count - 1 ? planTotal - baseAmt * (count - 1) : baseAmt,
        dueDate: date.toISOString().split('T')[0]
      }
    })
    setPlanInstallments(arr)
  }

  const handleInstallmentAmountChange = (index, value) => {
    const updated = [...planInstallments]
    updated[index].amount = Number(value)
    setPlanInstallments(updated)
  }

  const handleInstallmentDateChange = (index, value) => {
    const updated = [...planInstallments]
    updated[index].dueDate = value
    setPlanInstallments(updated)
  }

  const handleSaveCustomPlan = () => {
    // Validate sum
    const sum = planInstallments.reduce((s, inst) => s + inst.amount, 0)
    if (sum !== planTotal) {
      toast.error(`Total installments sum (₹${sum}) must equal Total Amount (₹${planTotal})`)
      return
    }

    if (!planReason.trim()) {
      toast.error('Reason for custom plan is required')
      return
    }

    const newPlan = {
      id: `cip-${Date.now()}`,
      studentId: detailedStudent.id,
      totalAmount: planTotal,
      reason: planReason,
      installmentsCount: planCount,
      installments: planInstallments.map((inst) => ({
        ...inst,
        id: `inst-${Date.now()}-${inst.installmentNo}`,
        paid: false,
        paymentDate: null,
        method: null,
        receiptNo: null
      })),
      isCompleted: false
    }

    addCustomInstallmentPlan(newPlan)

    // Deactivate/Cancel the original unpaid fee payments and replace with a unified pending row or update feePayments
    const unpaidRecords = feePayments.filter((f) => f.studentId === detailedStudent.id && !f.paid)
    unpaidRecords.forEach((f) => {
      updateFeePayment(f.id, {
        ...f,
        amount: 0,
        paid: true,
        method: 'Custom Plan Activated',
        paymentDate: new Date().toISOString().split('T')[0]
      })
    })

    // Add a unified "Custom Plan Total" payment block
    addFeePayment({
      id: `F-PLAN-${Date.now()}`,
      studentId: detailedStudent.id,
      studentName: detailedStudent.name,
      class: `${detailedStudent.standard}${detailedStudent.division}`,
      term: 'Custom Installment Plan',
      amount: planTotal,
      paid: false,
      dueDate: planInstallments[0].dueDate,
      paymentDate: null,
      method: null,
      receiptNo: null
    })

    setShowPlanModal(false)
    setShowDetailsModal(false)
    toast.success(`Custom plan generated for ${detailedStudent.name}`)
  }

  const handleCollectInstallment = (installment) => {
    setSelectedFee({
      id: installment.id,
      studentId: detailedStudent.id,
      studentName: detailedStudent.name,
      class: `${detailedStudent.standard}${detailedStudent.division}`,
      term: `Custom Installment ${installment.installmentNo}`,
      amount: installment.amount,
      paid: false
    })
    setPaymentMethod('UPI')
    setShowCollectModal(true)
  }

  // Handle custom installment save override
  const handleCollectInstallmentSubmit = () => {
    const activePlan = customInstallmentPlans.find(
      (p) => p.studentId === detailedStudent.id && !p.isCompleted
    )
    if (!activePlan) return

    const currentYear = new Date().getFullYear()
    const serial = String(feePayments.filter((f) => f.paid).length + 1).padStart(4, '0')
    const isLkgUkg = detailedStudent?.standard === 'LKG' || detailedStudent?.standard === 'UKG'
    const receiptNo = isLkgUkg
      ? `RCP-SDS-${currentYear}-${parseInt(serial, 10)}`
      : `RCP-SBIS-${currentYear}-${serial}`

    const updatedInstallments = activePlan.installments.map((inst) => {
      if (inst.id === selectedFee.id) {
        return {
          ...inst,
          paid: true,
          paymentDate: new Date().toISOString().split('T')[0],
          method: paymentMethod,
          receiptNo
        }
      }
      return inst
    })

    const allPaid = updatedInstallments.every((i) => i.paid)

    updateCustomInstallmentPlan(activePlan.id, {
      ...activePlan,
      installments: updatedInstallments,
      isCompleted: allPaid
    })

    // Also register the specific installment payment in main feePayments
    addFeePayment({
      id: `F-INST-${Date.now()}`,
      studentId: detailedStudent.id,
      studentName: detailedStudent.name,
      class: `${detailedStudent.standard}${detailedStudent.division}`,
      term: `Installment ${selectedFee.term.split(' ').slice(-1)[0]}`,
      amount: selectedFee.amount,
      paid: true,
      paymentDate: new Date().toISOString().split('T')[0],
      method: paymentMethod,
      receiptNo
    })

    // Update the main Custom Plan pending record in feePayments
    const mainPlanRecord = feePayments.find(
      (f) => f.studentId === detailedStudent.id && f.term === 'Custom Installment Plan' && !f.paid
    )
    if (mainPlanRecord) {
      const nextInst = updatedInstallments.find((i) => !i.paid)
      if (allPaid) {
        updateFeePayment(mainPlanRecord.id, {
          ...mainPlanRecord,
          paid: true,
          paymentDate: new Date().toISOString().split('T')[0],
          method: 'Completed'
        })
      } else if (nextInst) {
        updateFeePayment(mainPlanRecord.id, {
          ...mainPlanRecord,
          dueDate: nextInst.dueDate
        })
      }
    }

    // Generate Half+Half PDF
    const collectedInst = updatedInstallments.find((i) => i.id === selectedFee.id)
    const remaining = updatedInstallments.filter((i) => !i.paid).reduce((sum, i) => sum + i.amount, 0)
    const nextInst = updatedInstallments.find((i) => !i.paid)

    const customInfo = {
      installmentNo: collectedInst.installmentNo,
      totalInstallments: updatedInstallments.length,
      remainingBalance: remaining,
      nextDueDate: nextInst?.dueDate || null
    }

    const feeReceiptData = {
      amount: selectedFee.amount,
      term: selectedFee.term,
      paymentDate: collectedInst.paymentDate,
      method: paymentMethod,
      receiptNo
    }

    generateFeeReceipt(feeReceiptData, detailedStudent, customInfo)

    setShowCollectModal(false)
    setShowDetailsModal(false)
    toast.success('Installment collected & receipt generated!')
  }

  // --- STRUCTURE SETUP ACTIONS ---
  const handleAddStructureItem = () => {
    setStructureItems((prev) => [...prev, { type: 'Tuition', amount: 5000, frequency: 'Quarterly', dueDay: 10 }])
  }

  const handleRemoveStructureItem = (index) => {
    setStructureItems((prev) => prev.filter((_, idx) => idx !== index))
  }

  const handleStructureFieldChange = (index, field, value) => {
    const updated = [...structureItems]
    updated[index][field] = field === 'amount' || field === 'dueDay' ? Number(value) : value
    setStructureItems(updated)
  }

  const handleSaveStructure = () => {
    if (!selectedStructureClass || !selectedStructureYear) {
      toast.error('Please select both class and year')
      return
    }

    const structureData = {
      classId: selectedStructureClass,
      academicYearId: selectedStructureYear,
      items: structureItems,
      lateFineActive,
      lateFineAmount: Number(lateFineAmount)
    }

    if (loadedStructure) {
      updateFeeStructure(loadedStructure.id, structureData)
      toast.success('Fee structure updated!')
    } else {
      addFeeStructure(structureData)
      toast.success('Fee structure created!')
    }
  }

  // Table Columns
  const columns = useMemo(() => [
    { accessorKey: 'id', header: '#', cell: ({ row }) => <span className="text-textMuted">{row.index + 1}</span>, size: 50 },
    {
      accessorKey: 'studentName',
      header: 'Student',
      cell: ({ row }) => {
        const student = students.find((s) => s.id === row.original.studentId)
        const hasCustomPlan = student && customInstallmentPlans.some(
          (p) => p.studentId === student.id && !p.isCompleted
        )

        return (
          <div className="flex items-center gap-2">
            <Avatar name={row.original.studentName} size="sm" />
            <div>
              <span
                onClick={() => handleOpenDetails(row.original.studentId)}
                className="text-sm font-semibold text-textPrimary hover:underline hover:text-primary cursor-pointer"
                tabIndex={0}
              >
                {row.original.studentName}
              </span>
              {hasCustomPlan && (
                <div className="mt-0.5">
                  <Badge label="Custom Plan" color="purple" />
                </div>
              )}
            </div>
          </div>
        )
      }
    },
    {
      id: 'grNumber',
      header: 'GR Number',
      cell: ({ row }) => {
        const student = students.find((s) => s.id === row.original.studentId)
        return <span className="font-semibold text-textPrimary">{student?.grNumber || '—'}</span>
      }
    },
    { accessorKey: 'class', header: 'Class', cell: ({ row }) => <Badge label={row.original.class} color="blue" /> },
    { accessorKey: 'term', header: 'Term/Type' },
    { accessorKey: 'amount', header: 'Amount', cell: ({ row }) => <span className="font-bold text-textPrimary">{formatCurrency(row.original.amount)}</span> },
    { accessorKey: 'paid', header: 'Status', cell: ({ row }) => <Badge label={row.original.paid ? 'Paid' : 'Pending'} color={row.original.paid ? 'green' : 'red'} /> },
    { accessorKey: 'dueDate', header: 'Due Date', cell: ({ row }) => formatDate(row.original.dueDate) },
    { accessorKey: 'method', header: 'Method', cell: ({ row }) => row.original.paid ? <Badge label={row.original.method || 'Cash'} color="gray" /> : '—' },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const fee = row.original
        const isPaid = fee.paid

        if (isPaid) {
          if (fee.method === 'Custom Plan Activated') {
            return <span className="text-xs text-textMuted italic">Split into Installments</span>
          }
          return (
            <button
              onClick={() => handleDownloadReceipt(fee)}
              className="text-xs font-semibold text-primary hover:underline"
              tabIndex={0}
            >
              Receipt ↓
            </button>
          )
        }

        return (
          <div className="flex gap-2">
            <button
              onClick={() => handleCollectClick(fee)}
              className="rounded-lg bg-secondary px-3 py-1.5 text-xs font-semibold text-white hover:bg-secondary/90 transition-all"
              tabIndex={0}
            >
              Collect
            </button>
            <button
              onClick={() => toast.success(`Reminder notification sent to ${fee.studentName}`)}
              className="text-xs text-primary hover:underline font-semibold"
              tabIndex={0}
            >
              Remind
            </button>
          </div>
        )
      }
    }
  ], [students, customInstallmentPlans])

  // Student history layout
  const studentInstallmentPlan = useMemo(() => {
    if (!isStudent || !currentStudent) return null
    return customInstallmentPlans.find((p) => p.studentId === currentStudent.id && !p.isCompleted)
  }, [customInstallmentPlans, isStudent, currentStudent])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <PageHeader title="Fee Management" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Fees" value={formatCurrency(stats.totalDue)} icon={IndianRupee} color="primary" />
        <StatCard title="Collected" value={formatCurrency(stats.collected)} icon={CheckCircle} color="green" />
        <StatCard title="Pending" value={formatCurrency(stats.pending)} icon={AlertCircle} color="red" />
        <StatCard title="Collection Rate" value={`${stats.rate}%`} icon={TrendingUp} color="gold" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {!isStudent && (
          <>
            <button
              onClick={() => setActiveTab('payments')}
              className={`rounded-xl px-5 py-2.5 text-sm font-medium transition-all ${activeTab === 'payments' ? 'bg-primary text-white shadow-button' : 'bg-white text-textMuted border border-border hover:bg-gray-50'}`}
              tabIndex={0}
            >
              Payments List
            </button>
            {isAdmin && (
              <button
                onClick={() => setActiveTab('structure')}
                className={`rounded-xl px-5 py-2.5 text-sm font-medium transition-all ${activeTab === 'structure' ? 'bg-primary text-white shadow-button' : 'bg-white text-textMuted border border-border hover:bg-gray-50'}`}
                tabIndex={0}
              >
                Fee Structure Setup
              </button>
            )}
          </>
        )}
      </div>

      {activeTab === 'payments' && !isStudent && (
        <DataTable
          data={displayedPayments}
          columns={columns}
          searchPlaceholder="Search by student..."
          filters={
            <div className="flex gap-2">
              <select
                value={selectedClassFilter}
                onChange={(e) => setSelectedClassFilter(e.target.value)}
                className="rounded-xl border border-border bg-white px-3 py-2 text-sm"
                aria-label="Filter by class"
              >
                <option value="All">All Classes</option>
                {classes.map((c) => (
                  <option key={c.id} value={`${c.standard}${c.division}`}>
                    Class {c.standard}{c.division}
                  </option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-border bg-white px-3 py-2 text-sm"
                aria-label="Filter by status"
              >
                <option value="All">All Statuses</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          }
        />
      )}

      {activeTab === 'structure' && isAdmin && (
        <div className="rounded-2xl border border-border bg-card shadow-card p-6 space-y-6">
          <h3 className="text-sm font-bold text-textPrimary">Configure Class Fee Structure</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-textMuted">Select Class *</label>
              <select
                value={selectedStructureClass}
                onChange={(e) => setSelectedStructureClass(e.target.value)}
                className="w-full rounded-xl border border-border px-4 py-2.5 text-sm bg-white"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.standard}{c.division} ({c.medium})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-textMuted">Select Academic Year *</label>
              <select
                value={selectedStructureYear}
                onChange={(e) => setSelectedStructureYear(e.target.value)}
                className="w-full rounded-xl border border-border px-4 py-2.5 text-sm bg-white"
              >
                {academicYears.map((y) => (
                  <option key={y.id} value={y.id}>
                    {y.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold uppercase tracking-wider text-textMuted">Fee Components</h4>
              <button
                type="button"
                onClick={handleAddStructureItem}
                className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                <Plus className="h-3.5 w-3.5" /> Add Component
              </button>
            </div>

            {structureItems.map((item, idx) => (
              <div key={idx} className="flex flex-wrap items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3">
                <div className="flex-1 min-w-[150px]">
                  <label className="text-[10px] text-textMuted block mb-0.5">Fee Type</label>
                  <select
                    value={item.type}
                    onChange={(e) => handleStructureFieldChange(idx, 'type', e.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-1.5 text-xs bg-white"
                  >
                    {feeTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-32">
                  <label className="text-[10px] text-textMuted block mb-0.5">Amount (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={item.amount}
                    onChange={(e) => handleStructureFieldChange(idx, 'amount', e.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-1.5 text-xs"
                  />
                </div>

                <div className="w-36">
                  <label className="text-[10px] text-textMuted block mb-0.5">Frequency</label>
                  <select
                    value={item.frequency}
                    onChange={(e) => handleStructureFieldChange(idx, 'frequency', e.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-1.5 text-xs bg-white"
                  >
                    {frequencies.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-24">
                  <label className="text-[10px] text-textMuted block mb-0.5">Due Day</label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={item.dueDay}
                    onChange={(e) => handleStructureFieldChange(idx, 'dueDay', e.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-1.5 text-xs"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveStructureItem(idx)}
                  disabled={structureItems.length === 1}
                  className="rounded-lg p-1.5 text-highlight hover:bg-red-50 disabled:opacity-30 mt-4"
                  aria-label="Remove item"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="border-t border-border pt-4 space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="fine"
                checked={lateFineActive}
                onChange={(e) => setLateFineActive(e.target.checked)}
                className="rounded text-primary focus:ring-primary h-4 w-4"
              />
              <label htmlFor="fine" className="text-xs font-bold text-textPrimary cursor-pointer">
                Enable Late Fine Configuration
              </label>
            </div>

            {lateFineActive && (
              <div className="w-48">
                <label className="mb-1 block text-xs font-medium text-textMuted">Late Fine Amount (₹/day) *</label>
                <input
                  type="number"
                  min={0}
                  value={lateFineAmount}
                  onChange={(e) => setLateFineAmount(e.target.value)}
                  className="w-full rounded-xl border border-border px-4 py-2 text-sm"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleSaveStructure}
              className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-button"
            >
              Save Structure
            </button>
          </div>
        </div>
      )}

      {/* STUDENT VIEW HISTORY */}
      {isStudent && (() => {
        const unpaidPayments = feePayments.filter((p) => p.studentId === currentStudent?.id && !p.paid)
        const hasOutstanding = unpaidPayments.length > 0
        const nextInstallment = studentInstallmentPlan?.installments?.find((i) => !i.paid)

        return (
          <div className="space-y-6">
            {hasOutstanding && (
              <div className="rounded-2xl border border-red-200 bg-red-50/50 p-4 text-xs text-red-800 flex items-center gap-3 shadow-sm">
                <AlertCircle className="h-5 w-5 text-highlight flex-shrink-0" />
                <div>
                  <p className="font-bold">⚠️ Outstanding Fees Due</p>
                  <p className="mt-0.5 text-red-700 font-medium">
                    You have outstanding fee payments of <strong>{formatCurrency(unpaidPayments.reduce((sum, p) => sum + p.amount, 0))}</strong>. Please settle these immediately.
                  </p>
                </div>
              </div>
            )}

            {studentInstallmentPlan && (
              <div className="rounded-2xl bg-blue-50 border border-blue-200 p-6 shadow shadow-blue-100 space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-blue-900 flex items-center gap-1.5">
                    <FileText className="h-4 w-4" /> Custom Installment Plan Active
                  </h4>
                  <p className="text-xs text-blue-700 mt-1">Reason: {studentInstallmentPlan.reason}</p>
                  
                  {nextInstallment && (
                    <div className="mt-3 p-3 bg-blue-100/60 border border-blue-200 rounded-xl text-xs font-bold text-blue-900 inline-block">
                      Next installment: {formatCurrency(nextInstallment.amount)} due by {formatDate(nextInstallment.dueDate)}
                    </div>
                  )}

                  <div className="mt-4 space-y-2">
                    {studentInstallmentPlan.installments.map((inst) => (
                      <div key={inst.id} className="flex items-center gap-4 text-xs font-semibold">
                        <span className="text-blue-900 w-28">Installment {inst.installmentNo}:</span>
                        <span className="text-textPrimary w-20">{formatCurrency(inst.amount)}</span>
                        <span className="text-textMuted w-24">Due: {formatDate(inst.dueDate)}</span>
                        <Badge
                          label={inst.paid ? 'Paid' : 'Pending'}
                          color={inst.paid ? 'green' : 'red'}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          <div className="rounded-2xl border border-border bg-card shadow-card p-5">
            <h3 className="text-sm font-bold text-textPrimary mb-4">My Payment History</h3>
            {displayedPayments.length === 0 ? (
              <EmptyState title="No Payment History" description="There are no fees associated with your account at this time." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs font-semibold text-textMuted uppercase">
                      <th className="pb-3">Date</th>
                      <th className="pb-3">Receipt No</th>
                      <th className="pb-3">Fee Type</th>
                      <th className="pb-3">Period</th>
                      <th className="pb-3">Amount</th>
                      <th className="pb-3">Mode</th>
                      <th className="pb-3 text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50 text-textPrimary">
                    {displayedPayments.map((fee) => (
                      <tr key={fee.id}>
                        <td className="py-3 text-textMuted">
                          {fee.paid ? formatDate(fee.paymentDate) : formatDate(fee.dueDate)}
                        </td>
                        <td className="py-3 font-semibold text-primary">{fee.receiptNo || '—'}</td>
                        <td className="py-3">
                          {fee.term.includes('Installment') ? 'Installment' : 'Tuition Fee'}
                        </td>
                        <td className="py-3 text-textMuted">{fee.term}</td>
                        <td className="py-3 font-bold">{formatCurrency(fee.amount)}</td>
                        <td className="py-3">
                          {fee.paid ? (
                            <Badge label={fee.method || 'Cash'} color="gray" />
                          ) : (
                            <Badge label="Due ✗" color="red" />
                          )}
                        </td>
                        <td className="py-3 text-right">
                          {fee.paid && fee.method !== 'Custom Plan Activated' && (
                            <button
                              onClick={() => handleDownloadReceipt(fee)}
                              className="text-xs font-bold text-primary hover:underline cursor-pointer"
                            >
                              Download Receipt
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )})()}

      {/* COLLECT FEE MODAL */}
      <Modal isOpen={showCollectModal} onClose={() => setShowCollectModal(false)} title="Collect Fee" size="sm">
        {selectedFee && (
          <div className="space-y-4">
            <div className="rounded-xl bg-gray-50 border border-border p-4">
              <p className="text-sm font-semibold text-textPrimary">{selectedFee.studentName}</p>
              <p className="text-xs text-textMuted mt-0.5">Class: {selectedFee.class} | {selectedFee.term}</p>
              <p className="mt-2.5 text-2xl font-extrabold text-primary">{formatCurrency(selectedFee.amount)}</p>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-textMuted">Payment Method</label>
              <div className="flex gap-2 flex-wrap">
                {['UPI', 'Cash', 'NEFT', 'Cheque'].map((method) => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${paymentMethod === method ? 'bg-primary text-white shadow' : 'bg-gray-100 text-textMuted hover:bg-gray-200'}`}
                    tabIndex={0}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={
                selectedFee.term.includes('Installment')
                  ? handleCollectInstallmentSubmit
                  : handleCollectPayment
              }
              className="w-full rounded-xl bg-secondary py-3 text-sm font-semibold text-white shadow-button hover:bg-secondary/90 transition-all"
              tabIndex={0}
            >
              Collect & Generate Receipt
            </button>
          </div>
        )}
      </Modal>

      {/* STUDENT FEE DETAILS MODAL */}
      <Modal isOpen={showDetailsModal} onClose={() => setShowDetailsModal(false)} title="Student Fee Details" size="md">
        {detailedStudent && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <Avatar name={detailedStudent.name} size="md" />
              <div>
                <h4 className="text-base font-bold text-textPrimary">{detailedStudent.name}</h4>
                <p className="text-xs text-textMuted mt-0.5">
                  Class: {detailedStudent.standard}{detailedStudent.division} | GR: {detailedStudent.grNumber}
                </p>
              </div>
            </div>

            {/* Installments Plan Section if exists */}
            {(() => {
              const activePlan = customInstallmentPlans.find(
                (p) => p.studentId === detailedStudent.id && !p.isCompleted
              )

              if (activePlan) {
                return (
                  <div className="space-y-3">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-textMuted">Active Installment Plan</h5>
                    <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 space-y-3">
                      <p className="text-xs font-medium text-blue-900">Reason: {activePlan.reason}</p>
                      <div className="space-y-2">
                        {activePlan.installments.map((inst) => (
                          <div key={inst.id} className="flex items-center justify-between text-xs font-semibold py-1.5 border-b border-blue-100/50 last:border-b-0">
                            <span className="text-blue-900">Installment {inst.installmentNo}</span>
                            <span className="text-textPrimary">{formatCurrency(inst.amount)}</span>
                            <span className="text-textMuted">Due: {formatDate(inst.dueDate)}</span>
                            {inst.paid ? (
                              <Badge label="Paid" color="green" />
                            ) : (
                              <button
                                onClick={() => handleCollectInstallment(inst)}
                                className="rounded bg-secondary px-2.5 py-1 text-[10px] font-bold text-white shadow-sm hover:bg-secondary/90"
                              >
                                Collect
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              }

              // Else show regular unpaid fee records and custom plan setup trigger
              const unpaid = feePayments.filter((f) => f.studentId === detailedStudent.id && !f.paid)

              return (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-textMuted">Outstanding Fees</h5>
                    {unpaid.length > 0 && isAdmin && (
                      <button
                        onClick={handleOpenPlanSetup}
                        className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10 transition-all"
                      >
                        Create Custom Plan
                      </button>
                    )}
                  </div>

                  {unpaid.length === 0 ? (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 border border-green-200 text-green-800 text-xs font-semibold">
                      <CheckCircle className="h-4 w-4" />
                      All fees cleared for this student.
                    </div>
                  ) : (
                    <div className="divide-y divide-border border border-border rounded-xl overflow-hidden bg-white/5">
                      {unpaid.map((fee) => (
                        <div key={fee.id} className="flex items-center justify-between p-3.5 text-xs font-semibold">
                          <div>
                            <p className="text-textPrimary">{fee.term}</p>
                            <p className="text-textMuted mt-0.5">Due: {formatDate(fee.dueDate)}</p>
                          </div>
                          <span className="text-textPrimary font-bold">{formatCurrency(fee.amount)}</span>
                          <button
                            onClick={() => handleCollectClick(fee)}
                            className="rounded-lg bg-secondary px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-secondary/90"
                          >
                            Collect
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })()}
          </div>
        )}
      </Modal>

      {/* CREATE CUSTOM PLAN MODAL */}
      <Modal isOpen={showPlanModal} onClose={() => setShowPlanModal(false)} title="Create Custom Installment Plan" size="md">
        <div className="space-y-4">
          <div className="rounded-xl bg-orange-50 border border-orange-200 p-4 text-orange-800 text-xs flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 flex-shrink-0" />
            <span>This will split the student's pending total of {formatCurrency(planTotal)} into installment payments.</span>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-textMuted">Reason for Custom Plan *</label>
            <textarea
              value={planReason}
              onChange={(e) => setPlanReason(e.target.value)}
              placeholder="Provide a valid reason (e.g. Family medical emergency)..."
              rows={2}
              required
              className="w-full rounded-xl border border-border px-4 py-2.5 text-sm resize-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-textMuted">Total Amount (₹)</label>
              <input
                type="number"
                value={planTotal}
                disabled
                className="w-full rounded-xl border border-border bg-gray-100 px-4 py-2.5 text-sm font-semibold"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-textMuted">Number of Installments *</label>
              <select
                value={planCount}
                onChange={(e) => handlePlanCountChange(e.target.value)}
                className="w-full rounded-xl border border-border px-4 py-2.5 text-sm bg-white"
              >
                {[2, 3, 4, 5, 6].map((num) => (
                  <option key={num} value={num}>
                    {num} Installments
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2 border-t border-border pt-4">
            <h5 className="text-xs font-bold text-textPrimary">Installment Details</h5>
            {planInstallments.map((inst, idx) => (
              <div key={idx} className="flex items-center gap-3 text-xs">
                <span className="font-bold text-textMuted w-28">Installment {inst.installmentNo}</span>
                <input
                  type="number"
                  min={0}
                  value={inst.amount}
                  onChange={(e) => handleInstallmentAmountChange(idx, e.target.value)}
                  className="rounded-lg border border-border px-3 py-1.5 font-bold w-32"
                  placeholder="Amount"
                />
                <input
                  type="date"
                  value={inst.dueDate}
                  onChange={(e) => handleInstallmentDateChange(idx, e.target.value)}
                  className="rounded-lg border border-border px-3 py-1.5 flex-1"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setShowPlanModal(false)}
              className="rounded-xl border border-border px-4 py-2 text-xs font-medium text-textMuted hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveCustomPlan}
              className="rounded-xl bg-primary px-5 py-2 text-xs font-semibold text-white shadow"
            >
              Generate Plan
            </button>
          </div>
        </div>
      </Modal>
    </motion.div>
  )
}

export default Fees
