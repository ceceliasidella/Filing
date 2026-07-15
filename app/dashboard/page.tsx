import Link from 'next/link'
import { getCurrentUser } from '@/lib/dal'
import { prisma } from '@/lib/prisma'
import { Nav } from '@/app/ui/nav'
import { statusLabels, statusStyles, formatDate } from '@/lib/format'
import { CaseSearchForm } from './case-search-form'

type SearchParams = { [key: string]: string | string[] | undefined }

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const user = await getCurrentUser()
  const params = await searchParams

  const q = firstValue(params.q)?.trim().toLowerCase()
  const status = firstValue(params.status)
  const dateFromStr = firstValue(params.dateFrom)
  const dateToStr = firstValue(params.dateTo)
  const dateFrom = dateFromStr ? new Date(`${dateFromStr}T00:00:00.000Z`) : null
  const dateTo = dateToStr ? new Date(`${dateToStr}T23:59:59.999Z`) : null

  const allCases = await prisma.case.findMany({
    where: { teamId: user.teamId },
    orderBy: { createdAt: 'desc' },
  })

  const cases = allCases.filter((c) => {
    if (q) {
      const haystack = `${c.docketNumber} ${c.title} ${c.parties} ${c.charges}`.toLowerCase()
      if (!haystack.includes(q)) return false
    }
    if (status && c.status !== status) return false
    if (dateFrom && (!c.courtDate || c.courtDate < dateFrom)) return false
    if (dateTo && (!c.courtDate || c.courtDate > dateTo)) return false
    return true
  })

  const hasFilters = Boolean(q || status || dateFrom || dateTo)

  return (
    <div className="min-h-screen bg-stone-100">
      <Nav userName={user.name} teamName={user.team.name} />

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-end justify-between mb-8 border-b border-stone-300 pb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Docket</p>
            <h1 className="font-serif text-3xl text-brand-navy mt-1">{user.team.name}</h1>
          </div>
          <Link
            href="/cases/new"
            className="rounded-md bg-brand-navy px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-navy-light transition-colors"
          >
            + New Case
          </Link>
        </div>

        <CaseSearchForm
          defaults={{
            q: firstValue(params.q),
            status,
            dateFrom: dateFromStr,
            dateTo: dateToStr,
          }}
        />

        {hasFilters && (
          <p className="text-sm text-stone-500 mb-4">
            {cases.length} result{cases.length === 1 ? '' : 's'} &middot;{' '}
            <Link href="/dashboard" className="underline hover:text-brand-navy">
              Clear search
            </Link>
          </p>
        )}

        {cases.length === 0 ? (
          <p className="text-stone-500">
            {hasFilters ? 'No cases match your search.' : 'No cases yet for your team.'}
          </p>
        ) : (
          <div className="bg-white rounded-lg shadow-sm ring-1 ring-stone-200 divide-y divide-stone-100">
            {cases.map((c) => (
              <Link
                key={c.id}
                href={`/cases/${c.id}`}
                className="block px-6 py-5 hover:bg-stone-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-serif text-lg text-slate-900">{c.title}</div>
                    <div className="text-sm text-stone-500 mt-0.5">
                      Docket #{c.docketNumber} &middot; Court date: {formatDate(c.courtDate)}
                    </div>
                  </div>
                  <span
                    className={`text-xs font-medium px-3 py-1 rounded-full ${statusStyles[c.status]}`}
                  >
                    {statusLabels[c.status]}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
