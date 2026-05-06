const generateAttendanceForStudent = (studentId, pattern) => {
  const workingDays = [
    '2024-04-01', '2024-04-02', '2024-04-03', '2024-04-04', '2024-04-05',
    '2024-04-08', '2024-04-09', '2024-04-10', '2024-04-11', '2024-04-12',
    '2024-04-15', '2024-04-16', '2024-04-17', '2024-04-18', '2024-04-19',
    '2024-04-22', '2024-04-23', '2024-04-24', '2024-04-25', '2024-04-26',
  ]

  return workingDays.map((date, index) => ({
    id: `A-${studentId}-${index}`,
    studentId,
    date,
    status: pattern[index % pattern.length],
  }))
}

const patterns = {
  excellent: ['present', 'present', 'present', 'present', 'present', 'present', 'present', 'present', 'present', 'late', 'present', 'present', 'present', 'present', 'present', 'present', 'present', 'present', 'present', 'present'],
  good: ['present', 'present', 'absent', 'present', 'present', 'present', 'late', 'present', 'present', 'present', 'present', 'present', 'present', 'absent', 'present', 'present', 'present', 'present', 'late', 'present'],
  average: ['present', 'absent', 'absent', 'present', 'late', 'present', 'absent', 'present', 'present', 'absent', 'present', 'present', 'absent', 'present', 'present', 'late', 'present', 'absent', 'present', 'present'],
  belowAverage: ['present', 'absent', 'present', 'absent', 'present', 'absent', 'late', 'present', 'absent', 'absent', 'present', 'absent', 'present', 'present', 'absent', 'late', 'absent', 'present', 'absent', 'present'],
}

const studentPatternMap = {
  S001: 'excellent',
  S002: 'average',
  S003: 'good',
  S004: 'excellent',
  S005: 'belowAverage',
  S006: 'good',
  S007: 'excellent',
  S008: 'average',
  S009: 'good',
  S010: 'excellent',
  S011: 'belowAverage',
  S012: 'good',
  S013: 'excellent',
  S014: 'average',
  S015: 'good',
  S016: 'excellent',
  S017: 'average',
  S018: 'good',
  S019: 'excellent',
  S020: 'belowAverage',
  S021: 'good',
  S022: 'excellent',
  S023: 'average',
  S024: 'good',
  S025: 'excellent',
}

export const attendanceData = Object.entries(studentPatternMap).flatMap(
  ([studentId, patternKey]) => generateAttendanceForStudent(studentId, patterns[patternKey])
)

export const workingDays = [
  '2024-04-01', '2024-04-02', '2024-04-03', '2024-04-04', '2024-04-05',
  '2024-04-08', '2024-04-09', '2024-04-10', '2024-04-11', '2024-04-12',
  '2024-04-15', '2024-04-16', '2024-04-17', '2024-04-18', '2024-04-19',
  '2024-04-22', '2024-04-23', '2024-04-24', '2024-04-25', '2024-04-26',
]
