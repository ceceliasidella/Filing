'use server'

import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { redirect } from 'next/navigation'
import { revalidatePath, refresh } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, requireCaseAccess } from '@/lib/dal'

const UPLOAD_DIR = path.join(process.cwd(), 'uploads')

const NewCaseSchema = z.object({
  docketNumber: z.string().trim().min(1, 'Docket number is required'),
  title: z.string().trim().min(1, 'Title is required'),
  parties: z.string().trim().min(1, 'Parties are required'),
  charges: z.string().trim().min(1, 'Charges are required'),
  courtDate: z.string().optional(),
})

async function saveDocument(caseId: string, uploadedById: string, file: File) {
  await mkdir(UPLOAD_DIR, { recursive: true })
  const storedName = `${randomUUID()}-${file.name}`
  const bytes = Buffer.from(await file.arrayBuffer())
  await writeFile(path.join(UPLOAD_DIR, storedName), bytes)

  await prisma.document.create({
    data: {
      caseId,
      filename: file.name,
      storedName,
      uploadedById,
    },
  })
}

export async function createCase(prevState: unknown, formData: FormData) {
  const user = await getCurrentUser()

  const validated = NewCaseSchema.safeParse({
    docketNumber: formData.get('docketNumber'),
    title: formData.get('title'),
    parties: formData.get('parties'),
    charges: formData.get('charges'),
    courtDate: formData.get('courtDate'),
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const { docketNumber, title, parties, charges, courtDate } = validated.data

  const existing = await prisma.case.findUnique({ where: { docketNumber } })
  if (existing) {
    return { errors: { docketNumber: ['A case with this docket number already exists.'] } }
  }

  const created = await prisma.case.create({
    data: {
      docketNumber,
      title,
      parties,
      charges,
      courtDate: courtDate ? new Date(courtDate) : null,
      teamId: user.teamId,
    },
  })

  const scannedFiles = formData.getAll('scannedFiles')
  for (const file of scannedFiles) {
    if (file instanceof File && file.size > 0) {
      await saveDocument(created.id, user.id, file)
    }
  }

  redirect(`/cases/${created.id}`)
}

export async function addNote(caseId: string, formData: FormData) {
  const { user } = await requireCaseAccess(caseId)

  const content = formData.get('content')
  if (typeof content !== 'string' || !content.trim()) {
    return
  }

  await prisma.note.create({
    data: { caseId, authorId: user.id, content: content.trim() },
  })

  revalidatePath(`/cases/${caseId}`)
  refresh()
}

export async function updateStatus(caseId: string, formData: FormData) {
  await requireCaseAccess(caseId)

  const status = formData.get('status')
  if (status !== 'OPEN' && status !== 'PENDING_COURT' && status !== 'CLOSED') {
    return
  }

  await prisma.case.update({ where: { id: caseId }, data: { status } })
  revalidatePath(`/cases/${caseId}`)
  refresh()
}

export async function addDocument(caseId: string, formData: FormData) {
  const { user } = await requireCaseAccess(caseId)

  const file = formData.get('file')
  if (!(file instanceof File) || file.size === 0) {
    return
  }

  await saveDocument(caseId, user.id, file)

  revalidatePath(`/cases/${caseId}`)
  refresh()
}
