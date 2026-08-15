'use client'

import ErrorPage from '@/app/error'

export function ErrorStatePreviewClient() {
  return (
    <ErrorPage
      error={new Error('Development-only error state preview.')}
      retry={() => window.location.reload()}
    />
  )
}
