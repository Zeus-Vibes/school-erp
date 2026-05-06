import { motion } from 'framer-motion'
import clsx from 'clsx'

const StatCard = ({ title, value, subtitle, icon: Icon, color = 'primary', trend, delay = 0 }) => {
  const colorMap = {
    primary: { border: 'border-l-primary', iconBg: 'bg-blue-50', iconText: 'text-primary' },
    green: { border: 'border-l-secondary', iconBg: 'bg-green-50', iconText: 'text-secondary' },
    gold: { border: 'border-l-accent', iconBg: 'bg-amber-50', iconText: 'text-accent' },
    red: { border: 'border-l-highlight', iconBg: 'bg-red-50', iconText: 'text-highlight' },
  }

  const colors = colorMap[color] || colorMap.primary

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay * 0.1, ease: 'easeOut' }}
      whileHover={{ y: -4, boxShadow: '0 8px 30px rgba(30,58,95,0.15)' }}
      className={clsx(
        'rounded-2xl border bg-card p-6 shadow-card border-l-4',
        colors.border
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-textMuted">
            {title}
          </p>
          <p className="mt-2 text-3xl font-extrabold text-textPrimary font-inter">
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-sm text-textMuted">{subtitle}</p>
          )}
          {trend && (
            <div className={clsx(
              'mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
              trend > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            )}>
              <span>{trend > 0 ? '↑' : '↓'}</span>
              <span>{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={clsx('rounded-xl p-3', colors.iconBg)}>
            <Icon className={clsx('h-6 w-6', colors.iconText)} />
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default StatCard
