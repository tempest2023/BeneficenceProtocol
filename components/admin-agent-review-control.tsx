'use client'

import { useActionState } from 'react'
import { startAgentReview, type AgentReviewActionState } from '@/app/admin/actions'

const initialState: AgentReviewActionState = { status: 'idle', message: '' }

type AgentReviewControlProps = {
  jobId: string
  jobStatus: string
  reviewKind: 'application' | 'resource'
}

export function AdminAgentReviewControl({ jobId, jobStatus, reviewKind }: AgentReviewControlProps) {
  const [state, formAction, pending] = useActionState(startAgentReview, initialState)
  const isRetry = jobStatus === 'retry' || jobStatus === 'failed'
  const subject = reviewKind === 'application' ? 'application' : 'resource'

  return (
    <form action={formAction} className="admin-agent-control">
      <input type="hidden" name="id" value={jobId} />
      <p className="admin-agent-control__note">
        {reviewKind === 'application'
          ? 'Sends the approved application fields to OpenAI now. A severe, high-confidence safety result may apply the configured automatic rejection and email.'
          : 'Sends the submitted description to OpenAI now. The Agent does not open the external URL or publish the resource.'}
      </p>
      <button className="admin-button admin-button--quiet" type="submit" disabled={pending}>
        {pending ? `Running ${subject} Agent review…` : `${isRetry ? 'Retry' : 'Start'} ${subject} Agent review`}
      </button>
      {state.message ? (
        <p
          className={`admin-action-feedback admin-action-feedback--${state.status}`}
          role={state.status === 'error' ? 'alert' : 'status'}
          aria-live="polite"
        >
          {state.message}
        </p>
      ) : null}
    </form>
  )
}
