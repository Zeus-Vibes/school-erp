import { createContext, useContext, useState, useCallback } from 'react'
import { mockStudents } from '../data/mockStudents'
import { mockTeachers } from '../data/mockTeachers'
import { mockClasses } from '../data/mockClasses'
import { mockAcademicYears } from '../data/mockAcademicYears'
import { mockNotices } from '../data/mockNotices'
import { timetable as initialTimetable } from '../data/timetable'
import { attendanceData as initialAttendance } from '../data/attendance'
import { feesData as initialFees } from '../data/fees'

const DataContext = createContext(null)

export const useData = () => {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}

const loadState = (key, fallback) => {
  try {
    const stored = localStorage.getItem(`sbis_${key}`)
    return stored ? JSON.parse(stored) : fallback
  } catch {
    return fallback
  }
}

const saveState = (key, data) => {
  try {
    localStorage.setItem(`sbis_${key}`, JSON.stringify(data))
  } catch (e) {
    console.error('Failed to save state to localStorage', e)
  }
}

export const DataProvider = ({ children }) => {
  // --- States ---
  const [academicYears, setAcademicYears] = useState(() => loadState('academicYears', mockAcademicYears))
  const [classes, setClasses] = useState(() => loadState('classes', mockClasses))
  const [teachers, setTeachers] = useState(() => loadState('teachers', mockTeachers))
  const [students, setStudents] = useState(() => loadState('students', mockStudents))
  const [timetables, setTimetables] = useState(() => loadState('timetables', []))
  const [attendanceRecords, setAttendanceRecords] = useState(() => loadState('attendanceRecords', initialAttendance))
  const [holidays, setHolidays] = useState(() => loadState('holidays', [
    { id: 'h1', date: '2026-08-15', name: 'Independence Day', description: 'National holiday' },
    { id: 'h2', date: '2026-10-02', name: 'Gandhi Jayanti', description: 'National holiday' },
    { id: 'h3', date: '2026-12-25', name: 'Christmas', description: 'Winter holiday' }
  ]))
  const [feeStructures, setFeeStructures] = useState(() => loadState('feeStructures', []))
  const [feePayments, setFeePayments] = useState(() => {
    const loaded = loadState('feePayments', initialFees)
    const hasOldData = loaded.some((f) => f.studentId === 'S001' || f.class === '10A')
    if (hasOldData) {
      saveState('feePayments', initialFees)
      return initialFees
    }
    return loaded
  })
  const [customInstallmentPlans, setCustomInstallmentPlans] = useState(() => loadState('customInstallmentPlans', []))
  const initialExams = [
    {
      id: 'exam-mt1',
      name: 'Mid Term 1',
      classId: 'class-3-eng-a',
      academicYearId: '2024-25',
      startDate: '2024-09-10',
      endDate: '2024-09-15',
      status: 'Completed',
      subjects: [
        { name: 'English', maxMarks: 100, passingMarks: 33, teacherId: 'SBIS-TCH-2425-001', marksSubmitted: true },
        { name: 'Mathematics', maxMarks: 100, passingMarks: 33, teacherId: 'SBIS-TCH-2425-001', marksSubmitted: true },
        { name: 'Science', maxMarks: 100, passingMarks: 33, teacherId: 'SBIS-TCH-2425-001', marksSubmitted: true },
        { name: 'Social Studies', maxMarks: 100, passingMarks: 33, teacherId: 'SBIS-TCH-2425-003', marksSubmitted: true }
      ],
      gradeRanges: [
        { min: 90, max: 100, grade: 'A+', remark: 'Outstanding' },
        { min: 75, max: 89, grade: 'A', remark: 'Excellent' },
        { min: 60, max: 74, grade: 'B', remark: 'Good' },
        { min: 45, max: 59, grade: 'C', remark: 'Satisfactory' },
        { min: 33, max: 44, grade: 'D', remark: 'Pass' },
        { min: 0, max: 32, grade: 'F', remark: 'Fail' }
      ]
    },
    {
      id: 'exam-mt2',
      name: 'Mid Term 2',
      classId: 'class-3-eng-a',
      academicYearId: '2024-25',
      startDate: '2024-12-10',
      endDate: '2024-12-15',
      status: 'Completed',
      subjects: [
        { name: 'English', maxMarks: 100, passingMarks: 33, teacherId: 'SBIS-TCH-2425-001', marksSubmitted: true },
        { name: 'Mathematics', maxMarks: 100, passingMarks: 33, teacherId: 'SBIS-TCH-2425-001', marksSubmitted: true },
        { name: 'Science', maxMarks: 100, passingMarks: 33, teacherId: 'SBIS-TCH-2425-001', marksSubmitted: true },
        { name: 'Social Studies', maxMarks: 100, passingMarks: 33, teacherId: 'SBIS-TCH-2425-003', marksSubmitted: true }
      ],
      gradeRanges: [
        { min: 90, max: 100, grade: 'A+', remark: 'Outstanding' },
        { min: 75, max: 89, grade: 'A', remark: 'Excellent' },
        { min: 60, max: 74, grade: 'B', remark: 'Good' },
        { min: 45, max: 59, grade: 'C', remark: 'Satisfactory' },
        { min: 33, max: 44, grade: 'D', remark: 'Pass' },
        { min: 0, max: 32, grade: 'F', remark: 'Fail' }
      ]
    },
    {
      id: 'exam-fe',
      name: 'Final Exam',
      classId: 'class-3-eng-a',
      academicYearId: '2024-25',
      startDate: '2025-03-10',
      endDate: '2025-03-15',
      status: 'Marks Entry Open',
      subjects: [
        { name: 'English', maxMarks: 100, passingMarks: 33, teacherId: 'SBIS-TCH-2425-001', marksSubmitted: false },
        { name: 'Mathematics', maxMarks: 100, passingMarks: 33, teacherId: 'SBIS-TCH-2425-001', marksSubmitted: false },
        { name: 'Science', maxMarks: 100, passingMarks: 33, teacherId: 'SBIS-TCH-2425-001', marksSubmitted: false },
        { name: 'Social Studies', maxMarks: 100, passingMarks: 33, teacherId: 'SBIS-TCH-2425-003', marksSubmitted: false }
      ],
      gradeRanges: [
        { min: 90, max: 100, grade: 'A+', remark: 'Outstanding' },
        { min: 75, max: 89, grade: 'A', remark: 'Excellent' },
        { min: 60, max: 74, grade: 'B', remark: 'Good' },
        { min: 45, max: 59, grade: 'C', remark: 'Satisfactory' },
        { min: 33, max: 44, grade: 'D', remark: 'Pass' },
        { min: 0, max: 32, grade: 'F', remark: 'Fail' }
      ]
    }
  ]

  const initialExamMarks = [
    { id: 'm1', examId: 'exam-mt1', studentId: 'SB-2425-3A-01', subjectName: 'English', marks: 85, grade: 'A', isAbsent: false, isExempt: false },
    { id: 'm2', examId: 'exam-mt1', studentId: 'SB-2425-3A-01', subjectName: 'Mathematics', marks: 90, grade: 'A+', isAbsent: false, isExempt: false },
    { id: 'm3', examId: 'exam-mt1', studentId: 'SB-2425-3A-01', subjectName: 'Science', marks: 88, grade: 'A', isAbsent: false, isExempt: false },
    { id: 'm4', examId: 'exam-mt1', studentId: 'SB-2425-3A-01', subjectName: 'Social Studies', marks: 82, grade: 'A', isAbsent: false, isExempt: false },

    { id: 'm5', examId: 'exam-mt2', studentId: 'SB-2425-3A-01', subjectName: 'English', marks: 88, grade: 'A', isAbsent: false, isExempt: false },
    { id: 'm6', examId: 'exam-mt2', studentId: 'SB-2425-3A-01', subjectName: 'Mathematics', marks: 95, grade: 'A+', isAbsent: false, isExempt: false },
    { id: 'm7', examId: 'exam-mt2', studentId: 'SB-2425-3A-01', subjectName: 'Science', marks: 92, grade: 'A+', isAbsent: false, isExempt: false },
    { id: 'm8', examId: 'exam-mt2', studentId: 'SB-2425-3A-01', subjectName: 'Social Studies', marks: 84, grade: 'A', isAbsent: false, isExempt: false }
  ]

  const [exams, setExams] = useState(() => loadState('exams', initialExams))
  const [examMarks, setExamMarks] = useState(() => loadState('examMarks', initialExamMarks))
  const [notices, setNotices] = useState(() => loadState('notices', mockNotices))
  const [lcRecords, setLcRecords] = useState(() => loadState('lcRecords', []))
  const [settings, setSettings] = useState(() => loadState('settings', {
    schoolName: 'Shree Bala International School',
    address: 'Near Suramya Heights, Eklingji Bopal Road, Sanand - Ahmedabad',
    phone: '+91 84888 87896',
    email: 'shreebalainternationalschool@gmail.com',
    whatsapp: '+91 84888 87896',
    instagramUrl: 'https://instagram.com/shreebala',
    facebookUrl: 'https://facebook.com/shreebala',
    youtubeUrl: 'https://youtube.com/shreebala',
    principalName: 'Mrs. Manisha Patel',
    registrarName: 'Mr. Rajesh Shah',
    lowAttendanceThreshold: 75
  }))

  // Helper helper to update state and sync to localStorage
  const updateAndSync = (key, setter, newData) => {
    setter(newData)
    saveState(key, newData)
  }

  // --- CRUD Operations ---

  // Academic Years
  const addAcademicYear = useCallback((year) => {
    setAcademicYears((prev) => {
      const updated = [...prev, { ...year, id: year.id || year.label }]
      saveState('academicYears', updated)
      return updated
    })
  }, [])

  const updateAcademicYear = useCallback((id, updatedYear) => {
    setAcademicYears((prev) => {
      const updated = prev.map((y) => (y.id === id ? { ...y, ...updatedYear } : y))
      saveState('academicYears', updated)
      return updated
    })
  }, [])

  const deleteAcademicYear = useCallback((id) => {
    setAcademicYears((prev) => {
      const updated = prev.filter((y) => y.id !== id)
      saveState('academicYears', updated)
      return updated
    })
  }, [])

  const setActiveAcademicYear = useCallback((id) => {
    setAcademicYears((prev) => {
      const updated = prev.map((y) => ({
        ...y,
        isActive: y.id === id
      }))
      saveState('academicYears', updated)
      return updated
    })
  }, [])

  // Classes
  const addClass = useCallback((clsData) => {
    setClasses((prev) => {
      const newCls = { ...clsData, id: clsData.id || `class-${String(Date.now()).slice(-6)}` }
      const updated = [...prev, newCls]
      saveState('classes', updated)
      return updated
    })
  }, [])

  const updateClass = useCallback((id, updatedCls) => {
    setClasses((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, ...updatedCls } : c))
      saveState('classes', updated)
      return updated
    })
  }, [])

  const deleteClass = useCallback((id) => {
    setClasses((prev) => {
      const updated = prev.filter((c) => c.id !== id)
      saveState('classes', updated)
      return updated
    })
  }, [])

  // Teachers
  const addTeacher = useCallback((teacherData) => {
    setTeachers((prev) => {
      const employeeId = `SBIS-TCH-${String(prev.length + 1).padStart(3, '0')}`
      const userId = `SBIS-TCH-2425-${String(prev.length + 1).padStart(3, '0')}`
      const newTeacher = {
        ...teacherData,
        id: teacherData.id || userId,
        employeeId,
        userId,
        isActive: true
      }
      const updated = [...prev, newTeacher]
      saveState('teachers', updated)
      return updated
    })
  }, [])

  const updateTeacher = useCallback((id, updatedTeacher) => {
    setTeachers((prev) => {
      const updated = prev.map((t) => (t.id === id ? { ...t, ...updatedTeacher } : t))
      saveState('teachers', updated)
      return updated
    })
  }, [])

  const deleteTeacher = useCallback((id) => {
    setTeachers((prev) => {
      const updated = prev.filter((t) => t.id !== id)
      saveState('teachers', updated)
      return updated
    })
  }, [])

  // Students
  const addStudent = useCallback((studentData) => {
    setStudents((prev) => {
      const rollNoStr = String(studentData.rollNumber).padStart(2, '0')
      const stdDiv = `${studentData.standard}${studentData.division}`.toUpperCase()
      const userId = `SB-2425-${stdDiv}-${rollNoStr}`
      const newStudent = {
        ...studentData,
        id: studentData.id || userId,
        userId,
        isActive: true,
        lcId: null
      }
      const updated = [...prev, newStudent]
      saveState('students', updated)
      return updated
    })
  }, [])

  const updateStudent = useCallback((id, updatedStudent) => {
    setStudents((prev) => {
      const updated = prev.map((s) => (s.id === id ? { ...s, ...updatedStudent } : s))
      saveState('students', updated)
      return updated
    })
  }, [])

  const deleteStudent = useCallback((id) => {
    setStudents((prev) => {
      const updated = prev.filter((s) => s.id !== id)
      saveState('students', updated)
      return updated
    })
  }, [])

  // Timetables
  const addTimetable = useCallback((timetableData) => {
    setTimetables((prev) => {
      const newTimetable = { ...timetableData, id: timetableData.id || `tt-${String(Date.now()).slice(-6)}` }
      const updated = [...prev, newTimetable]
      saveState('timetables', updated)
      return updated
    })
  }, [])

  const updateTimetable = useCallback((id, updatedTimetable) => {
    setTimetables((prev) => {
      const updated = prev.map((t) => (t.id === id ? { ...t, ...updatedTimetable } : t))
      saveState('timetables', updated)
      return updated
    })
  }, [])

  const deleteTimetable = useCallback((id) => {
    setTimetables((prev) => {
      const updated = prev.filter((t) => t.id !== id)
      saveState('timetables', updated)
      return updated
    })
  }, [])

  // Attendance Records
  const addAttendanceRecord = useCallback((record) => {
    setAttendanceRecords((prev) => {
      const updated = [...prev, { ...record, id: record.id || `att-${String(Date.now()).slice(-6)}` }]
      saveState('attendanceRecords', updated)
      return updated
    })
  }, [])

  const updateAttendanceRecord = useCallback((id, updatedRecord) => {
    setAttendanceRecords((prev) => {
      const updated = prev.map((r) => (r.id === id ? { ...r, ...updatedRecord } : r))
      saveState('attendanceRecords', updated)
      return updated
    })
  }, [])

  const saveAttendanceBatch = useCallback((date, classId, subject, records, editorInfo) => {
    setAttendanceRecords((prev) => {
      const updated = [...prev]
      records.forEach((rec) => {
        const existingIdx = updated.findIndex(
          (r) => r.studentId === rec.studentId && r.date === date && r.subject === subject
        )
        if (existingIdx > -1) {
          const oldRecord = updated[existingIdx]
          const statusChanged = oldRecord.status !== rec.status
          const newHistory = [...(oldRecord.editHistory || [])]
          if (statusChanged && editorInfo?.reason) {
            newHistory.push({
              editedBy: editorInfo.userId,
              editedByName: editorInfo.name,
              editedAt: new Date().toISOString(),
              reason: editorInfo.reason,
              previousStatus: oldRecord.status
            })
          }
          updated[existingIdx] = {
            ...oldRecord,
            status: rec.status,
            editHistory: newHistory
          }
        } else {
          updated.push({
            id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            studentId: rec.studentId,
            classId,
            subject,
            date,
            status: rec.status,
            editHistory: []
          })
        }
      })
      saveState('attendanceRecords', updated)
      return updated
    })
  }, [])

  // Holidays
  const addHoliday = useCallback((holiday) => {
    setHolidays((prev) => {
      const newHoliday = { ...holiday, id: holiday.id || `hol-${String(Date.now()).slice(-6)}` }
      const updated = [...prev, newHoliday]
      saveState('holidays', updated)
      return updated
    })
  }, [])

  const deleteHoliday = useCallback((id) => {
    setHolidays((prev) => {
      const updated = prev.filter((h) => h.id !== id)
      saveState('holidays', updated)
      return updated
    })
  }, [])

  const updateHoliday = useCallback((id, updatedHoliday) => {
    setHolidays((prev) => {
      const updated = prev.map((h) => (h.id === id ? { ...h, ...updatedHoliday } : h))
      saveState('holidays', updated)
      return updated
    })
  }, [])

  // Fee Structures
  const addFeeStructure = useCallback((structure) => {
    setFeeStructures((prev) => {
      const newStructure = { ...structure, id: structure.id || `fs-${String(Date.now()).slice(-6)}` }
      const updated = [...prev, newStructure]
      saveState('feeStructures', updated)
      return updated
    })
  }, [])

  const updateFeeStructure = useCallback((id, updatedStructure) => {
    setFeeStructures((prev) => {
      const updated = prev.map((fs) => (fs.id === id ? { ...fs, ...updatedStructure } : fs))
      saveState('feeStructures', updated)
      return updated
    })
  }, [])

  const deleteFeeStructure = useCallback((id) => {
    setFeeStructures((prev) => {
      const updated = prev.filter((fs) => fs.id !== id)
      saveState('feeStructures', updated)
      return updated
    })
  }, [])

  // Fee Payments
  const addFeePayment = useCallback((payment) => {
    setFeePayments((prev) => {
      const newPayment = { ...payment, id: payment.id || `pay-${String(Date.now()).slice(-6)}` }
      const updated = [...prev, newPayment]
      saveState('feePayments', updated)
      return updated
    })
  }, [])

  const updateFeePayment = useCallback((id, updatedPayment) => {
    setFeePayments((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, ...updatedPayment } : p))
      saveState('feePayments', updated)
      return updated
    })
  }, [])

  // Custom Installment Plans
  const addCustomInstallmentPlan = useCallback((plan) => {
    setCustomInstallmentPlans((prev) => {
      const newPlan = { ...plan, id: plan.id || `cip-${String(Date.now()).slice(-6)}` }
      const updated = [...prev, newPlan]
      saveState('customInstallmentPlans', updated)
      return updated
    })
  }, [])

  const updateCustomInstallmentPlan = useCallback((id, updatedPlan) => {
    setCustomInstallmentPlans((prev) => {
      const updated = prev.map((cip) => (cip.id === id ? { ...cip, ...updatedPlan } : cip))
      saveState('customInstallmentPlans', updated)
      return updated
    })
  }, [])

  // Exams
  const addExam = useCallback((exam) => {
    setExams((prev) => {
      const newExam = { ...exam, id: exam.id || `exam-${String(Date.now()).slice(-6)}` }
      const updated = [...prev, newExam]
      saveState('exams', updated)
      return updated
    })
  }, [])

  const updateExam = useCallback((id, updatedExam) => {
    setExams((prev) => {
      const updated = prev.map((e) => (e.id === id ? { ...e, ...updatedExam } : e))
      saveState('exams', updated)
      return updated
    })
  }, [])

  const deleteExam = useCallback((id) => {
    setExams((prev) => {
      const updated = prev.filter((e) => e.id !== id)
      saveState('exams', updated)
      return updated
    })
  }, [])

  // Exam Marks
  const addExamMark = useCallback((mark) => {
    setExamMarks((prev) => {
      const newMark = { ...mark, id: mark.id || `mark-${String(Date.now()).slice(-6)}` }
      const updated = [...prev, newMark]
      saveState('examMarks', updated)
      return updated
    })
  }, [])

  const updateExamMark = useCallback((id, updatedMark) => {
    setExamMarks((prev) => {
      const updated = prev.map((em) => (em.id === id ? { ...em, ...updatedMark } : em))
      saveState('examMarks', updated)
      return updated
    })
  }, [])

  // Notices
  const addNotice = useCallback((notice) => {
    setNotices((prev) => {
      const newNotice = { ...notice, id: notice.id || `N${String(Date.now()).slice(-3)}` }
      const updated = [newNotice, ...prev]
      saveState('notices', updated)
      return updated
    })
  }, [])

  const updateNotice = useCallback((id, updatedNotice) => {
    setNotices((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, ...updatedNotice } : n))
      saveState('notices', updated)
      return updated
    })
  }, [])

  const deleteNotice = useCallback((id) => {
    setNotices((prev) => {
      const updated = prev.filter((n) => n.id !== id)
      saveState('notices', updated)
      return updated
    })
  }, [])

  // LC Records
  const issueLC = useCallback((lcRecord) => {
    setLcRecords((prev) => {
      const updated = [...prev, { ...lcRecord, id: lcRecord.id || `lc-${String(Date.now()).slice(-6)}` }]
      saveState('lcRecords', updated)
      return updated
    })
  }, [])

  const revokeLC = useCallback((id, cancellationReason) => {
    setLcRecords((prev) => {
      const updated = prev.map((lc) =>
        lc.id === id
          ? {
              ...lc,
              status: 'Cancelled',
              cancelledAt: new Date().toISOString(),
              cancellationReason
            }
          : lc
      )
      saveState('lcRecords', updated)
      return updated
    })
  }, [])

  const updateSettings = useCallback((newSettings) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings }
      saveState('settings', updated)
      return updated
    })
  }, [])

  const getEnrolledCount = useCallback((classId) => {
    return students.filter(s =>
      (s.currentClassId === classId || s.classId === classId) &&
      s.isActive !== false &&
      (!s.status || s.status === 'Active')
    ).length
  }, [students])

  const value = {
    academicYears,
    classes,
    teachers,
    students,
    timetables,
    attendanceRecords,
    holidays,
    feeStructures,
    feePayments,
    customInstallmentPlans,
    exams,
    examMarks,
    notices,
    lcRecords,
    settings,
    getEnrolledCount,
    
    // CRUD methods
    addAcademicYear,
    updateAcademicYear,
    deleteAcademicYear,
    setActiveAcademicYear,
    addClass,
    updateClass,
    deleteClass,
    addTeacher,
    updateTeacher,
    deleteTeacher,
    addStudent,
    updateStudent,
    deleteStudent,
    addTimetable,
    updateTimetable,
    deleteTimetable,
    addAttendanceRecord,
    updateAttendanceRecord,
    saveAttendanceBatch,
    addHoliday,
    deleteHoliday,
    updateHoliday,
    addFeeStructure,
    updateFeeStructure,
    deleteFeeStructure,
    addFeePayment,
    updateFeePayment,
    addCustomInstallmentPlan,
    updateCustomInstallmentPlan,
    addExam,
    updateExam,
    deleteExam,
    addExamMark,
    updateExamMark,
    addNotice,
    updateNotice,
    deleteNotice,
    issueLC,
    revokeLC,
    updateSettings
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}
