import { expect, type Page } from '@playwright/test'

export const directAdminEmail = !process.env.PLAYWRIGHT_BASE_URL && !process.env.RESEND_API_KEY?.trim()
  ? process.env.ADMIN_EMAILS?.split(',').map((email) => email.trim()).find(Boolean)
  : undefined

export async function signInDevelopmentAdmin(page: Page, email: string) {
  await page.goto('/admin/login')
  await page.getByRole('textbox', { name: 'Email' }).fill(email)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page).toHaveURL(/\/admin$/)
}
