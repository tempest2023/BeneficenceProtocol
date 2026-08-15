import { defineConfig, devices } from '@playwright/test'
import { existsSync } from 'node:fs'

if (existsSync('.env.local')) process.loadEnvFile('.env.local')

const dataTestMode = process.env.PLAYWRIGHT_E2E_DATA === '1'
const port = process.env.PLAYWRIGHT_PORT ?? '3000'
const localBaseUrl = `http://127.0.0.1:${port}`

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: !dataTestMode,
  workers: dataTestMode ? 1 : undefined,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? localBaseUrl,
    trace: 'on-first-retry',
  },
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: `npm run dev -- --port ${port}`,
        url: localBaseUrl,
        reuseExistingServer: !dataTestMode,
      },
  projects: dataTestMode
    ? [{ name: 'data-chromium', testMatch: /data-submissions\.spec\.ts/, use: { ...devices['Desktop Chrome'] } }]
    : [
        { name: 'chromium', testIgnore: /data-submissions\.spec\.ts/, use: { ...devices['Desktop Chrome'] } },
        { name: 'mobile', testIgnore: /data-submissions\.spec\.ts/, use: { ...devices['iPhone 13'], browserName: 'chromium' } },
      ],
})
