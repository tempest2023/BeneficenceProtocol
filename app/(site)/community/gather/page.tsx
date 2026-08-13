import type { Metadata } from 'next'
import Link from 'next/link'
import { CommunityPageHero, CommunitySection } from '@/components/community-shell'
import { EmptyState } from '@/components/primitives'
import { getPublishedEvents } from '@/lib/community/data'

export const metadata: Metadata = { title: 'Gather', description: 'Public online and in-person Beneficence community gatherings.' }

function firstStart(event: Awaited<ReturnType<typeof getPublishedEvents>>[number]) { return event.event_sessions.map((session) => new Date(session.starts_at)).sort((a, b) => a.getTime() - b.getTime())[0] }
function EventList({ events }: { events: Awaited<ReturnType<typeof getPublishedEvents>> }) { return <div className="event-list">{events.map((event) => { const start = firstStart(event); return <article className="event-card" key={event.id}><span className="event-card__meta">{event.relationship} · {event.format.replace('_', ' ')} · {event.attendance_status}</span><h2>{event.title}</h2><p>{event.summary}</p>{start ? <p className="field-hint">{new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeStyle: 'short', timeZone: event.timezone }).format(start)} · {event.timezone}</p> : null}<Link href={`/community/gather/${event.slug}`}>Event details</Link></article> })}</div> }

export default async function GatherPage() {
  const events = await getPublishedEvents()
  const now = Date.now()
  const upcoming = events.filter((event) => (firstStart(event)?.getTime() ?? 0) >= now && event.attendance_status !== 'closed')
  const past = events.filter((event) => !upcoming.includes(event))
  return <main id="main-content" className="community-shell"><CommunityPageHero eyebrow="Community / Gather" title="Shared attention becomes shared capacity." lead="Future online and local gatherings will connect technical learning, public-interest practice, campus communities, companies, and research conferences—without overstating institutional relationships." />
    <CommunitySection eyebrow="Upcoming" title="Meet around ideas and responsible work.">{upcoming.length ? <EventList events={upcoming} /> : <EmptyState eyebrow="No events scheduled" title="The calendar is open, not forgotten."><p>Future formats include online paper discussions, local gatherings led by Core Contributors, campus activity, independent conference-adjacent programs, and properly approved partner events.</p><p>Real registration, capacity, waitlists, cancellations, check-in, and attendee records will stay on the linked external event platform.</p><div className="empty-state__actions"><Link href="/community#register" className="primary-action">Register for event updates</Link><Link href="/community/contribute" className="quiet-action">Propose an activity</Link></div></EmptyState>}</CommunitySection>
    {past.length ? <CommunitySection eyebrow="Past" title="The public gathering record." tone="soft"><EventList events={past} /></CommunitySection> : null}
    <CommunitySection eyebrow="Organizing standard" title="Relationships are described precisely." lead="Every event is classified as Independent, Beneficence-hosted, Co-hosted, Partner event, or Official conference event. Partner and official claims require an internal approval reference." tone="ink"><p className="member-measure__definition">A display-only attendance limit may appear here. The external registration platform remains authoritative for real capacity and attendee information.</p></CommunitySection>
  </main>
}
