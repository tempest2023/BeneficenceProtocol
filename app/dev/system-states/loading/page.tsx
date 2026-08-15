import { notFound } from 'next/navigation'
import Loading from '@/app/loading'

export default function LoadingStatePreview() {
  if (process.env.NODE_ENV !== 'development') notFound()

  return <Loading />
}
