import { requireAdmin } from '@/lib/admin/auth'

export default async function AuditLogPage() {
  const { service } = await requireAdmin()
  const { data: entries } = await service.from('admin_audit_log').select('*').order('created_at',{ ascending:false }).limit(250)
  return (
    <main className="admin-main">
      <header className="admin-heading"><div><p className="eyebrow">System</p><h1>Audit</h1><p>Timestamped administrator, Agent, and system actions.</p></div></header>
      {entries?.length ? (
        <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Time</th><th>Actor</th><th>Action</th><th>Entity</th><th>Details</th></tr></thead><tbody>{entries.map((entry) => <tr key={entry.id}><td>{new Intl.DateTimeFormat('en-US',{ dateStyle:'medium',timeStyle:'medium' }).format(new Date(entry.created_at))}</td><td>{entry.actor_type}<br /><small>{entry.actor_id}</small></td><td>{entry.action}</td><td>{entry.entity_type}<br /><small>{entry.entity_id}</small></td><td><details className="admin-disclosure"><summary>Inspect JSON</summary><pre className="audit-json">{JSON.stringify(entry.details,null,2)}</pre></details></td></tr>)}</tbody></table></div>
      ) : <div className="admin-empty"><strong>No audit entries yet</strong><span>Administrative actions will appear here.</span></div>}
    </main>
  )
}
