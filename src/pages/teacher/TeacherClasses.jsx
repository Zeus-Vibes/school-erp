import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Layers, User, Calendar, BookOpen, Clock, Users, ArrowRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import EnrolledStudentsDrawer from '../../components/shared/EnrolledStudentsDrawer'

const TeacherClasses = () => {
  const { user } = useAuth()
  const { teachers, classes, students, getEnrolledCount } = useData()
  const navigate = useNavigate()

  const [selectedClass, setSelectedClass] = useState(null)

  // Find the logged-in teacher
  const currentTeacher = useMemo(() => {
    return teachers.find(t => t.id === user?.userId || t.userId === user?.userId)
  }, [teachers, user])

  // Get class teacher class
  const classTeacherOfClass = useMemo(() => {
    if (!currentTeacher || !currentTeacher.classTeacherOf) return null
    return classes.find(c => c.id === currentTeacher.classTeacherOf)
  }, [currentTeacher, classes])

  // Get all unique classes mapped to subjects taught
  const teachingClasses = useMemo(() => {
    if (!currentTeacher || !currentTeacher.subjectClassMapping) return []
    return currentTeacher.subjectClassMapping.map(mapping => {
      const cls = classes.find(c => c.id === mapping.classId)
      if (!cls) return null
      return {
        ...cls,
        subjectTaught: mapping.subject,
        studentCount: getEnrolledCount(mapping.classId)
      }
    }).filter(Boolean)
  }, [currentTeacher, classes, getEnrolledCount])

  const handleViewStudents = (cls) => {
    setSelectedClass(cls)
  }

  const handleMarkAttendance = (classId, subject) => {
    navigate(`/dashboard/teacher/attendance?classId=${classId}&subject=${encodeURIComponent(subject)}`)
  }

  const handleEnterMarks = (classId, subject) => {
    navigate(`/dashboard/teacher/marks?classId=${classId}&subject=${encodeURIComponent(subject)}`)
  }

  if (!currentTeacher) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-sm font-semibold text-textMuted">
        Teacher record not found.
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-textPrimary">My Classes</h2>
        <p className="text-xs text-textMuted mt-1">Manage and view details of classes assigned to you.</p>
      </div>

      {/* Class Teacher Section */}
      {classTeacherOfClass && (
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-textMuted uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="h-4 w-4 text-accent" /> Class Teacher Dashboard
          </h3>
          <div className="rounded-2xl border border-accent/20 bg-accent/5 p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-2">
              <h4 className="text-lg font-bold text-textPrimary flex items-center gap-2">
                👑 Class {classTeacherOfClass.standard}{classTeacherOfClass.division} ({classTeacherOfClass.medium})
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-accent/20 text-accent dark:text-yellow-600">
                  Academic Year: {classTeacherOfClass.academicYearId}
                </span>
              </h4>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-textMuted">
                <span className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" /> {getEnrolledCount(classTeacherOfClass.id)} Students Enrolled
                </span>
                <span className="flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4" /> Room: {classTeacherOfClass.room || '—'}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" /> Schedule: {classTeacherOfClass.workingDays}
                </span>
              </div>
            </div>

            <button
              onClick={() => handleViewStudents(classTeacherOfClass)}
              className="rounded-xl bg-primary hover:bg-primary/95 text-white text-xs font-bold px-5 py-2.5 shadow transition-all flex items-center gap-1.5 cursor-pointer"
              tabIndex={0}
              aria-label="View Class Students"
            >
              <Users className="h-4 w-4" /> View Students
            </button>
          </div>
        </div>
      )}

      {/* Subjects I Teach Section */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-textMuted uppercase tracking-wider flex items-center gap-1.5">
          <BookOpen className="h-4 w-4 text-primary" /> Subjects I Teach
        </h3>
        
        {teachingClasses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-xs text-textMuted">
            No subject teaching assignments found.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {teachingClasses.map((cls, idx) => (
              <div 
                key={`${cls.id}-${cls.subjectTaught}-${idx}`} 
                className="rounded-2xl border border-border bg-card p-5 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-1.5">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-textMuted uppercase tracking-wide">
                      {cls.medium} Medium
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary">
                      {cls.subjectTaught}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-textPrimary">
                    Class {cls.standard}{cls.division}
                  </h4>
                  <p className="text-xs text-textMuted font-medium flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" /> {cls.studentCount} Students
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 border-t border-border pt-4">
                  <button
                    onClick={() => handleMarkAttendance(cls.id, cls.subjectTaught)}
                    className="rounded-lg border border-border hover:bg-gray-50 text-textPrimary text-xs font-semibold py-2 text-center transition-colors cursor-pointer"
                    tabIndex={0}
                    aria-label={`Mark Attendance for Class ${cls.standard}${cls.division} ${cls.subjectTaught}`}
                  >
                    Attendance
                  </button>
                  <button
                    onClick={() => handleEnterMarks(cls.id, cls.subjectTaught)}
                    className="rounded-lg bg-primary hover:bg-primary/95 text-white text-xs font-semibold py-2 text-center shadow transition-all cursor-pointer"
                    tabIndex={0}
                    aria-label={`Enter Marks for Class ${cls.standard}${cls.division} ${cls.subjectTaught}`}
                  >
                    Enter Marks
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Drawer */}
      <AnimatePresence>
        {selectedClass && (
          <EnrolledStudentsDrawer
            cls={selectedClass}
            students={students.filter(s =>
              s.currentClassId === selectedClass.id || s.classId === selectedClass.id
            )}
            onClose={() => setSelectedClass(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default TeacherClasses
