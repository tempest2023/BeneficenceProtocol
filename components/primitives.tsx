import Link from 'next/link'
import type { ReactNode } from 'react'
import type { StaticImageData } from 'next/image'
import { Arrow } from '@/components/icons'

export function TextLink({ href, children, light = false }: { href: string; children: ReactNode; light?: boolean }) {
  return <Link href={href} className={`text-link ${light ? 'text-link--light' : ''}`}><span>{children}</span><Arrow /></Link>
}

export function ArticleHero({ eyebrow, title, lead, image, imagePosition, caption }: {
  eyebrow: string
  title: string
  lead: string
  image: StaticImageData
  imagePosition?: string
  caption: string
}) {
  return (
    <header className="article-hero">
      <div className="page-shell article-hero__grid">
        <div className="article-hero__content">
          <p className="eyebrow hero-enter hero-enter--1">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="article-hero__lead hero-enter hero-enter--3">{lead}</p>
        </div>
        <figure className="article-hero__figure hero-enter hero-enter--3">
          <img src={image.src} alt="" width="971" height="1619" style={{ objectPosition: imagePosition }} />
          <figcaption>{caption}</figcaption>
        </figure>
      </div>
    </header>
  )
}

export function EmptyState({ eyebrow, title, children, actions }: { eyebrow: string; title: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <section className="empty-state" aria-labelledby={`empty-${eyebrow.replace(/\s+/g, '-').toLowerCase()}`}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 id={`empty-${eyebrow.replace(/\s+/g, '-').toLowerCase()}`}>{title}</h2>
      <div className="empty-state__copy">{children}</div>
      {actions ? <div className="empty-state__actions">{actions}</div> : null}
    </section>
  )
}
