const statusStyles = {
  active: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  left: 'bg-rose-100 text-rose-800 dark:bg-rose-950/30 dark:text-rose-300 border-rose-200 dark:border-rose-800',
  graduated: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
  heldback: 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  draft: 'bg-slate-100 text-slate-800 dark:bg-slate-950/30 dark:text-slate-300 border-slate-200 dark:border-slate-800',
  published: 'bg-sky-100 text-sky-800 dark:bg-sky-950/30 dark:text-sky-300 border-sky-200 dark:border-sky-800',
  paid: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300 border-amber-200 dark:border-amber-800'
}

const StatusBadge = ({ status }) => {
  const normStatus = String(status).trim().toLowerCase()
  const styleClass = statusStyles[normStatus] || 'bg-slate-100 text-slate-800 border-slate-200'
  const displayLabel = status.charAt(0).toUpperCase() + status.slice(1)

  return (
    <span 
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border ${styleClass}`}
      aria-label={`Status: ${displayLabel}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {displayLabel}
    </span>
  )
}

export default StatusBadge
