'use client'

import Link from 'next/link'
import errorSixthStreet from '@/src/assets/scenes/system-error-sixth-street.webp'
import { Arrow } from '@/components/icons'
import { SystemPage } from '@/components/system-page'

export default function ErrorPage({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <SystemPage
      variant="error"
      eyebrow="Something went wrong"
      title={<>This page couldn’t<br />be loaded.</>}
      description="Your request was not completed. Try again, or return to the home page."
      artwork={errorSixthStreet}
      artworkCaption="Los Angeles / Sixth Street Viaduct / Steve Lyon · CC BY-SA 2.0 · altered"
      artworkHref="https://commons.wikimedia.org/wiki/File:Sixth_Street_Viaduct_Los_Angeles_River_(9066252968).jpg"
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
