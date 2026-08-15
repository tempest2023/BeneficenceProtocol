import sanFrancisco from '@/src/assets/scenes/san-francisco.webp'
import { SystemPage } from '@/components/system-page'

export default function Loading() {
  return (
    <SystemPage
      variant="loading"
      eyebrow="Loading"
      title={<>Preparing the<br />public record…</>}
      artwork={sanFrancisco}
      artworkCaption="San Francisco / Golden Gate Bridge / Bernard Gagnon"
      busy
      live="polite"
    >
      <div className="system-page__loading-status" role="status">
        <span className="system-page__progress" aria-hidden="true"><span /></span>
        <span>Gathering the public view</span>
      </div>
    </SystemPage>
  )
}
