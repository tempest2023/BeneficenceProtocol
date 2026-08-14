import { describe, expect, it } from 'vitest'
import { csvRow, isGithubUsername, isPlausibleEmail, neutralizeCsvCell, normalizeEmail, normalizeGithubUsername, safeLocalPath, sanitizePostgrestSearch } from '@/lib/security'

describe('identity and export hardening', () => {
  it('normalizes deduplication identities', () => {
    expect(normalizeEmail(' Person@Example.ORG ')).toBe('person@example.org')
    expect(normalizeGithubUsername(' @SomePerson ')).toBe('someperson')
    expect(isPlausibleEmail('person@example.org')).toBe(true)
    expect(isPlausibleEmail('not-an-email')).toBe(false)
    expect(isGithubUsername('some-person')).toBe(true)
    expect(isGithubUsername('some--person')).toBe(false)
  })

  it('neutralizes spreadsheet formulas and quotes CSV fields', () => {
    expect(neutralizeCsvCell('=HYPERLINK("bad")')).toBe('"\'=HYPERLINK(""bad"")"')
    expect(csvRow(['normal', '+cmd', 'line,"quoted"'])).toBe('"normal","\'+cmd","line,""quoted"""')
  })

  it('removes PostgREST filter syntax while preserving international locations', () => {
    expect(sanitizePostgrestSearch('Tokyo,Japan).or(id.neq.null')).toBe('TokyoJapanoridneqnull')
    expect(sanitizePostgrestSearch('北京市 海淀区')).toBe('北京市 海淀区')
  })

  it('allows only same-origin callback paths', () => {
    expect(safeLocalPath('/admin/applications', '/admin')).toBe('/admin/applications')
    expect(safeLocalPath('//example.org', '/admin')).toBe('/admin')
    expect(safeLocalPath('/\\example.org', '/admin')).toBe('/admin')
  })
})
