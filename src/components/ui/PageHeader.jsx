import { motion } from 'framer-motion'

const PageHeader = ({ title, subtitle, actions, count }) => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
  >
    <div>
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-textPrimary font-inter">{title}</h1>
        {count !== undefined && (
          <span className="rounded-full bg-primary/10 px-3 py-0.5 text-sm font-medium text-primary">
            {count} total
          </span>
        )}
      </div>
      {subtitle && (
        <p className="mt-1 text-sm text-textMuted">{subtitle}</p>
      )}
    </div>
    {actions && <div className="flex items-center gap-3">{actions}</div>}
  </motion.div>
)

export default PageHeader
