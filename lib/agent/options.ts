export const agentModelOptions = [
  {
    value: 'gpt-5.6-sol',
    label: 'GPT-5.6 Sol',
    description: 'Highest-capability option for nuanced review work.',
  },
  {
    value: 'gpt-5.6-terra',
    label: 'GPT-5.6 Terra',
    description: 'Balances review quality, latency, and cost.',
  },
  {
    value: 'gpt-5.6-luna',
    label: 'GPT-5.6 Luna',
    description: 'Optimized for lower-cost, higher-volume processing.',
  },
] as const

export const agentReasoningEffortOptions = [
  { value: 'none', label: 'None' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'xhigh', label: 'Extra high' },
  { value: 'max', label: 'Maximum' },
] as const

export type AgentModel = (typeof agentModelOptions)[number]['value']
export type AgentReasoningEffort = (typeof agentReasoningEffortOptions)[number]['value']

export const defaultAgentConfiguration = {
  model: 'gpt-5.6-sol',
  reasoningEffort: 'low',
} satisfies { model: AgentModel; reasoningEffort: AgentReasoningEffort }

export function isAgentModel(value: string): value is AgentModel {
  return agentModelOptions.some((option) => option.value === value)
}

export function isAgentReasoningEffort(value: string): value is AgentReasoningEffort {
  return agentReasoningEffortOptions.some((option) => option.value === value)
}

export function resolveAgentConfiguration(settings: Record<string, string | undefined>) {
  const model = settings.openai_model ?? ''
  const reasoningEffort = settings.openai_reasoning_effort ?? ''
  return {
    model: isAgentModel(model) ? model : defaultAgentConfiguration.model,
    reasoningEffort: isAgentReasoningEffort(reasoningEffort)
      ? reasoningEffort
      : defaultAgentConfiguration.reasoningEffort,
  }
}
