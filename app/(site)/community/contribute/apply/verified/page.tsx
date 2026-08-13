import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Contributor Email Verification', robots: { index: false, follow: false } }

export default async function VerificationResult({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams
  const success = status === 'success'
  return <main id="main-content" className="community-shell"><div className="page-shell form-page"><section className="empty-state"><p className="eyebrow">Contributor application</p><h1>{success ? 'Your email is verified.' : 'This verification link is not valid.'}</h1><div className="empty-state__copy"><p>{success ? 'Your application is now available for normal review. Agent processing happens in the background and cannot block human review.' : 'The link may have expired after 24 hours, may already have been used, or may be incomplete. Contact the organization for a new link or manual recovery.'}</p></div><div className="empty-state__actions"><Link href="/community" className="primary-action">Return to Community</Link></div></section></div></main>
}
