import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/community/actions', () => ({
  registerParticipant: vi.fn(async () => ({ status: 'success' })),
  submitContributorApplication: vi.fn(async () => ({ status: 'success' })),
  submitResource: vi.fn(async () => ({ status: 'success' })),
}))

import { ContributorForm } from '@/components/forms/contributor-form'
import { ParticipantForm } from '@/components/forms/participant-form'
import { ResourceSubmissionForm } from '@/components/forms/resource-form'
import { FormStatus } from '@/components/forms/form-controls'

describe('public community forms', () => {
  it('includes the optional profile links and omits a time-commitment question', () => {
    render(<ContributorForm />)
    expect(screen.getByLabelText('Personal website')).toBeInTheDocument()
    expect(screen.getByLabelText('GitHub')).toBeInTheDocument()
    expect(screen.getByLabelText('Google Scholar')).toBeInTheDocument()
    expect(screen.getByLabelText('LinkedIn')).toBeInTheDocument()
    expect(screen.queryByText(/monthly|hours per month/i)).not.toBeInTheDocument()
  })

  it('keeps public forms available without pre-launch availability copy', () => {
    render(<ContributorForm />)
    expect(screen.queryByText(/not open|check back soon/i)).not.toBeInTheDocument()
    expect(screen.getByLabelText('Personal website')).toBeEnabled()
    expect(screen.getByLabelText('GitHub')).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Submit Contributor application' })).toBeEnabled()
  })

  it('shows operational submission failures in a dismissible dialog', async () => {
    render(<FormStatus state={{ status: 'error', presentation: 'dialog', message: 'Please try again in a few minutes. Your information was not submitted.' }} />)
    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveAttribute('open')
    expect(screen.getByRole('heading', { name: 'We couldn’t submit the form.' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Close and try again' }))
    await waitFor(() => expect(dialog).not.toHaveAttribute('open'))
  })

  it('switches between U.S. state and international country without requesting an address', () => {
    const { container } = render(<ParticipantForm />)
    expect(screen.queryByText(/does not create legal membership/i)).not.toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: /^State/ })).toBeInTheDocument()
    fireEvent.click(screen.getByLabelText('Outside the United States'))
    expect(screen.getByRole('combobox', { name: /^Country/ })).toBeInTheDocument()
    expect(container.querySelector('[name="street_address"], [name="address"]')).toBeNull()
  })

  it('accepts public resource URLs without offering file uploads', () => {
    const { container } = render(<ResourceSubmissionForm />)
    expect(screen.getByLabelText(/Public URL/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Factual author or publisher/)).toBeInTheDocument()
    expect(container.querySelector('input[type="file"]')).toBeNull()
  })
})
