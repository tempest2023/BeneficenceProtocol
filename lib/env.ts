const publicSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const publicSupabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const publicEnv = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  supabaseUrl: publicSupabaseUrl,
  supabaseKey: publicSupabaseKey,
  formsFlag: process.env.NEXT_PUBLIC_COMMUNITY_FORMS_ENABLED === 'true',
}

export function deploymentReadiness() {
  const required: Record<string, string | undefined> = {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SUPABASE_URL: publicSupabaseUrl,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: publicSupabaseKey,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
    ADMIN_EMAILS: process.env.ADMIN_EMAILS,
    SCHEDULING_URL: process.env.SCHEDULING_URL,
    GITHUB_REPOSITORY_URL: process.env.GITHUB_REPOSITORY_URL,
    MONITORED_CONTACT_EMAIL: process.env.MONITORED_CONTACT_EMAIL,
    IP_HASH_SECRET: process.env.IP_HASH_SECRET,
    CRON_SECRET: process.env.CRON_SECRET,
    COMMUNITY_LAUNCH_APPROVED: process.env.COMMUNITY_LAUNCH_APPROVED === 'true' ? 'true' : undefined,
  }

  return {
    ready: Object.values(required).every(Boolean),
    missing: Object.entries(required).filter(([, value]) => !value).map(([key]) => key),
  }
}

export function communityFormsOperational() {
  return publicEnv.formsFlag && deploymentReadiness().ready
}

export function adminEmails() {
  return new Set((process.env.ADMIN_EMAILS ?? '').split(',').map((email) => email.trim().toLowerCase()).filter(Boolean))
}
