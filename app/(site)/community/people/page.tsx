import type { Metadata } from 'next'
import { CommunityPageHero, CommunitySection } from '@/components/community-shell'
import { ProfileCard } from '@/components/profile-card'
import { EmptyState } from '@/components/primitives'
import { getPublicPeople } from '@/lib/community/data'

export const metadata: Metadata = { title: 'Community People', description: 'Directors and Core Contributors carrying visible responsibility in the Beneficence community.' }

export default async function PeoplePage() {
  const people = await getPublicPeople()
  return <main id="main-content" className="community-shell"><CommunityPageHero eyebrow="Community / People" title="People behind the work." lead="Meet the directors and Core Contributors helping lead Beneficence programs and community work." /><CommunitySection eyebrow="Public profiles" title="Directors and Core Contributors.">{people.length ? <div className="profile-grid">{people.map((person) => <ProfileCard person={person} key={person.id} />)}</div> : <EmptyState eyebrow="People" title="Profiles are being prepared."><p>Please check back soon.</p></EmptyState>}</CommunitySection></main>
}
