import { useState, useMemo, Fragment } from 'react'
import { motion } from 'framer-motion'
import PageHeader from '../../components/ui/PageHeader'
import Badge from '../../components/ui/Badge'
import Avatar from '../../components/ui/Avatar'
import ResultsRadar from '../../components/charts/ResultsRadar'
import { results } from '../../data'
import { getGradeColor } from '../../utils/helpers'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const Results = () => {
  const [classFilter, setClassFilter] = useState('All')
  const [expandedId, setExpandedId] = useState(null)

  const filtered = useMemo(() => classFilter === 'All' ? results : results.filter((r) => r.class.startsWith(classFilter)), [classFilter])

  const getRankStyle = (rank) => {
    if (rank === 1) return 'bg-amber-50'
    if (rank === 2) return 'bg-gray-50'
    if (rank === 3) return 'bg-orange-50'
    return ''
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <PageHeader title="Exam Results" />

      <div className="flex flex-wrap gap-2">
        {['All', '10', '9'].map((cls) => (
          <button key={cls} onClick={() => setClassFilter(cls)} className={`rounded-xl px-5 py-2.5 text-sm font-medium transition-all ${classFilter === cls ? 'bg-primary text-white shadow-button' : 'bg-white border border-border text-textMuted'}`} tabIndex={0}>{cls === 'All' ? 'All Classes' : `Class ${cls}`}</button>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-card overflow-x-auto">
        <table className="w-full"><thead><tr className="border-b border-border bg-gray-50/50">
          {['Rank','Student','Maths','Science','English','Hindi','Soc.St.','Computer','Total','%','Result'].map((h) => <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase text-textMuted">{h}</th>)}
        </tr></thead><tbody>
          {filtered.sort((a, b) => a.rank - b.rank).map((result) => (
            <Fragment key={result.studentId}>
              <tr key={result.studentId} onClick={() => setExpandedId(expandedId === result.studentId ? null : result.studentId)}
                className={clsx('border-b border-border/50 cursor-pointer hover:bg-blue-50/30 transition-colors', getRankStyle(result.rank))}>
                <td className="px-4 py-3"><Badge label={`#${result.rank}`} color={result.rank <= 3 ? 'gold' : 'gray'} /></td>
                <td className="px-4 py-3"><div className="flex items-center gap-2"><Avatar name={result.studentName} size="sm" /><div><p className="text-sm font-medium">{result.studentName}</p><p className="text-xs text-textMuted">{result.class}</p></div></div></td>
                {result.subjects.map((sub) => <td key={sub.name} className="px-4 py-3 text-sm font-medium" style={{ color: getGradeColor(sub.grade) }}>{sub.obtained}</td>)}
                <td className="px-4 py-3 text-sm font-bold">{result.obtained}/{result.totalMarks}</td>
                <td className="px-4 py-3 text-sm font-bold text-primary">{result.percentage}%</td>
                <td className="px-4 py-3"><Badge label={result.result} color="green" /></td>
              </tr>
              {expandedId === result.studentId && (
                <tr key={`${result.studentId}-detail`}><td colSpan={11} className="p-6 bg-bg/50">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div><h4 className="mb-3 text-sm font-semibold text-textPrimary">Subject-wise Performance</h4>
                      <div className="space-y-2">{result.subjects.map((sub) => (
                        <div key={sub.name} className="flex items-center justify-between"><span className="text-xs text-textMuted w-24">{sub.name}</span>
                          <div className="flex-1 mx-3 h-2 rounded-full bg-gray-100 overflow-hidden"><div className="h-full rounded-full" style={{ width: `${sub.obtained}%`, backgroundColor: getGradeColor(sub.grade) }} /></div>
                          <span className="text-xs font-medium w-16 text-right" style={{ color: getGradeColor(sub.grade) }}>{sub.obtained} ({sub.grade})</span></div>
                      ))}</div></div>
                    <div><h4 className="mb-3 text-sm font-semibold text-textPrimary">Radar Chart</h4><ResultsRadar subjects={result.subjects} /></div>
                  </div>
                  <button onClick={() => toast('Report card download — Coming Soon!', { icon: '📄' })} className="mt-4 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary/90" tabIndex={0}>Download Report Card</button>
                </td></tr>
              )}
            </Fragment>
          ))}
        </tbody></table>
      </div>
    </motion.div>
  )
}

export default Results
