export const statusLabels: Record<string, string> = {
  OPEN: 'Open',
  PENDING_COURT: 'Pending Court',
  CLOSED: 'Closed',
}

export const statusStyles: Record<string, string> = {
  OPEN: 'bg-blue-50 text-blue-900 ring-1 ring-inset ring-blue-200',
  PENDING_COURT: 'bg-amber-50 text-amber-900 ring-1 ring-inset ring-amber-300',
  CLOSED: 'bg-stone-100 text-stone-600 ring-1 ring-inset ring-stone-300',
}

export function formatDate(date: Date | string | null | undefined) {
  if (!date) return 'Not scheduled'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTime(date: Date | string) {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
