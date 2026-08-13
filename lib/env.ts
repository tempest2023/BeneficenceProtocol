const publicSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const configuredPublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

export function isSupabasePublishableKey(value: string | undefined) {
  return value?.startsWith('sb_publishable_') ?? false
}

export function isSupabaseSecretKey(value: string | undefined) {
  return value?.startsWith('sb_secret_') ?? false
}

const publicSupabaseKey = isSupabasePublishableKey(configuredPublishableKey) ? configuredPublishableKey : undefined

export const publicEnv = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  supabaseUrl: publicSupabaseUrl,
  supabaseKey: publicSupabaseKey,
}

export function adminReadiness() {
  const secretKey = process.env.SUPABASE_SECRET_KEY
  const required: Record<string, string | undefined> = {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SUPABASE_URL: publicSupabaseUrl,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: publicSupabaseKey,
    SUPABASE_SECRET_KEY: isSupabaseSecretKey(secretKey) ? secretKey : undefined,
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
