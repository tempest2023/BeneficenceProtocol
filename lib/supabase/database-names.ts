import type { SupabaseClient } from '@supabase/supabase-js'

export type DatabaseEnvironment = 'dev' | 'prod'

function isLocalSiteUrl(value: string | undefined) {
  if (!value) return false
  try {
    return ['localhost', '127.0.0.1', '::1'].includes(new URL(value).hostname)
  } catch {
    return false
  }
}

export function databaseEnvironment(): DatabaseEnvironment {
  const configuredEnvironment = process.env.DATABASE_ENVIRONMENT?.trim().toLowerCase()
  if (configuredEnvironment === 'dev' || configuredEnvironment === 'prod') return configuredEnvironment
  if (configuredEnvironment) return 'dev'

  if (process.env.VERCEL_ENV) return process.env.VERCEL_ENV === 'production' ? 'prod' : 'dev'
  if (process.env.NODE_ENV !== 'production') return 'dev'
  return isLocalSiteUrl(process.env.NEXT_PUBLIC_SITE_URL) ? 'dev' : 'prod'
}

export function databaseTable(table: string): string {
  return `${databaseEnvironment()}_${table}`
}

export function databaseFunction(name: string): string {
  return `${databaseEnvironment()}_${name}`
}

export function databaseRelation<Alias extends string, Table extends string = Alias>(
  alias: Alias,
  table: Table = alias as unknown as Table,
): `${Alias}:dev_${Table}` | `${Alias}:prod_${Table}` {
  return `${alias}:${databaseTable(table)}` as `${Alias}:dev_${Table}` | `${Alias}:prod_${Table}`
}

/**
 * Scope every direct table and RPC call to the current environment. Auth and
 * Storage remain project-wide Supabase services and pass through unchanged.
 */
export function scopeDatabaseClient<T extends SupabaseClient>(client: T): T {
  return new Proxy(client, {
    get(target, property, receiver) {
      if (property === 'from') {
        return (table: string) => target.from(databaseTable(table))
      }
      if (property === 'rpc') {
        return (name: string, args?: Record<string, unknown>, options?: { head?: boolean; get?: boolean; count?: 'exact' | 'planned' | 'estimated' }) =>
          target.rpc(databaseFunction(name), args, options)
      }

      const value = Reflect.get(target, property, receiver)
      return typeof value === 'function' ? value.bind(target) : value
    },
  }) as T
}
