'use client'

import { useActionState } from 'react'
import { requestAdminLink } from '@/app/admin/login/actions'
import { initialActionState } from '@/lib/community/types'
import { FormStatus, SubmitButton } from '@/components/forms/form-controls'

export function AdminLoginForm({ directLogin = false }: { directLogin?: boolean }) {
  const [state, action] = useActionState(requestAdminLink, initialActionState)
  return <form className="admin-form" action={action}><FormStatus state={state} /><label>Email<input type="email" name="email" autoComplete="email" required /></label><SubmitButton>{directLogin ? 'Sign in' : 'Send magic link'}</SubmitButton></form>
}
