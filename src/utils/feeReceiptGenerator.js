import jsPDF from 'jspdf'
import { formatDate, numberToWords } from './helpers'
import { getSchoolBrand } from './schoolBrand'

export const generateFeeReceipt = (feeRecord, studentData, customPlanInfo = null) => {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth() // usually 210mm
  const pageHeight = doc.internal.pageSize.getHeight() // usually 297mm

  const standard = studentData?.standard || '1'
  const brand = getSchoolBrand(standard)

  // Receipt Number format
  // RCP-SBIS-{year}-{4-digit-serial} or RCP-SDS-{year}-{serial}
  const year = feeRecord.paymentDate ? feeRecord.paymentDate.split('-')[0] : new Date().getFullYear()
  const serial = String(feeRecord.id || '0001').replace(/[^0-9]/g, '').slice(-4).padStart(4, '0')
  const isShivDhara = standard === 'LKG' || standard === 'UKG'
  const receiptNo = isShivDhara
    ? `RCP-SDS-${year}-${parseInt(serial, 10)}`
    : `RCP-SBIS-${year}-${serial}`

  const drawHalf = (yOffset, copyType) => {
    // 1. Header Banner
    doc.setFillColor(30, 58, 95) // Dark blue
    doc.rect(0, yOffset, pageWidth, 28, 'F')

    // Header Texts
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text(brand.name, pageWidth / 2, yOffset + 8, { align: 'center' })

    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text('Shiv Dhara Educational Charitable Trust', pageWidth / 2, yOffset + 13, { align: 'center' })
    doc.text('Near Suramya Heights, Eklingji Bopal Road, Sanand - Ahmedabad', pageWidth / 2, yOffset + 18, { align: 'center' })
    doc.text('Ph: +91 84888 87896 | Email: shreebalainternationalschool@gmail.com', pageWidth / 2, yOffset + 23, { align: 'center' })

    // Copy Type indicator
    doc.setFillColor(212, 160, 23) // Gold stripe
    doc.rect(0, yOffset + 28, pageWidth, 2, 'F')

    doc.setTextColor(30, 58, 95)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text(copyType.toUpperCase(), pageWidth - 15, yOffset + 36, { align: 'right' })

    // Title
    doc.setFontSize(12)
    doc.text('FEE RECEIPT', 15, yOffset + 36)

    // Meta details
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(44, 44, 44)
    doc.text(`Receipt No: ${receiptNo}`, 15, yOffset + 43)
    doc.text(`Date: ${formatDate(feeRecord.paymentDate || new Date().toISOString().split('T')[0])}`, pageWidth - 15, yOffset + 43, { align: 'right' })

    // Divider
    doc.setDrawColor(229, 231, 235)
    doc.setLineWidth(0.3)
    doc.line(15, yOffset + 46, pageWidth - 15, yOffset + 46)

    // Student & Fee Information Grid
    doc.setFont('helvetica', 'bold')
    doc.text('Student Details', 15, yOffset + 52)

    doc.setFont('helvetica', 'normal')
    doc.text('Student Name:', 15, yOffset + 58)
    doc.text(feeRecord.studentName || studentData?.name || '—', 45, yOffset + 58)

    doc.text('GR Number:', 15, yOffset + 64)
    doc.text(studentData?.grNumber || '—', 45, yOffset + 64)

    doc.text('Class:', 15, yOffset + 70)
    doc.text(feeRecord.class || (studentData ? `${studentData.standard}-${studentData.division}` : '—'), 45, yOffset + 70)

    // Fee info
    doc.setFont('helvetica', 'bold')
    doc.text('Payment Details', 110, yOffset + 52)

    doc.setFont('helvetica', 'normal')
    doc.text('Fee Type:', 110, yOffset + 58)
    doc.text(feeRecord.term || 'Tuition Fee', 140, yOffset + 58)

    doc.text('Amount:', 110, yOffset + 64)
    doc.text(`Rs. ${(feeRecord.amount || 0).toLocaleString('en-IN')}`, 140, yOffset + 64)

    doc.text('Payment Mode:', 110, yOffset + 70)
    doc.text(feeRecord.method || 'Cash', 140, yOffset + 70)

    // Amount in Words
    doc.setFontSize(8.5)
    doc.text(`Amount in Words: ${numberToWords(feeRecord.amount || 0)}`, 15, yOffset + 78)

    // Divider
    doc.line(15, yOffset + 81, pageWidth - 15, yOffset + 81)

    // Custom Plan installment details (Parent Copy Only)
    if (copyType === 'Parent Copy' && customPlanInfo) {
      doc.setFillColor(239, 246, 255) // Light blue box
      doc.roundedRect(15, yOffset + 84, pageWidth - 30, 16, 2, 2, 'F')
      doc.setTextColor(30, 58, 95)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8.5)
      doc.text('CUSTOM INSTALLMENT PLAN ACTIVE', 20, yOffset + 89)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.text(`Installment: ${customPlanInfo.installmentNo} of ${customPlanInfo.totalInstallments}`, 20, yOffset + 95)
      doc.text(`Remaining Balance: Rs. ${(customPlanInfo.remainingBalance || 0).toLocaleString('en-IN')}`, 75, yOffset + 95)
      if (customPlanInfo.nextDueDate) {
        doc.text(`Next Due: ${formatDate(customPlanInfo.nextDueDate)}`, 140, yOffset + 95)
      }
      doc.setTextColor(44, 44, 44)
    }

    // Stamp circle & signature
    const bottomBase = yOffset + (copyType === 'Parent Copy' && customPlanInfo ? 108 : 95)

    // Stamp area
    doc.setDrawColor(30, 58, 95)
    doc.roundedRect(15, bottomBase, 32, 16, 2, 2)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.text('SCHOOL STAMP', 31, bottomBase + 9, { align: 'center' })

    // Signatures
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.text('Received By: __________________', 80, bottomBase + 10)

    doc.line(pageWidth - 55, bottomBase + 10, pageWidth - 15, bottomBase + 10)
    doc.text('Authorized Signatory', pageWidth - 35, bottomBase + 14, { align: 'center' })
  }

  // Draw Top Half - School Copy
  drawHalf(0, 'School Copy')

  // Draw Dashed Scissors Line at 148.5mm
  doc.setDrawColor(156, 163, 175)
  doc.setLineWidth(0.4)
  doc.setLineDashPattern([2, 2], 0)
  doc.line(0, 148.5, pageWidth, 148.5)

  // Cut Label
  doc.setTextColor(107, 114, 128)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('── [✂ Cut Here dashed line at 148.5mm] ──', pageWidth / 2, 148.5 + 1, { align: 'center' })

  // Reset Line Dash for Bottom Half
  doc.setLineDashPattern([], 0)

  // Draw Bottom Half - Parent Copy
  drawHalf(148.5, 'Parent Copy')

  doc.save(`FeeReceipt_${(studentData?.name || 'Student').replace(/\s+/g, '_')}_${(feeRecord.term || 'Fee').replace(/\s+/g, '_')}.pdf`)
}
