import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Search, ChevronDown, ChevronUp } from 'lucide-react'
import Avatar from '../ui/Avatar'

const houseColors = {
  Red: 'bg-red-500',
  Blue: 'bg-blue-500',
  Green: 'bg-green-500',
  Yellow: 'bg-yellow-500'
}

const EnrolledStudentsDrawer = ({ cls, students, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [showLeftStudents, setShowLeftStudents] = useState(false)

  // Filter active vs Left students
  const activeStudents = useMemo(() => {
    return students.filter(s => s.isActive !== false && s.status !== 'Left')
  }, [students])

  const leftStudents = useMemo(() => {
    return students.filter(s => s.isActive === false || s.status === 'Left')
  }, [students])

  // Filter active by search query
  const filteredActive = useMemo(() => {
    if (!searchQuery.trim()) return activeStudents
    const query = searchQuery.toLowerCase()
    return activeStudents.filter(s => 
      s.name.toLowerCase().includes(query) || 
      (s.grNumber && s.grNumber.toLowerCase().includes(query))
    )
  }, [activeStudents, searchQuery])

  // Filter left by search query
  const filteredLeft = useMemo(() => {
    if (!searchQuery.trim()) return leftStudents
    const query = searchQuery.toLowerCase()
    return leftStudents.filter(s => 
      s.name.toLowerCase().includes(query) || 
      (s.grNumber && s.grNumber.toLowerCase().includes(query))
    )
  }, [leftStudents, searchQuery])

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
  }

  const handleToggleLeftClick = () => {
    setShowLeftStudents(prev => !prev)
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black"
        aria-hidden="true"
      />

      {/* Slide-over panel */}
      <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="pointer-events-auto w-screen max-w-md bg-white shadow-2xl flex flex-col h-full"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-border bg-primary text-white flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold">
                Class {cls.standard}{cls.division} ({cls.medium})
              </h2>
              <p className="text-xs text-white/70 mt-1">
                {activeStudents.length} Active Enrolled Students
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close panel"
              tabIndex={0}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Search bar */}
          <div className="p-4 border-b border-border bg-bg">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name or GR..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full rounded-xl border border-border bg-white pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-textMuted" />
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Active Students Section */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-textMuted uppercase tracking-wider">
                Active Students ({filteredActive.length})
              </h3>
              
              {filteredActive.length === 0 ? (
                <p className="text-xs text-textMuted italic py-2">No active students found.</p>
              ) : (
                <div className="divide-y divide-border/50 border border-border rounded-xl bg-card overflow-hidden">
                  {filteredActive.map(student => {
                    const houseDotColor = houseColors[student.house] || 'bg-gray-400'
                    return (
                      <div key={student.id} className="flex items-center justify-between p-3 hover:bg-bg/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-textMuted w-5">
                            {String(student.rollNumber || student.roll || 0).padStart(2, '0')}
                          </span>
                          <Avatar name={student.name} size="sm" photoUrl={student.photoUrl} />
                          <div>
                            <span className="text-sm font-semibold text-textPrimary block">
                              {student.name}
                            </span>
                            <span className="text-[10px] text-textMuted">
                              GR: {student.grNumber || '—'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`h-2.5 w-2.5 rounded-full ${houseDotColor}`} title={`${student.house} House`} />
                          <span className="text-[10px] text-textMuted font-medium">{student.house}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Collapsible Left Students Section */}
            {leftStudents.length > 0 && (
              <div className="border-t border-border pt-4">
                <button
                  onClick={handleToggleLeftClick}
                  className="flex w-full items-center justify-between py-2 text-xs font-bold text-textMuted uppercase tracking-wider hover:text-textPrimary cursor-pointer"
                  tabIndex={0}
                  aria-expanded={showLeftStudents}
                  aria-label="Toggle Left students section"
                >
                  <span>Students on LC / Left ({filteredLeft.length})</span>
                  {showLeftStudents ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>

                {showLeftStudents && (
                  <div className="mt-3 divide-y divide-border/50 border border-border rounded-xl bg-bg overflow-hidden opacity-80">
                    {filteredLeft.length === 0 ? (
                      <p className="text-xs text-textMuted italic p-3">No students found.</p>
                    ) : (
                      filteredLeft.map(student => (
                        <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50/50">
                          <div className="flex items-center gap-3">
                            <Avatar name={student.name} size="sm" photoUrl={student.photoUrl} className="grayscale" />
                            <div>
                              <span className="text-sm font-semibold text-textMuted block line-through">
                                {student.name}
                              </span>
                              <span className="text-[10px] text-textMuted">
                                GR: {student.grNumber || '—'}
                              </span>
                            </div>
                          </div>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-gray-200 text-gray-700">
                            Left
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default EnrolledStudentsDrawer
