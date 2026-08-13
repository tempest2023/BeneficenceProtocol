'use server'

import { after } from 'next/server'
import { communityFormsOperational, publicEnv } from '@/lib/env'
import { contributorSchema, formDataRecord, participantSchema, resourceSubmissionSchema, zodErrors } from '@/lib/community/schemas'
import type { ActionState } from '@/lib/community/types'
import { requireServiceClient } from '@/lib/supabase/service'
import { createVerificationToken, normalizeEmail, protectedRateKey, requestIpHash } from '@/lib/security'
import { sendContributorVerification, sendParticipantConfirmation } from '@/lib/email'

function unavailable(): ActionState {
  return { status: 'error', message: 'Community forms are not open yet. No information was submitted.' }
}

function databaseMessage(error: { message: string }) {
  if (error.message.includes('rate_limit_exceeded')) return 'Too many submissions were received from this connection. Please try again later.'
  return 'We could not save this submission. Nothing was lost from an earlier submission; please try again.'
}

function hourWindow() {
  const date = new Date(); date.setUTCMinutes(0, 0, 0); return date
}

function dayWindow() {
  const date = new Date(); date.setUTCHours(0, 0, 0, 0); return date
}

async function consumeLimit(form: string, start: Date, limit: number, alternateKey?: string) {
  const client = requireServiceClient()
  const key = alternateKey ?? await requestIpHash(form, start.toISOString())
  const expires = new Date(start); expires.setUTCDate(expires.getUTCDate() + 7)
  const { data, error } = await client.rpc('consume_form_rate_limit', {
    p_rate_key: key, p_form_type: form, p_window_start: start.toISOString(), p_limit: limit, p_expires_at: expires.toISOString(),
  })
  if (error) throw error
  if (!data) throw new Error('rate_limit_exceeded')
}

export async function registerParticipant(_previous: ActionState, formData: FormData): Promise<ActionState> {
  if (!communityFormsOperational()) return unavailable()
  const result = participantSchema.safeParse(formDataRecord(formData))
  if (!result.success) return { status: 'error', message: 'Review the highlighted fields.', fieldErrors: zodErrors(result.error) }
  try {
    await consumeLimit('community_registration', hourWindow(), 10)
    const client = requireServiceClient()
    const data = result.data
    const { data: created, error } = await client.rpc('register_community_participant', {
      p_email: normalizeEmail(data.email), p_name: data.name ?? null, p_industry: data.industry,
      p_industry_other: data.industry_other ?? null, p_location_scope: data.location_scope,
      p_country: data.location_scope === 'international' ? data.country : 'United States',
      p_us_state: data.location_scope === 'united_states' ? data.us_state : null,
      p_city_region: data.city_region, p_communications_consent: true, p_privacy_consent: true,
    })
    if (error) return { status: 'error', message: databaseMessage(error) }
    const participantId = created?.[0]?.participant_id as string | undefined
    after(async () => { try { await sendParticipantConfirmation(data.email, data.name, participantId) } catch { /* administrator can inspect provider configuration */ } })
    return { status: 'success', message: 'You are registered. We will use your information only for community communication and administration.' }
  } catch (error) {
    return { status: 'error', message: databaseMessage(error as Error) }
  }
}

export async function submitContributorApplication(_previous: ActionState, formData: FormData): Promise<ActionState> {
  if (!communityFormsOperational()) return unavailable()
  const record = formDataRecord(formData)
  record.participation_reasons = formData.getAll('participation_reasons')
  record.contribution_areas = formData.getAll('contribution_areas')
  const result = contributorSchema.safeParse(record)
  if (!result.success) return { status: 'error', message: 'Review the highlighted fields.', fieldErrors: zodErrors(result.error) }
  try {
    await consumeLimit('contributor_application', dayWindow(), 5)
    const client = requireServiceClient()
    const { token, hash } = createVerificationToken()
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)
    const data = result.data
    const { data: created, error } = await client.rpc('create_contributor_application', {
      p_name: data.name, p_email: normalizeEmail(data.email), p_industry: data.industry ?? null,
      p_industry_other: data.industry_other ?? null, p_location_scope: data.location_scope,
      p_country: data.location_scope === 'international' ? data.country : 'United States',
      p_us_state: data.location_scope === 'united_states' ? data.us_state : null, p_city_region: data.city_region,
      p_participation_reasons: data.participation_reasons, p_participation_reason_other: data.participation_reason_other ?? null,
      p_contribution_areas: data.contribution_areas, p_contribution_area_other: data.contribution_area_other ?? null,
      p_personal_website: data.personal_website ?? null, p_github_url: data.github_url ?? null,
      p_scholar_url: data.scholar_url ?? null, p_linkedin_url: data.linkedin_url ?? null,
      p_profile_willingness: data.profile_willingness ?? null, p_verification_token_hash: hash,
      p_verification_expires_at: expires.toISOString(), p_privacy_consent: true, p_conduct_consent: true,
    })
    const applicationId = created?.[0]?.application_id as string | undefined
    if (error || !applicationId) return { status: 'error', message: databaseMessage(error ?? new Error('No application was returned.')) }
    const verifyUrl = `${publicEnv.siteUrl}/api/contributor/verify?token=${encodeURIComponent(token)}`
    after(async () => { try { await sendContributorVerification(data.email, data.name, verifyUrl, applicationId) } catch { /* administrator can resend */ } })
    return { status: 'success', message: 'Your application was saved and counted. Check your email within 24 hours to verify it and begin review.' }
  } catch (error) {
    return { status: 'error', message: databaseMessage(error as Error) }
  }
}

export async function submitResource(_previous: ActionState, formData: FormData): Promise<ActionState> {
  if (!communityFormsOperational()) return unavailable()
  const result = resourceSubmissionSchema.safeParse(formDataRecord(formData))
  if (!result.success) return { status: 'error', message: 'Review the highlighted fields.', fieldErrors: zodErrors(result.error) }
  try {
    const start = dayWindow()
    await consumeLimit('resource_submission_ip', start, 10)
    const data = result.data
    await consumeLimit('resource_submission_email', start, 3, protectedRateKey('resource-email', normalizeEmail(data.contact_email)))
    const client = requireServiceClient()
    const { data: created, error } = await client.rpc('create_resource_submission', {
      p_contact_email: normalizeEmail(data.contact_email), p_submitter_name: data.submitter_name ?? null,
      p_title: data.title, p_public_url: data.public_url, p_format: data.format, p_language: data.language,
      p_description: data.description, p_ai_agent_relevance: data.ai_agent_relevance,
      p_author_publisher: data.author_publisher, p_access_confirmation: true,
      p_copyright_confirmation: true, p_privacy_consent: true,
    })
    const jobId = created?.[0]?.job_id as string | undefined
    if (error) return { status: 'error', message: databaseMessage(error) }
    if (jobId) after(async () => { const { processAgentJob } = await import('@/lib/agent/process'); await processAgentJob(jobId) })
    return { status: 'success', message: 'Thank you. Your resource is queued for administrative review; submission does not create Contributor status.' }
  } catch (error) {
    return { status: 'error', message: databaseMessage(error as Error) }
  }
}
