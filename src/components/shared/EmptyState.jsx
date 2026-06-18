import { Inbox } from 'lucide-react'

const EmptyState = ({ 
  icon: Icon = Inbox, 
  title, 
  description, 
  actionLabel, 
  onAction 
}) => {
  const handleActionClick = (e) => {
    if (onAction) {
      onAction(e)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleActionClick(e)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white/5 border border-white/10 rounded-2xl">
      <div className="p-4 bg-primary/10 rounded-full text-primary mb-4">
        <Icon className="h-8 w-8 text-accent" />
      </div>
      <h3 className="text-lg font-semibold text-textPrimary mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-textMuted max-w-sm mb-6">{description}</p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={handleActionClick}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          aria-label={actionLabel}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary/95 rounded-xl transition-all shadow-button cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

export default EmptyState
