'use client'

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="system-state page-shell">
      <p className="eyebrow">Temporary interruption</p>
      <h1>This page could not be loaded.</h1>
      <p>Your data has not been submitted. Check your connection and try again.</p>
      <button className="primary-action" type="button" onClick={reset}>Try again</button>
    </main>
  )
}
