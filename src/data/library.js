export const books = [
  { id: 'B001', title: 'Mathematics NCERT Class 10', author: 'NCERT', category: 'Textbook', total: 30, available: 18, issuedTo: 'S003,S007,S011,S014,S016,S018,S020,S001,S004,S009,S012,S015' },
  { id: 'B002', title: 'Science NCERT Class 10', author: 'NCERT', category: 'Textbook', total: 30, available: 22, issuedTo: 'S002,S005,S008,S010,S013,S017,S019,S006' },
  { id: 'B003', title: 'Wings of Fire', author: 'A.P.J. Abdul Kalam', category: 'Biography', total: 5, available: 3, issuedTo: 'S001,S004' },
  { id: 'B004', title: 'The Alchemist', author: 'Paulo Coelho', category: 'Fiction', total: 4, available: 2, issuedTo: 'S002,S008' },
  { id: 'B005', title: 'Competitive Maths — Class 9 & 10', author: 'R.D. Sharma', category: 'Reference', total: 10, available: 7, issuedTo: 'S003,S011,S015' },
  { id: 'B006', title: 'English Grammar in Use', author: 'Raymond Murphy', category: 'Reference', total: 8, available: 5, issuedTo: 'S007,S012,S016' },
  { id: 'B007', title: 'Harry Potter and the Sorcerers Stone', author: 'J.K. Rowling', category: 'Fiction', total: 3, available: 1, issuedTo: 'S005,S013' },
  { id: 'B008', title: 'India After Gandhi', author: 'Ramachandra Guha', category: 'History', total: 3, available: 3, issuedTo: '' },
  { id: 'B009', title: 'Class 10 Social Science NCERT', author: 'NCERT', category: 'Textbook', total: 25, available: 15, issuedTo: 'S001,S002,S003,S004,S005,S006,S007,S008,S009,S010' },
  { id: 'B010', title: 'The Diary of a Young Girl', author: 'Anne Frank', category: 'Biography', total: 4, available: 4, issuedTo: '' },
  { id: 'B011', title: 'Computer Science with Python', author: 'Sumita Arora', category: 'Textbook', total: 15, available: 9, issuedTo: 'S011,S012,S013,S014,S015,S016' },
  { id: 'B012', title: 'Godan', author: 'Munshi Premchand', category: 'Hindi Lit', total: 5, available: 3, issuedTo: 'S017,S018' },
]

export const issuedBooks = [
  { id: 'IS001', bookId: 'B001', bookTitle: 'Mathematics NCERT Class 10', studentId: 'S001', studentName: 'Aarav Patel', issueDate: '2024-04-10', dueDate: '2024-04-24', returned: false },
  { id: 'IS002', bookId: 'B003', bookTitle: 'Wings of Fire', studentId: 'S001', studentName: 'Aarav Patel', issueDate: '2024-04-12', dueDate: '2024-04-26', returned: false },
  { id: 'IS003', bookId: 'B004', bookTitle: 'The Alchemist', studentId: 'S002', studentName: 'Sneha Iyer', issueDate: '2024-04-08', dueDate: '2024-04-22', returned: true, returnDate: '2024-04-21' },
  { id: 'IS004', bookId: 'B007', bookTitle: 'Harry Potter', studentId: 'S005', studentName: 'Dev Chauhan', issueDate: '2024-04-15', dueDate: '2024-04-29', returned: false },
  { id: 'IS005', bookId: 'B011', bookTitle: 'Computer Science — Python', studentId: 'S012', studentName: 'Riya Desai', issueDate: '2024-04-05', dueDate: '2024-04-19', returned: false },
]
