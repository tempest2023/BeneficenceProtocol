import { createHash, randomBytes } from 'node:crypto'
import { isIP } from 'node:net'
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

export async function requestIpAddress() {
  const requestHeaders = await headers()
  const forwarded = requestHeaders.get('x-forwarded-for')?.split(',')[0]?.trim()
  const candidate = forwarded ?? requestHeaders.get('x-real-ip')?.trim() ?? 'unknown'
  return isIP(candidate) ? candidate : 'unknown'
}

export function safetyIdentifier(contactId: string) {
  return createHash('sha256').update(`openai:${contactId}`).digest('hex')
}

export function hashedRateIdentifier(scope: string, value: string) {
  return createHash('sha256').update(`${scope}:${value}`).digest('hex')
}

export function neutralizeCsvCell(value: unknown) {
  const stringValue = value == null ? '' : String(value)
  const safe = /^[=+\-@\t\r]/.test(stringValue) ? `'${stringValue}` : stringValue
  return `"${safe.replaceAll('"', '""')}"`
}

export function csvRow(values: unknown[]) {
  return values.map(neutralizeCsvCell).join(',')
}
