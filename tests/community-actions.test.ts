import { describe, expect, it, vi } from 'vitest'

vi.mock('next/headers', () => ({
  headers: async () => new Headers({ 'x-forwarded-for': '203.0.113.10' }),
}))

vi.mock('@/lib/supabase/secret', () => ({
  requireSecretClient: () => { throw new Error('Backend unavailable.') },
}))

vi.mock('@/lib/email', () => ({
  sendContributorVerification: vi.fn(),
  sendParticipantConfirmation: vi.fn(),
}))

import { registerParticipant } from '@/lib/community/actions'
import { initialActionState } from '@/lib/community/types'

describe('community submission actions', () => {
  it('returns a dialog error when an enabled form cannot reach its backend', async () => {
    const formData = new FormData()
    formData.set('email', 'person@example.org')
    formData.set('industry', 'Education')
    formData.set('location_scope', 'united_states')
    formData.set('us_state', 'CA')
    formData.set('city_region', 'Oakland')
    formData.set('communications_consent', 'on')
    formData.set('privacy_consent', 'on')

    await expect(registerParticipant(initialActionState, formData)).resolves.toEqual({
      status: 'error',
      presentation: 'dialog',
      message: 'Please try again in a few minutes. Your information was not submitted.',
    })
  })
})
