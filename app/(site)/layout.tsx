import { RevealController } from '@/components/reveal-controller'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <SiteHeader />
      {children}
      <SiteFooter />
      <RevealController />
    </div>
  )
}
