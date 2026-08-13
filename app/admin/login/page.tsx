import Link from 'next/link'
import { AdminLoginForm } from '@/app/admin/login/login-form'
import { deploymentReadiness } from '@/lib/env'

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams
  const readiness = deploymentReadiness()
  return <main className="admin-login"><section className="admin-login__panel"><p className="eyebrow">Private administration</p><h1>Beneficence Dashboard</h1><p>Authorized administrators sign in with a one-time Supabase magic link. There is no public administrator registration.</p>{error === 'not_authorized' ? <div className="form-status" data-kind="error" role="alert">This account is not authorized.</div> : null}{!readiness.ready ? <div className="form-status" data-kind="error"><strong>Production setup is incomplete.</strong><p>Missing: {readiness.missing.join(', ')}</p></div> : <AdminLoginForm />}<p><Link href="/">Return to the public site</Link></p></section></main>
}
