import Image, { type StaticImageData } from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { FoundationMark } from '@/components/icons'

type SystemPageProps = {
  variant: 'loading' | 'not-found' | 'error'
  eyebrow: string
  title: ReactNode
  description?: string
  artwork: StaticImageData
  artworkCaption: string
  artworkHref: string
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
  artworkHref,
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
          sizes="100vw"
          placeholder="blur"
          loading="eager"
          fetchPriority="high"
        />
        <figcaption>
          <a href={artworkHref} target="_blank" rel="noreferrer">
            {artworkCaption}
          </a>
        </figcaption>
      </figure>

      <div className="system-page__frame page-shell">
        <Link href="/" className="wordmark system-page__brand" aria-label="Beneficence Protocol Foundation home">
          <FoundationMark />
          <span>Beneficence Protocol<small>Foundation</small></span>
        </Link>

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
