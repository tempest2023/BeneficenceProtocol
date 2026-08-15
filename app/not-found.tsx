import Link from 'next/link'
import notFoundBradbury from '@/src/assets/scenes/system-not-found-bradbury.webp'
import { Arrow } from '@/components/icons'
import { SystemPage } from '@/components/system-page'

export default function NotFound() {
  return (
    <SystemPage
      variant="not-found"
      eyebrow="404 / Page not found"
      title={<>We couldn’t find<br />that page.</>}
      description="The link may be outdated, or the address may have been entered incorrectly."
      artwork={notFoundBradbury}
      artworkCaption="Los Angeles / Bradbury Building / Jack Boucher · HABS · public domain · altered"
      artworkHref="https://commons.wikimedia.org/wiki/File:Bradbury_Building.jpg"
    >
      <div className="system-page__actions">
        <Link href="/" className="system-page__action system-page__action--primary">
          Return home <Arrow />
        </Link>
      </div>
    </SystemPage>
  )
}
