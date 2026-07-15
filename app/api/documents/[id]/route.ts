import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { getCurrentUser } from '@/lib/dal'
import { prisma } from '@/lib/prisma'

const UPLOAD_DIR = path.join(process.cwd(), 'uploads')

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  const { id } = await context.params

  const doc = await prisma.document.findUnique({ where: { id }, include: { case: true } })

  if (!doc || doc.case.teamId !== user.teamId) {
    return new Response('Not found', { status: 404 })
  }

  const bytes = await readFile(path.join(UPLOAD_DIR, doc.storedName))

  return new Response(new Uint8Array(bytes), {
    headers: {
      'Content-Disposition': `attachment; filename="${encodeURIComponent(doc.filename)}"`,
      'Content-Type': 'application/octet-stream',
    },
  })
}
