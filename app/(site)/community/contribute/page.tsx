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
  return <main id="main-content" className="community-shell"><CommunityPageHero eyebrow="Community / Contribute" title="Contribute to the community." lead="Apply for ongoing involvement, propose work on GitHub, or share a free learning resource." /><CommunitySection eyebrow="Ways to contribute" title="Choose a path."><div className="path-ledger"><article><span>Contributor</span><h3>Apply as a Contributor</h3><p>For people who want to organize activities or take part in ongoing work.</p><Link href="/community/contribute/apply">Apply privately <Arrow /></Link></article><article><span>GitHub</span><h3>Propose public work</h3><p>Use an Issue Form for an event, campus activity, or technical contribution.</p><ul>{issueLinks.map(([label, href]) => <li key={label}><a href={href} target="_blank" rel="noreferrer">{label} <span aria-hidden="true">↗</span></a></li>)}</ul></article><article><span>Learn</span><h3>Submit a learning resource</h3><p>Share a free public video, document, course, paper discussion, tool, or reference.</p><Link href="/community/contribute/resources/submit">Submit a resource <Arrow /></Link></article></div><div className="form-notice"><strong>GitHub submissions are public.</strong>Do not include private contact details, addresses, confidential material, or credentials.</div><p className="legal-note">Contributing does not create legal membership or employment. Publishing a resource does not automatically grant Contributor status.</p></CommunitySection></main>
}
