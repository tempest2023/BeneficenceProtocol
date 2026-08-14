import type { Metadata } from 'next'
import '../src/index.css'
import '../src/App.css'
import './community.css'
import './admin.css'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: { default: 'Beneficence Protocol Foundation', template: '%s — Beneficence Protocol Foundation' },
  description: 'Advancing beneficial AI Agents, public knowledge, and accountable infrastructure for the Agent age.',
  openGraph: { type: 'website', siteName: 'Beneficence Protocol Foundation' },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>
}
