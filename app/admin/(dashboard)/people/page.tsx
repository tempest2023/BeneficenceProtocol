import Link from 'next/link'
import { AdminForm } from '@/components/admin-form'
import { AdminSubmitButton } from '@/components/admin-submit-button'
import { requireAdmin } from '@/lib/admin/auth'
import { databaseRelation } from '@/lib/supabase/database-names'

export default async function PeopleAdminPage() {
  const { service } = await requireAdmin()
  const [{ data: people }, { data: contributors }, { data: directors }] = await Promise.all([
    service.from('people').select('*').order('sort_order').order('display_name'),
    service.from('contributors').select(`id,${databaseRelation('contributor_applications')}(name)`).eq('status','active'),
    service.from('people').select('id,display_name').eq('person_type','director'),
  ])

  return (
    <main className="admin-main">
      <header className="admin-heading"><div><p className="eyebrow">Publishing</p><h1>People</h1><p>Manage director and Core Contributor profiles and publication consent.</p></div></header>
      <div className="admin-stack">
        <details className="admin-create-panel">
          <summary><strong>Create profile</strong><span>Start as a private draft</span></summary>
          <AdminForm className="admin-form admin-form--grid" actionId="create_person" successMessage="Profile draft created.">
            <label>Profile type<select name="person_type"><option value="director">Director</option><option value="core_contributor">Core Contributor</option></select></label>
            <label>Display name or approved pseudonym<input name="display_name" required /></label>
            <label>Role<input name="role" required /></label>
            <label>Profile slug<input name="slug" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="jane-doe" required /></label>
            <fieldset>
              <legend>Organizational record</legend>
              <p>Directors need a counting identity. Core Contributors need an existing Contributor, nominating director, and effective date.</p>
              <label>Director identity type<select name="identity_kind" defaultValue="email"><option value="email">Email</option><option value="github">GitHub username</option></select></label>
              <label>Director identity<input name="identity_value" /></label>
              <label>Existing Contributor<select name="contributor_id" defaultValue=""><option value="">Not applicable</option>{contributors?.map((contributor) => { const applications = contributor.contributor_applications as Array<{ name?: string }> | null; return <option value={contributor.id} key={contributor.id}>{applications?.[0]?.name ?? contributor.id}</option> })}</select></label>
              <label>Nominating director<select name="nominating_director_id" defaultValue=""><option value="">Not applicable</option>{directors?.map((director) => <option value={director.id} key={director.id}>{director.display_name}</option>)}</select></label>
              <label>Effective date<input type="date" name="effective_date" /></label>
              <label>Active since<input type="date" name="active_since" /></label>
            </fieldset>
            <div className="admin-form__section">
              <h3>Public profile</h3>
              <label className="admin-field--wide">Responsibilities<textarea name="responsibilities" /></label>
              <label className="admin-field--wide">Biography<textarea name="biography" /></label>
              <label>Region<input name="region" /></label>
              <label>Current work<input name="current_work" /></label>
            </div>
            <details className="admin-disclosure admin-field--wide">
              <summary>Professional links</summary>
              <div className="admin-disclosure__body admin-form__section">
                <label>Website<input type="url" name="website_url" placeholder="https://…" /></label>
                <label>GitHub<input type="url" name="github_url" placeholder="https://github.com/…" /></label>
                <label>Google Scholar<input type="url" name="scholar_url" placeholder="https://scholar.google.com/…" /></label>
                <label>LinkedIn<input type="url" name="linkedin_url" placeholder="https://linkedin.com/in/…" /></label>
              </div>
            </details>
            <details className="admin-disclosure admin-field--wide">
              <summary>Profile photo</summary>
              <div className="admin-disclosure__body admin-form__section">
                <label className="admin-field--wide">Photo <small>JPEG, PNG, or WebP; maximum 10 MB</small><input type="file" name="image" accept="image/jpeg,image/png,image/webp" /></label>
                <label>Alt text<input name="image_alt" /></label>
                <label>Source<input name="image_source" /></label>
                <label className="admin-field--wide">Permission notes<textarea name="image_permission_notes" /></label>
              </div>
            </details>
            <AdminSubmitButton pendingLabel="Creating profile…">Create draft profile</AdminSubmitButton>
          </AdminForm>
        </details>
        <aside className="admin-note">Publishing requires separately recorded consent. Withdrawing consent removes the profile from public pages.</aside>
        {people?.length ? (
          <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Person</th><th>Role</th><th>Nomination</th><th>Publication</th></tr></thead><tbody>{people.map((person) => <tr key={person.id}>
            <td><strong>{person.display_name}</strong><br /><small>{person.person_type.replace('_',' ')}</small><br/><Link href={`/admin/people/${person.id}`}>Edit profile</Link></td>
            <td>{person.role}<br /><small>{person.region}</small></td>
            <td>{person.person_type === 'core_contributor' ? <>Director {person.nominating_director_id}<br /><small>Effective {person.effective_date}</small></> : 'Director'}</td>
            <td><AdminForm className="admin-form admin-row-form" actionId="set_person_publication" successMessage="Publication settings saved."><input type="hidden" name="id" value={person.id} /><label>Status<select name="status" defaultValue={person.publication_status}><option value="draft">Draft</option><option value="published">Published</option><option value="withdrawn">Consent withdrawn</option><option value="archived">Archived</option></select></label><label className="admin-check"><input type="checkbox" name="featured" defaultChecked={person.featured} /> Featured</label><label className="admin-check"><input type="checkbox" name="publication_consent" /> Publication consent recorded</label><AdminSubmitButton pendingLabel="Saving…">Save publication</AdminSubmitButton></AdminForm></td>
          </tr>)}</tbody></table></div>
        ) : <div className="admin-empty"><strong>No profiles yet</strong><span>Create the first private draft when a profile is approved.</span></div>}
      </div>
    </main>
  )
}
