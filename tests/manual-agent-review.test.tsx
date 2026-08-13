import { readFileSync } from 'node:fs'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  startAgentReview: vi.fn(async (_previous: unknown, _formData: FormData) => ({
    status: 'success' as const,
    message: 'Agent review completed.',
  })),
}))

vi.mock('@/app/admin/actions', () => ({ startAgentReview: mocks.startAgentReview }))

import { AdminAgentReviewControl } from '@/components/admin-agent-review-control'

describe('manual Agent review', () => {
  it('offers a specific administrator action for a pending application', () => {
    render(<AdminAgentReviewControl jobId="job-1" jobStatus="pending" reviewKind="application" />)

    expect(screen.getByRole('button', { name: 'Start application Agent review' })).toBeEnabled()
    expect(screen.getByText(/may apply the configured automatic rejection and email/i)).toBeInTheDocument()
  })

  it('labels a failed resource job as a retry', () => {
    render(<AdminAgentReviewControl jobId="job-2" jobStatus="failed" reviewKind="resource" />)

    expect(screen.getByRole('button', { name: 'Retry resource Agent review' })).toBeEnabled()
    expect(screen.getByText(/does not open the external URL or publish the resource/i)).toBeInTheDocument()
  })

  it('passes the selected job to the administrator action', async () => {
    render(<AdminAgentReviewControl jobId="job-3" jobStatus="pending" reviewKind="resource" />)
    fireEvent.click(screen.getByRole('button', { name: 'Start resource Agent review' }))

    await vi.waitFor(() => expect(mocks.startAgentReview).toHaveBeenCalled())
    const formData = mocks.startAgentReview.mock.calls.at(-1)?.[1]
    expect(formData).toBeInstanceOf(FormData)
    expect(formData?.get('id')).toBe('job-3')
  })

  it('keeps public submissions and Vercel schedules from starting Agent work', () => {
    const communityActions = readFileSync('lib/community/actions.ts', 'utf8')
    const verificationRoute = readFileSync('app/api/contributor/verify/route.ts', 'utf8')
    const vercelConfig = JSON.parse(readFileSync('vercel.json', 'utf8')) as { crons?: Array<{ path: string }> }

    expect(communityActions).not.toContain('processAgentJob')
    expect(verificationRoute).not.toContain('processAgentJob')
    expect(vercelConfig.crons?.map((cron) => cron.path)).not.toContain('/api/cron/agent-jobs')
  })
})
