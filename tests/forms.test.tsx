import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/community/actions', () => ({
  registerParticipant: vi.fn(async () => ({ status: 'success' })),
  submitContributorApplication: vi.fn(async () => ({ status: 'success' })),
  submitResource: vi.fn(async () => ({ status: 'success' })),
}))

import { ContributorForm } from '@/components/forms/contributor-form'
import { ParticipantForm } from '@/components/forms/participant-form'
import { ResourceSubmissionForm } from '@/components/forms/resource-form'

describe('public community forms', () => {
  it('includes the optional profile links and omits a time-commitment question', () => {
    render(<ContributorForm enabled />)
    expect(screen.getByLabelText('Personal website')).toBeInTheDocument()
    expect(screen.getByLabelText('GitHub')).toBeInTheDocument()
    expect(screen.getByLabelText('Google Scholar')).toBeInTheDocument()
    expect(screen.getByLabelText('LinkedIn')).toBeInTheDocument()
    expect(screen.queryByText(/monthly|hours per month/i)).not.toBeInTheDocument()
  })

  it('switches between U.S. state and international country without requesting an address', () => {
    const { container } = render(<ParticipantForm enabled />)
    expect(screen.getByRole('combobox', { name: /^State/ })).toBeInTheDocument()
    fireEvent.click(screen.getByLabelText('Outside the United States'))
    expect(screen.getByRole('combobox', { name: /^Country/ })).toBeInTheDocument()
    expect(container.querySelector('[name="street_address"], [name="address"]')).toBeNull()
  })

  it('accepts public resource URLs without offering file uploads', () => {
    const { container } = render(<ResourceSubmissionForm enabled />)
    expect(screen.getByLabelText(/Public URL/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Factual author or publisher/)).toBeInTheDocument()
    expect(container.querySelector('input[type="file"]')).toBeNull()
  })
})
