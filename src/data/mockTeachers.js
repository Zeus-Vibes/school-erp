export const mockTeachers = [
  {
    id: 'SBIS-TCH-2425-001',
    employeeId: 'SBIS-TCH-001',
    userId: 'SBIS-TCH-2425-001',
    name: 'Priya Mehta',
    dob: '1988-05-15',
    gender: 'Female',
    phone: '9876540001',
    email: 'priya.m@school.com',
    address: '45 Navrangpura, Ahmedabad',
    qualification: 'M.Sc Mathematics',
    experience: 8,
    joiningDate: '2016-06-01',
    salary: 45000,
    subjects: ['Mathematics', 'Science', 'English'],
    subjectClassMapping: [
      { subject: 'English', classId: 'class-lkg-a' },
      { subject: 'Mathematics', classId: 'class-lkg-a' },
      { subject: 'Mathematics', classId: 'class-3-eng-a' },
      { subject: 'Science', classId: 'class-3-eng-a' }
    ],
    classTeacherOf: 'class-3-eng-a',
    isActive: true
  },
  {
    id: 'SBIS-TCH-2425-002',
    employeeId: 'SBIS-TCH-002',
    userId: 'SBIS-TCH-2425-002',
    name: 'Arjun Verma',
    dob: '1990-07-22',
    gender: 'Male',
    phone: '9876540002',
    email: 'arjun.v@school.com',
    address: '78 Satellite, Ahmedabad',
    qualification: 'M.Sc Physics',
    experience: 6,
    joiningDate: '2018-07-15',
    salary: 42000,
    subjects: ['Science', 'Mathematics', 'Social Studies'],
    subjectClassMapping: [
      { subject: 'Science', classId: 'class-5-guj-b' },
      { subject: 'Mathematics', classId: 'class-5-guj-b' }
    ],
    classTeacherOf: 'class-5-guj-b',
    isActive: true
  },
  {
    id: 'SBIS-TCH-2425-003',
    employeeId: 'SBIS-TCH-003',
    userId: 'SBIS-TCH-2425-003',
    name: 'Sunita Sharma',
    dob: '1982-04-10',
    gender: 'Female',
    phone: '9876540003',
    email: 'sunita.s@school.com',
    address: '89 Vastrapur, Ahmedabad',
    qualification: 'MA English',
    experience: 12,
    joiningDate: '2012-04-01',
    salary: 50000,
    subjects: ['English'],
    subjectClassMapping: [
      { subject: 'English', classId: 'class-3-eng-a' }
    ],
    classTeacherOf: null,
    isActive: true
  }
]
