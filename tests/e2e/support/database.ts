import { expect } from '@playwright/test'

function requiredEnvironment(name: string) {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is required for database-writing E2E tests.`)
  return value
}

const restUrl = `${requiredEnvironment('NEXT_PUBLIC_SUPABASE_URL')}/rest/v1`
const secretKey = requiredEnvironment('SUPABASE_SECRET_KEY')
const publishableKey = requiredEnvironment('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY')

async function databaseRequest(path: string, init: RequestInit = {}, apiKey = secretKey) {
  const response = await fetch(`${restUrl}/${path}`, {
    ...init,
    headers: {
      apikey: apiKey,
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...init.headers,
    },
  })
  const body = await response.text()
  if (!response.ok) throw new Error(`Database request ${path} failed (${response.status}): ${body}`)
  return body ? JSON.parse(body) : null
}

export const e2eRunId = requiredEnvironment('E2E_RUN_ID')

export function e2eEmail(label: string) {
  return `${label}-${e2eRunId}@example.test`
}

export async function memberCount() {
  const data = await databaseRequest('rpc/dev_get_public_community_metrics', { method: 'POST', body: '{}' }, publishableKey)
  expect(data).toHaveLength(1)
  return Number(data[0].all_time)
}

export async function oneRecord(table: string, column: string, value: string) {
  const query = new URLSearchParams({ select: '*', [column]: `eq.${value}` })
  const data = await databaseRequest(`${table}?${query}`)
  expect(data).toHaveLength(1)
  return data[0]
}

export async function recordCount(table: string, column: string, value: string) {
  const query = new URLSearchParams({ select: 'id', [column]: `eq.${value}` })
  const data = await databaseRequest(`${table}?${query}`)
  return data.length
}

export async function updateRecord(table: string, id: string, values: Record<string, unknown>) {
  const query = new URLSearchParams({ id: `eq.${id}` })
  const data = await databaseRequest(`${table}?${query}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(values),
  })
  expect(data).toHaveLength(1)
  return data[0]
}
