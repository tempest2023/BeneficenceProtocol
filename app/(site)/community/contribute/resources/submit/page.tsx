import type { Metadata } from 'next'
import { ResourceSubmissionForm } from '@/components/forms/resource-form'

export const metadata: Metadata = { title: 'Submit a Learning Resource', description: 'Submit a free public AI Agent learning or technical resource for review.' }
export const maxDuration = 120

export default function SubmitResourcePage() {
  return <main id="main-content" className="community-shell"><div className="page-shell form-page"><div className="form-layout"><aside className="form-intro"><p className="eyebrow">Community / Submit resource</p><h1>Share a learning resource.</h1><p className="form-intro__lead">Submit a free public link related to AI Agent learning or technical discussion.</p><div className="form-notice"><strong>Your identity stays private.</strong>If approved, Learn will show the resource’s author or publisher, not the submitter.</div></aside><ResourceSubmissionForm /></div></div></main>
}
