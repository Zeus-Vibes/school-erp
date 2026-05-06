import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, BookCheck, AlertTriangle, BookCopy } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import DataTable from '../../components/ui/DataTable'
import StatCard from '../../components/ui/StatCard'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import { books as initialBooks, issuedBooks as initialIssued, students } from '../../data'
import { formatDate } from '../../utils/helpers'
import toast from 'react-hot-toast'

const Library = () => {
  const [booksList, setBooksList] = useState(initialBooks)
  const [issuedList, setIssuedList] = useState(initialIssued)
  const [activeTab, setActiveTab] = useState('catalogue')
  const [showIssueModal, setShowIssueModal] = useState(false)
  const [selectedBook, setSelectedBook] = useState(null)
  const [issueStudentId, setIssueStudentId] = useState('')

  const totalBooks = useMemo(() => booksList.reduce((s, b) => s + b.total, 0), [booksList])
  const totalAvailable = useMemo(() => booksList.reduce((s, b) => s + b.available, 0), [booksList])
  const totalIssued = totalBooks - totalAvailable
  const overdue = useMemo(() => issuedList.filter((b) => !b.returned && new Date(b.dueDate) < new Date()).length, [issuedList])

  const handleReturn = (issueId) => {
    setIssuedList((prev) => prev.map((b) => b.id === issueId ? { ...b, returned: true, returnDate: new Date().toISOString().split('T')[0] } : b))
    const issue = issuedList.find((b) => b.id === issueId)
    if (issue) setBooksList((prev) => prev.map((b) => b.id === issue.bookId ? { ...b, available: b.available + 1 } : b))
    toast.success('Book returned successfully!')
  }

  const handleIssue = () => {
    if (!selectedBook || !issueStudentId) return
    const student = students.find((s) => s.id === issueStudentId)
    if (!student) return
    const newIssue = { id: `IS${String(issuedList.length + 1).padStart(3, '0')}`, bookId: selectedBook.id, bookTitle: selectedBook.title, studentId: student.id, studentName: student.name, issueDate: new Date().toISOString().split('T')[0], dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0], returned: false }
    setIssuedList((prev) => [...prev, newIssue])
    setBooksList((prev) => prev.map((b) => b.id === selectedBook.id ? { ...b, available: b.available - 1 } : b))
    setShowIssueModal(false)
    toast.success(`"${selectedBook.title}" issued to ${student.name}`)
  }

  const bookColumns = useMemo(() => [
    { accessorKey: 'id', header: '#', cell: ({ row }) => row.index + 1, size: 50 },
    { accessorKey: 'title', header: 'Title', cell: ({ row }) => <p className="text-sm font-medium text-textPrimary">{row.original.title}</p> },
    { accessorKey: 'author', header: 'Author' },
    { accessorKey: 'category', header: 'Category', cell: ({ row }) => <Badge label={row.original.category} color={row.original.category === 'Fiction' ? 'purple' : row.original.category === 'Biography' ? 'gold' : row.original.category === 'Reference' ? 'teal' : 'blue'} /> },
    { accessorKey: 'total', header: 'Total' },
    { accessorKey: 'available', header: 'Available', cell: ({ row }) => { const pct = row.original.available / row.original.total; return <span className={`font-medium ${pct > 0.5 ? 'text-secondary' : pct > 0.2 ? 'text-accent' : 'text-highlight'}`}>{row.original.available}</span> } },
    { id: 'actions', header: 'Actions', cell: ({ row }) => row.original.available > 0 ? <button onClick={() => { setSelectedBook(row.original); setShowIssueModal(true) }} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white" tabIndex={0}>Issue</button> : <Badge label="Unavailable" color="red" /> },
  ], [])

  const issuedColumns = useMemo(() => [
    { accessorKey: 'id', header: '#', cell: ({ row }) => row.index + 1, size: 50 },
    { accessorKey: 'bookTitle', header: 'Book' },
    { accessorKey: 'studentName', header: 'Student' },
    { accessorKey: 'issueDate', header: 'Issue Date', cell: ({ row }) => formatDate(row.original.issueDate) },
    { accessorKey: 'dueDate', header: 'Due Date', cell: ({ row }) => formatDate(row.original.dueDate) },
    { accessorKey: 'returned', header: 'Status', cell: ({ row }) => { const isOverdue = !row.original.returned && new Date(row.original.dueDate) < new Date(); return <Badge label={row.original.returned ? 'Returned' : isOverdue ? 'Overdue' : 'Active'} color={row.original.returned ? 'green' : isOverdue ? 'red' : 'gold'} /> } },
    { id: 'actions', header: 'Actions', cell: ({ row }) => !row.original.returned ? <button onClick={() => handleReturn(row.original.id)} className="rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-white" tabIndex={0}>Return</button> : null },
  ], [issuedList])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <PageHeader title="Library" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Books" value={totalBooks} icon={BookOpen} color="primary" />
        <StatCard title="Available" value={totalAvailable} icon={BookCheck} color="green" />
        <StatCard title="Issued" value={totalIssued} icon={BookCopy} color="gold" />
        <StatCard title="Overdue" value={overdue} icon={AlertTriangle} color="red" />
      </div>

      <div className="flex gap-2">
        {['catalogue', 'issued'].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`rounded-xl px-5 py-2.5 text-sm font-medium transition-all ${activeTab === tab ? 'bg-primary text-white shadow-button' : 'bg-white border border-border text-textMuted'}`} tabIndex={0}>{tab === 'catalogue' ? 'Book Catalogue' : 'Issued Books'}</button>
        ))}
      </div>

      {activeTab === 'catalogue' ? <DataTable data={booksList} columns={bookColumns} searchPlaceholder="Search books..." /> : <DataTable data={issuedList} columns={issuedColumns} searchPlaceholder="Search issued books..." />}

      <Modal isOpen={showIssueModal} onClose={() => setShowIssueModal(false)} title="Issue Book" size="sm">
        <div className="space-y-4">
          {selectedBook && <div className="rounded-xl bg-bg p-4"><p className="text-sm font-medium text-textPrimary">{selectedBook.title}</p><p className="text-xs text-textMuted">by {selectedBook.author} | Available: {selectedBook.available}</p></div>}
          <div><label className="mb-1 block text-xs font-medium text-textMuted">Select Student</label><select value={issueStudentId} onChange={(e) => setIssueStudentId(e.target.value)} className="w-full rounded-xl border border-border px-4 py-2.5 text-sm"><option value="">— Select —</option>{students.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.class}-{s.section})</option>)}</select></div>
          <motion.button whileHover={{ scale: 1.02 }} onClick={handleIssue} disabled={!issueStudentId} className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white shadow-button disabled:opacity-50" tabIndex={0}>Issue Book</motion.button>
        </div>
      </Modal>
    </motion.div>
  )
}

export default Library
