import { permanentRedirect } from 'next/navigation'

export default function PeoplePage() {
  permanentRedirect('/community#people')
}
