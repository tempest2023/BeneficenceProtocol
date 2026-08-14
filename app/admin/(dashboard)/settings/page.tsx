import { AdminForm } from '@/components/admin-form'
import { AdminSubmitButton } from '@/components/admin-submit-button'
import { requireAdmin } from '@/lib/admin/auth'

const settings = [
  ['scheduling_url','Scheduling URL','https://…'],
  ['github_repository_url','GitHub repository','https://github.com/…'],
  ['github_event_url','Event proposal','https://github.com/…'],
  ['github_campus_url','Campus volunteer','https://github.com/…'],
  ['github_technical_url','Technical contribution','https://github.com/…'],
  ['email_identity','Public email','community@example.org'],
] as const

export default async function SettingsPage() {
  const { service } = await requireAdmin()
  const { data } = await service.from('site_settings').select('*')
  const values = new Map((data ?? []).map((item) => [item.setting_key,item.setting_value]))
  return (
    <main className="admin-main">
      <header className="admin-heading"><div><p className="eyebrow">System</p><h1>Settings</h1><p>Destinations used by invitations and public contribution paths.</p></div></header>
      <div className="admin-settings-list">
        {settings.map(([key,label,placeholder]) => <AdminForm className="admin-form admin-setting-row" actionId="save_setting" successMessage={`${label} saved.`} key={key}><input type="hidden" name="setting_key" value={key} /><label><span>{label}</span><input name="setting_value" defaultValue={values.get(key) ?? ''} placeholder={placeholder} required /></label><AdminSubmitButton pendingLabel="Saving…">Save</AdminSubmitButton></AdminForm>)}
      </div>
    </main>
  )
}
