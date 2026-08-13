import type { Metadata } from 'next'
import { ResourceSubmissionForm } from '@/components/forms/resource-form'
import { communityFormsOperational } from '@/lib/env'

export const metadata: Metadata = { title: 'Submit a Learning Resource', description: 'Submit a free public AI Agent learning or technical resource for review.' }
export const maxDuration = 120

export default function SubmitResourcePage() {
  return <main id="main-content" className="community-shell"><div className="page-shell form-page"><div className="form-layout"><aside className="form-intro"><p className="eyebrow">Public learning contribution</p><h1>Share a resource worth learning from.</h1><p className="form-intro__lead">Submit a free, publicly accessible resource focused on AI Agent learning or technical discussion. We accept links—not uploads—and administrators verify relevance, access, and copyright context before publication.</p><div className="form-notice"><strong>Your identity stays private.</strong>If approved, Learn displays the resource’s factual author or publisher, never the submitter. Publication does not automatically make anyone a Contributor.</div></aside><ResourceSubmissionForm enabled={communityFormsOperational()} /></div></div></main>
}
