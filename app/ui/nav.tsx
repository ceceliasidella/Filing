import Link from 'next/link'
import Image from 'next/image'
import { logout } from '@/app/dashboard/actions'

export function Nav({ userName, teamName }: { userName: string; teamName: string }) {
  return (
    <header className="bg-brand-navy text-stone-100 border-b border-brand-gold/30">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3">
          <Image
            src="/images/da-seal.png"
            alt="Dauphin County District Attorney seal"
            width={40}
            height={41}
            className="rounded-full"
          />
          <div className="leading-tight min-w-0">
            <div className="font-serif text-base sm:text-lg tracking-wide truncate max-w-[220px] sm:max-w-none">
              Dauphin County District Attorney&rsquo;s Office
            </div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-brand-gold/80">
              CORE
            </div>
          </div>
        </Link>
        <div className="flex items-center gap-5 text-sm">
          <span className="text-stone-300">
            {userName} <span className="text-stone-500">&middot;</span> {teamName}
          </span>
          <form action={logout}>
            <button
              type="submit"
              className="text-stone-300 hover:text-white border border-brand-gold/40 hover:border-brand-gold rounded px-3 py-1.5 transition-colors"
            >
              Log out
            </button>
          </form>
        </div>
      </div>
    </header>
  )
}
