import { saveSetting } from '@/app/admin/actions'
import { requireAdmin } from '@/lib/admin/auth'

const settings = [
  ['scheduling_url','Default scheduling URL'],['github_repository_url','GitHub repository URL'],['github_event_url','Event proposal Issue Form URL'],['github_campus_url','Campus volunteer Issue Form URL'],['github_technical_url','Technical contribution Issue Form URL'],['email_identity','Public email identity'],
] as const

export default async function SettingsPage() {
  const { service } = await requireAdmin(); const { data } = await service.from('site_settings').select('*'); const values = new Map((data ?? []).map((item) => [item.setting_key,item.setting_value]))
  return <main className="admin-main"><header className="admin-heading"><div><p className="eyebrow">Settings</p><h1>Operational destinations</h1><p>Centralize the destinations used in invitations and contribution pathways. Environment values remain fallbacks for deployment bootstrap.</p></div></header><div className="admin-grid">{settings.map(([key,label]) => <section className="admin-panel" key={key}><form className="admin-form" action={saveSetting}><input type="hidden" name="setting_key" value={key} /><label>{label}<input name="setting_value" defaultValue={values.get(key) ?? ''} required /></label><button>Save</button></form></section>)}</div></main>
}
