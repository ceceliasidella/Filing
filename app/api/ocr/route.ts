import { getCurrentUser } from '@/lib/dal'
import { extractText, guessCaseFields, renderPdfFirstPageToPng } from '@/lib/ocr'

export async function POST(request: Request) {
  await getCurrentUser()

  const formData = await request.formData()
  const file = formData.get('file')

  if (!(file instanceof File) || file.size === 0) {
    return Response.json({ error: 'No file provided' }, { status: 400 })
  }

  const isImage = file.type.startsWith('image/')
  const isPdf = file.type === 'application/pdf'

  if (!isImage && !isPdf) {
    return Response.json(
      { error: 'Auto-extraction only works on image or PDF scans.' },
      { status: 400 }
    )
  }

  const bytes = Buffer.from(await file.arrayBuffer())
  const imageBytes = isPdf ? await renderPdfFirstPageToPng(bytes) : bytes

  const text = await extractText(imageBytes)
  const guesses = guessCaseFields(text)

  return Response.json({ guesses })
}
