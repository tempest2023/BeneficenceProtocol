import Link from 'next/link'
import { requireAdmin } from '@/lib/admin/auth'
import { signOut } from '@/app/admin/actions'

const links = [
  ['/admin', 'Overview'], ['/admin/participants', 'Participants'], ['/admin/applications', 'Applications'],
  ['/admin/contributors', 'Contributors'], ['/admin/people', 'People'], ['/admin/learn', 'Learn'],
  ['/admin/gather', 'Gather'], ['/admin/resources', 'Resource Review'], ['/admin/guide/contributor-conversation', 'Meeting Guide'],
  ['/admin/settings', 'Settings'], ['/admin/audit-log', 'Audit Log'],
] as const

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireAdmin()
  return <><header className="admin-header"><Link href="/admin" className="admin-brand">Beneficence / Administration</Link><form action={signOut}><button className="admin-button admin-button--quiet" type="submit">Sign out {user.email}</button></form></header><nav className="admin-nav" aria-label="Administration">{links.map(([href, label]) => <Link href={href} key={href}>{label}</Link>)}</nav>{children}</>
}
