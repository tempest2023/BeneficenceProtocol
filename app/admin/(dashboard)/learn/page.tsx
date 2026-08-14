import Link from 'next/link'
import { AdminForm } from '@/components/admin-form'
import { AdminSubmitButton } from '@/components/admin-submit-button'
import { requireAdmin } from '@/lib/admin/auth'
import { RESOURCE_FORMATS } from '@/lib/community/constants'

export default async function LearnAdminPage() {
  const { service } = await requireAdmin()
  const { data: resources } = await service.from('resources').select('*').order('sort_order').order('created_at',{ ascending:false })
  return (
    <main className="admin-main">
      <header className="admin-heading"><div><p className="eyebrow">Publishing</p><h1>Learn</h1><p>Draft, verify, order, and publish free learning resources.</p></div><Link className="admin-button admin-button--quiet" href="/community/learn" target="_blank">View public page ↗</Link></header>
      <div className="admin-stack">
        <details className="admin-create-panel">
          <summary><strong>Create resource</strong><span>Start a new draft</span></summary>
          <AdminForm className="admin-form admin-form--grid" actionId="create_resource" successMessage="Resource draft created.">
            <label>Title<input name="title" required /></label>
            <label>Slug<input name="slug" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="resource-name" required /></label>
            <label className="admin-field--wide">Summary<textarea name="summary" required /></label>
            <label className="admin-field--wide">Public URL<input type="url" name="public_url" placeholder="https://…" required /></label>
            <label>Material type<select name="resource_type">{RESOURCE_FORMATS.map((format) => <option key={format}>{format}</option>)}</select></label>
            <label>Language<input name="language" placeholder="e.g. English, 中文, Spanish" required /></label>
            <label>Difficulty<input name="difficulty" placeholder="e.g. Introductory" /></label>
            <label>Topics<input name="topics" placeholder="Agents, alignment, evaluation" /></label>
            <label>Author or publisher<input name="author_publisher" /></label>
            <label>Access notes<textarea name="access_notes" /></label>
            <AdminSubmitButton pendingLabel="Creating draft…">Create resource draft</AdminSubmitButton>
          </AdminForm>
        </details>
        <aside className="admin-note">Before publishing, open the URL and verify relevance, attribution, copyright context, and free public access.</aside>
        {resources?.length ? (
          <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Resource</th><th>Source</th><th>Status</th><th>Publication</th></tr></thead><tbody>{resources.map((resource) => <tr key={resource.id}>
            <td><strong>{resource.title}</strong><br /><small>{resource.resource_type} · {resource.language}</small><br/><Link href={`/admin/learn/${resource.id}`}>Edit</Link> · <Link href={`/admin/learn/preview/${resource.id}`}>Preview</Link></td>
            <td><a href={resource.public_url} target="_blank" rel="noreferrer">Open URL ↗</a><br /><small>{resource.author_publisher}</small></td>
            <td><span className="status-badge">{resource.publication_status}</span></td>
            <td><AdminForm className="admin-form admin-row-form" actionId="set_resource_publication" successMessage="Publication settings saved."><input type="hidden" name="id" value={resource.id} /><label>Status<select name="status" defaultValue={resource.publication_status}><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></label><label>Order<input type="number" name="sort_order" defaultValue={resource.sort_order} /></label><label className="admin-check"><input type="checkbox" name="featured" defaultChecked={resource.featured} /> Featured</label><label className="admin-check"><input type="checkbox" name="access_verified" defaultChecked={Boolean(resource.access_verified_at)} /> Free public access verified</label><AdminSubmitButton pendingLabel="Saving…">Save publication</AdminSubmitButton></AdminForm></td>
          </tr>)}</tbody></table></div>
        ) : <div className="admin-empty"><strong>No learning resources yet</strong><span>Create a draft or approve a public submission.</span></div>}
      </div>
    </main>
  )
}
