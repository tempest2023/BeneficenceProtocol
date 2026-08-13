'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Arrow, FoundationMark } from '@/components/icons'

const links = [
  ['/', 'Home'],
  ['/mission', 'Mission'],
  ['/programs', 'Programs'],
  ['/governance', 'Governance'],
  ['/community', 'Community'],
] as const

export function SiteHeader() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

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
            return <Link key={href} href={href} className={current ? 'is-active' : undefined} aria-current={current ? 'page' : undefined}>{label}</Link>
          })}
          <Link href="/giving" className={`nav-action ${pathname === '/giving' ? 'is-active' : ''}`} aria-current={pathname === '/giving' ? 'page' : undefined}>
            Giving <Arrow />
          </Link>
        </nav>
      </div>
    </header>
  )
}
