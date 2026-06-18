import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { GraduationCap, AlertTriangle, Check, ArrowRight, ShieldAlert, CheckCircle } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import Badge from '../../components/ui/Badge'
import Avatar from '../../components/ui/Avatar'
import ConfirmDialog from '../../components/shared/ConfirmDialog'
import EmptyState from '../../components/shared/EmptyState'
import { useData } from '../../context/DataContext'
import { getSchoolBrand } from '../../utils/schoolBrand'
import toast from 'react-hot-toast'

const BulkPromotion = () => {
  const { students, classes, academicYears, updateStudent } = useData()

  const [selectedClassId, setSelectedClassId] = useState('')
  const [targetYearId, setTargetYearId] = useState('2025-26') // next year

  // Track held back student IDs in a local Set/State
  const [heldBackStudentIds, setHeldBackStudentIds] = useState(new Set())
  const [showConfirm, setShowConfirm] = useState(false)
  const [isPromoting, setIsPromoting] = useState(false)

  // Filter classes
  const activeClasses = useMemo(() => {
    return classes
  }, [classes])

  // Set default class
  useMemo(() => {
    if (activeClasses.length > 0 && !selectedClassId) {
      setSelectedClassId(activeClasses[0].id)
    }
  }, [activeClasses, selectedClassId])

  // Current active students in selected class
  const classStudents = useMemo(() => {
    if (!selectedClassId) return []
    return students.filter((s) => s.classId === selectedClassId && s.isActive)
  }, [students, selectedClassId])

  // Clear hold back selections on class change
  useMemo(() => {
    setHeldBackStudentIds(new Set())
  }, [selectedClassId])

  const handleToggleHoldBack = (studentId) => {
    setHeldBackStudentIds((prev) => {
      const updated = new Set(prev)
      if (updated.has(studentId)) {
        updated.delete(studentId)
      } else {
        updated.add(studentId)
      }
      return updated
    })
  }

  // Next standard mapping helper
  const getNextStandard = (std) => {
    const stdStr = String(std).trim().toUpperCase()
    const promotionMap = {
      'LKG': 'UKG',
      'UKG': '1',
      '1': '2',
      '2': '3',
      '3': '4',
      '4': '5',
      '5': '6',
      '6': '7',
      '7': '8',
      '8': 'GRADUATE'
    }
    return promotionMap[stdStr] || stdStr
  }

  // Pre-calculated stats for the confirm dialog
  const summaryStats = useMemo(() => {
    let promoteCount = 0
    let holdCount = 0
    let graduateCount = 0

    classStudents.forEach((s) => {
      if (heldBackStudentIds.has(s.id)) {
        holdCount++
      } else {
        const nextStd = getNextStandard(s.standard)
        if (nextStd === 'GRADUATE') {
          graduateCount++
        } else {
          promoteCount++
        }
      }
    })

    return { promoteCount, holdCount, graduateCount }
  }, [classStudents, heldBackStudentIds])

  const handleTriggerPromotion = () => {
    if (classStudents.length === 0) {
      toast.error('No active students to promote')
      return
    }
    setShowConfirm(true)
  }

  const handleConfirmPromotion = async () => {
    setIsPromoting(true)
    setShowConfirm(false)
    toast.loading('Processing promotions...')

    await new Promise((resolve) => setTimeout(resolve, 1000))

    classStudents.forEach((student) => {
      const isHeldBack = heldBackStudentIds.has(student.id)

      if (isHeldBack) {
        // Held back: keep standard/class, set status to HeldBack, update year
        updateStudent(student.id, {
          status: 'HeldBack',
          academicYearId: targetYearId
        })
      } else {
        const nextStd = getNextStandard(student.standard)

        if (nextStd === 'GRADUATE') {
          // Graduate: set status to Graduated, isActive = false, standard stays 8
          updateStudent(student.id, {
            status: 'Graduated',
            isActive: false,
            academicYearId: targetYearId
          })
        } else {
          // Regular promotion: LKG -> UKG -> 1 etc.
          // recaculate schoolBrand
          const nextBrand = getSchoolBrand(nextStd)

          // Find next class ID if exists
          const nextClass = classes.find(
            (c) =>
              c.standard === nextStd &&
              c.division === student.division &&
              c.medium === student.medium &&
              c.academicYearId === targetYearId
          )

          updateStudent(student.id, {
            standard: nextStd,
            classId: nextClass?.id || student.classId, // fallback if class 4A doesn't exist
            currentClassId: nextClass?.id || null,
            status: 'Active',
            academicYearId: targetYearId,
            schoolBrand: nextBrand.name
          })
        }
      }
    })

    toast.dismiss()
    toast.success('Students promoted successfully!')
    setHeldBackStudentIds(new Set())
    setIsPromoting(false)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <PageHeader title="Bulk Academic Year Promotion" />

      {/* Prominent Warning Banner */}
      <div className="rounded-2xl border border-red-200 bg-red-50/50 p-5 shadow-sm flex items-start gap-4">
        <div className="p-3 bg-red-100 rounded-xl text-highlight">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-red-900">⚠️ Academic Year Promotion</h4>
          <p className="text-xs text-red-700 leading-relaxed">
            Promote all students from <strong>2024-25</strong> → <strong>{targetYearId}</strong>.
            <br />
            <strong>IMPORTANT:</strong> Class teachers do NOT change automatically. Please review class allocations carefully in class settings after confirming.
          </p>
        </div>
      </div>

      {/* Controls Panel */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-card flex flex-wrap gap-4 items-end">
        <div className="flex flex-col gap-1 w-64">
          <label className="text-xs font-semibold text-textMuted uppercase">Filter Current Class</label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="rounded-xl border border-border bg-white px-4 py-2.5 text-sm"
          >
            {activeClasses.map((c) => (
              <option key={c.id} value={c.id}>
                Class {c.standard}{c.division} ({c.medium})
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1 w-48">
          <label className="text-xs font-semibold text-textMuted uppercase">Target Academic Year</label>
          <select
            value={targetYearId}
            onChange={(e) => setTargetYearId(e.target.value)}
            className="rounded-xl border border-border bg-white px-4 py-2.5 text-sm"
          >
            <option value="2025-26">2025-26 (Next Year)</option>
            <option value="2026-27">2026-27</option>
          </select>
        </div>

        <button
          onClick={handleTriggerPromotion}
          disabled={classStudents.length === 0 || isPromoting}
          className="ml-auto rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-button hover:bg-primary/95 disabled:opacity-50 flex items-center gap-1.5"
          tabIndex={0}
        >
          <GraduationCap className="h-5 w-5" /> Promote Class Batch
        </button>
      </div>

      {/* Student Promotion Table */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-4">
        <div className="flex justify-between items-center border-b border-border pb-3">
          <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider">Class Promotion Roster</h3>
          <span className="text-xs text-textMuted font-semibold">
            {classStudents.length} Students Listed
          </span>
        </div>

        {classStudents.length === 0 ? (
          <EmptyState
            title="No Active Students Found"
            description="All students in this class have either been promoted or there are no active enrollments."
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border bg-gray-50/50 text-textMuted font-bold uppercase">
                  <th className="px-6 py-4">Student Name</th>
                  <th className="px-6 py-4 text-center">Current Standard</th>
                  <th className="px-6 py-4 text-center">Next Standard</th>
                  <th className="px-6 py-4 text-center">Hold Back (Retain in Class)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 text-textPrimary">
                {classStudents.map((student) => {
                  const isHeld = heldBackStudentIds.has(student.id)
                  const nextStd = getNextStandard(student.standard)
                  const brand = getSchoolBrand(student.standard)
                  const nextBrand = nextStd !== 'GRADUATE' ? getSchoolBrand(nextStd) : null
                  const targetClassExists = nextStd === 'GRADUATE' || classes.some(
                    (c) =>
                      c.standard === nextStd &&
                      c.division === student.division &&
                      c.medium === student.medium &&
                      c.academicYearId === targetYearId
                  )

                  return (
                    <tr key={student.id} className="hover:bg-gray-50/30 font-medium">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={student.name} size="xs" photoUrl={student.photoUrl} />
                          <div>
                            <span className="font-bold block">{student.name}</span>
                            <span className="text-[10px] text-textMuted">GR: {student.grNumber}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex flex-col items-center gap-0.5">
                          <span className="font-semibold">Standard {student.standard}</span>
                          <span className="text-[9px] text-textMuted">({brand.name})</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {isHeld ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-yellow-100 text-yellow-800">
                            Stay in Std {student.standard} (Held)
                          </span>
                        ) : nextStd === 'GRADUATE' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-800">
                            🎓 GRADUATE
                          </span>
                        ) : (
                          <div className="inline-flex flex-col items-center gap-0.5">
                            <span className="font-semibold text-primary">Standard {nextStd}</span>
                            <span className="text-[9px] text-textMuted">({nextBrand?.name})</span>
                            {!targetClassExists && (
                              <span className="mt-1 text-[10px] text-highlight font-bold leading-tight block">
                                ⚠️ No {nextStd} {student.medium} {student.division} class found for {targetYearId}. Create it first.
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={isHeld}
                          onChange={() => handleToggleHoldBack(student.id)}
                          className="rounded text-primary focus:ring-primary h-4.5 w-4.5 cursor-pointer"
                          aria-label={`Hold back ${student.name}`}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CONFIRM PROMOTION DIALOG */}
      <ConfirmDialog
        isOpen={showConfirm}
        title="Execute Bulk Promotion?"
        message={
          <div className="space-y-3">
            <p className="text-xs text-textMuted leading-relaxed">
              Are you sure you want to promote students in this class batch to the next Academic Year ({targetYearId})?
            </p>
            <div className="rounded-xl border border-border p-3.5 bg-gray-50 text-xs space-y-1.5 font-semibold text-textMuted">
              <p className="flex justify-between">
                <span>Promoting to next standard:</span>
                <span className="text-primary font-bold">{summaryStats.promoteCount} students</span>
              </p>
              <p className="flex justify-between">
                <span>Graduating (Class 8):</span>
                <span className="text-green-700 font-bold">{summaryStats.graduateCount} students</span>
              </p>
              <p className="flex justify-between">
                <span>Holding back (re-enroll same class):</span>
                <span className="text-yellow-600 font-bold">{summaryStats.holdCount} students</span>
              </p>
            </div>
            <p className="text-[10px] text-highlight font-bold uppercase">
              ⚠️ Warning: This action updates student records in place.
            </p>
          </div>
        }
        confirmLabel="Execute Promotion"
        isDanger={true}
        onConfirm={handleConfirmPromotion}
        onCancel={() => setShowConfirm(false)}
      />
    </motion.div>
  )
}

export default BulkPromotion
