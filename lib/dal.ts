import 'server-only'
import { cache } from 'react'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export const verifySession = cache(async () => {
  const session = await getSession()
  if (!session?.userId) {
    redirect('/login')
  }
  return { userId: session.userId }
})

export const getCurrentUser = cache(async () => {
  const session = await verifySession()
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, role: true, teamId: true, team: { select: { id: true, name: true } } },
  })
  if (!user) {
    redirect('/login')
  }
  return user
})

/** Throws if the current user's team doesn't own the given case. Call before every case read/write. */
export async function requireCaseAccess(caseId: string) {
  const user = await getCurrentUser()
  const kase = await prisma.case.findUnique({ where: { id: caseId } })
  if (!kase || kase.teamId !== user.teamId) {
    throw new Error('Forbidden: you do not have access to this case')
  }
  return { user, case: kase }
}
