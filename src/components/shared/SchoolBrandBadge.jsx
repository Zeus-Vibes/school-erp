const SchoolBrandBadge = ({ brand }) => {
  const isShivDhara = brand === 'Shiv Dhara School'
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium whitespace-nowrap
        ${isShivDhara
          ? 'bg-blue-100 text-blue-700 border border-blue-200'
          : 'bg-green-100 text-green-700 border border-green-200'
        }
      `}
    >
      {isShivDhara ? 'Shiv Dhara' : 'Shree Bala'}
    </span>
  )
}

export default SchoolBrandBadge
