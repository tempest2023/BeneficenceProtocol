import 'server-only'
import OpenAI from 'openai'
import { zodTextFormat } from 'openai/helpers/zod'
import { applicationAgentSchema, qualifiesForAutomaticRejection, resourceAgentSchema } from '@/lib/agent/schemas'
import { requireServiceClient } from '@/lib/supabase/service'
import { safetyIdentifier } from '@/lib/security'
import { sendAutomaticRejection } from '@/lib/email'

const model = process.env.OPENAI_MODEL ?? 'gpt-5.6'
const promptVersion = 'community-review-v1'

function openaiClient() {
  if (!process.env.OPENAI_API_KEY) throw new Error('OpenAI is not configured.')
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
}

function applicationText(application: Record<string, unknown>) {
  return [
    ...(application.participation_reasons as string[] ?? []),
    application.participation_reason_other,
    ...(application.contribution_areas as string[] ?? []),
    application.contribution_area_other,
  ].filter(Boolean).join('\n')
}

export async function analyzeApplication(application: Record<string, unknown>) {
  const openai = openaiClient()
  const source = applicationText(application)
  const moderation = await openai.moderations.create({ model: 'omni-moderation-latest', input: source })
  const moderationResult = moderation.results[0]
  const safeInput = {
    participation_reasons: application.participation_reasons,
    participation_reason_other: application.participation_reason_other,
    contribution_areas: application.contribution_areas,
    contribution_area_other: application.contribution_area_other,
    location: { country: application.country, state: application.us_state, city_or_region: application.city_region },
    industry: application.industry,
    industry_other: application.industry_other,
  }
  const response = await openai.responses.parse({
    model,
    reasoning: { effort: 'low' },
    store: false,
    safety_identifier: safetyIdentifier(String(application.contact_id)),
    instructions: `You support a low-barrier nonprofit Contributor review. Return only the requested structure. Welcome different industries, education, nationality, political or cultural backgrounds, technical seniority, public influence, limited English fluency, criticism, disagreement, and blunt or awkward phrasing. These must never cause rejection. A lack of an immediate project is not grounds for rejection. Recommend auto_reject only for an explicit threat, severe targeted hate or harassment, explicit fraud or impersonation, or explicit malicious disruption or sabotage intent. For any auto_reject recommendation, include exact verbatim excerpts from the supplied application and use confidence >= 0.95 only when unambiguous. Otherwise use manual_review. Do not infer facts, identity, or intent beyond the supplied fields. Draft concise, warm emails, but do not claim acceptance.`,
    input: JSON.stringify(safeInput),
    text: { format: zodTextFormat(applicationAgentSchema, 'application_review') },
  })
  if (!response.output_parsed) throw new Error('The application Agent returned no structured output.')
  return { output: response.output_parsed, moderation: moderationResult, source, responseId: response.id, responseModel: response.model }
}

export async function analyzeResource(submission: Record<string, unknown>, exactDuplicate: boolean) {
  const openai = openaiClient()
  const response = await openai.responses.parse({
    model,
    reasoning: { effort: 'low' },
    store: false,
    safety_identifier: safetyIdentifier(String(submission.contact_id)),
    instructions: `Assist an administrator reviewing a submitted public learning resource. Return only the requested structure. Assess only the submitter's description; do not visit, crawl, fetch, summarize, or make claims about the external URL. Treat exact_url_duplicate_warning as the supplied database fact. Recommend accept only when the description indicates a free, publicly accessible resource focused on AI Agent learning or technical discussion. Administrators remain responsible for opening the URL, verifying the content, access, attribution, and copyright.`,
    input: JSON.stringify({
      title: submission.title, public_url: submission.public_url, material_type: submission.format,
      language: submission.language, description: submission.description,
      author_publisher: submission.author_publisher,
      exact_url_duplicate_warning: exactDuplicate,
    }),
    text: { format: zodTextFormat(resourceAgentSchema, 'resource_review') },
  })
  if (!response.output_parsed) throw new Error('The resource Agent returned no structured output.')
  return { output: response.output_parsed, responseId: response.id, responseModel: response.model }
}

