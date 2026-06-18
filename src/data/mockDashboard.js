export const mockDashboardStats = {
  totalStudents: 1240,
  totalTeachers: 52,
  feesCollected: 1845000,
  avgAttendance: 92.4,
  houses: {
    Red: 310,
    Green: 305,
    Blue: 320,
    Yellow: 305
  },
  newAdmissionsThisMonth: 12,
  lcIssuedThisMonth: 2,
  pendingFees: 245000,
  todayAttendancePercentage: 94.2,
  alerts: [
    { id: 'alert-1', type: 'warning', text: 'Classes without published timetable: 4', link: '/dashboard/admin/timetable' },
    { id: 'alert-2', type: 'danger', text: 'Students with overdue fees: 23', link: '/dashboard/admin/fees' },
    { id: 'alert-3', type: 'warning', text: 'Exams with incomplete marks: 2', link: '/dashboard/admin/examinations' },
    { id: 'alert-4', type: 'info', text: 'Students below 75% attendance: 18', link: '/dashboard/admin/attendance' }
  ]
}
