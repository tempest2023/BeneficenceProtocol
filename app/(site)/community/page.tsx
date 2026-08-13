import type { Metadata } from 'next'
import Link from 'next/link'
import { Arrow } from '@/components/icons'
import { CommunitySection, CommunitySubnav } from '@/components/community-shell'
import { ParticipantForm } from '@/components/forms/participant-form'
import { ProfileCard } from '@/components/profile-card'
import { communityFormsOperational } from '@/lib/env'
import { getPublicMemberMetrics, getPublicPeople } from '@/lib/community/data'

export const metadata: Metadata = { title: 'Community', description: 'Learn, gather, and contribute with the Beneficence community.' }
export const maxDuration = 60

export default async function CommunityPage() {
  const [metrics, people] = await Promise.all([getPublicMemberMetrics(), getPublicPeople({ featured: true })])
  return <main id="main-content" className="community-shell">
    <section className="community-hero" aria-labelledby="community-title"><div className="page-shell community-hero__inner"><p className="eyebrow">Beneficence Community</p><h1 id="community-title">Learn in public. Build with responsibility.</h1><p className="community-hero__lead">A global community for people exploring AI Agents, sharing open knowledge, organizing thoughtful gatherings, and taking responsibility for public-benefit work.</p><div className="community-hero__actions"><Link href="#register" className="primary-action">Register for updates <Arrow /></Link><Link href="/community/contribute" className="quiet-action">Ways to contribute</Link></div></div></section>
    <CommunitySubnav />

    <CommunitySection eyebrow="01 / Participation" title="Different ways to take part." lead="Most of the community is public. Deeper responsibility is available without confusing community participation with legal membership.">
      <div className="participation-ledger">
        <article><span>Open by default</span><h3>Public Participant</h3><p>Access most learning resources and public events. No registration is required.</p></article>
        <article><span>Stay connected</span><h3>Community Participant</h3><p>Registers contact, industry, and region so we can share relevant activity. This is not legal membership.</p></article>
        <article><span>Take responsibility</span><h3>Contributor</h3><p>Participates more deeply, organizes activity, or accepts responsibility for ongoing work after a conversational process.</p></article>
        <article><span>Public stewardship</span><h3>Core Contributor</h3><p>An existing Contributor carrying sustained responsibility and, with separate consent, eligible for a public profile. There is no direct application path.</p></article>
      </div>
      <p className="field-hint" style={{ marginTop: '1.5rem' }}>Board members and officers carry separately identified legal responsibilities. No website registration or application creates legal membership, employment, governance, ownership, Token, agency, or tax rights.</p>
    </CommunitySection>

    <CommunitySection eyebrow="02 / Community growth" title="One simple measure of reach." tone="ink">
      <div className="member-measure"><div><strong className="member-measure__number">{metrics.allTime.toLocaleString('en-US')}</strong><span className="member-measure__label">Community members — all time</span></div><p className="member-measure__definition">Cumulative unique people recorded through community registration, contribution applications, resource submissions, public contributor activity, or organizational roles. This is a community-growth measure, not legal membership or current activity.</p></div>
    </CommunitySection>

    <CommunitySection eyebrow="03 / Find your entry" title="Learn, gather, or contribute." lead="Start with the public path that is useful now. Registering or applying is never a prerequisite for reading or attending a public event.">
      <div className="path-ledger">
        <article><span>Learn</span><h3>Free knowledge, interpreted together.</h3><p>Courses, research interpretation, paper discussions, and useful public references.</p><Link href="/community/learn">Explore Learn <Arrow /></Link></article>
        <article><span>Gather</span><h3>Conversations with a place and time.</h3><p>Online discussions, local gatherings, campus activity, and responsibly described conference relationships.</p><Link href="/community/gather">Explore Gather <Arrow /></Link></article>
        <article><span>Contribute</span><h3>Share work or take deeper responsibility.</h3><p>Submit a public resource, contribute on GitHub, or apply for the private Contributor pathway.</p><Link href="/community/contribute">Explore Contribute <Arrow /></Link></article>
      </div>
    </CommunitySection>

    <CommunitySection eyebrow="04 / Current work" title="Institution-building before scale." lead="Current Work is intentionally separate from People. These are the organization’s present areas of effort, not open task listings." tone="soft">
      <div className="current-work-grid"><article><span>Institution</span><h3>Formation and public controls</h3><p>Establishing legal, governance, privacy, custody, reporting, and safety foundations before activating sensitive operations.</p></article><article><span>Knowledge</span><h3>Open-learning preparation</h3><p>Preparing a reusable structure for free AI Agent courses, research interpretation, and paper discussions without inventing material before it is ready.</p></article><article><span>Community</span><h3>Participation infrastructure</h3><p>Building accessible public paths, private review workflows, and a human-centered network that can grow responsibly.</p></article></div>
    </CommunitySection>

    <CommunitySection eyebrow="05 / Featured People" title="The people carrying visible responsibility." lead="Only directors and Core Contributors appear publicly, and only after separate publication consent.">
      {people.length ? <div className="profile-grid">{people.map((person) => <ProfileCard person={person} key={person.id} />)}</div> : <div className="empty-state"><p className="eyebrow">Profiles in preparation</p><h2>Approved public profiles will appear here.</h2><div className="empty-state__copy"><p>No profile is published until the person’s role is eligible and separate publication consent is recorded.</p></div><div className="empty-state__actions"><Link href="/community/people" className="quiet-action">How People profiles work</Link></div></div>}
    </CommunitySection>

    <CommunitySection eyebrow="06 / Stay connected" title="Register as a Community Participant." lead="Registration helps us share activity by field and region. It is free, immediate, and optional; public participation remains open without it." id="register" tone="soft">
      <ParticipantForm enabled={communityFormsOperational()} />
    </CommunitySection>
  </main>
}
