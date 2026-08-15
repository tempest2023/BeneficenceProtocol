import Link from 'next/link'
import losAngeles from '@/src/assets/scenes/los-angeles.webp'
import { Arrow } from '@/components/icons'
import { SystemPage } from '@/components/system-page'

export default function NotFound() {
  return (
    <SystemPage
      variant="error"
      eyebrow="Error 404"
      title={<>This page is outside<br />the public record.</>}
      description="The address may have changed, or the page may no longer be available."
      artwork={losAngeles}
      artworkCaption="Los Angeles / Griffith Observatory / Serouj"
    >
      <div className="system-page__actions">
        <Link href="/" className="system-page__action system-page__action--primary">
          Return home <Arrow />
        </Link>
      </div>
    </SystemPage>
  )
}
