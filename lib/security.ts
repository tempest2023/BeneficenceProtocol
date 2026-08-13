import { createHmac, createHash, randomBytes } from 'node:crypto'
import { headers } from 'next/headers'

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export function normalizeGithubUsername(username: string) {
  return username.trim().replace(/^@/, '').toLowerCase()
}

export function isPlausibleEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 320
}

export function isGithubUsername(username: string) {
  return /^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(username) && !username.includes('--')
}

export function sanitizePostgrestSearch(value: string) {
  return value.normalize('NFKC').replace(/[^\p{L}\p{N}\s-]/gu, '').trim().slice(0, 100)
}

export function safeLocalPath(value: string | null, fallback = '/') {
  return value?.startsWith('/') && !value.startsWith('//') && !value.includes('\\') ? value : fallback
}

export function createVerificationToken() {
  const token = randomBytes(32).toString('base64url')
  return { token, hash: hashToken(token) }
}

export function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

export async function requestIpHash(form: string, windowKey: string) {
  const requestHeaders = await headers()
  const forwarded = requestHeaders.get('x-forwarded-for')?.split(',')[0]?.trim()
  const ip = requestHeaders.get('x-real-ip') ?? forwarded ?? 'unknown'
  const secret = process.env.IP_HASH_SECRET
  if (!secret) throw new Error('Rate-limit protection is not configured.')
  return createHmac('sha256', secret).update(`${form}:${windowKey}:${ip}`).digest('hex')
}

export function safetyIdentifier(contactId: string) {
  const secret = process.env.IP_HASH_SECRET
  if (!secret) throw new Error('Safety identifier protection is not configured.')
  return createHmac('sha256', secret).update(`openai:${contactId}`).digest('hex')
}

export function protectedRateKey(scope: string, value: string) {
  const secret = process.env.IP_HASH_SECRET
  if (!secret) throw new Error('Rate-limit protection is not configured.')
  return createHmac('sha256', secret).update(`${scope}:${value}`).digest('hex')
}

export function neutralizeCsvCell(value: unknown) {
  const stringValue = value == null ? '' : String(value)
  const safe = /^[=+\-@\t\r]/.test(stringValue) ? `'${stringValue}` : stringValue
  return `"${safe.replaceAll('"', '""')}"`
}

export function csvRow(values: unknown[]) {
  return values.map(neutralizeCsvCell).join(',')
}
