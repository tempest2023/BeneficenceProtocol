import Link from 'next/link'

export default function NotFound() {
  return (
    <main id="main-content" className="not-found page-shell">
      <p className="eyebrow">404</p>
      <h1>This page is not part of the public record.</h1>
      <Link href="/" className="text-link"><span>Return home</span></Link>
    </main>
  )
}
