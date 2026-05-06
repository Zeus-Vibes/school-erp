import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, ChevronDown } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import { notices as initialNotices } from '../../data'
import { formatDate, getPriorityColor, getCategoryColor } from '../../utils/helpers'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const categories = ['All', 'Event', 'Finance', 'Holiday', 'Meeting', 'Academic']

const Notices = () => {
  const { isAdmin } = useAuth()
  const [noticesList, setNoticesList] = useState(initialNotices)
  const [activeCategory, setActiveCategory] = useState('All')
  const [expandedId, setExpandedId] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [form, setForm] = useState({ title: '', category: 'Event', priority: 'normal', content: '', author: 'Admin' })
  const [search, setSearch] = useState('')

  const filtered = noticesList.filter((n) => (activeCategory === 'All' || n.category === activeCategory) && (n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase())))

  const handleAdd = (event) => {
    event.preventDefault()
    const newNotice = { id: `N${String(noticesList.length + 1).padStart(3, '0')}`, ...form, date: new Date().toISOString().split('T')[0] }
    setNoticesList((prev) => [newNotice, ...prev])
    setShowAddModal(false)
    setForm({ title: '', category: 'Event', priority: 'normal', content: '', author: 'Admin' })
    toast.success('Notice added successfully!')
  }

  const handleDelete = (id) => {
    if (window.confirm('Delete this notice?')) {
      setNoticesList((prev) => prev.filter((n) => n.id !== id))
      toast.success('Notice deleted')
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <PageHeader title="Notice Board" count={filtered.length}
        actions={isAdmin && <motion.button whileHover={{ scale: 1.02 }} onClick={() => setShowAddModal(true)} className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-button" tabIndex={0} aria-label="Add Notice"><Plus className="h-4 w-4" />Add Notice</motion.button>} />

      <div className="flex flex-wrap items-center gap-2">
        {categories.map((cat) => (
          <button key={cat} onClick={() => setActiveCategory(cat)} className={`rounded-full px-4 py-2 text-xs font-medium transition-all ${activeCategory === cat ? 'bg-primary text-white' : 'bg-white border border-border text-textMuted hover:bg-gray-50'}`} tabIndex={0} aria-label={`Filter ${cat}`}>{cat}</button>
        ))}
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search notices..." className="ml-auto rounded-xl border border-border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((notice) => {
          const catColor = getCategoryColor(notice.category)
          const isExpanded = expandedId === notice.id
          return (
            <motion.div key={notice.id} layout whileHover={{ y: -2 }}
              className="rounded-xl border border-border bg-card p-5 shadow-card transition-all" style={{ borderLeftWidth: '4px', borderLeftColor: getPriorityColor(notice.priority) }}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2"><span className="rounded-full px-2.5 py-0.5 text-[10px] font-medium" style={{ backgroundColor: catColor.bg, color: catColor.text }}>{notice.category}</span><span className="text-xs text-textMuted">{formatDate(notice.date)}</span><span className="text-xs text-textMuted">by {notice.author}</span></div>
                  <h4 className="text-sm font-semibold text-textPrimary">{notice.title}</h4>
                  <AnimatePresence>
                    <motion.p className={`mt-2 text-xs text-textMuted leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>{notice.content}</motion.p>
                  </AnimatePresence>
                  <button onClick={() => setExpandedId(isExpanded ? null : notice.id)} className="mt-2 flex items-center gap-1 text-xs font-medium text-primary hover:underline" tabIndex={0} aria-label={isExpanded ? 'Show less' : 'Read more'}>
                    {isExpanded ? 'Show Less' : 'Read More'}<ChevronDown className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>
                </div>
                {isAdmin && (
                  <div className="flex gap-1 ml-3"><button onClick={() => handleDelete(notice.id)} className="rounded-lg p-1.5 text-highlight hover:bg-red-50" tabIndex={0} aria-label="Delete notice"><Trash2 className="h-4 w-4" /></button></div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Notice" size="md">
        <form onSubmit={handleAdd} className="space-y-4">
          <div><label className="mb-1 block text-xs font-medium text-textMuted">Title *</label><input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required className="w-full rounded-xl border border-border px-4 py-2.5 text-sm" /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="mb-1 block text-xs font-medium text-textMuted">Category</label><select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className="w-full rounded-xl border border-border px-4 py-2.5 text-sm">{['Event','Finance','Holiday','Meeting','Academic'].map((c) => <option key={c}>{c}</option>)}</select></div>
            <div><label className="mb-1 block text-xs font-medium text-textMuted">Priority</label><select value={form.priority} onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))} className="w-full rounded-xl border border-border px-4 py-2.5 text-sm"><option value="normal">Normal</option><option value="high">High</option><option value="urgent">Urgent</option></select></div>
          </div>
          <div><label className="mb-1 block text-xs font-medium text-textMuted">Content *</label><textarea value={form.content} onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))} required rows={4} className="w-full rounded-xl border border-border px-4 py-2.5 text-sm resize-none" /></div>
          <div className="flex justify-end gap-3"><button type="button" onClick={() => setShowAddModal(false)} className="rounded-xl border border-border px-5 py-2.5 text-sm text-textMuted">Cancel</button><motion.button whileHover={{ scale: 1.02 }} type="submit" className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-button">Publish Notice</motion.button></div>
        </form>
      </Modal>
    </motion.div>
  )
}

export default Notices
