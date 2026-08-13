import type { Metadata } from 'next'
import Link from 'next/link'
import { Arrow } from '@/components/icons'
import { CommunitySection } from '@/components/community-shell'
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
    <CommunitySection eyebrow="01 / Participation" title="Different ways to take part." lead="Most resources and public events are open to everyone. Registration is optional; Contributor applications are for deeper involvement.">
      <div className="participation-ledger">
        <article><span>Open by default</span><h3>Public Participant</h3><p>Access most learning resources and public events. No registration is required.</p></article>
        <article><span>Stay connected</span><h3>Community Participant</h3><p>Register your field and region to receive relevant community updates.</p></article>
        <article><span>Take responsibility</span><h3>Contributor</h3><p>Help organize activities or take part in ongoing work.</p></article>
        <article><span>Public stewardship</span><h3>Core Contributor</h3><p>Existing Contributors recognized for sustained responsibility.</p></article>
      </div>
      <p className="legal-note">Website registration and applications do not create legal membership or employment. Board and officer responsibilities are separate.</p>
    </CommunitySection>

    <CommunitySection eyebrow="02 / Community growth" title="One simple measure of reach." tone="ink">
      <div className="member-measure"><div><strong className="member-measure__number">{metrics.allTime.toLocaleString('en-US')}</strong><span className="member-measure__label">Community members — all time</span></div><p className="member-measure__definition">Cumulative unique people recorded through community registration, contribution applications, resource submissions, public contributor activity, or organizational roles. This is a community-growth measure, not legal membership or current activity.</p></div>
    </CommunitySection>

    <CommunitySection eyebrow="03 / Find your entry" title="Learn, gather, or contribute." lead="Choose the path that is useful to you now.">
      <div className="path-ledger">
        <article><span>Learn</span><h3>Free knowledge, interpreted together.</h3><p>Courses, research interpretation, paper discussions, and useful public references.</p><Link href="/community/learn">Explore Learn <Arrow /></Link></article>
        <article><span>Gather</span><h3>Conversations with a place and time.</h3><p>Online discussions, local gatherings, campus activity, and conference events.</p><Link href="/community/gather">Explore Gather <Arrow /></Link></article>
        <article><span>Contribute</span><h3>Share work or take deeper responsibility.</h3><p>Submit a public resource, contribute on GitHub, or apply for the private Contributor pathway.</p><Link href="/community/contribute">Explore Contribute <Arrow /></Link></article>
      </div>
    </CommunitySection>

    <CommunitySection eyebrow="04 / Current work" title="What we are building now." tone="soft">
      <div className="current-work-grid"><article><span>Institution</span><h3>Organizational foundations</h3><p>Establishing governance, privacy, reporting, and operational foundations.</p></article><article><span>Knowledge</span><h3>Open learning</h3><p>Developing free AI Agent courses, research briefings, and paper discussions.</p></article><article><span>Community</span><h3>Participation</h3><p>Preparing public events and clear paths for contributors.</p></article></div>
    </CommunitySection>

    <CommunitySection eyebrow="05 / Featured People" title="Meet the people behind the work." lead="Directors and Core Contributors from across the community.">
      {people.length ? <div className="profile-grid">{people.map((person) => <ProfileCard person={person} key={person.id} />)}</div> : <div className="empty-state"><p className="eyebrow">People</p><h2>Profiles are being prepared.</h2><div className="empty-state__copy"><p>Please check back soon.</p></div><div className="empty-state__actions"><Link href="/community/people" className="quiet-action">View People</Link></div></div>}
    </CommunitySection>

    <CommunitySection eyebrow="06 / Stay connected" title="Register for community updates." lead="Share your field and region so we can send relevant news and event announcements. Registration is optional." id="register" tone="soft">
      <ParticipantForm enabled={communityFormsOperational()} />
    </CommunitySection>
  </main>
}
