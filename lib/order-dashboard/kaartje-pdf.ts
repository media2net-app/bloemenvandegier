import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import type { WcOrder } from '@/lib/woocommerce/orders'
import { cleanKaartjeText, getKaartjeTexts } from '@/lib/woocommerce/order-display'

/** A6 landscape: 148 × 105 mm in PDF points */
const MM = 2.834645669
const PAGE_W = 148 * MM
const PAGE_H = 105 * MM

function toPdfSafeText(input: string): string {
  return cleanKaartjeText(input)
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\u2013|\u2014/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF]/g, '') // WinAnsi / Latin-1
}

function wrapText(
  text: string,
  font: { widthOfTextAtSize: (t: string, s: number) => number },
  fontSize: number,
  maxWidth: number
): string[] {
  const paragraphs = text.replace(/\r\n/g, '\n').split('\n')
  const lines: string[] = []
  for (const para of paragraphs) {
    if (!para.trim()) {
      lines.push('')
      continue
    }
    const words = para.split(/\s+/)
    let current = ''
    for (const word of words) {
      const next = current ? `${current} ${word}` : word
      if (font.widthOfTextAtSize(next, fontSize) <= maxWidth) {
        current = next
      } else {
        if (current) lines.push(current)
        current = word
      }
    }
    if (current) lines.push(current)
  }
  return lines
}

/** Bouw één PDF met alle kaartjes (A6 liggend, tekst rechts van de vouw). */
export async function buildKaartjesPdf(orders: WcOrder[]): Promise<Uint8Array> {
  const pdf = await PDFDocument.create()
  const font = await pdf.embedFont(StandardFonts.TimesRoman)
  const fontSize = 12
  const lineHeight = 16
  const leftOfRightPanel = PAGE_W / 2 + 10 * MM
  const textMaxWidth = PAGE_W / 2 - 20 * MM

  let pagesAdded = 0

  for (const order of orders) {
    const cards = getKaartjeTexts(order)
    for (const card of cards) {
      const text = toPdfSafeText(card.text).trim()
      if (!text) continue

      const page = pdf.addPage([PAGE_W, PAGE_H])
      pagesAdded++

      const lines = wrapText(text, font, fontSize, textMaxWidth)
      const blockHeight = Math.max(lines.length, 1) * lineHeight
      let y = (PAGE_H + blockHeight) / 2 - lineHeight

      for (const line of lines) {
        if (!line) {
          y -= lineHeight
          continue
        }
        const w = font.widthOfTextAtSize(line, fontSize)
        const x = leftOfRightPanel + Math.max(0, (textMaxWidth - w) / 2)
        page.drawText(line, {
          x,
          y,
          size: fontSize,
          font,
          color: rgb(0.1, 0.1, 0.1),
        })
        y -= lineHeight
      }
    }
  }

  if (!pagesAdded) {
    throw new Error('Geen kaartjetekst gevonden voor de geselecteerde orders')
  }

  return pdf.save()
}
