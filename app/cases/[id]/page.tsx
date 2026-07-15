import { notFound } from 'next/navigation'
import { getCurrentUser } from '@/lib/dal'
import { prisma } from '@/lib/prisma'
import { Nav } from '@/app/ui/nav'
import { formatDate, formatDateTime } from '@/lib/format'
import { addNote, addDocument, updateStatus } from '@/app/cases/actions'
import { StatusSelect } from './status-select'

export default async function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getCurrentUser()

  const kase = await prisma.case.findUnique({
    where: { id },
    include: {
      notes: { include: { author: true }, orderBy: { createdAt: 'desc' } },
      documents: { include: { uploadedBy: true }, orderBy: { uploadedAt: 'desc' } },
    },
  })

  if (!kase || kase.teamId !== user.teamId) {
    notFound()
  }

  const addNoteWithId = addNote.bind(null, kase.id)
  const addDocumentWithId = addDocument.bind(null, kase.id)
  const updateStatusWithId = updateStatus.bind(null, kase.id)

  return (
    <div className="min-h-screen bg-stone-100">
      <Nav userName={user.name} teamName={user.team.name} />

      <main className="max-w-3xl mx-auto px-6 py-10 space-y-6">
        <div className="bg-white rounded-lg shadow-sm ring-1 ring-stone-200 p-7">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-stone-500">
                Docket #{kase.docketNumber}
              </p>
              <h1 className="font-serif text-3xl text-brand-navy mt-1">{kase.title}</h1>
            </div>
            <StatusSelect currentStatus={kase.status} action={updateStatusWithId} />
          </div>

          <dl className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm border-t border-stone-100 pt-6">
            <div>
              <dt className="text-xs uppercase tracking-wide text-stone-500">Parties</dt>
              <dd className="text-slate-900 whitespace-pre-wrap mt-1">{kase.parties}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-stone-500">Charges</dt>
              <dd className="text-slate-900 whitespace-pre-wrap mt-1">{kase.charges}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-stone-500">Court Date</dt>
              <dd className="text-slate-900 mt-1">{formatDate(kase.courtDate)}</dd>
            </div>
          </dl>
        </div>

        <div className="bg-white rounded-lg shadow-sm ring-1 ring-stone-200 p-7">
          <h2 className="font-serif text-lg text-brand-navy mb-4">Documents</h2>
          {kase.documents.length === 0 ? (
            <p className="text-sm text-stone-500">No documents uploaded yet.</p>
          ) : (
            <ul className="divide-y divide-stone-100 mb-5">
              {kase.documents.map((doc) => (
                <li key={doc.id} className="py-2.5 text-sm flex items-center justify-between">
                  <a
                    href={`/api/documents/${doc.id}`}
                    className="text-blue-800 hover:underline"
                  >
                    {doc.filename}
                  </a>
                  <span className="text-stone-400">
                    {doc.uploadedBy.name} &middot; {formatDateTime(doc.uploadedAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <form action={addDocumentWithId} className="flex items-center gap-3">
            <input type="file" name="file" required className="text-sm" />
            <button
              type="submit"
              className="rounded-md bg-brand-navy px-3.5 py-1.5 text-sm font-medium text-white hover:bg-brand-navy-light transition-colors"
            >
              Upload
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-sm ring-1 ring-stone-200 p-7">
          <h2 className="font-serif text-lg text-brand-navy mb-4">Notes</h2>
          <form action={addNoteWithId} className="mb-5 space-y-2">
            <textarea
              name="content"
              rows={3}
              required
              placeholder="Add a note about this case..."
              className="block w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
            />
            <button
              type="submit"
              className="rounded-md bg-brand-navy px-3.5 py-1.5 text-sm font-medium text-white hover:bg-brand-navy-light transition-colors"
            >
              Add Note
            </button>
          </form>

          {kase.notes.length === 0 ? (
            <p className="text-sm text-stone-500">No notes yet.</p>
          ) : (
            <ul className="space-y-4">
              {kase.notes.map((note) => (
                <li key={note.id} className="border-t border-stone-100 pt-4 text-sm">
                  <p className="text-slate-900 whitespace-pre-wrap">{note.content}</p>
                  <p className="text-stone-400 mt-1.5">
                    {note.author.name} &middot; {formatDateTime(note.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  )
}
