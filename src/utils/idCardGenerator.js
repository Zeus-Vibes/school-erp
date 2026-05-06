import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

const PDF_CARD_WIDTH_MM = 63.5

export const generateIdCardPdf = async (elementId, studentName, studentId) => {
  const element = document.getElementById(elementId)
  if (!element) return

  const canvas = await html2canvas(element, {
    scale: 4,
    useCORS: true,
    backgroundColor: '#FFFFFF',
    logging: false,
  })

  const canvasWidth = canvas.width
  const canvasHeight = canvas.height
  const aspectRatio = canvasHeight / canvasWidth
  const pdfWidth = PDF_CARD_WIDTH_MM
  const pdfHeight = pdfWidth * aspectRatio

  const imgData = canvas.toDataURL('image/png', 1.0)
  const doc = new jsPDF('p', 'mm', [pdfWidth, pdfHeight])

  doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
  doc.save(`IDCard_${studentName.replace(/\s+/g, '_')}_${studentId}.pdf`)
}

export const generateBulkIdCards = async (studentElements, onProgress) => {
  const doc = new jsPDF('p', 'mm', 'a4')
  const cardWidth = PDF_CARD_WIDTH_MM
  let cardIndex = 0

  for (let i = 0; i < studentElements.length; i++) {
    const { elementId } = studentElements[i]
    const element = document.getElementById(elementId)
    if (!element) continue

    const canvas = await html2canvas(element, {
      scale: 4,
      useCORS: true,
      backgroundColor: '#FFFFFF',
      logging: false,
    })

    const aspectRatio = canvas.height / canvas.width
    const cardHeight = cardWidth * aspectRatio

    const imgData = canvas.toDataURL('image/png', 1.0)
    const cols = 3
    const rows = Math.floor(270 / (cardHeight + 8))
    const cardsPerPage = cols * rows
    const marginX = (210 - cardWidth * cols - 8 * (cols - 1)) / 2
    const marginY = 12
    const col = cardIndex % cols
    const row = Math.floor((cardIndex % cardsPerPage) / cols)

    if (cardIndex > 0 && cardIndex % cardsPerPage === 0) {
      doc.addPage()
    }

    const xPosition = marginX + col * (cardWidth + 8)
    const yPosition = marginY + row * (cardHeight + 8)

    doc.addImage(imgData, 'PNG', xPosition, yPosition, cardWidth, cardHeight)
    cardIndex++

    if (onProgress) {
      onProgress(i + 1, studentElements.length)
    }

    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  doc.save('IDCards_Bulk.pdf')
}