async function processApplication(recordId: string, jobId: string) {
  const client = requireServiceClient()
  const { data: application, error } = await client.from('contributor_applications').select('*').eq('id', recordId).single()
  if (error || !application) throw new Error(error?.message ?? 'Application not found.')
  if (application.status !== 'submitted' && application.status !== 'agent_processing') return
  await client.from('contributor_applications').update({ status: 'agent_processing' }).eq('id', recordId)
  const result = await analyzeApplication(application)
  const categories = result.moderation.categories as unknown as Record<string, boolean>
  const autoReject = !application.auto_reject_disabled && qualifiesForAutomaticRejection(result.output, result.source, categories)
  const nextStatus = autoReject ? 'auto_rejected' : 'reviewing'
  const run = {
    agent_job_id: jobId, workflow: 'contributor_application', model: result.responseModel,
    prompt_version: promptVersion, provider_response_id: result.responseId,
    structured_output: result.output, moderation_output: result.moderation,
    evidence: result.output.evidence, confidence: result.output.confidence,
    decision: nextStatus, completed_at: new Date().toISOString(),
  }
  const { data: savedRun, error: runError } = await client.from('agent_runs').insert(run).select('id').single()
  if (runError) throw runError
  const rejectionRetention = autoReject ? { closed_at: new Date().toISOString(), retention_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() } : {}
  const { error: updateError } = await client.from('contributor_applications').update({ status: nextStatus, agent_output: result.output, agent_processed_at: new Date().toISOString(), ...rejectionRetention }).eq('id', recordId)
  if (updateError) throw updateError
  const { error: auditError } = await client.from('admin_audit_log').insert({
    actor_type: 'agent', actor_id: jobId, action: autoReject ? 'application.auto_rejected' : 'application.review_prepared',
    entity_type: 'contributor_application', entity_id: recordId,
    details: { agent_run_id: savedRun.id, decision: nextStatus, prompt_version: promptVersion, confidence: result.output.confidence },
  })
  if (auditError) throw auditError
  if (autoReject) {
    try { await sendAutomaticRejection(application.email, application.name, application.id) } catch { /* failed delivery is retained for administrator follow-up */ }
  }
}

async function processResource(recordId: string, jobId: string) {
  const client = requireServiceClient()
  const { data: submission, error } = await client.from('resource_submissions').select('*').eq('id', recordId).single()
  if (error || !submission) throw new Error(error?.message ?? 'Resource submission not found.')
  const [{ count: resourceCount }, { count: submissionCount }] = await Promise.all([
    client.from('resources').select('id', { count: 'exact', head: true }).eq('public_url_normalized', submission.public_url_normalized),
    client.from('resource_submissions').select('id', { count: 'exact', head: true }).eq('public_url_normalized', submission.public_url_normalized).neq('id', recordId),
  ])
  const result = await analyzeResource(submission, Boolean(resourceCount || submissionCount))
  const { data: savedRun, error: runError } = await client.from('agent_runs').insert({
    agent_job_id: jobId, workflow: 'resource_submission', model: result.responseModel,
    prompt_version: promptVersion, provider_response_id: result.responseId,
    structured_output: result.output, evidence: [], decision: result.output.recommendation,
    completed_at: new Date().toISOString(),
  }).select('id').single()
  if (runError) throw runError
  const { error: updateError } = await client.from('resource_submissions').update({ status: 'in_review', agent_output: result.output }).eq('id', recordId)
  if (updateError) throw updateError
  const { error: auditError } = await client.from('admin_audit_log').insert({
    actor_type: 'agent', actor_id: jobId, action: 'resource.review_prepared', entity_type: 'resource_submission', entity_id: recordId,
    details: { agent_run_id: savedRun.id, recommendation: result.output.recommendation, prompt_version: promptVersion },
  })
  if (auditError) throw auditError
}

export async function processAgentJob(jobId: string) {
  const client = requireServiceClient()
  const { data: claimed, error } = await client.rpc('claim_agent_job', { p_job_id: jobId })
  if (error || !claimed?.[0]) return { processed: false }
  const job = claimed[0]
  try {
    if (job.job_type === 'contributor_application') await processApplication(job.record_id, job.id)
    else if (job.job_type === 'resource_submission') await processResource(job.record_id, job.id)
    else throw new Error(`Unsupported Agent job type: ${job.job_type}`)
    await client.from('agent_jobs').update({ status: 'completed', completed_at: new Date().toISOString(), last_error: null }).eq('id', job.id)
    return { processed: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown Agent failure'
    await client.rpc('fail_agent_job', { p_job_id: job.id, p_error: message.slice(0, 2000) })
    await client.from('admin_audit_log').insert({ actor_type: 'agent', actor_id: job.id, action: 'agent_job.failed', entity_type: job.job_type, entity_id: job.record_id, details: { error: message.slice(0, 500), attempt: job.attempts } })
    return { processed: false, error: message }
  }
}

export async function processRetryableAgentJobs(limit = 10) {
  const client = requireServiceClient()
  const { data, error } = await client.rpc('list_retryable_agent_jobs', { p_limit: limit })
  if (error) throw error
  const outcomes = []
  for (const job of data ?? []) outcomes.push(await processAgentJob(job.id))
  return outcomes
}
