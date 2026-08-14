'use client'

export default function AdminError({ error, reset }: { error: Error; reset: () => void }) {
  return <main className="admin-main"><section className="admin-panel"><p className="eyebrow">Administrative error</p><h1>This operation could not be completed.</h1><p>{error.message}</p><button className="admin-button" type="button" onClick={reset}>Try again</button></section></main>
}
