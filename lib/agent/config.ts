import 'server-only'
import { resolveAgentConfiguration } from '@/lib/agent/options'
import { requireSecretClient } from '@/lib/supabase/secret'

const settingKeys = ['openai_model', 'openai_reasoning_effort']

export async function getAgentConfiguration() {
  const client = requireSecretClient()
  const { data, error } = await client
    .from('site_settings')
    .select('setting_key,setting_value')
    .in('setting_key', settingKeys)

  if (error) throw new Error('The Agent configuration could not be loaded.')

  return resolveAgentConfiguration(
    Object.fromEntries((data ?? []).map((item) => [item.setting_key, item.setting_value])),
  )
}
