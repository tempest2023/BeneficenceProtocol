import type { Metadata } from 'next'
import Link from 'next/link'
import { Arrow } from '@/components/icons'
import { CommunityPageHero, CommunitySection } from '@/components/community-shell'
import { getPublicSiteSettings } from '@/lib/community/data'

export const metadata: Metadata = { title: 'Contribute', description: 'Three ways to contribute to Beneficence: a private application, public GitHub work, or a public learning resource.' }

export default async function ContributePage() {
  const github = process.env.GITHUB_REPOSITORY_URL ?? 'https://github.com/tempest2023/BeneficenceProtocol'
  const settings = await getPublicSiteSettings(['github_repository_url', 'github_event_url', 'github_campus_url', 'github_technical_url'])
  const repository = settings.github_repository_url ?? github
  const issueLinks = [
    ['Event proposal', settings.github_event_url ?? `${repository}/issues/new?template=event-proposal.yml`],
    ['Campus volunteer', settings.github_campus_url ?? `${repository}/issues/new?template=campus-volunteer.yml`],
    ['Technical contribution', settings.github_technical_url ?? `${repository}/issues/new?template=technical-contribution.yml`],
  ]
  return <main id="main-content" className="community-shell"><CommunityPageHero eyebrow="Community / Contribute" title="Choose the responsibility you actually want." lead="You can improve public work without applying for a title. Share a useful resource, make a public GitHub contribution, or use the private Contributor path for sustained involvement." /><CommunitySection eyebrow="Three paths" title="Public work or deeper participation."><div className="path-ledger"><article><span>Private path</span><h3>Apply as a Contributor</h3><p>For people who want to organize activities, join ongoing work, or accept sustained responsibility. Email verification and a short conversational 1v1 may follow.</p><Link href="/community/contribute/apply">Read before applying <Arrow /></Link></article><article><span>Public path</span><h3>Contribute on GitHub</h3><p>Choose an Issue Form. GitHub content and its history are public.</p><ul>{issueLinks.map(([label, href]) => <li key={label}><a href={href} target="_blank" rel="noreferrer">{label} <span aria-hidden="true">↗</span></a></li>)}</ul></article><article><span>Review path</span><h3>Submit a learning resource</h3><p>Share a free public video, document, course, paper discussion, tool, or reference for review. Approval creates a Learn draft.</p><Link href="/community/contribute/resources/submit">Submit a resource <Arrow /></Link></article></div><div className="form-notice"><strong>GitHub submissions are public.</strong>They must not include private contact or address information, confidential material, or anything you do not want permanently associated with your public account.</div></CommunitySection><CommunitySection eyebrow="Important distinction" title="A contribution is not a legal status." tone="ink"><p className="member-measure__definition">Submitting work, registering, applying, or being listed as a Contributor does not create legal membership, employment, governance, ownership, Token, agency, or tax rights. A published resource records a verified contribution but does not automatically grant Contributor status.</p></CommunitySection></main>
}
