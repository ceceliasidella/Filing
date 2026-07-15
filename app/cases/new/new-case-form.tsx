'use client'

import { useActionState, useState } from 'react'
import { createCase } from '@/app/cases/actions'

type FormState = { errors?: Record<string, string[]> } | undefined

type Fields = {
  docketNumber: string
  title: string
  parties: string
  charges: string
  courtDate: string
}

const EMPTY_FIELDS: Fields = {
  docketNumber: '',
  title: '',
  parties: '',
  charges: '',
  courtDate: '',
}

export function NewCaseForm() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(createCase, undefined)
  const [fileNames, setFileNames] = useState<string[]>([])
  const [fields, setFields] = useState<Fields>(EMPTY_FIELDS)
  const [scanning, setScanning] = useState(false)
  const [scanNotice, setScanNotice] = useState<string | null>(null)

  async function handleFilesChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    setFileNames(files.map((f) => f.name))
    setScanNotice(null)

    const scannable = files.find((f) => f.type.startsWith('image/') || f.type === 'application/pdf')
    if (!scannable) return

    setScanning(true)
    try {
      const body = new FormData()
      body.append('file', scannable)
      const res = await fetch('/api/ocr', { method: 'POST', body })
      const data = await res.json()

      if (!res.ok) {
        setScanNotice(data.error ?? 'Could not read text from that scan.')
        return
      }

      const guesses = data.guesses as Partial<Fields>
      const foundAny = Object.values(guesses).some(Boolean)

      setFields((prev) => ({
        docketNumber: prev.docketNumber || guesses.docketNumber || '',
        title: prev.title || guesses.title || '',
        parties: prev.parties || guesses.parties || '',
        charges: prev.charges || guesses.charges || '',
        courtDate: prev.courtDate || guesses.courtDate || '',
      }))

      setScanNotice(
        foundAny
          ? 'Auto-filled from the scan below — please review every field before submitting.'
          : "Couldn't confidently read case details from that scan. Please fill in the fields manually."
      )
    } catch {
      setScanNotice('Something went wrong reading that scan. Please fill in the fields manually.')
    } finally {
      setScanning(false)
    }
  }

  function updateField(name: keyof Fields) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFields((prev) => ({ ...prev, [name]: e.target.value }))
  }

  return (
    <form action={formAction} className="bg-white rounded-lg shadow-sm ring-1 ring-stone-200 p-7 space-y-5">
      <div className="border-2 border-dashed border-stone-300 rounded-lg p-5 text-center">
        <label htmlFor="scannedFiles" className="cursor-pointer">
          <div className="text-sm font-medium text-slate-700">
            Scan or attach the case file
          </div>
          <div className="text-xs text-stone-500 mt-1">
            Use your device camera to scan paper documents, or upload existing photos/PDFs.
            We&rsquo;ll attempt to auto-fill the fields below from the first page. Optional.
          </div>
          <span className="inline-block mt-3 rounded-md bg-brand-navy px-4 py-2 text-sm font-medium text-white hover:bg-brand-navy-light transition-colors">
            Choose Files
          </span>
        </label>
        <input
          id="scannedFiles"
          name="scannedFiles"
          type="file"
          multiple
          accept="image/*,application/pdf"
          capture="environment"
          className="hidden"
          onChange={handleFilesChosen}
        />
        {fileNames.length > 0 && (
          <ul className="mt-3 text-xs text-slate-600 space-y-0.5">
            {fileNames.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        )}
        {scanning && (
          <p className="mt-3 text-xs text-brand-navy font-medium">Reading scanned document…</p>
        )}
        {scanNotice && !scanning && (
          <p className="mt-3 text-xs text-amber-700 bg-amber-50 rounded px-3 py-2 inline-block">
            {scanNotice}
          </p>
        )}
      </div>

      <div className="border-t border-stone-100 pt-5">
        <p className="text-xs uppercase tracking-wide text-stone-500 mb-4">Case Details</p>

        <div className="space-y-5">
          <div>
            <label htmlFor="docketNumber" className="block text-sm font-medium text-slate-700 uppercase text-xs tracking-wide">
              Docket Number
            </label>
            <input
              id="docketNumber"
              name="docketNumber"
              value={fields.docketNumber}
              onChange={updateField('docketNumber')}
              className="mt-1.5 block w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
              placeholder="CP-2026-000000"
            />
            {state?.errors?.docketNumber && (
              <p className="mt-1 text-sm text-red-600">{state.errors.docketNumber[0]}</p>
            )}
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-700 uppercase text-xs tracking-wide">
              Case Title
            </label>
            <input
              id="title"
              name="title"
              value={fields.title}
              onChange={updateField('title')}
              className="mt-1.5 block w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
              placeholder="Commonwealth v. Doe"
            />
            {state?.errors?.title && <p className="mt-1 text-sm text-red-600">{state.errors.title[0]}</p>}
          </div>

          <div>
            <label htmlFor="parties" className="block text-sm font-medium text-slate-700 uppercase text-xs tracking-wide">
              Parties
            </label>
            <textarea
              id="parties"
              name="parties"
              rows={2}
              value={fields.parties}
              onChange={updateField('parties')}
              className="mt-1.5 block w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
              placeholder="Defendant: ...; Victim: ..."
            />
            {state?.errors?.parties && (
              <p className="mt-1 text-sm text-red-600">{state.errors.parties[0]}</p>
            )}
          </div>

          <div>
            <label htmlFor="charges" className="block text-sm font-medium text-slate-700 uppercase text-xs tracking-wide">
              Charges
            </label>
            <textarea
              id="charges"
              name="charges"
              rows={2}
              value={fields.charges}
              onChange={updateField('charges')}
              className="mt-1.5 block w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
              placeholder="e.g. Aggravated Assault (18 Pa.C.S. 2702)"
            />
            {state?.errors?.charges && (
              <p className="mt-1 text-sm text-red-600">{state.errors.charges[0]}</p>
            )}
          </div>

          <div>
            <label htmlFor="courtDate" className="block text-sm font-medium text-slate-700 uppercase text-xs tracking-wide">
              Court Date (optional)
            </label>
            <input
              id="courtDate"
              name="courtDate"
              type="date"
              value={fields.courtDate}
              onChange={updateField('courtDate')}
              className="mt-1.5 block w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={pending || scanning}
        className="rounded-md bg-brand-navy px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-navy-light transition-colors disabled:opacity-50"
      >
        {pending ? 'Creating…' : 'Create Case'}
      </button>
    </form>
  )
}
