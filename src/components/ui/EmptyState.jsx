import { motion } from 'framer-motion'

const EmptyState = ({ icon: Icon, title, subtitle, actionLabel, onAction }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="flex flex-col items-center justify-center py-16 text-center"
  >
    {Icon && (
      <div className="mb-4 rounded-full bg-gray-100 p-4">
        <Icon className="h-10 w-10 text-textMuted" />
      </div>
    )}
    <h3 className="text-lg font-semibold text-textPrimary">{title}</h3>
    {subtitle && (
      <p className="mt-1 max-w-sm text-sm text-textMuted">{subtitle}</p>
    )}
    {actionLabel && onAction && (
      <button
        onClick={onAction}
        className="mt-4 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-button hover:bg-primary/90 transition-colors"
        tabIndex={0}
        aria-label={actionLabel}
      >
        {actionLabel}
      </button>
    )}
  </motion.div>
)

export default EmptyState
