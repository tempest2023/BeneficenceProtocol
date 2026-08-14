import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const forms = ['event-proposal.yml', 'campus-volunteer.yml', 'technical-contribution.yml']

describe('GitHub Issue Forms', () => {
  for (const filename of forms) {
    it(`${filename} declares a complete form using an existing label`, () => {
      const form = readFileSync(resolve('.github/ISSUE_TEMPLATE', filename), 'utf8')
      expect(form).toMatch(/^name: .+/m)
      expect(form).toMatch(/^description: .+/m)
      expect(form).toMatch(/^title: .+/m)
      expect(form).toContain('labels: ["enhancement"]')
      expect(form).toContain('assignees: []')
      expect(form).toMatch(/^body:\s*$/m)
      expect(form).toContain('required: true')
    })
  }
})
