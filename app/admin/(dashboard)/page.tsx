import Link from 'next/link'
import { requireAdmin } from '@/lib/admin/auth'
import { databaseRelation } from '@/lib/supabase/database-names'
import { getPublicMemberMetrics } from '@/lib/community/data'

export default async function AdminOverview() {
  const { service } = await requireAdmin()
  const [metrics, applications, resources, events, failedJobs] = await Promise.all([
    getPublicMemberMetrics(),
    service.from('contributor_applications').select('id', { count: 'exact', head: true }).in('status', ['submitted','agent_processing','reviewing','invitation_sent','meeting_scheduled','conversation_complete']),
    service.from('resource_submissions').select('id', { count: 'exact', head: true }).in('status', ['pending','in_review','changes_requested']),
    service.from('events').select(`id,${databaseRelation('event_sessions')}!inner(starts_at)`, { count: 'exact' }).eq('publication_status','published').gte('event_sessions.starts_at',new Date().toISOString()),
    service.from('agent_jobs').select('id', { count: 'exact', head: true }).eq('status','failed'),
  ])
  const queues = [
    { href: '/admin/applications', label: 'Applications', value: applications.count ?? 0 },
    { href: '/admin/resources', label: 'Resources', value: resources.count ?? 0 },
    { href: '/admin/gather', label: 'Upcoming events', value: events.count ?? 0 },
    { href: '/admin/audit-log', label: 'Failed Agent jobs', value: failedJobs.count ?? 0 },
  ]

  return (
    <main className="admin-main">
      <header className="admin-heading">
        <div><p className="eyebrow">Overview</p><h1>Community operations</h1><p>Growth, review queues, and publishing at a glance.</p></div>
      </header>
      <section className="admin-overview" aria-label="Current metrics">
        <div className="admin-overview__primary">
          <div><span>Community members — all time</span><strong>{metrics.allTime.toLocaleString('en-US')}</strong></div>
          <small>+{metrics.thisMonth.toLocaleString('en-US')} this month</small>
        </div>
        <dl className="admin-queue">
          {queues.map((queue) => <Link href={queue.href} key={queue.label}><dt>{queue.label}</dt><dd>{queue.value}</dd></Link>)}
        </dl>
      </section>
      <section className="admin-source-ledger">
        <div><p className="eyebrow">Sources</p><h2>Member count</h2></div>
        {Object.keys(metrics.bySource).length ? (
          <dl>{Object.entries(metrics.bySource).map(([source,total]) => <div key={source}><dt>{source.replaceAll('_',' ')}</dt><dd>{total}</dd></div>)}</dl>
        ) : <p>No member sources yet.</p>}
      </section>
    </main>
  )
}
