import { PrismaClient } from '../app/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  await prisma.document.deleteMany()
  await prisma.note.deleteMany()
  await prisma.case.deleteMany()
  await prisma.user.deleteMany()
  await prisma.team.deleteMany()

  const teamA = await prisma.team.create({ data: { name: 'Team A - Violent Crimes' } })
  const teamB = await prisma.team.create({ data: { name: 'Team B - Property Crimes' } })

  const jane = await prisma.user.create({
    data: { name: 'Jane Smith (Attorney)', role: 'ATTORNEY', teamId: teamA.id },
  })
  const john = await prisma.user.create({
    data: { name: 'John Doe (Clerical)', role: 'CLERICAL', teamId: teamA.id },
  })
  const alex = await prisma.user.create({
    data: { name: 'Alex Lee (Investigator)', role: 'INVESTIGATOR', teamId: teamA.id },
  })

  const maria = await prisma.user.create({
    data: { name: 'Maria Garcia (Attorney)', role: 'ATTORNEY', teamId: teamB.id },
  })
  await prisma.user.create({
    data: { name: 'Sam Patel (Clerical)', role: 'CLERICAL', teamId: teamB.id },
  })

  const case1 = await prisma.case.create({
    data: {
      docketNumber: 'CP-2026-000123',
      title: 'Commonwealth v. Doe',
      parties: 'Defendant: John Q. Doe; Victim: Redacted',
      charges: 'Aggravated Assault (18 Pa.C.S. 2702)',
      status: 'OPEN',
      courtDate: new Date('2026-08-15T09:00:00Z'),
      teamId: teamA.id,
    },
  })

  const case2 = await prisma.case.create({
    data: {
      docketNumber: 'CP-2026-000456',
      title: 'Commonwealth v. Smith',
      parties: 'Defendant: Jane R. Smith',
      charges: 'DUI (75 Pa.C.S. 3802)',
      status: 'PENDING_COURT',
      courtDate: new Date('2026-07-22T13:30:00Z'),
      teamId: teamA.id,
    },
  })

  const case3 = await prisma.case.create({
    data: {
      docketNumber: 'CP-2025-009876',
      title: 'Commonwealth v. Nguyen',
      parties: 'Defendant: Tam Nguyen',
      charges: 'Retail Theft (18 Pa.C.S. 3929)',
      status: 'CLOSED',
      teamId: teamB.id,
    },
  })

  await prisma.note.create({
    data: {
      caseId: case1.id,
      authorId: jane.id,
      content: 'Reviewed initial police report. Requesting additional witness statements.',
    },
  })
  await prisma.note.create({
    data: {
      caseId: case1.id,
      authorId: alex.id,
      content: 'Interviewed witness on-site, statement filed with clerical.',
    },
  })
  await prisma.note.create({
    data: {
      caseId: case2.id,
      authorId: john.id,
      content: 'Docket scheduled, notice sent to defense counsel.',
    },
  })
  await prisma.note.create({
    data: {
      caseId: case3.id,
      authorId: maria.id,
      content: 'Case closed, restitution paid in full.',
    },
  })

  console.log('Seed complete:')
  console.log({ teamA: teamA.name, teamB: teamB.name })
  console.log('Demo users:', [jane.name, john.name, alex.name, maria.name])
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
