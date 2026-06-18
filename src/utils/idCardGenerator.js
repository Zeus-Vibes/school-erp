import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

const CARD_WIDTH_MM = 63.5
const CARD_HEIGHT_MM = 100.0

export const generateIdCardPdf = async (elementId, cardHolderName, cardHolderId) => {
  const element = document.getElementById(elementId)
  if (!element) return

  const canvas = await html2canvas(element, {
    scale: 3,
    useCORS: true,
    backgroundColor: '#FFFFFF',
    logging: false
  })

  const imgData = canvas.toDataURL('image/png', 1.0)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [CARD_WIDTH_MM, CARD_HEIGHT_MM]
  })

  doc.addImage(imgData, 'PNG', 0, 0, CARD_WIDTH_MM, CARD_HEIGHT_MM)
  doc.save(`IDCard_${cardHolderName.replace(/\s+/g, '_')}_${cardHolderId}.pdf`)
}

export const generateBulkIdCards = async (elements, onProgress) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [CARD_WIDTH_MM, CARD_HEIGHT_MM]
  })

  let pageAdded = false

  for (let i = 0; i < elements.length; i++) {
    const { elementId } = elements[i]
    const element = document.getElementById(elementId)
    if (!element) continue

    if (pageAdded) {
      doc.addPage([CARD_WIDTH_MM, CARD_HEIGHT_MM], 'portrait')
    } else {
      pageAdded = true
    }

    const canvas = await html2canvas(element, {
      scale: 3,
      useCORS: true,
      backgroundColor: '#FFFFFF',
      logging: false
    })

    const imgData = canvas.toDataURL('image/png', 1.0)
    doc.addImage(imgData, 'PNG', 0, 0, CARD_WIDTH_MM, CARD_HEIGHT_MM)

    if (onProgress) {
      onProgress(i + 1, elements.length)
    }

    await new Promise((resolve) => setTimeout(resolve, 50))
  }

  doc.save('IDCards_Bulk.pdf')
}
