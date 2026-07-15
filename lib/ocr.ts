import 'server-only'
import { createWorker, type Worker } from 'tesseract.js'
import { definePDFJSModule, renderPageAsImage } from 'unpdf'

let workerPromise: Promise<Worker> | null = null
let pdfjsReady: Promise<void> | null = null

function getWorker() {
  if (!workerPromise) {
    workerPromise = createWorker('eng')
  }
  return workerPromise
}

async function ensurePdfjsModule() {
  if (!pdfjsReady) {
    pdfjsReady = definePDFJSModule(() => import('pdfjs-dist/legacy/build/pdf.mjs'))
  }
  return pdfjsReady
}

export async function renderPdfFirstPageToPng(buffer: Buffer): Promise<Buffer> {
  await ensurePdfjsModule()
  const result = await renderPageAsImage(new Uint8Array(buffer), 1, {
    canvasImport: () => import('@napi-rs/canvas'),
    scale: 2,
  })
  return Buffer.from(result)
}

export async function extractText(buffer: Buffer): Promise<string> {
  const worker = await getWorker()
  const { data } = await worker.recognize(buffer)
  return data.text
}

const MONTHS = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
]

function toIsoDate(year: number, monthIndex0: number, day: number): string | null {
  if (year < 1900 || year > 2100 || monthIndex0 < 0 || monthIndex0 > 11 || day < 1 || day > 31) {
    return null
  }
  const mm = String(monthIndex0 + 1).padStart(2, '0')
  const dd = String(day).padStart(2, '0')
  return `${year}-${mm}-${dd}`
}

function guessCourtDate(text: string): string | null {
  const slash = text.match(/\b(\d{1,2})\/(\d{1,2})\/(\d{2,4})\b/)
  if (slash) {
    const [, m, d, y] = slash
    const year = y.length === 2 ? 2000 + Number(y) : Number(y)
    return toIsoDate(year, Number(m) - 1, Number(d))
  }

  const named = text.match(
    /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(\d{4})\b/i
  )
  if (named) {
    const [, monthName, d, y] = named
    const monthIndex = MONTHS.indexOf(monthName.toLowerCase())
    return toIsoDate(Number(y), monthIndex, Number(d))
  }

  return null
}

export type CaseFieldGuesses = {
  docketNumber: string | null
  title: string | null
  parties: string | null
  charges: string | null
  courtDate: string | null
}

/**
 * Best-effort regex extraction from OCR text. Real scanned filings vary too much
 * in layout to parse reliably — this is a starting point for staff to review/correct,
 * not an authoritative reader.
 */
export function guessCaseFields(text: string): CaseFieldGuesses {
  const docketMatch =
    text.match(/\b([A-Z]{1,4}-\d{4}-\d{4,8})\b/) ??
    text.match(/docket\s*(?:no\.?|number|#)?\s*[:#]?\s*([A-Z0-9-]{5,})/i)

  const titleMatch = text.match(/Commonwealth\s+v\.?\s+([A-Za-z.,'\- ]{2,60})/i)

  const defendantMatch = text.match(/defendant\s*[:#]?\s*([A-Za-z.,'\- ]{2,60})/i)
  const victimMatch = text.match(/victim\s*[:#]?\s*([A-Za-z.,'\- ]{2,60})/i)

  const chargeMatch = text.match(/(\d+\s*Pa\.?\s*C\.?\s*S\.?\s*(?:§|section)?\s*\d+[A-Za-z0-9.]*)/i)
  const chargeLineMatch = text.match(/charge[sd]?\s*[:#]?\s*([A-Za-z0-9 .,()§-]{3,80})/i)

  let parties: string | null = null
  if (defendantMatch || victimMatch) {
    const parts = []
    if (defendantMatch) parts.push(`Defendant: ${defendantMatch[1].trim()}`)
    if (victimMatch) parts.push(`Victim: ${victimMatch[1].trim()}`)
    parties = parts.join('; ')
  } else if (titleMatch) {
    parties = `Defendant: ${titleMatch[1].trim()}`
  }

  return {
    docketNumber: docketMatch ? docketMatch[1].trim() : null,
    title: titleMatch ? `Commonwealth v. ${titleMatch[1].trim()}` : null,
    parties,
    charges: (chargeMatch ?? chargeLineMatch) ? (chargeMatch ?? chargeLineMatch)![1].trim() : null,
    courtDate: guessCourtDate(text),
  }
}
