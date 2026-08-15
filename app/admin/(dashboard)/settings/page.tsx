import { AdminForm } from '@/components/admin-form'
import { AdminSubmitButton } from '@/components/admin-submit-button'
import { requireAdmin } from '@/lib/admin/auth'
import { agentModelOptions, agentReasoningEffortOptions, resolveAgentConfiguration } from '@/lib/agent/options'

const settings = [
  ['scheduling_url','Scheduling URL','https://…'],
  ['github_repository_url','GitHub repository','https://github.com/…'],
  ['github_event_url','Event proposal','https://github.com/…'],
  ['github_campus_url','Campus volunteer','https://github.com/…'],
  ['github_technical_url','Technical contribution','https://github.com/…'],
  ['email_identity','Monitored contact email','contact@example.org'],
] as const

export default async function SettingsPage() {
  const { service } = await requireAdmin()
  const { data } = await service.from('site_settings').select('*')
  const values = new Map((data ?? []).map((item) => [item.setting_key,item.setting_value]))
  const agentConfiguration = resolveAgentConfiguration(Object.fromEntries(values))
  return (
    <main className="admin-main">
      <header className="admin-heading"><div><p className="eyebrow">System</p><h1>Settings</h1><p>Configure service destinations and Agent review defaults.</p></div></header>
      <section className="admin-settings-section" aria-labelledby="operational-settings-heading">
        <header><p className="eyebrow">Operations</p><h2 id="operational-settings-heading">Destinations</h2></header>
        <div className="admin-settings-list">
          {settings.map(([key,label,placeholder]) => <AdminForm className="admin-form admin-setting-row" actionId="save_setting" successMessage={`${label} saved.`} key={key}><input type="hidden" name="setting_key" value={key} /><label><span>{label}</span><input type={key === 'email_identity' ? 'email' : undefined} name="setting_value" defaultValue={values.get(key) ?? ''} placeholder={placeholder} required /></label><AdminSubmitButton pendingLabel="Saving…">Save</AdminSubmitButton></AdminForm>)}
        </div>
      </section>
      <section className="admin-settings-section" aria-labelledby="agent-settings-heading">
        <header><p className="eyebrow">OpenAI</p><h2 id="agent-settings-heading">Agent review</h2><p>The selected model and reasoning effort apply to application and resource reviews.</p></header>
        <AdminForm className="admin-form admin-agent-settings" actionId="save_agent_settings" successMessage="Agent review settings saved.">
          <label>
            <span>Model</span>
            <select name="openai_model" defaultValue={agentConfiguration.model} required>
              {agentModelOptions.map((option) => <option value={option.value} key={option.value}>{option.label} — {option.description}</option>)}
            </select>
          </label>
          <label>
            <span>Reasoning effort</span>
            <select name="openai_reasoning_effort" defaultValue={agentConfiguration.reasoningEffort} required>
              {agentReasoningEffortOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
            </select>
            <small>Higher effort can improve difficult reviews but increases latency and token use.</small>
          </label>
          <AdminSubmitButton pendingLabel="Saving…">Save Agent settings</AdminSubmitButton>
        </AdminForm>
      </section>
    </main>
  )
}
