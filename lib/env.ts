const publicSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const publicSupabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const publicEnv = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  supabaseUrl: publicSupabaseUrl,
  supabaseKey: publicSupabaseKey,
}

export function adminReadiness() {
  const required: Record<string, string | undefined> = {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SUPABASE_URL: publicSupabaseUrl,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: publicSupabaseKey,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    ADMIN_EMAILS: process.env.ADMIN_EMAILS,
  }

  return {
    ready: Object.values(required).every(Boolean),
    missing: Object.entries(required).filter(([, value]) => !value).map(([key]) => key),
  }
}

export function adminEmails() {
  return new Set((process.env.ADMIN_EMAILS ?? '').split(',').map((email) => email.trim().toLowerCase()).filter(Boolean))
}
