'use client'

import { useFormStatus } from 'react-dom'

export function AdminSubmitButton({
  children,
  pendingLabel = 'Saving…',
  className = 'admin-button',
}: {
  children: React.ReactNode
  pendingLabel?: string
  className?: string
}) {
  const { pending } = useFormStatus()
  return <button className={className} type="submit" disabled={pending}>{pending ? pendingLabel : children}</button>
}
