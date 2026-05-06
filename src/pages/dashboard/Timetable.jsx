import { useState } from 'react'
import { motion } from 'framer-motion'
import PageHeader from '../../components/ui/PageHeader'
import { timetable, timeSlots } from '../../data'
import { getSubjectColor, getDayOfWeek } from '../../utils/helpers'
import clsx from 'clsx'
import toast from 'react-hot-toast'

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const Timetable = () => {
  const [selectedClass, setSelectedClass] = useState('10A')
  const classTimetable = timetable[selectedClass]
  const today = getDayOfWeek()

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <PageHeader title="Timetable"
        actions={<button onClick={() => toast('Print feature — Coming Soon!', { icon: '🖨️' })} className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-textMuted hover:bg-gray-50" tabIndex={0} aria-label="Print timetable">Print Timetable</button>} />

      <div className="flex flex-wrap gap-2">
        {Object.keys(timetable).map((cls) => (
          <button key={cls} onClick={() => setSelectedClass(cls)} className={`rounded-xl px-5 py-2.5 text-sm font-medium transition-all ${selectedClass === cls ? 'bg-primary text-white shadow-button' : 'bg-white border border-border text-textMuted hover:bg-gray-50'}`} tabIndex={0}>{cls}</button>
        ))}
      </div>

      {classTimetable ? (
        <div className="rounded-2xl border border-border bg-card shadow-card overflow-x-auto">
          <table className="w-full"><thead><tr>
            <th className="bg-primary px-4 py-3 text-left text-xs font-semibold text-white w-32">Time</th>
            {days.map((day) => <th key={day} className={clsx('px-4 py-3 text-center text-xs font-semibold', today === day ? 'bg-accent text-white' : 'bg-primary text-white')}>{day}</th>)}
          </tr></thead><tbody>
            {timeSlots.map((slot, slotIndex) => (
              <tr key={slot} className="border-b border-border/50">
                <td className="bg-primary/5 px-4 py-3 text-xs font-bold text-primary whitespace-nowrap">{slot}</td>
                {days.map((day) => {
                  const subject = classTimetable[day]?.[slotIndex] || '—'
                  const colors = getSubjectColor(subject)
                  const isLunch = subject === '--Lunch--'
                  return (
                    <td key={day} className={clsx('px-3 py-3 text-center', isLunch ? 'bg-gray-50' : '')}>
                      <span className={clsx('inline-block rounded-lg px-3 py-1.5 text-xs font-medium', colors.bg, colors.text, isLunch && 'italic')}>
                        {subject}
                      </span>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody></table>
        </div>
      ) : <p className="text-sm text-textMuted">No timetable available for this class</p>}
    </motion.div>
  )
}

export default Timetable
