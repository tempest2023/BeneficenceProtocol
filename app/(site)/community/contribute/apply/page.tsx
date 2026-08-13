import type { Metadata } from 'next'
import Link from 'next/link'
import { ContributorForm } from '@/components/forms/contributor-form'
import { communityFormsOperational } from '@/lib/env'

export const metadata: Metadata = { title: 'Contributor Application', description: 'Apply for deeper participation in Beneficence community work.' }
export const maxDuration = 60

export default function ContributorApplicationPage() {
  return <main id="main-content" className="community-shell"><div className="page-shell form-page"><div className="form-layout"><aside className="form-intro"><p className="eyebrow">Private Contributor pathway</p><h1>Apply for deeper responsibility.</h1><p className="form-intro__lead">Most public resources and events are open without becoming a Contributor. Apply only if you want to participate more deeply, organize activities, or take responsibility for ongoing work.</p><div className="form-notice"><strong>The 1v1 is a conversation—not a traditional interview.</strong>If invited, the meeting introduces the organization and community, learns about your interests, explores useful paths, and answers questions. It lasts no more than 30 minutes. We do not record, automatically transcribe, or send meeting content to an Agent.</div><h2>What the conversation covers</h2><ol className="conversation-agenda"><li><time>0–5 min</time><span>Beneficence, its Mission, and the community</span></li><li><time>5–15 min</time><span>Your background, interests, and desired involvement</span></li><li><time>15–25 min</time><span>Relevant people, activities, projects, and contribution paths</span></li><li><time>25–30 min</time><span>Questions and a mutually clear next step</span></li></ol><p className="field-hint">We welcome different industries, educational backgrounds, nationalities, professional paths, technical experience, political views, and levels of public influence. A lack of an immediate project is not grounds for rejection. Decisions are based on documented conduct under the <Link href="/community/code-of-conduct">Code of Conduct</Link>.</p></aside><ContributorForm enabled={communityFormsOperational()} /></div></div></main>
}
