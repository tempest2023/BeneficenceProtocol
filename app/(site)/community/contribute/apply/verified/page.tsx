import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Contributor Email Verification', robots: { index: false, follow: false } }

export default async function VerificationResult({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams
  const success = status === 'success'
  return <main id="main-content" className="community-shell"><div className="page-shell form-page"><section className="empty-state"><p className="eyebrow">Contributor application</p><h1>{success ? 'Your email is verified.' : 'This verification link is not valid.'}</h1><div className="empty-state__copy"><p>{success ? 'Thank you. Your application is ready for review.' : 'The link may have expired, already been used, or be incomplete. Contact us if you need a new link.'}</p></div><div className="empty-state__actions"><Link href="/community" className="primary-action">Return to Community</Link></div></section></div></main>
}
