'use client'

import Link from 'next/link'
import losAngeles from '@/src/assets/scenes/los-angeles.webp'
import { Arrow } from '@/components/icons'
import { SystemPage } from '@/components/system-page'
import '../src/index.css'
import '../src/App.css'

export default function GlobalError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="en">
      <body>
        <title>Application error — Beneficence Protocol Foundation</title>
        <SystemPage
          variant="error"
          eyebrow="System interruption"
          title={<>The public record<br />is temporarily unavailable.</>}
          description="The interruption is temporary. Try again, or return to the home page."
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
      </body>
    </html>
  )
}
