import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/admin/auth'

export default async function ResourcePreview({params}:{params:Promise<{id:string}>}) {
  const {id}=await params; const {service}=await requireAdmin(); const {data:resource}=await service.from('resources').select('*').eq('id',id).maybeSingle(); if(!resource) notFound()
  return <main className="admin-main"><header className="admin-heading"><div><p className="eyebrow">Private preview · {resource.publication_status}</p><h1>{resource.title}</h1><p>{resource.summary}</p></div></header><article className="admin-panel"><p className="resource-card__meta">{resource.resource_type} · {resource.language}{resource.difficulty?` · ${resource.difficulty}`:''}</p><p>Topics: {(resource.topics??[]).join(', ')||'None'}</p><p>Author/publisher: {resource.author_publisher||'Not recorded'}</p><p>{resource.access_notes}</p><a className="admin-button" href={resource.public_url} target="_blank" rel="noreferrer">Open external resource ↗</a></article></main>
}
