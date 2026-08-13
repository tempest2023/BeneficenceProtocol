import { describe, expect, it } from 'vitest'
import { applicationAgentSchema, qualifiesForAutomaticRejection } from '@/lib/agent/schemas'

function output(overrides: Record<string, unknown> = {}) {
  return applicationAgentSchema.parse({
    summary: 'Applicant is interested in public discussion.', interest_tags: ['discussion'], contribution_tags: ['events'],
    introduction_points: [], suggested_questions: [], activity_directions: [],
    email_drafts: { review_acknowledgement: 'Thank you.', conversation_invitation: 'Let us talk.' },
    risk_category: 'none', evidence: [], confidence: 0.7, recommendation: 'accept_for_review', ...overrides,
  })
}

describe('automatic rejection safeguards', () => {
  it('cannot reject ordinary disagreement, Mission criticism, or awkward wording', () => {
    const source = 'I disagree with the Mission and write English awkwardly. I still want to organize a discussion.'
    expect(qualifiesForAutomaticRejection(output({ recommendation: 'manual_review', risk_category: 'uncertain', confidence: 0.99 }), source, { harassment: false })).toBe(false)
  })

  it('requires a severe category, exact evidence, high confidence, and relevant moderation for threats', () => {
    const source = 'I will attack the named event tomorrow.'
    const severe = output({ recommendation: 'auto_reject', risk_category: 'explicit_threat', confidence: 0.99, evidence: ['I will attack the named event tomorrow.'] })
    expect(qualifiesForAutomaticRejection(severe, source, { violence: true })).toBe(true)
    expect(qualifiesForAutomaticRejection(severe, source, { violence: false })).toBe(false)
    expect(qualifiesForAutomaticRejection(output({ ...severe, evidence: ['Fabricated quote'] }), source, { violence: true })).toBe(false)
    expect(qualifiesForAutomaticRejection(output({ ...severe, confidence: 0.8 }), source, { violence: true })).toBe(false)
  })
})
