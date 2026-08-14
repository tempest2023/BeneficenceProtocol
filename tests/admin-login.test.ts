import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { initialActionState } from '@/lib/community/types'

const mocks = vi.hoisted(() => ({
  generateLink: vi.fn(),
  isAllowedAdminEmail: vi.fn(),
  redirect: vi.fn(() => { throw new Error('NEXT_REDIRECT') }),
  signInWithOtp: vi.fn(),
  verifyOtp: vi.fn(),
}))

vi.mock('next/navigation', () => ({ redirect: mocks.redirect }))
vi.mock('@/lib/admin/auth', () => ({ isAllowedAdminEmail: mocks.isAllowedAdminEmail }))
vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: vi.fn(async () => ({
    auth: {
      signInWithOtp: mocks.signInWithOtp,
      verifyOtp: mocks.verifyOtp,
    },
  })),
}))
vi.mock('@/lib/supabase/secret', () => ({
  requireSecretClient: vi.fn(() => ({ auth: { admin: { generateLink: mocks.generateLink } } })),
}))

import { requestAdminLink } from '@/app/admin/login/actions'

function loginForm(email = 'admin@example.org') {
  const formData = new FormData()
  formData.set('email', email)
  return formData
}

describe('administrator login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.isAllowedAdminEmail.mockResolvedValue(true)
    mocks.generateLink.mockResolvedValue({
      data: { properties: { hashed_token: 'hashed-login-token' } },
      error: null,
    })
    mocks.verifyOtp.mockResolvedValue({ error: null })
    mocks.signInWithOtp.mockResolvedValue({ error: null })
  })

  afterEach(() => vi.unstubAllEnvs())

  it('creates a normal Supabase session without sending email in local development', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('RESEND_API_KEY', '')

    await expect(requestAdminLink(initialActionState, loginForm())).rejects.toThrow('NEXT_REDIRECT')

    expect(mocks.generateLink).toHaveBeenCalledWith(expect.objectContaining({
      type: 'magiclink',
      email: 'admin@example.org',
    }))
    expect(mocks.verifyOtp).toHaveBeenCalledWith({
      token_hash: 'hashed-login-token',
      type: 'email',
    })
    expect(mocks.signInWithOtp).not.toHaveBeenCalled()
    expect(mocks.redirect).toHaveBeenCalledWith('/admin')
  })

  it('uses the email magic-link flow outside the development bypass', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('RESEND_API_KEY', '')

    await expect(requestAdminLink(initialActionState, loginForm())).resolves.toEqual({
      status: 'success',
      message: 'If this address is authorized, a sign-in link has been sent.',
    })

    expect(mocks.signInWithOtp).toHaveBeenCalledOnce()
    expect(mocks.generateLink).not.toHaveBeenCalled()
    expect(mocks.verifyOtp).not.toHaveBeenCalled()
  })

  it('never creates a development session for an unauthorized address', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('RESEND_API_KEY', '')
    mocks.isAllowedAdminEmail.mockResolvedValue(false)

    await expect(requestAdminLink(initialActionState, loginForm('unknown@example.org'))).resolves.toEqual({
      status: 'success',
      message: 'If this address is authorized, you will be signed in.',
    })

    expect(mocks.generateLink).not.toHaveBeenCalled()
    expect(mocks.verifyOtp).not.toHaveBeenCalled()
    expect(mocks.signInWithOtp).not.toHaveBeenCalled()
    expect(mocks.redirect).not.toHaveBeenCalled()
  })
})
