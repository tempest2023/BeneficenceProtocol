import { requireAdmin } from '@/lib/admin/auth'
import { getPublicMemberMetrics } from '@/lib/community/data'

export default async function AdminOverview() {
  const { service } = await requireAdmin()
  const [metrics, applications, resources, events, failedJobs] = await Promise.all([
    getPublicMemberMetrics(),
    service.from('contributor_applications').select('id', { count: 'exact', head: true }).in('status', ['submitted','agent_processing','reviewing','invitation_sent','meeting_scheduled','conversation_complete']),
    service.from('resource_submissions').select('id', { count: 'exact', head: true }).in('status', ['pending','in_review','changes_requested']),
    service.from('events').select('id,event_sessions!inner(starts_at)', { count: 'exact' }).eq('publication_status','published').gte('event_sessions.starts_at',new Date().toISOString()),
    service.from('agent_jobs').select('id', { count: 'exact', head: true }).eq('status','failed'),
  ])
  return <main className="admin-main"><header className="admin-heading"><div><p className="eyebrow">Overview</p><h1>Community operations</h1><p>The all-time count is the primary growth measure. Pending human decisions and failed automation remain visible beside it.</p></div></header><section className="admin-metrics" aria-label="Current metrics"><article className="admin-metric"><span>Community members — all time</span><strong>{metrics.allTime.toLocaleString('en-US')}</strong></article><article className="admin-metric"><span>New members this month</span><strong>{metrics.thisMonth.toLocaleString('en-US')}</strong></article><article className="admin-metric"><span>Pending applications</span><strong>{applications.count ?? 0}</strong></article><article className="admin-metric"><span>Pending resources</span><strong>{resources.count ?? 0}</strong></article><article className="admin-metric"><span>Upcoming events</span><strong>{events.count ?? 0}</strong></article><article className="admin-metric"><span>Failed Agent jobs</span><strong>{failedJobs.count ?? 0}</strong></article></section><section className="admin-panel" style={{ marginTop: '1rem' }}><h2>Simple source breakdown</h2>{Object.keys(metrics.bySource).length ? <dl>{Object.entries(metrics.bySource).map(([source,total]) => <div key={source}><dt>{source.replaceAll('_',' ')}</dt><dd>{total}</dd></div>)}</dl> : <p>No count events have been recorded.</p>}<p>This metric never decrements. Spam, tests, unverified submissions, closed applications, safety rejections, and later personal-data deletion do not remove an already-recorded count event.</p></section></main>
}
