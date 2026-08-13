import { z } from 'zod'

export const severeRiskCategories = [
  'explicit_threat',
  'severe_targeted_hate_or_harassment',
  'explicit_fraud_or_impersonation',
  'explicit_malicious_disruption_or_sabotage',
] as const

export const applicationAgentSchema = z.object({
  summary: z.string().max(800),
  interest_tags: z.array(z.string().max(80)).max(12),
  contribution_tags: z.array(z.string().max(80)).max(12),
  introduction_points: z.array(z.string().max(300)).max(8),
  suggested_questions: z.array(z.string().max(300)).max(8),
  activity_directions: z.array(z.string().max(300)).max(8),
  email_drafts: z.object({
    review_acknowledgement: z.string().max(1500),
    conversation_invitation: z.string().max(2000),
  }),
  risk_category: z.enum(['none', 'uncertain', ...severeRiskCategories]),
  evidence: z.array(z.string().max(500)).max(6),
  confidence: z.number().min(0).max(1),
  recommendation: z.enum(['accept_for_review', 'manual_review', 'auto_reject']),
})

export type ApplicationAgentOutput = z.infer<typeof applicationAgentSchema>

export const resourceAgentSchema = z.object({
  resource_type: z.enum(['Video', 'Article / Document', 'Course', 'Paper Discussion', 'Tool / Reference']),
  topic_tags: z.array(z.string().max(80)).max(12),
  relevance: z.enum(['strong', 'possible', 'not_relevant']),
  summary: z.string().max(800),
  exact_url_duplicate_warning: z.boolean(),
  recommendation: z.enum(['accept', 'request_changes', 'reject']),
  rationale: z.string().max(800),
})

export type ResourceAgentOutput = z.infer<typeof resourceAgentSchema>

export function evidenceIsExact(output: ApplicationAgentOutput, source: string) {
  return output.evidence.length > 0 && output.evidence.every((excerpt) => excerpt.length >= 4 && source.includes(excerpt))
}

export function qualifiesForAutomaticRejection(output: ApplicationAgentOutput, source: string, moderationCategories: Record<string, boolean>) {
  if (output.recommendation !== 'auto_reject' || output.confidence < 0.95 || !evidenceIsExact(output, source)) return false
  if (!severeRiskCategories.includes(output.risk_category as (typeof severeRiskCategories)[number])) return false
  if (output.risk_category === 'explicit_threat') return Boolean(moderationCategories['harassment/threatening'] || moderationCategories['hate/threatening'] || moderationCategories.violence)
  if (output.risk_category === 'severe_targeted_hate_or_harassment') return Boolean(moderationCategories['harassment/threatening'] || moderationCategories['hate/threatening'] || moderationCategories.hate || moderationCategories.harassment)
  return true
}
