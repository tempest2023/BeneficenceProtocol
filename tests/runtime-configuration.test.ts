import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { isSupabasePublishableKey, isSupabaseSecretKey } from '@/lib/env'

describe('runtime configuration', () => {
  it('accepts current Supabase keys and rejects legacy JWT keys', () => {
    expect(isSupabasePublishableKey('sb_publishable_example')).toBe(true)
    expect(isSupabaseSecretKey('sb_secret_example')).toBe(true)
    expect(isSupabasePublishableKey('eyJhbGciOiJIUzI1NiJ9.legacy-anon')).toBe(false)
    expect(isSupabaseSecretKey('eyJhbGciOiJIUzI1NiJ9.legacy-service-role')).toBe(false)
  })

  it('keeps public forms enabled without launch environment flags', () => {
    const example = readFileSync('.env.example', 'utf8')
    const actions = readFileSync('lib/community/actions.ts', 'utf8')

    expect(example).not.toContain('NEXT_PUBLIC_COMMUNITY_FORMS_ENABLED')
    expect(example).not.toContain('COMMUNITY_LAUNCH_APPROVED')
    expect(actions).not.toContain('communityFormsOperational')
  })

  it('keeps operational URLs in Dashboard settings rather than environment variables', () => {
    const example = readFileSync('.env.example', 'utf8')
    const adminSettings = readFileSync('app/admin/(dashboard)/settings/page.tsx', 'utf8')

    expect(example).not.toContain('SCHEDULING_URL')
    expect(example).not.toContain('GITHUB_REPOSITORY_URL')
    expect(adminSettings).toContain('scheduling_url')
    expect(adminSettings).toContain('github_repository_url')
  })

  it('uses only current Supabase publishable and secret environment variables', () => {
    const example = readFileSync('.env.example', 'utf8')
    const environment = readFileSync('lib/env.ts', 'utf8')

    expect(example).toContain('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=')
    expect(example).toContain('SUPABASE_SECRET_KEY=')
    expect(example).not.toContain('NEXT_PUBLIC_SUPABASE_ANON_KEY')
    expect(example).not.toContain('SUPABASE_SERVICE_ROLE_KEY')
    expect(environment).not.toContain('NEXT_PUBLIC_SUPABASE_ANON_KEY')
    expect(environment).not.toContain('SUPABASE_SERVICE_ROLE_KEY')
  })

  it('uses database retention scheduling without public cron secrets or routes', () => {
    const example = readFileSync('.env.example', 'utf8')
    const migration = readFileSync('supabase/migrations/202608130001_simplify_runtime_configuration.sql', 'utf8')
    const agentProcessing = readFileSync('lib/agent/process.ts', 'utf8')

    expect(example).not.toContain('IP_HASH_SECRET')
    expect(example).not.toContain('CRON_SECRET')
    expect(existsSync('vercel.json')).toBe(false)
    expect(agentProcessing).not.toContain('processRetryableAgentJobs')
    expect(migration).toContain('beneficence-retention-maintenance')
    expect(migration).toContain('public.run_retention_maintenance()')
  })

  it('documents raw IP collection and seven-day retention', () => {
    const privacy = readFileSync('app/(site)/privacy/page.tsx', 'utf8')
    const migration = readFileSync('supabase/migrations/202608130001_simplify_runtime_configuration.sql', 'utf8')

    expect(privacy).toContain('IP address')
    expect(privacy).toContain('within seven days')
    expect(migration).toContain("identifier_type in ('ip','email_hash')")
  })
})
