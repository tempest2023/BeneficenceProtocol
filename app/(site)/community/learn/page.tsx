import type { Metadata } from 'next'
import Link from 'next/link'
import { CommunityPageHero, CommunitySection } from '@/components/community-shell'
import { EmptyState } from '@/components/primitives'
import { getPublishedResources } from '@/lib/community/data'

export const metadata: Metadata = { title: 'Learn', description: 'Free, public AI Agent learning and technical discussion resources.' }

export default async function LearnPage() {
  const resources = await getPublishedResources()
  return <main id="main-content" className="community-shell"><CommunityPageHero eyebrow="Community / Learn" title="Learn about AI Agents." lead="Free courses, research briefings, paper discussions, and practical references for the community." /><CommunitySection eyebrow="Public library" title="Free learning resources.">{resources.length ? <div className="resource-list">{resources.map((resource) => <article className="resource-card" key={resource.id}><span className="resource-card__meta">{resource.resource_type} · {resource.language}{resource.difficulty ? ` · ${resource.difficulty}` : ''}</span><h2>{resource.title}</h2><p>{resource.summary}</p>{resource.author_publisher ? <p className="field-hint">By {resource.author_publisher}</p> : null}<a href={resource.public_url} target="_blank" rel="noreferrer">Open free resource <span aria-hidden="true">↗</span></a></article>)}</div> : <EmptyState eyebrow="Learn" title="Learning resources are being prepared."><p>Courses, research briefings, and paper discussions will be added here.</p><div className="empty-state__actions"><Link href="/community#register" className="primary-action">Register for updates</Link><Link href="/community/contribute/resources/submit" className="quiet-action">Submit a resource</Link></div></EmptyState>}</CommunitySection></main>
}
