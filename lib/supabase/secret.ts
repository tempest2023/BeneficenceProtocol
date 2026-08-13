import 'server-only'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { isSupabaseSecretKey, publicEnv } from '@/lib/env'

let secretClient: SupabaseClient | null | undefined

export function getSecretClient() {
  if (secretClient !== undefined) return secretClient
  const secretKey = process.env.SUPABASE_SECRET_KEY
  if (!publicEnv.supabaseUrl || !publicEnv.supabaseKey || !isSupabaseSecretKey(secretKey) || !secretKey) {
    secretClient = null
    return secretClient
  }
  secretClient = createClient(publicEnv.supabaseUrl, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return secretClient
}

export function requireSecretClient() {
  const client = getSecretClient()
  if (!client) throw new Error('The community database is not configured with current Supabase API keys.')
  return client
}
