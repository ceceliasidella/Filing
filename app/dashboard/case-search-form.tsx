'use client'

import { useState } from 'react'
import { statusLabels } from '@/lib/format'

type Defaults = {
  q?: string
  status?: string
  dateFrom?: string
  dateTo?: string
}

export function CaseSearchForm({ defaults }: { defaults: Defaults }) {
  const [showFilters, setShowFilters] = useState(
    Boolean(defaults.status || defaults.dateFrom || defaults.dateTo)
  )

  return (
    <form action="/dashboard" className="bg-white rounded-lg shadow-sm ring-1 ring-stone-200 p-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          name="q"
          defaultValue={defaults.q}
          placeholder="Search by docket #, party, or charge..."
          className="flex-1 rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
        />
        <div className="flex gap-2">
          <button
            type="submit"
            className="rounded-md bg-brand-navy px-4 py-2 text-sm font-medium text-white hover:bg-brand-navy-light transition-colors"
          >
            Search
          </button>
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className="rounded-md border border-stone-300 px-3 py-2 text-sm text-slate-600 hover:border-brand-navy transition-colors whitespace-nowrap"
          >
            {showFilters ? 'Hide filters' : 'More filters'}
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 pt-3 border-t border-stone-100">
          <div>
            <label className="block text-xs uppercase tracking-wide text-stone-500 mb-1">
              Status
            </label>
            <select
              name="status"
              defaultValue={defaults.status ?? ''}
              className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
            >
              <option value="">Any status</option>
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-stone-500 mb-1">
              Court date from
            </label>
            <input
              type="date"
              name="dateFrom"
              defaultValue={defaults.dateFrom}
              className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-stone-500 mb-1">
              Court date to
            </label>
            <input
              type="date"
              name="dateTo"
              defaultValue={defaults.dateTo}
              className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
            />
          </div>
        </div>
      )}
    </form>
  )
}
