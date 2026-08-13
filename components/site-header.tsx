'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { Arrow, FoundationMark } from '@/components/icons'

const links = [
  ['/', 'Home'],
  ['/mission', 'Mission'],
  ['/programs', 'Programs'],
  ['/governance', 'Governance'],
  ['/community', 'Community'],
] as const

const communityLinks = [
  ['/community', 'Overview'],
  ['/community/people', 'People'],
  ['/community/learn', 'Learn'],
  ['/community/gather', 'Gather'],
  ['/community/contribute', 'Contribute'],
  ['/community/contribute/apply', 'Apply'],
  ['/community/contribute/resources/submit', 'Submit resource'],
  ['/community/code-of-conduct', 'Code of Conduct'],
] as const

export function SiteHeader() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const communityNavRef = useRef<HTMLDivElement>(null)
  const inCommunity = pathname === '/community' || pathname.startsWith('/community/')
  const activeCommunityHref = inCommunity
    ? [...communityLinks]
        .filter(([href]) => pathname === href || (href !== '/community' && pathname.startsWith(`${href}/`)))
        .sort(([a], [b]) => b.length - a.length)[0]?.[0] ?? '/community'
    : null

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [])

  useEffect(() => {
    const navigation = communityNavRef.current
    const activeLink = navigation?.querySelector<HTMLElement>('.is-active')
    if (!navigation || !activeLink) return
    navigation.scrollTo({
      left: Math.max(0, activeLink.offsetLeft - (navigation.clientWidth - activeLink.offsetWidth) / 2),
      behavior: 'auto',
    })
  }, [pathname])

  return (
    <header className="site-header">
      <div className="nav-shell">
        <Link href="/" className="wordmark">
          <FoundationMark />
          <span>Beneficence Protocol<small>Foundation</small></span>
        </Link>
        <button
          className="menu-toggle"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
        </button>
        <nav id="primary-navigation" className={`primary-navigation ${menuOpen ? 'is-open' : ''}`} aria-label="Primary navigation">
          {links.map(([href, label]) => {
            const current = href === '/' ? pathname === '/' : pathname.startsWith(href)
            const exact = pathname === href
            return <Link key={href} href={href} className={current ? 'is-active' : undefined} aria-current={exact ? 'page' : current ? 'location' : undefined}>{label}</Link>
          })}
          <Link href="/giving" className={`nav-action ${pathname === '/giving' ? 'is-active' : ''}`} aria-current={pathname === '/giving' ? 'page' : undefined}>
            Giving <Arrow />
          </Link>
        </nav>
      </div>
      {inCommunity ? (
        <nav className="community-navigation" aria-label="Community navigation">
          <div ref={communityNavRef} className="page-shell community-navigation__inner">
            {communityLinks.map(([href, label]) => {
              const current = activeCommunityHref === href
              return <Link key={href} href={href} className={current ? 'is-active' : undefined} aria-current={current ? 'page' : undefined}>{label}</Link>
            })}
          </div>
        </nav>
      ) : null}
    </header>
  )
}
