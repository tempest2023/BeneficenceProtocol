import 'server-only'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { publicEnv } from '@/lib/env'

let serviceClient: SupabaseClient | null | undefined

export function getServiceClient() {
  if (serviceClient !== undefined) return serviceClient
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!publicEnv.supabaseUrl || !serviceKey) {
    serviceClient = null
    return serviceClient
  }
  serviceClient = createClient(publicEnv.supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return serviceClient
}

export function requireServiceClient() {
  const client = getServiceClient()
  if (!client) throw new Error('The community database is not configured.')
  return client
}
