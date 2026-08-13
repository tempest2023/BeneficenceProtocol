import type { Metadata } from 'next'
import { CommunityPageHero, CommunitySection } from '@/components/community-shell'
import { ProfileCard } from '@/components/profile-card'
import { EmptyState } from '@/components/primitives'
import { getPublicPeople } from '@/lib/community/data'

export const metadata: Metadata = { title: 'Community People', description: 'Directors and Core Contributors carrying visible responsibility in the Beneficence community.' }

export default async function PeoplePage() {
  const people = await getPublicPeople()
  return <main id="main-content" className="community-shell"><CommunityPageHero eyebrow="Community / People" title="A network is made of people, not only resources." lead="We show the directors and Core Contributors carrying visible responsibility. Contributors remain private unless their role changes and they separately consent to publication." /><CommunitySection eyebrow="Public profiles" title="People carrying visible responsibility.">{people.length ? <div className="profile-grid">{people.map((person) => <ProfileCard person={person} key={person.id} />)}</div> : <EmptyState eyebrow="No profiles yet" title="Profiles will appear after approval and consent."><p>We will not fabricate a founding team list or publish private Contributors. Approved director and Core Contributor profiles will be added as the organization completes its public record.</p></EmptyState>}</CommunitySection></main>
}
