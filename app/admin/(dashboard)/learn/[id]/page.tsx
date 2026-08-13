import Link from 'next/link'
import { notFound } from 'next/navigation'
import { updateResource } from '@/app/admin/actions'
import { requireAdmin } from '@/lib/admin/auth'
import { RESOURCE_FORMATS } from '@/lib/community/constants'

export default async function EditResourcePage({params}:{params:Promise<{id:string}>}) {
  const {id}=await params; const {service}=await requireAdmin(); const {data:resource}=await service.from('resources').select('*').eq('id',id).maybeSingle(); if(!resource) notFound()
  return <main className="admin-main"><header className="admin-heading"><div><p className="eyebrow">Learn / Edit</p><h1>{resource.title}</h1></div><Link className="admin-button admin-button--quiet" href={`/admin/learn/preview/${id}`}>Preview draft</Link></header><section className="admin-panel"><form className="admin-form" action={updateResource}><input type="hidden" name="id" value={resource.id}/><label>Title<input name="title" defaultValue={resource.title} required/></label><label>Summary<textarea name="summary" defaultValue={resource.summary} required/></label><label>Public URL<input type="url" name="public_url" defaultValue={resource.public_url} required/></label><label>Type<select name="resource_type" defaultValue={resource.resource_type}>{RESOURCE_FORMATS.map((format)=><option key={format}>{format}</option>)}</select></label><label>Language<input name="language" defaultValue={resource.language} required/></label><label>Difficulty<input name="difficulty" defaultValue={resource.difficulty??''}/></label><label>Topics, comma separated<input name="topics" defaultValue={(resource.topics??[]).join(', ')}/></label><label>Author or publisher<input name="author_publisher" defaultValue={resource.author_publisher??''}/></label><label>Access notes<textarea name="access_notes" defaultValue={resource.access_notes??''}/></label><button>Save resource</button></form></section></main>
}
