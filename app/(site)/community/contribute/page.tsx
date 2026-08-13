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
  return <main id="main-content" className="community-shell"><CommunityPageHero eyebrow="Community / Contribute" title="Ways to contribute." lead="Take part in ongoing work, propose a public project, or share a free learning resource." /><CommunitySection eyebrow="Choose a path" title="Contribute in the way that fits."><ol className="contribution-list"><li><span>01</span><div><p className="article-kicker">Contributor</p><h3>Join ongoing work.</h3><p>For people who want to organize activities or take responsibility for a project.</p><Link href="/community/contribute/apply" className="text-action">Apply privately <Arrow /></Link></div></li><li><span>02</span><div><p className="article-kicker">GitHub</p><h3>Propose public work.</h3><p>Use an Issue Form for an event, campus activity, or technical contribution.</p><ul className="github-contribution-links">{issueLinks.map(([label, href]) => <li key={label}><a href={href} target="_blank" rel="noreferrer">{label} <span aria-hidden="true">↗</span></a></li>)}</ul><p className="field-hint">GitHub submissions are public. Do not include private contact details, addresses, confidential material, or credentials.</p></div></li><li><span>03</span><div><p className="article-kicker">Learn</p><h3>Share a learning resource.</h3><p>Submit a free public video, document, course, paper discussion, tool, or reference.</p><Link href="/community/contribute/resources/submit" className="text-action">Submit a resource <Arrow /></Link></div></li></ol><p className="legal-note">Contributing does not create legal membership or employment. Publishing a resource does not automatically grant Contributor status. See the <Link href="/community/code-of-conduct">Code of Conduct</Link>.</p></CommunitySection></main>
}
