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
  return <main id="main-content" className="community-shell"><CommunityPageHero eyebrow="Community / Gather" title="Meet, learn, and build together." lead="Online and in-person events for AI Agent learning, research, and public-interest work." />
    <CommunitySection eyebrow="Upcoming" title="Upcoming events.">{upcoming.length ? <EventList events={upcoming} /> : <EmptyState eyebrow="Gather" title="Events are being planned."><p>Upcoming online discussions, local gatherings, campus activities, and conference events will be posted here.</p><div className="empty-state__actions"><Link href="/community#register" className="primary-action">Register for updates</Link><Link href="/community/contribute" className="quiet-action">Propose an activity</Link></div></EmptyState>}</CommunitySection>
    {past.length ? <CommunitySection eyebrow="Past" title="Past events." tone="soft"><EventList events={past} /></CommunitySection> : null}
  </main>
}
