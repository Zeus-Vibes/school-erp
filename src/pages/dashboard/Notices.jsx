import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, ChevronDown, Pin, Archive, Trash, CheckCircle } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/shared/EmptyState'
import { useData } from '../../context/DataContext'
import { useAuth } from '../../context/AuthContext'
import { formatDate } from '../../utils/helpers'
import toast from 'react-hot-toast'

const categories = ['All', 'Event', 'Finance', 'Holiday', 'Meeting', 'Academic']

const Notices = () => {
  const { user } = useAuth()
  const { notices, addNotice, updateNotice, deleteNotice } = useData()

  // Role Checks
  const isAdmin = user?.role === 'admin'
  const isTeacher = user?.role === 'teacher'
  const isStudent = user?.role === 'student'

  const todayStr = new Date().toISOString().split('T')[0]

  // State
  const [activeCategory, setActiveCategory] = useState('All')
  const [activeTab, setActiveTab] = useState('active') // 'active' | 'archive'
  const [expandedId, setExpandedId] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [search, setSearch] = useState('')

  // Form State
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [sendTo, setSendTo] = useState(isAdmin ? 'All' : 'All Students')
  const [category, setCategory] = useState('Event')
  const [priority, setPriority] = useState('Normal')
  const [pinned, setPinned] = useState(false)
  const [validUntil, setValidUntil] = useState('')

  // Filter & Sort Notices
  const filteredNotices = useMemo(() => {
    // 1. Role visibility filter
    let visible = notices.filter((n) => {
      if (isAdmin) return true // Admins see everything
      if (isTeacher) {
        // Teachers see notices targeted to All or Teachers Only / Faculty
        return n.sendTo === 'All' || n.sendTo === 'Teachers Only' || n.sendTo === 'All Faculty' || n.authorId === user.userId
      }
      if (isStudent) {
        // Students see notices targeted to All or Students Only
        return n.sendTo === 'All' || n.sendTo === 'Students Only' || n.sendTo === 'All Students'
      }
      return false
    })

    // 2. Active vs Archive filter
    if (activeTab === 'active') {
      visible = visible.filter((n) => !n.validUntil || n.validUntil >= todayStr)
    } else {
      visible = visible.filter((n) => n.validUntil && n.validUntil < todayStr)
    }

    // 3. Category filter
    if (activeCategory !== 'All') {
      visible = visible.filter((n) => n.category === activeCategory)
    }

    // 4. Search search
    if (search.trim()) {
      const q = search.toLowerCase()
      visible = visible.filter(
        (n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
      )
    }

    // 5. Pinned first, then by date descending
    return visible.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1
      if (!a.pinned && b.pinned) return 1
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })
  }, [notices, activeTab, activeCategory, search, isAdmin, isTeacher, isStudent, user, todayStr])

  const handleAddNotice = (e) => {
    e.preventDefault()

    const newNotice = {
      title,
      content: message,
      sendTo,
      category,
      priority,
      pinned,
      validUntil: validUntil || null,
      date: todayStr,
      author: user.name,
      authorId: user.userId
    }

    addNotice(newNotice)
    setShowAddModal(false)

    // Reset Form
    setTitle('')
    setMessage('')
    setSendTo(isAdmin ? 'All' : 'All Students')
    setCategory('Event')
    setPriority('Normal')
    setPinned(false)
    setValidUntil('')

    toast.success('Notice published successfully!')
  }

  const handleDelete = (id) => {
    if (window.confirm('Delete this notice?')) {
      deleteNotice(id)
      toast.success('Notice deleted permanently')
    }
  }

  const handleReactivate = (notice) => {
    const updated = {
      ...notice,
      validUntil: null // clears expiration so it returns to active list
    }
    updateNotice(notice.id, updated)
    toast.success('Notice reactivated!')
  }

  const getPriorityStyle = (prio) => {
    switch (prio) {
      case 'Important':
        return 'border-l-4 border-yellow-400 bg-yellow-50/20'
      case 'Urgent':
        return 'border-l-4 border-red-500 bg-red-50/20'
      default:
        return 'border border-border bg-card'
    }
  }

  const getCategoryBadgeColor = (cat) => {
    switch (cat) {
      case 'Event':
        return 'bg-purple-100 text-purple-800'
      case 'Finance':
        return 'bg-green-100 text-green-800'
      case 'Holiday':
        return 'bg-red-100 text-red-800'
      case 'Meeting':
        return 'bg-blue-100 text-blue-800'
      case 'Academic':
        return 'bg-cyan-100 text-cyan-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <PageHeader
        title="Notice Board"
        actions={
          (isAdmin || isTeacher) && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-button"
              tabIndex={0}
              aria-label="Add Notice"
            >
              <Plus className="h-4 w-4" /> Add Notice
            </motion.button>
          )
        }
      />

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-px">
        <button
          onClick={() => setActiveTab('active')}
          className={`rounded-t-xl px-5 py-2.5 text-sm font-semibold border-b-2 transition-all ${activeTab === 'active' ? 'border-primary text-primary' : 'border-transparent text-textMuted hover:text-textPrimary'}`}
          tabIndex={0}
        >
          Active Notices
        </button>
        <button
          onClick={() => setActiveTab('archive')}
          className={`rounded-t-xl px-5 py-2.5 text-sm font-semibold border-b-2 transition-all ${activeTab === 'archive' ? 'border-primary text-primary' : 'border-transparent text-textMuted hover:text-textPrimary'}`}
          tabIndex={0}
        >
          Archived / Expired
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${activeCategory === cat ? 'bg-primary text-white shadow' : 'bg-white border border-border text-textMuted hover:bg-gray-50'}`}
            tabIndex={0}
            aria-label={`Filter ${cat}`}
          >
            {cat}
          </button>
        ))}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search notices..."
          className="ml-auto rounded-xl border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary bg-white"
        />
      </div>

      {filteredNotices.length === 0 ? (
        <EmptyState title="No Notices Found" description="There are no announcements matching your filters at this time." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredNotices.map((notice) => {
            const isExpanded = expandedId === notice.id
            const cardStyle = getPriorityStyle(notice.priority)

            // Check author permission
            const canManage = isAdmin || (isTeacher && notice.authorId === user.userId)

            return (
              <motion.div
                key={notice.id}
                layout
                whileHover={{ y: -2 }}
                className={`rounded-2xl p-5 shadow-card transition-all flex flex-col justify-between ${cardStyle}`}
              >
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getCategoryBadgeColor(notice.category)}`}>
                        {notice.category}
                      </span>
                      {notice.pinned && (
                        <span className="text-primary" title="Pinned Announcement">
                          <Pin className="h-3.5 w-3.5 fill-current" />
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-textMuted font-medium">{formatDate(notice.date)}</span>
                  </div>

                  <div>
                    <h4 className={`text-sm text-textPrimary ${notice.priority === 'Urgent' ? 'font-extrabold text-red-700' : 'font-bold'}`}>
                      {notice.title}
                    </h4>
                    <p className={`mt-2 text-xs text-textMuted leading-relaxed ${isExpanded ? '' : 'line-clamp-3'}`}>
                      {notice.content}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/40">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-textMuted">By: <strong className="text-textPrimary">{notice.author || 'Admin'}</strong></span>
                    {notice.sendTo && (
                      <span className="text-[9px] text-textMuted bg-gray-100 px-1.5 py-0.5 rounded border border-border">
                        To: {notice.sendTo}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : notice.id)}
                      className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5"
                      tabIndex={0}
                    >
                      {isExpanded ? 'Less' : 'More'} <ChevronDown className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>

                    {activeTab === 'archive' && canManage && (
                      <button
                        onClick={() => handleReactivate(notice)}
                        className="rounded-lg p-1 text-green-600 hover:bg-green-50"
                        title="Reactivate Notice"
                        tabIndex={0}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                    )}

                    {canManage && (
                      <button
                        onClick={() => handleDelete(notice.id)}
                        className="rounded-lg p-1 text-highlight hover:bg-red-50"
                        title="Delete Notice"
                        tabIndex={0}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* ADD NOTICE MODAL */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Publish Notice" size="md">
        <form onSubmit={handleAddNotice} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <div>
            <label className="mb-1 block text-xs font-medium text-textMuted">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full rounded-xl border border-border px-4 py-2.5 text-sm"
              placeholder="Notice Heading..."
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-textMuted">Message *</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={4}
              className="w-full rounded-xl border border-border px-4 py-2.5 text-sm resize-none"
              placeholder="Write notice body message here..."
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-textMuted">Send To *</label>
              <select
                value={sendTo}
                onChange={(e) => setSendTo(e.target.value)}
                required
                className="w-full rounded-xl border border-border px-4 py-2.5 text-sm bg-white"
              >
                {isAdmin ? (
                  <>
                    <option value="All">All</option>
                    <option value="Teachers Only">Teachers Only</option>
                    <option value="Students Only">Students Only</option>
                  </>
                ) : (
                  <>
                    <option value="All Students">All Students</option>
                    <option value="All Faculty">All Faculty</option>
                    <option value="My Class Students">My Class Students</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-textMuted">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full rounded-xl border border-border px-4 py-2.5 text-sm bg-white"
              >
                {categories.slice(1).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-textMuted">Priority *</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                required
                className="w-full rounded-xl border border-border px-4 py-2.5 text-sm bg-white"
              >
                <option value="Normal">Normal</option>
                <option value="Important">Important</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-textMuted">Valid Until (Optional)</label>
              <input
                type="date"
                min={todayStr}
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full rounded-xl border border-border px-4 py-2.5 text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="pin"
              checked={pinned}
              onChange={(e) => setPinned(e.target.checked)}
              className="rounded text-primary focus:ring-primary h-4 w-4"
            />
            <label htmlFor="pin" className="text-xs font-semibold text-textPrimary cursor-pointer select-none">
              Pin notice at the top of the board
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="rounded-xl border border-border px-5 py-2.5 text-sm text-textMuted"
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              type="submit"
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-button"
            >
              Publish Notice
            </motion.button>
          </div>
        </form>
      </Modal>
    </motion.div>
  )
}

export default Notices
