import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Administration', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="admin-shell">{children}</div>
}
