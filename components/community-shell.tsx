import Link from 'next/link'
import type { ReactNode } from 'react'

export function CommunitySubnav() {
  return <nav className="community-subnav" aria-label="Community"><div className="page-shell community-subnav__inner"><Link href="/community">Overview</Link><Link href="/community/people">People</Link><Link href="/community/learn">Learn</Link><Link href="/community/gather">Gather</Link><Link href="/community/contribute">Contribute</Link><Link href="/community/code-of-conduct">Code of Conduct</Link></div></nav>
}

export function CommunityPageHero({ eyebrow, title, lead }: { eyebrow: string; title: string; lead: string }) {
  return <><header className="community-page-hero"><div className="page-shell community-page-hero__inner"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="community-page-hero__lead">{lead}</p></div></header><CommunitySubnav /></>
}

export function CommunitySection({ eyebrow, title, lead, children, tone = 'light', id }: { eyebrow: string; title: string; lead?: string; children: ReactNode; tone?: 'light' | 'soft' | 'ink'; id?: string }) {
  return <section className={`community-section ${tone === 'soft' ? 'community-section--soft' : ''} ${tone === 'ink' ? 'community-section--ink' : ''}`} id={id}><div className="page-shell"><div className="community-heading"><p className="section-index">{eyebrow}</p><div><h2>{title}</h2>{lead ? <p>{lead}</p> : null}</div></div>{children}</div></section>
}
