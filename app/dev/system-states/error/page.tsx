import { notFound } from 'next/navigation'

export default function ErrorStatePreview() {
  if (process.env.NODE_ENV !== 'development') notFound()

  throw new Error('Development preview for the public error boundary.')
}
