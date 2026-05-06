import jsPDF from 'jspdf'
import { formatDate, numberToWords } from './helpers'

export const generateFeeReceipt = (feeRecord, studentData) => {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()

  // Header
  doc.setFillColor(30, 58, 95)
  doc.rect(0, 0, pageWidth, 40, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('Shree Bala International School', pageWidth / 2, 15, { align: 'center' })
  doc.setFontSize(9)
  doc.text('Shiv Dhara Educational Charitable Trust', pageWidth / 2, 22, { align: 'center' })
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Near Suramya Heights, Eklingji Bopal Road, Sanand - Ahmedabad', pageWidth / 2, 29, { align: 'center' })
  doc.text('Ph: +91 84888 87896 | Email: shreebalainternationalschool@gmail.com', pageWidth / 2, 35, { align: 'center' })

  // Gold stripe
  doc.setFillColor(212, 160, 23)
  doc.rect(0, 40, pageWidth, 3, 'F')

  // Receipt title
  doc.setTextColor(30, 58, 95)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('FEE RECEIPT', pageWidth / 2, 55, { align: 'center' })

  // Receipt meta
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(44, 44, 44)
  doc.text(`Receipt No: ${feeRecord.receiptNo || 'N/A'}`, 20, 68)
  doc.text(`Date: ${formatDate(feeRecord.paymentDate)}`, pageWidth - 20, 68, { align: 'right' })

  // Student details box
  doc.setDrawColor(229, 231, 235)
  doc.setLineWidth(0.5)
  doc.roundedRect(15, 75, pageWidth - 30, 45, 3, 3)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('Student Details', 20, 85)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  const studentInfo = [
    ['Student Name:', feeRecord.studentName],
    ['Class:', feeRecord.class],
    ['Student ID:', feeRecord.studentId],
    ['Father\'s Name:', studentData?.fatherName || '—'],
  ]

  studentInfo.forEach(([label, value], index) => {
    const yPosition = 95 + index * 6
    doc.setFont('helvetica', 'bold')
    doc.text(label, 22, yPosition)
    doc.setFont('helvetica', 'normal')
    doc.text(String(value), 65, yPosition)
  })

  // Fee details box
  doc.roundedRect(15, 128, pageWidth - 30, 40, 3, 3)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('Fee Details', 20, 138)

  doc.setFontSize(10)
  const feeInfo = [
    ['Term:', feeRecord.term],
    ['Amount:', `Rs. ${feeRecord.amount.toLocaleString('en-IN')}`],
    ['Payment Method:', feeRecord.method || '—'],
    ['Amount in Words:', numberToWords(feeRecord.amount)],
  ]

  feeInfo.forEach(([label, value], index) => {
    const yPosition = 148 + index * 6
    doc.setFont('helvetica', 'bold')
    doc.text(label, 22, yPosition)
    doc.setFont('helvetica', 'normal')
    doc.text(String(value), 65, yPosition)
  })

  // Status
  doc.setFillColor(220, 252, 231)
  doc.roundedRect(15, 178, pageWidth - 30, 15, 3, 3, 'F')
  doc.setTextColor(21, 128, 61)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('STATUS: PAID', pageWidth / 2, 188, { align: 'center' })

  // Signature section
  doc.setTextColor(107, 114, 128)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('This is a computer-generated receipt and does not require a signature.', pageWidth / 2, 210, { align: 'center' })

  doc.setDrawColor(30, 58, 95)
  doc.line(pageWidth - 70, 225, pageWidth - 20, 225)
  doc.setTextColor(44, 44, 44)
  doc.setFontSize(10)
  doc.text('Authorized Signatory', pageWidth - 45, 232, { align: 'center' })

  // Footer
  doc.setFillColor(30, 58, 95)
  doc.rect(0, 275, pageWidth, 22, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(8)
  doc.text('Shree Bala International School | CBSE Affiliated | Shiv Dhara Educational Charitable Trust', pageWidth / 2, 287, { align: 'center' })

  doc.save(`FeeReceipt_${feeRecord.studentName.replace(/\s+/g, '_')}_${feeRecord.term.replace(/\s+/g, '_')}.pdf`)
}
