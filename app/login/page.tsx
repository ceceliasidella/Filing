import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { login } from './actions'

export default async function LoginPage() {
  const users = await prisma.user.findMany({
    include: { team: true },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="min-h-screen bg-stone-100">
      <div className="relative h-72 sm:h-80 w-full overflow-hidden">
        <Image
          src="/images/courthouse-hero.jpg"
          alt="Dauphin County Courthouse"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/70 to-brand-navy/20" />
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-8 text-center px-4">
          <Image
            src="/images/da-seal.png"
            alt="Dauphin County District Attorney seal"
            width={64}
            height={66}
            className="mb-3 drop-shadow-lg"
            priority
          />
          <h1 className="font-serif text-2xl sm:text-3xl text-white drop-shadow-sm max-w-md">
            Dauphin County District Attorney&rsquo;s Office
          </h1>
          <p className="text-xs uppercase tracking-[0.2em] text-brand-gold mt-1">
            CORE
          </p>
          <p className="text-[11px] text-stone-300 mt-0.5">
            Case &amp; Operations Records Engine
          </p>
        </div>
      </div>

      <div className="flex justify-center px-4 -mt-6 pb-16">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-md ring-1 ring-stone-200 p-8">
            <p className="text-sm text-slate-500 mb-6">
              This is a prototype with fake data only. Select a demo account to continue.
            </p>

            <form action={login} className="space-y-3">
              {users.map((user) => (
                <button
                  key={user.id}
                  type="submit"
                  name="userId"
                  value={user.id}
                  className="w-full text-left rounded-md border border-stone-200 px-4 py-3 hover:border-brand-navy hover:bg-stone-50 transition-colors"
                >
                  <div className="font-medium text-slate-900">{user.name}</div>
                  <div className="text-xs text-slate-500">{user.team.name}</div>
                </button>
              ))}
            </form>
          </div>

          <p className="text-center text-xs text-stone-400 mt-6">
            Internal use only &middot; Not for production case data
          </p>
        </div>
      </div>
    </div>
  )
}
