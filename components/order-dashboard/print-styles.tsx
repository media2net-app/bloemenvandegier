/** Gedeelde print-CSS voor A4 pakbon/factuur — voorkomt grijs vlak + witte strook. */
export const PRINT_A4_CSS = `
@media print {
  @page {
    size: A4;
    margin: 10mm;
  }

  html, body {
    background: #ffffff !important;
    background-color: #ffffff !important;
    color: #000000 !important;
    margin: 0 !important;
    padding: 0 !important;
    width: 100% !important;
    min-height: 0 !important;
    height: auto !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* Next.js / layout wrappers */
  body > *,
  #__next,
  [data-overlay-container],
  .min-h-screen {
    background: #ffffff !important;
    background-color: #ffffff !important;
    margin: 0 !important;
    padding: 0 !important;
    max-width: none !important;
    width: 100% !important;
    min-height: 0 !important;
    height: auto !important;
    box-shadow: none !important;
  }

  .no-print {
    display: none !important;
  }

  .print-sheet {
    display: block !important;
    position: static !important;
    float: none !important;
    width: 100% !important;
    max-width: none !important;
    margin: 0 !important;
    padding: 0 !important;
    background: #ffffff !important;
    background-color: #ffffff !important;
    color: #000000 !important;
    box-shadow: none !important;
    border-radius: 0 !important;
    page-break-inside: auto;
    break-inside: auto;
  }

  .print-sheet * {
    color: #000000 !important;
    visibility: visible !important;
    box-shadow: none !important;
    text-shadow: none !important;
  }

  /* Geen grijze Tailwind-achtergronden in print */
  .print-sheet [class*="bg-"],
  .min-h-screen [class*="bg-"] {
    background: #ffffff !important;
    background-color: #ffffff !important;
  }

  .print-sheet-break {
    page-break-after: always;
    break-after: page;
  }

  .print-sheet-last {
    page-break-after: auto !important;
    break-after: auto !important;
  }

  .pakbon-products {
    border-collapse: collapse !important;
    width: 100% !important;
  }

  .pakbon-product-row-sep td {
    border-bottom: 2px solid #000000 !important;
    padding-bottom: 12px !important;
  }

  .pakbon-extra-highlight {
    border-left: 3px solid #000000 !important;
    background: transparent !important;
  }
}
`

export function PrintA4Styles() {
  return <style dangerouslySetInnerHTML={{ __html: PRINT_A4_CSS }} />
}
