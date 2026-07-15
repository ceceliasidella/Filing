import { getCurrentUser } from '@/lib/dal'
import { Nav } from '@/app/ui/nav'
import { NewCaseForm } from './new-case-form'

export default async function NewCasePage() {
  const user = await getCurrentUser()

  return (
    <div className="min-h-screen bg-stone-100">
      <Nav userName={user.name} teamName={user.team.name} />
      <main className="max-w-2xl mx-auto px-6 py-10">
        <p className="text-xs uppercase tracking-[0.2em] text-stone-500">New Filing</p>
        <h1 className="font-serif text-3xl text-brand-navy mt-1 mb-7">Open a New Case</h1>
        <NewCaseForm />
      </main>
    </div>
  )
}
