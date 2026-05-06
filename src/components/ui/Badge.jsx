import clsx from 'clsx'

const colorMap = {
  green: 'bg-green-100 text-green-800',
  red: 'bg-red-100 text-red-800',
  blue: 'bg-blue-100 text-blue-800',
  gold: 'bg-amber-100 text-amber-800',
  gray: 'bg-gray-100 text-gray-700',
  purple: 'bg-purple-100 text-purple-800',
  teal: 'bg-teal-100 text-teal-800',
  amber: 'bg-amber-100 text-amber-800',
  pink: 'bg-pink-100 text-pink-800',
  navy: 'bg-blue-900 text-white',
  olive: 'bg-green-800 text-white',
}

const Badge = ({ label, color = 'gray', className = '', style = {} }) => (
  <span
    className={clsx(
      'inline-flex items-center rounded-full px-3 py-0.5 text-xs font-medium tracking-wide',
      colorMap[color],
      className
    )}
    style={style}
  >
    {label}
  </span>
)

export default Badge
