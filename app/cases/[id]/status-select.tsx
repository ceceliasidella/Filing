'use client'

import { statusLabels, statusStyles } from '@/lib/format'

export function StatusSelect({
  currentStatus,
  action,
}: {
  currentStatus: string
  action: (formData: FormData) => void
}) {
  return (
    <form action={action}>
      <select
        key={currentStatus}
        name="status"
        defaultValue={currentStatus}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className={`text-xs font-medium px-3 py-1.5 rounded-full border-0 cursor-pointer ${statusStyles[currentStatus]}`}
      >
        {Object.entries(statusLabels).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </form>
  )
}
