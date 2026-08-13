import { expect, test } from '@playwright/test'

test('preserves the institutional Mission-first home and adds Community', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('AI Agents should enlarge human possibility')
  await expect(page.getByLabel('Primary navigation').getByRole('link', { name: 'Community', exact: true })).toBeVisible()
  await expect(page.getByText('Community members — all time')).toBeVisible()
  await expect(page.getByText('Donation intake is not active.')).toBeVisible()
})

test('Learn and Gather provide useful honest empty states', async ({ page }) => {
  await page.goto('/community/learn')
  await expect(page.getByRole('heading', { name: 'The shelves are intentionally empty—for now.' })).toBeVisible()
  await page.goto('/community/gather')
  await expect(page.getByRole('heading', { name: 'The calendar is open, not forgotten.' })).toBeVisible()
})

test('Contributor application sets a low-pressure, non-interview expectation', async ({ page }) => {
  await page.goto('/community/contribute/apply')
  await expect(page.getByText('Most public resources and events are open without becoming a Contributor.')).toBeVisible()
  await expect(page.getByText('The 1v1 is a conversation—not a traditional interview.')).toBeVisible()
  await expect(page.getByText('no more than 30 minutes')).toBeVisible()
  await expect(page.getByText(/monthly/i)).toHaveCount(0)
})

test('public contribution path warns that GitHub is public', async ({ page }) => {
  await page.goto('/community/contribute')
  await expect(page.getByText('GitHub submissions are public.')).toBeVisible()
  await expect(page.getByText(/must not include private contact or address information/i)).toBeVisible()
  await expect(page.getByRole('link', { name: /Event proposal/ })).toBeVisible()
  await expect(page.getByRole('link', { name: /Campus volunteer/ })).toBeVisible()
  await expect(page.getByRole('link', { name: /Technical contribution/ })).toBeVisible()
})

test('all public routes expose a keyboard skip link', async ({ page }) => {
  await page.goto('/community')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused()
})
