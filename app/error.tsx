'use client'

import Link from 'next/link'
import losAngeles from '@/src/assets/scenes/los-angeles.webp'
import { Arrow } from '@/components/icons'
import { SystemPage } from '@/components/system-page'

export default function ErrorPage({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <SystemPage
      variant="error"
      eyebrow="Temporary interruption"
      title={<>The record paused<br />before this page.</>}
      description="Nothing has been submitted or changed. Try the request again, or return to the home page."
      artwork={losAngeles}
      artworkCaption="Los Angeles / Griffith Observatory / Serouj"
      live="assertive"
    >
      <div className="system-page__actions">
        <button className="system-page__action system-page__action--primary" type="button" onClick={retry}>
          Try again <Arrow />
        </button>
        <Link href="/" className="system-page__action system-page__action--quiet">Return home</Link>
      </div>
    </SystemPage>
  )
}
