import Image, { type StaticImageData } from 'next/image'
import type { ReactNode } from 'react'

type SystemPageProps = {
  variant: 'loading' | 'error'
  eyebrow: string
  title: ReactNode
  description?: string
  artwork: StaticImageData
  artworkCaption: string
  children?: ReactNode
  busy?: boolean
  live?: 'polite' | 'assertive'
}

export function SystemPage({
  variant,
  eyebrow,
  title,
  description,
  artwork,
  artworkCaption,
  children,
  busy = false,
  live,
}: SystemPageProps) {
  const titleId = `system-page-${variant}-title`

  return (
    <main
      id="main-content"
      className={`system-page system-page--${variant}`}
      aria-labelledby={titleId}
      aria-busy={busy || undefined}
      aria-live={live}
    >
      <figure className="system-page__visual">
        <Image
          src={artwork}
          alt=""
          fill
          sizes="(min-width: 64rem) 42vw, 100vw"
          placeholder="blur"
          loading="eager"
          fetchPriority="high"
        />
        <figcaption>{artworkCaption}</figcaption>
      </figure>

      <div className="system-page__frame page-shell">
        <section className="system-page__content">
          <p className="eyebrow">{eyebrow}</p>
          <h1 id={titleId}>{title}</h1>
          {description ? <p className="system-page__description">{description}</p> : null}
          {children}
        </section>
      </div>
    </main>
  )
}
