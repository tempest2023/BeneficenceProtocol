import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/auth'
import { csvRow } from '@/lib/security'
import { sanitizePostgrestSearch } from '@/lib/security'

export async function GET(request: Request) {
  const { service } = await requireAdmin()
  const url = new URL(request.url); const industry = url.searchParams.get('industry'); const rawLocation = url.searchParams.get('location'); const location = rawLocation ? sanitizePostgrestSearch(rawLocation) : ''
  let query = service.from('community_participants').select('name,email,industry,industry_other,country,us_state,city_region,subscription_status,created_at').order('created_at',{ ascending:false })
  if (industry) query = query.eq('industry',industry)
  if (location) query = query.or(`country.ilike.%${location}%,city_region.ilike.%${location}%,us_state.ilike.%${location}%`)
  const { data, error } = await query; if (error) return NextResponse.json({ error:'Export failed.' },{ status:500 })
  const rows = [csvRow(['Name','Email','Industry','Industry other','Country','State','City or region','Subscription','Created'])]
  for (const record of data ?? []) rows.push(csvRow([record.name,record.email,record.industry,record.industry_other,record.country,record.us_state,record.city_region,record.subscription_status,record.created_at]))
  return new NextResponse(rows.join('\r\n'), { headers: { 'Content-Type':'text/csv; charset=utf-8', 'Content-Disposition':`attachment; filename="community-participants-${new Date().toISOString().slice(0,10)}.csv"`, 'Cache-Control':'private, no-store', 'X-Content-Type-Options':'nosniff' } })
}
