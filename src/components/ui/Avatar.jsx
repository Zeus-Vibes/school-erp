import { getAvatarColor, getInitials } from '../../utils/helpers'
import clsx from 'clsx'

const sizeMap = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-16 w-16 text-xl',
  xl: 'h-24 w-24 text-3xl',
}

const Avatar = ({ name, size = 'md', photoUrl = null, className = '' }) => {
  const bgColor = getAvatarColor(name)
  const initials = getInitials(name)

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={`Photo of ${name}`}
        className={clsx(
          'rounded-full object-cover shrink-0',
          sizeMap[size],
          className
        )}
      />
    )
  }

  return (
    <div
      className={clsx(
        'flex items-center justify-center rounded-full font-semibold text-white shrink-0',
        sizeMap[size],
        className
      )}
      style={{ backgroundColor: bgColor }}
      aria-label={`Avatar for ${name}`}
    >
      {initials}
    </div>
  )
}

export default Avatar
