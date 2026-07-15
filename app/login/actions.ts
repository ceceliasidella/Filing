'use server'

import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { createSession } from '@/lib/session'

export async function login(formData: FormData) {
  const userId = formData.get('userId')
  if (typeof userId !== 'string' || !userId) {
    return
  }

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    return
  }

  await createSession(user.id)
  redirect('/dashboard')
}
