import { describe, expect, it } from 'vitest'
import {
  agentModelOptions,
  agentReasoningEffortOptions,
  defaultAgentConfiguration,
  isAgentModel,
  isAgentReasoningEffort,
  resolveAgentConfiguration,
} from '@/lib/agent/options'

describe('Agent configuration', () => {
  it('offers the current GPT-5.6 family and supported reasoning efforts', () => {
    expect(agentModelOptions.map((option) => option.value)).toEqual([
      'gpt-5.6-sol',
      'gpt-5.6-terra',
      'gpt-5.6-luna',
    ])
    expect(agentReasoningEffortOptions.map((option) => option.value)).toEqual([
      'none',
      'low',
      'medium',
      'high',
      'xhigh',
      'max',
    ])
  })

  it('preserves the existing Sol and low defaults until an administrator changes them', () => {
    expect(resolveAgentConfiguration({})).toEqual(defaultAgentConfiguration)
  })

  it('accepts supported selections and safely ignores stale database values', () => {
    expect(resolveAgentConfiguration({
      openai_model: 'gpt-5.6-terra',
      openai_reasoning_effort: 'high',
    })).toEqual({ model: 'gpt-5.6-terra', reasoningEffort: 'high' })

    expect(isAgentModel('gpt-5.6-pro')).toBe(false)
    expect(isAgentReasoningEffort('minimal')).toBe(false)
    expect(resolveAgentConfiguration({
      openai_model: 'gpt-5.6-pro',
      openai_reasoning_effort: 'minimal',
    })).toEqual(defaultAgentConfiguration)
  })
})
