import Link from 'next/link'
import { AdminForm } from '@/components/admin-form'
import { AdminSubmitButton } from '@/components/admin-submit-button'
import { requireAdmin } from '@/lib/admin/auth'
import { INDUSTRIES } from '@/lib/community/constants'
import { sanitizePostgrestSearch } from '@/lib/security'

export default async function ParticipantsPage({ searchParams }: { searchParams: Promise<{ industry?: string; location?: string }> }) {
  const filters = await searchParams
  const { service } = await requireAdmin()
  let query = service.from('community_participants').select('*').order('created_at',{ ascending: false }).limit(200)
  if (filters.industry) query = query.eq('industry', filters.industry)
  const location = filters.location ? sanitizePostgrestSearch(filters.location) : ''
  if (location) query = query.or(`country.ilike.%${location}%,city_region.ilike.%${location}%,us_state.ilike.%${location}%`)
  const { data: participants } = await query
  const exportHref = `/api/admin/participants/export?industry=${encodeURIComponent(filters.industry ?? '')}&location=${encodeURIComponent(filters.location ?? '')}`

  return (
    <main className="admin-main">
      <header className="admin-heading"><div><p className="eyebrow">Community</p><h1>Participants</h1><p>Find contacts, manage subscriptions, and reconcile identities.</p></div></header>
      <div className="admin-toolbar">
        <form className="admin-form admin-toolbar__form" method="get">
          <label>Industry<select name="industry" defaultValue={filters.industry ?? ''}><option value="">All industries</option>{INDUSTRIES.map((industry) => <option key={industry}>{industry}</option>)}</select></label>
          <label>Location<input name="location" defaultValue={filters.location ?? ''} placeholder="Country, state, city, or region" /></label>
          <AdminSubmitButton pendingLabel="Filtering…">Apply filters</AdminSubmitButton>
        </form>
        <Link className="admin-button admin-button--quiet" href={exportHref}>Export CSV</Link>
      </div>
      <div className="admin-grid" style={{ marginBottom: '1rem' }}>
        <details className="admin-create-panel">
          <summary><strong>Add member</strong><span>GitHub, director, or manual source</span></summary>
          <AdminForm className="admin-form admin-form--grid" actionId="add_direct_member" successMessage="Member record added.">
            <label>Identity type<select name="identity_kind"><option value="github">GitHub username</option><option value="email">Email</option></select></label>
            <label>Source<select name="source"><option value="github_contributor">Direct GitHub contributor</option><option value="director">Director</option><option value="core_contributor">Core Contributor</option><option value="manual">Manual</option></select></label>
            <label className="admin-field--wide">Email or GitHub username<input name="identity_value" required /></label>
            <AdminSubmitButton pendingLabel="Adding member…">Add or match member</AdminSubmitButton>
          </AdminForm>
        </details>
        <details className="admin-create-panel">
          <summary><strong>Merge contacts</strong><span>Move one identity into another</span></summary>
          <AdminForm className="admin-form admin-form--grid" actionId="merge_contacts" successMessage="Contacts merged.">
            <label>Source contact ID<input name="source_contact_id" required /></label>
            <label>Target contact ID<input name="target_contact_id" required /></label>
            <p className="admin-note admin-field--wide">The source identity moves to the target contact. Historical count events remain unchanged.</p>
            <AdminSubmitButton pendingLabel="Merging contacts…">Merge contacts</AdminSubmitButton>
          </AdminForm>
        </details>
      </div>
      {participants?.length ? (
        <div className="admin-table-wrap">
          <table className="admin-table"><thead><tr><th>Participant</th><th>Industry</th><th>Location</th><th>Status</th><th>Contact ID</th><th>Privacy</th></tr></thead>
            <tbody>{participants.map((participant) => <tr key={participant.id}>
              <td><strong>{participant.name || 'Unnamed'}</strong><br /><small>{participant.email}</small></td>
              <td>{participant.industry}{participant.industry_other ? ` — ${participant.industry_other}` : ''}</td>
              <td>{[participant.city_region,participant.us_state,participant.country].filter(Boolean).join(', ')}</td>
              <td><span className="status-badge">{participant.subscription_status}</span></td>
              <td><code>{participant.contact_id}</code></td>
              <td><details className="admin-disclosure"><summary>Delete data</summary><div className="admin-disclosure__body"><AdminForm actionId="delete_participant_data" successMessage="Personal data deleted."><input type="hidden" name="id" value={participant.id} /><label className="admin-check"><input type="checkbox" name="confirm_delete" required /> Confirm permanent deletion. The anonymous count remains.</label><AdminSubmitButton className="admin-button admin-button--quiet" pendingLabel="Deleting…">Unsubscribe and delete</AdminSubmitButton></AdminForm></div></details></td>
            </tr>)}</tbody>
          </table>
        </div>
      ) : <div className="admin-empty"><strong>No matching participants</strong><span>Adjust the filters or add a member above.</span></div>}
    </main>
  )
}
