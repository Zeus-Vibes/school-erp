export const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)

export const formatDate = (dateString) => {
  if (!dateString) return '—'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export const formatDateShort = (dateString) => {
  if (!dateString) return '—'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
  })
}

const AVATAR_COLORS = [
  '#1E3A5F', '#6B8E23', '#D4A017', '#B23A3A',
  '#6366F1', '#0891B2', '#7C3AED', '#B45309',
]

export const getAvatarColor = (name) => {
  const charCode = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return AVATAR_COLORS[charCode % AVATAR_COLORS.length]
}

export const getInitials = (name) => {
  const parts = name.trim().split(' ')
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
  }
  return parts[0][0].toUpperCase()
}

export const getStageFromClass = (className) => {
  const classNames = ['Nursery', 'LKG', 'UKG']
  if (classNames.includes(className)) return 'Pre-Primary'
  const classNum = parseInt(className)
  if (classNum >= 1 && classNum <= 8) return 'Primary'
  if (classNum >= 9 && classNum <= 10) return 'Secondary'
  if (classNum >= 11 && classNum <= 12) return 'Higher Secondary'
  return 'Primary'
}

export const getStageBadgeColor = (stage) => {
  const colorMap = {
    'Pre-Primary': { bg: '#EDE9FE', text: '#5B21B6' },
    'Primary': { bg: '#DBEAFE', text: '#1D4ED8' },
    'Secondary': { bg: '#CCFBF1', text: '#0F766E' },
    'Higher Secondary': { bg: '#FEF3C7', text: '#92400E' },
  }
  return colorMap[stage] || { bg: '#F3F4F6', text: '#374151' }
}

export const getStreamBadgeColor = (stream) => {
  const colorMap = {
    Science: { bg: '#DBEAFE', text: '#1D4ED8' },
    Commerce: { bg: '#FEF3C7', text: '#92400E' },
    Arts: { bg: '#DCFCE7', text: '#15803D' },
  }
  return colorMap[stream] || { bg: '#F3F4F6', text: '#374151' }
}

export const getGradeColor = (grade) => {
  const colorMap = {
    'A+': '#059669',
    A: '#2563EB',
    'B+': '#0D9488',
    B: '#D97706',
    C: '#EA580C',
    F: '#DC2626',
  }
  return colorMap[grade] || '#6B7280'
}

export const getPriorityColor = (priority) => {
  const colorMap = {
    urgent: '#B23A3A',
    high: '#D4A017',
    normal: '#6B8E23',
  }
  return colorMap[priority] || '#6B7280'
}

export const getCategoryColor = (category) => {
  const colorMap = {
    Event: { bg: '#DBEAFE', text: '#1D4ED8' },
    Finance: { bg: '#FEE2E2', text: '#991B1B' },
    Holiday: { bg: '#DCFCE7', text: '#15803D' },
    Meeting: { bg: '#FEF3C7', text: '#92400E' },
    Academic: { bg: '#EDE9FE', text: '#5B21B6' },
  }
  return colorMap[category] || { bg: '#F3F4F6', text: '#374151' }
}

export const getSubjectColor = (subject) => {
  const colorMap = {
    Mathematics: { bg: 'bg-blue-100', text: 'text-blue-700' },
    Science: { bg: 'bg-green-100', text: 'text-green-700' },
    English: { bg: 'bg-purple-100', text: 'text-purple-700' },
    Hindi: { bg: 'bg-amber-100', text: 'text-amber-700' },
    'Social Studies': { bg: 'bg-orange-100', text: 'text-orange-700' },
    Computer: { bg: 'bg-teal-100', text: 'text-teal-700' },
    'Art': { bg: 'bg-pink-100', text: 'text-pink-700' },
    'Art & Craft': { bg: 'bg-pink-100', text: 'text-pink-700' },
    Sports: { bg: 'bg-red-100', text: 'text-red-700' },
    '--Lunch--': { bg: 'bg-gray-100', text: 'text-gray-500' },
    Library: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
    '---': { bg: 'bg-gray-50', text: 'text-gray-300' },
  }
  return colorMap[subject] || { bg: 'bg-gray-100', text: 'text-gray-700' }
}

export const calculateAttendancePercentage = (records) => {
  if (!records.length) return 0
  const presentCount = records.filter(
    (record) => record.status === 'present' || record.status === 'late'
  ).length
  return Math.round((presentCount / records.length) * 100)
}

export const getDayOfWeek = () => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return days[new Date().getDay()]
}

export const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 17) return 'Good Afternoon'
  return 'Good Evening'
}

export const numberToWords = (num) => {
  if (num === 0) return 'Zero'
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

  const convertHundreds = (n) => {
    let result = ''
    if (n >= 100) {
      result += ones[Math.floor(n / 100)] + ' Hundred '
      n %= 100
    }
    if (n >= 20) {
      result += tens[Math.floor(n / 10)] + ' '
      n %= 10
    }
    if (n > 0) result += ones[n] + ' '
    return result.trim()
  }

  if (num >= 100000) {
    return convertHundreds(Math.floor(num / 1000)) + ' Thousand ' + convertHundreds(num % 1000) + ' Rupees Only'
  }
  if (num >= 1000) {
    return convertHundreds(Math.floor(num / 1000)) + ' Thousand ' + convertHundreds(num % 1000) + ' Rupees Only'
  }
  return convertHundreds(num) + ' Rupees Only'
}
