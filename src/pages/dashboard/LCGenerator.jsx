import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, User, FileText, Calendar, Check, AlertTriangle, ArrowRight, ArrowLeft, Download, RefreshCw, XCircle } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/shared/ConfirmDialog'
import EmptyState from '../../components/shared/EmptyState'
import LCDocument from '../../components/dashboard/LCDocument'
import { useData } from '../../context/DataContext'
import { formatDate } from '../../utils/helpers'
import toast from 'react-hot-toast'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

const LCGenerator = () => {
  const {
    students,
    classes,
    feePayments,
    lcRecords,
    issueLC,
    revokeLC,
    updateStudent
  } = useData()

  // Wizard Steps: 1 = Search, 2 = Student Card Preview, 3 = LC Form, 4 = Preview + Issue
  const [step, setStep] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStudent, setSelectedStudent] = useState(null)
  
  // Form state
  const [leavingDate, setLeavingDate] = useState(() => new Date().toISOString().split('T')[0])
  const [reason, setReason] = useState('Transfer to another city')
  const [otherReason, setOtherReason] = useState('')
  const [conduct, setConduct] = useState('Good character and satisfactory conduct during the term.')
  const [feesCleared, setFeesCleared] = useState(true)

  // Revoke state
  const [showRevokeModal, setShowRevokeModal] = useState(false)
  const [revokeRecordId, setRevokeRecordId] = useState(null)
  const [revokeReason, setRevokeReason] = useState('')

  // View Modal state
  const [showViewModal, setShowViewModal] = useState(false)
  const [viewRecord, setViewRecord] = useState(null)

  // Confirmation dialog state
  const [showIssueConfirm, setShowIssueConfirm] = useState(false)
  const [isIssuing, setIsIssuing] = useState(false)
  const [generatedLC, setGeneratedLC] = useState(null)
  const [printData, setPrintData] = useState(null)

  // Search active students
  const activeStudents = useMemo(() => {
    return students.filter((s) => s.isActive)
  }, [students])

  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return []
    const query = searchQuery.toLowerCase()
    return activeStudents.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        (s.grNumber && s.grNumber.toLowerCase().includes(query))
    )
  }, [activeStudents, searchQuery])

  // Fee check for current month
  const feeStatusInfo = useMemo(() => {
    if (!selectedStudent) return { cleared: true, currentPayments: [] }
    const studentPayments = feePayments.filter((p) => p.studentId === selectedStudent.id)
    const currentMonthEnd = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
    // Check if there are any unpaid fees due on or before current month
    const hasPendingFees = studentPayments.some((p) => !p.paid && new Date(p.dueDate) <= currentMonthEnd)
    return {
      cleared: !hasPendingFees,
      payments: studentPayments
    }
  }, [selectedStudent, feePayments])

  const handleSelectStudent = (student) => {
    setSelectedStudent(student)
    // Pre-populate fee status
    const studentPayments = feePayments.filter((p) => p.studentId === student.id)
    const currentMonthEnd = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
    const hasPendingFees = studentPayments.some((p) => !p.paid && new Date(p.dueDate) <= currentMonthEnd)
    
    setFeesCleared(!hasPendingFees)
    setLeavingDate(new Date().toISOString().split('T')[0])
    setReason('Transfer to another city')
    setOtherReason('')
    setConduct('Good character and satisfactory conduct during the term.')
    setStep(2)
  }

  const handleNextStep = () => {
    if (step === 2) {
      setStep(3)
      return
    }
    if (step === 3) {
      if (reason === 'Other' && !otherReason.trim()) {
        toast.error('Please specify the reason')
        return
      }
      setStep(4)
    }
  }

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleTriggerIssue = () => {
    setShowIssueConfirm(true)
  }

  const handleIssueConfirm = async () => {
    if (!selectedStudent) return
    setIsIssuing(true)
    setShowIssueConfirm(false)
    toast.loading('Issuing Leaving Certificate...')

    // Wait slightly
    await new Promise((resolve) => setTimeout(resolve, 800))

    // 1. Create LC Record
    const serial = String(lcRecords.length + 1).padStart(4, '0')
    const lcNumber = `LC-SBIS-2425-${serial}`
    
    const newLC = {
      id: `lc-${Date.now()}`,
      lcNumber,
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      classLabel: `${selectedStudent.standard}${selectedStudent.division}`,
      leavingDate,
      reason,
      otherReason: reason === 'Other' ? otherReason : '',
      conduct,
      feesCleared,
      issuedAt: new Date().toISOString(),
      status: 'Active'
    }

    issueLC(newLC)

    // 2. Update Student isActive to false
    updateStudent(selectedStudent.id, {
      isActive: false,
      status: 'Left',
      lcId: newLC.id,
      lcIssuedAt: newLC.issuedAt
    })

    toast.dismiss()
    toast.success(`Leaving Certificate issued successfully: ${lcNumber}`)
    setGeneratedLC(newLC)
    setIsIssuing(false)
  }

  const handleDownloadPDF = async (lcDataRecord, studentId) => {
    const studentData = students.find((s) => s.id === studentId)
    if (!studentData) return

    toast.loading('Preparing document...')
    setPrintData({ student: studentData, record: lcDataRecord })

    setTimeout(async () => {
      try {
        const element = document.getElementById('lc-document-print')
        if (!element) {
          toast.dismiss()
          toast.error('Print layout not found')
          setPrintData(null)
          return
        }

        toast.loading('Generating PDF...')
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
        pdf.save(`Leaving_Certificate_${studentData.name.replace(/\s+/g, '_')}.pdf`)
        toast.dismiss()
        toast.success('Certificate downloaded successfully')
      } catch (err) {
        console.error(err)
        toast.dismiss()
        toast.error('Failed to generate PDF')
      } finally {
        setPrintData(null)
      }
    }, 150)
  }

  const handleResetGenerator = () => {
    setStep(1)
    setSearchQuery('')
    setSelectedStudent(null)
    setGeneratedLC(null)
  }

  const handleTriggerRevoke = (recordId) => {
    setRevokeRecordId(recordId)
    setRevokeReason('')
    setShowRevokeModal(true)
  }

  const handleRevokeConfirm = () => {
    if (!revokeReason.trim()) {
      toast.error('Cancellation reason is required')
      return
    }

    const lcRecord = lcRecords.find((r) => r.id === revokeRecordId)
    if (!lcRecord) return

    // 1. Revoke LC (sets status to Cancelled and saves reason)
    revokeLC(revokeRecordId, revokeReason)

    // 2. Restore Student Login
    updateStudent(lcRecord.studentId, {
      isActive: true,
      status: 'Active',
      lcId: null,
      lcIssuedAt: null
    })

    setShowRevokeModal(false)
    toast.success('LC cancelled. Student login restored.')
  }

  const handleViewLC = (record) => {
    setViewRecord(record)
    setShowViewModal(true)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <PageHeader title="Leaving Certificate (LC) Generator" />

      {/* Generator Wizard Panel */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-6">
        <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider">Issue Leaving Certificate</h3>

        {/* Step Indicators */}
        {!generatedLC && (
          <div className="flex items-center gap-2 text-xs font-semibold text-textMuted border-b border-border pb-4">
            <span className={`px-2.5 py-1 rounded-lg ${step === 1 ? 'bg-primary text-white' : 'bg-gray-100 text-textMuted'}`}>
              1. Search
            </span>
            <ArrowRight className="h-3.5 w-3.5" />
            <span className={`px-2.5 py-1 rounded-lg ${step === 2 ? 'bg-primary text-white' : 'bg-gray-100 text-textMuted'}`}>
              2. Fee & Card Check
            </span>
            <ArrowRight className="h-3.5 w-3.5" />
            <span className={`px-2.5 py-1 rounded-lg ${step === 3 ? 'bg-primary text-white' : 'bg-gray-100 text-textMuted'}`}>
              3. LC Form
            </span>
            <ArrowRight className="h-3.5 w-3.5" />
            <span className={`px-2.5 py-1 rounded-lg ${step === 4 ? 'bg-primary text-white' : 'bg-gray-100 text-textMuted'}`}>
              4. Preview & Issue
            </span>
          </div>
        )}

        {/* STEP 1: SEARCH */}
        {step === 1 && !generatedLC && (
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-semibold text-textMuted">Search Student (Name or GR Number)</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter name or GR-XXXX..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-border bg-white pl-10 pr-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                />
                <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-textMuted" />
              </div>
            </div>

            {filteredStudents.length > 0 && (
              <div className="border border-border rounded-xl divide-y divide-border/50 max-h-60 overflow-y-auto bg-white/5">
                {filteredStudents.map((std) => {
                  const cls = classes.find((c) => c.id === std.classId)
                  return (
                    <div
                      key={std.id}
                      onClick={() => handleSelectStudent(std)}
                      className="flex items-center justify-between p-3.5 hover:bg-primary/5 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar name={std.name} size="sm" photoUrl={std.photoUrl} />
                        <div>
                          <p className="text-sm font-semibold text-textPrimary">{std.name}</p>
                          <p className="text-xs text-textMuted mt-0.5">
                            GR Number: {std.grNumber || '—'} | Class: {cls ? `${cls.standard}${cls.division}` : 'N/A'}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-textMuted" />
                    </div>
                  )
                })}
              </div>
            )}

            {searchQuery.trim() && filteredStudents.length === 0 && (
              <p className="text-sm text-textMuted italic">No active students found matching "{searchQuery}"</p>
            )}
          </div>
        )}

        {/* STEP 2: FEE & CARD CHECK */}
        {step === 2 && selectedStudent && (
          <div className="space-y-4">
            <div className="rounded-xl border border-border p-4 bg-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar name={selectedStudent.name} size="md" photoUrl={selectedStudent.photoUrl} />
                <div>
                  <p className="text-sm font-bold text-textPrimary">{selectedStudent.name}</p>
                  <p className="text-xs text-textMuted mt-0.5">
                    GR Number: {selectedStudent.grNumber} | Father: {selectedStudent.father?.name}
                  </p>
                  <p className="text-xs text-textMuted mt-0.5">
                    Class: {selectedStudent.standard}{selectedStudent.division} ({selectedStudent.medium})
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-textMuted font-bold uppercase block">Current Fee Status</span>
                {feeStatusInfo.cleared ? (
                  <Badge label="🟢 CLEARED" color="green" className="mt-1" />
                ) : (
                  <Badge label="🔴 PENDING" color="red" className="mt-1" />
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handlePrevStep}
                className="rounded-xl border border-border px-5 py-2.5 text-xs font-semibold text-textMuted hover:bg-gray-50 flex items-center gap-1.5"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button
                onClick={handleNextStep}
                className="rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-white shadow-button hover:bg-primary/95 flex items-center gap-1.5 ml-auto"
              >
                Proceed to Details <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: LC FORM */}
        {step === 3 && selectedStudent && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-textMuted">Leaving Date *</label>
                <input
                  type="date"
                  value={leavingDate}
                  onChange={(e) => setLeavingDate(e.target.value)}
                  required
                  className="w-full rounded-xl border border-border px-4 py-2.5 text-sm bg-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-textMuted">Reason for Leaving *</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full rounded-xl border border-border px-4 py-2.5 text-sm bg-white"
                >
                  <option value="Transfer to another city">Transfer to another city</option>
                  <option value="Admission in another school">Admission in another school</option>
                  <option value="Parent's request">Parent's request</option>
                  <option value="Completed education">Completed education</option>
                  <option value="Long absence">Long absence</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {reason === 'Other' && (
                <div className="col-span-2">
                  <label className="mb-1 block text-xs font-semibold text-textMuted">Specify Reason *</label>
                  <input
                    type="text"
                    value={otherReason}
                    onChange={(e) => setOtherReason(e.target.value)}
                    placeholder="Enter school leaving reason..."
                    required
                    className="w-full rounded-xl border border-border px-4 py-2.5 text-sm"
                  />
                </div>
              )}

              <div className="col-span-2">
                <label className="mb-1 block text-xs font-semibold text-textMuted">Conduct & Character *</label>
                <textarea
                  value={conduct}
                  onChange={(e) => setConduct(e.target.value)}
                  rows={2}
                  required
                  className="w-full rounded-xl border border-border px-4 py-2.5 text-sm resize-none"
                />
              </div>

              <div className="col-span-2 flex items-center justify-between border-t border-border pt-4">
                <div>
                  <p className="text-xs font-bold text-textPrimary">Fees Cleared</p>
                  <p className="text-[10px] text-textMuted">Toggle if all outstanding fee payments are settled</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFeesCleared(!feesCleared)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${feesCleared ? 'bg-green-600' : 'bg-gray-200'}`}
                  aria-label="Toggle fees cleared status"
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${feesCleared ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handlePrevStep}
                className="rounded-xl border border-border px-5 py-2.5 text-xs font-semibold text-textMuted hover:bg-gray-50 flex items-center gap-1.5"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button
                onClick={handleNextStep}
                className="rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-white shadow-button hover:bg-primary/95 flex items-center gap-1.5 ml-auto"
              >
                Review Certificate <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: PREVIEW & ISSUE */}
        {step === 4 && selectedStudent && !generatedLC && (
          <div className="space-y-6">
            <div className="border border-border rounded-xl p-4 bg-gray-50 overflow-x-auto">
              <LCDocument
                student={selectedStudent}
                lcData={{
                  leavingDate,
                  reason,
                  otherReason,
                  conduct,
                  feesCleared
                }}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handlePrevStep}
                className="rounded-xl border border-border px-5 py-2.5 text-xs font-semibold text-textMuted hover:bg-gray-50 flex items-center gap-1.5"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>

              <button
                onClick={handleTriggerIssue}
                className="rounded-xl bg-highlight px-6 py-2.5 text-xs font-semibold text-white shadow-button hover:bg-highlight/90 flex items-center gap-1.5 ml-auto uppercase tracking-wider"
              >
                <Check className="h-4 w-4" /> Issue LC
              </button>
            </div>
          </div>
        )}

        {/* SUCCESS STATE */}
        {generatedLC && (
          <div className="rounded-xl border border-green-200 bg-green-50/50 p-6 text-center space-y-6">
            <div className="mx-auto h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <Check className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-green-800">Leaving Certificate Issued!</h4>
              <p className="text-xs text-green-600 mt-1">
                Student {selectedStudent.name} has been deactivated. LC Number: {generatedLC.lcNumber}
              </p>
            </div>

            {/* Hidden printable container */}
            <div className="hidden">
              <div className="bg-white p-4">
                <LCDocument student={selectedStudent} lcData={generatedLC} />
              </div>
            </div>

            {/* Quick Preview of Issued Document */}
            <div className="border border-border rounded-xl p-4 bg-gray-50 overflow-x-auto scale-95 origin-top max-w-lg mx-auto">
              <LCDocument student={selectedStudent} lcData={generatedLC} />
            </div>

            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <button
                onClick={() => handleDownloadPDF(generatedLC, selectedStudent.id)}
                className="rounded-xl bg-green-600 px-5 py-2.5 text-xs font-semibold text-white shadow hover:bg-green-700 flex items-center gap-1.5"
              >
                <Download className="h-4 w-4" /> Download LC PDF
              </button>
              <button
                onClick={handleResetGenerator}
                className="rounded-xl border border-border bg-white px-5 py-2.5 text-xs font-semibold text-textMuted hover:bg-gray-50 flex items-center gap-1.5"
              >
                <RefreshCw className="h-4 w-4" /> Issue Another
              </button>
            </div>
          </div>
        )}
      </div>

      {/* LC List View Table */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-4">
        <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider">Leaving Certificates Register</h3>

        {lcRecords.length === 0 ? (
          <EmptyState
            title="No Leaving Certificates Issued"
            description="All issued leaving certificates will be listed in this registry table."
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border bg-gray-50/50 text-textMuted uppercase font-semibold">
                  <th className="px-6 py-4">LC Number</th>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Class</th>
                  <th className="px-6 py-4">Issue Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 text-textPrimary">
                {lcRecords.map((record) => {
                  const studentMatch = students.find((s) => s.id === record.studentId)
                  return (
                    <tr key={record.id} className="hover:bg-gray-50/30">
                      <td className="px-6 py-4 font-bold text-primary">{record.lcNumber}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Avatar name={record.studentName} size="xs" photoUrl={studentMatch?.photoUrl} />
                          <span className="font-semibold">{record.studentName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{record.classLabel}</td>
                      <td className="px-6 py-4 text-textMuted">{formatDate(record.issuedAt)}</td>
                      <td className="px-6 py-4">
                        <Badge
                          label={record.status}
                          color={record.status === 'Active' ? 'green' : 'red'}
                        />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2.5">
                          <button
                            onClick={() => handleViewLC(record)}
                            className="text-primary hover:underline font-semibold"
                          >
                            View
                          </button>
                          {record.status === 'Active' ? (
                            <button
                              onClick={() => handleTriggerRevoke(record.id)}
                              className="text-highlight hover:underline font-semibold"
                            >
                              Revoke/Cancel
                            </button>
                          ) : (
                            <span className="text-[10px] text-textMuted font-bold uppercase">Cancelled</span>
                          )}
                          <button
                            onClick={() => handleDownloadPDF(record, record.studentId)}
                            className="text-green-600 hover:underline font-semibold flex items-center gap-0.5"
                          >
                            📥 PDF
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CONFIRM ISSUE LC DIALOG */}
      <ConfirmDialog
        isOpen={showIssueConfirm}
        title="Issue Leaving Certificate?"
        message="⚠️ This will deactivate the student's login. This action can be reversed."
        confirmLabel="Issue LC"
        isDanger={true}
        onConfirm={handleIssueConfirm}
        onCancel={() => setShowIssueConfirm(false)}
      />

      {/* REVOKE LC MODAL */}
      <Modal isOpen={showRevokeModal} onClose={() => setShowRevokeModal(false)} title="Cancel Leaving Certificate" size="sm">
        <div className="space-y-4">
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-800 text-xs flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <span>This will reactivate the student login and restore active status.</span>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-textMuted">Reason for Cancellation *</label>
            <textarea
              value={revokeReason}
              onChange={(e) => setRevokeReason(e.target.value)}
              placeholder="Enter reason for cancelling this LC (e.g. Issued by mistake, Student returned)..."
              rows={3}
              required
              className="w-full rounded-xl border border-border px-4 py-2.5 text-sm resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setShowRevokeModal(false)}
              className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-textMuted hover:bg-gray-50"
            >
              Close
            </button>
            <button
              onClick={handleRevokeConfirm}
              disabled={!revokeReason.trim()}
              className="rounded-xl bg-highlight px-5 py-2 text-xs font-bold text-white shadow disabled:opacity-50"
            >
              Cancel LC & Restore
            </button>
          </div>
        </div>
      </Modal>

      {/* VIEW CERTIFICATE MODAL */}
      <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title="Leaving Certificate Preview" size="md">
        {viewRecord && (() => {
          const studentMatch = students.find((s) => s.id === viewRecord.studentId)
          return (
            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
              <div className="border border-border rounded-xl p-4 bg-gray-50 overflow-x-auto">
                <LCDocument student={studentMatch} lcData={viewRecord} />
              </div>

              {viewRecord.status === 'Cancelled' && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-800 text-xs space-y-1">
                  <p className="font-bold flex items-center gap-1">
                    <XCircle className="h-4 w-4" /> Certificate Cancelled
                  </p>
                  <p>Cancelled On: {formatDate(viewRecord.cancelledAt)}</p>
                  <p>Reason: {viewRecord.cancellationReason}</p>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="rounded-xl border border-border px-5 py-2.5 text-xs font-semibold text-textMuted hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => handleDownloadPDF(viewRecord, viewRecord.studentId)}
                  className="rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-white shadow"
                >
                  Download PDF
                </button>
              </div>
            </div>
          )
        })()}
      </Modal>
      {/* Hidden container for background PDF generation */}
      <div className="absolute -top-[9999px] -left-[9999px] pointer-events-none">
        {printData && (
          <div className="bg-white p-4">
            <LCDocument
              student={printData.student}
              lcData={printData.record}
              id="lc-document-print"
            />
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default LCGenerator
