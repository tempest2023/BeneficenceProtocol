import Link from 'next/link'
import { AdminAgentReviewControl } from '@/components/admin-agent-review-control'
import { AdminForm } from '@/components/admin-form'
import { AdminSubmitButton } from '@/components/admin-submit-button'
import { requireAdmin } from '@/lib/admin/auth'

export const maxDuration = 120

export default async function ApplicationsPage() {
  const { service } = await requireAdmin()
  const [{ data: applications }, { data: jobs }] = await Promise.all([
    service.from('contributor_applications').select('*').order('created_at', { ascending: false }).limit(100),
    service.from('agent_jobs').select('*').eq('job_type', 'contributor_application').order('created_at', { ascending: false }).limit(100),
  ])
  const jobByRecord = new Map((jobs ?? []).map((job) => [job.record_id, job]))

  return (
    <main className="admin-main">
      <header className="admin-heading">
        <div><p className="eyebrow">Community</p><h1>Applications</h1><p>Review verified Contributor applications and coordinate 1v1 conversations.</p></div>
        <Link className="admin-button admin-button--quiet" href="/admin/guide/contributor-conversation">Open meeting guide</Link>
      </header>
      {applications?.length ? (
        <div className="admin-record-list">
          {applications.map((application) => {
            const job = jobByRecord.get(application.id)
            const links = [
              ['Website', application.personal_website],
              ['GitHub', application.github_url],
              ['Scholar', application.scholar_url],
              ['LinkedIn', application.linkedin_url],
            ].filter((item): item is [string, string] => Boolean(item[1]))
            const canStartAgent = Boolean(
              job
              && ['pending', 'retry', 'failed'].includes(job.status)
              && application.email_verified_at
              && ['submitted', 'agent_processing'].includes(application.status),
            )
            const submittedAt = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(application.created_at))
            const location = [application.city_region, application.us_state, application.country].filter(Boolean).join(', ')

            return (
              <details className="admin-record" name="applications" key={application.id}>
                <summary>
                  <span className="admin-record__title"><strong>{application.name}</strong><small>{application.email}</small></span>
                  <span className="admin-record__meta">{location || 'Location not supplied'}</span>
                  <span className="status-badge">{application.status}</span>
                  <small className="admin-record__meta">{submittedAt}</small>
                </summary>
                <div className="admin-record__body">
                  <section className="admin-record__section">
                    <h2>Applicant</h2>
                    <p><a href={`mailto:${application.email}`}>{application.email}</a><br /><small>{location}</small></p>
                    <p><strong>Industry:</strong> {application.industry ? `${application.industry}${application.industry_other ? ` — ${application.industry_other}` : ''}` : 'Not supplied'}</p>
                    <p><strong>Profile preference:</strong> {application.profile_willingness?.replaceAll('_', ' ') ?? 'Not supplied'}</p>
                    {links.length ? <p>{links.map(([label, href], index) => <span key={label}><a href={href} target="_blank" rel="noreferrer">{label} ↗</a>{index < links.length - 1 ? ' · ' : ''}</span>)}</p> : null}
                    <h2>Intent</h2>
                    <strong>Why participate</strong>
                    <ul>{application.participation_reasons.map((item: string) => <li key={item}>{item}</li>)}</ul>
                    {application.participation_reason_other ? <p>{application.participation_reason_other}</p> : null}
                    <strong>Contribution areas</strong>
                    <ul>{application.contribution_areas.map((item: string) => <li key={item}>{item}</li>)}</ul>
                    {application.contribution_area_other ? <p>{application.contribution_area_other}</p> : null}
                  </section>
                  <section className="admin-record__section">
                    <h2>Agent review</h2>
                    {application.agent_output ? <details className="admin-disclosure"><summary>Inspect structured output</summary><pre className="audit-json">{JSON.stringify(application.agent_output, null, 2)}</pre></details> : <p>{application.email_verified_at ? 'Ready for administrator-approved Agent review.' : 'Waiting for email verification.'}</p>}
                    {job ? <><p><span className="status-badge">Job {job.status}</span> · {job.attempts} {job.attempts === 1 ? 'attempt' : 'attempts'}</p>{job.last_error ? <p className="admin-action-feedback admin-action-feedback--error">{job.last_error}</p> : null}{canStartAgent ? <AdminAgentReviewControl jobId={job.id} jobStatus={job.status} reviewKind="application" /> : null}</> : <p>No Agent job is attached.</p>}
                  </section>
                  <section className="admin-record__section">
                    <h2>Next action</h2>
                    {application.status === 'email_pending' ? <AdminForm actionId="resend_contributor_verification" successMessage="Verification link sent."><input type="hidden" name="id" value={application.id} /><AdminSubmitButton pendingLabel="Sending…">Send verification link</AdminSubmitButton></AdminForm> : null}
                    {application.status === 'auto_rejected' ? <AdminForm actionId="restore_application" successMessage="Application restored to human review."><input type="hidden" name="id" value={application.id} /><AdminSubmitButton pendingLabel="Restoring…">Restore to human review</AdminSubmitButton></AdminForm> : null}
                    {['reviewing', 'submitted'].includes(application.status) ? <AdminForm actionId="invite_applicant" successMessage="1v1 invitation sent."><input type="hidden" name="id" value={application.id} /><AdminSubmitButton pendingLabel="Sending invitation…">Send 1v1 invitation</AdminSubmitButton></AdminForm> : null}
                    {application.status !== 'email_pending' ? (
                      <AdminForm actionId="set_application_status" successMessage="Application status saved.">
                        <input type="hidden" name="id" value={application.id} />
                        <label>Status<select name="status" defaultValue={application.status === 'auto_rejected' || application.status === 'agent_processing' || application.status === 'invitation_sent' ? 'reviewing' : application.status}><option value="reviewing">Reviewing</option><option value="meeting_scheduled">Meeting scheduled</option><option value="conversation_complete">Conversation complete</option><option value="closed">Closed</option></select></label>
                        <label>Meeting notes<textarea name="meeting_notes" defaultValue={application.meeting_notes ?? ''} /></label>
                        <label>Host decision<input name="host_decision" defaultValue={application.host_decision ?? ''} /></label>
                        <AdminSubmitButton pendingLabel="Saving status…">Save application status</AdminSubmitButton>
                      </AdminForm>
                    ) : null}
                    {application.status === 'conversation_complete' ? <AdminForm actionId="create_contributor" successMessage="Contributor record created."><input type="hidden" name="application_id" value={application.id} /><AdminSubmitButton pendingLabel="Creating Contributor…">Create Contributor</AdminSubmitButton></AdminForm> : null}
                  </section>
                </div>
              </details>
            )
          })}
        </div>
      ) : <div className="admin-empty"><strong>No applications yet</strong><span>Verified applications will enter this review queue.</span></div>}
    </main>
  )
}
