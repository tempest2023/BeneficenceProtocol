import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { publicEnv } from '@/lib/env'
import { scopeDatabaseClient } from '@/lib/supabase/database-names'

let publicClient: SupabaseClient | null | undefined

export function getPublicClient() {
  if (publicClient !== undefined) return publicClient
  if (!publicEnv.supabaseUrl || !publicEnv.supabaseKey) {
    publicClient = null
    return publicClient
  }
  publicClient = scopeDatabaseClient(createClient(publicEnv.supabaseUrl, publicEnv.supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  }))
  return publicClient
}
