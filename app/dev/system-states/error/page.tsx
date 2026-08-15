import { notFound } from 'next/navigation'
import { ErrorStatePreviewClient } from './preview-client'

export default function ErrorStatePreview() {
  if (process.env.NODE_ENV !== 'development') notFound()

  return <ErrorStatePreviewClient />
}
