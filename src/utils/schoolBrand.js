export const getSchoolBrand = (standard) => {
  const std = String(standard).trim().toUpperCase()
  if (std === 'LKG' || std === 'UKG') {
    return {
      name: 'Shiv Dhara School',
      color: 'blue',
      badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
    }
  }
  return {
    name: 'Shree Bala International School',
    color: 'green',
    badgeClass: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800'
  }
}
