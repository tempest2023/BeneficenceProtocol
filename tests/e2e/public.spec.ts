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
  await expect(page.getByRole('heading', { name: 'Learning resources are being prepared.' })).toBeVisible()
  await page.goto('/community/gather')
  await expect(page.getByRole('heading', { name: 'Events are being planned.' })).toBeVisible()
})

test('Contributor application sets a low-pressure, non-interview expectation', async ({ page }) => {
  await page.goto('/community/contribute/apply')
  await expect(page.getByText(/Most public resources and events are open to everyone/)).toBeVisible()
  await expect(page.getByText('A conversation, not an interview.')).toBeVisible()
  await expect(page.getByText(/up to 30 minutes/)).toBeVisible()
  await expect(page.getByRole('textbox', { name: /^Name/ })).toBeVisible()
  await expect(page.getByRole('textbox', { name: /^Email/ })).toBeVisible()
  await expect(page.getByText(/monthly/i)).toHaveCount(0)
})

test('Community pages use the header submenu without an in-page duplicate', async ({ page }) => {
  await page.goto('/community/contribute/apply')
  const communityNav = page.getByRole('navigation', { name: 'Community navigation' })
  for (const name of ['Overview', 'People', 'Learn', 'Gather', 'Contribute', 'Apply', 'Submit resource', 'Code of Conduct']) {
    await expect(communityNav.getByRole('link', { name, exact: true })).toBeVisible()
  }
  await expect(communityNav.getByRole('link', { name: 'Apply', exact: true })).toHaveAttribute('aria-current', 'page')
  await expect(communityNav.getByRole('link', { name: 'Apply', exact: true })).toBeInViewport()
  await expect(page.locator('.community-subnav')).toHaveCount(0)
})

test('public contribution path warns that GitHub is public', async ({ page }) => {
  await page.goto('/community/contribute')
  await expect(page.getByText('GitHub submissions are public.')).toBeVisible()
  await expect(page.getByText(/Do not include private contact details, addresses/i)).toBeVisible()
  await expect(page.getByRole('link', { name: /Event proposal/ })).toHaveAttribute('href', /template=event-proposal\.yml/)
  await expect(page.getByRole('link', { name: /Campus volunteer/ })).toBeVisible()
  await expect(page.getByRole('link', { name: /Technical contribution/ })).toBeVisible()
})

test('all public routes expose a keyboard skip link', async ({ page }) => {
  await page.goto('/community')
  await page.getByRole('navigation', { name: 'Community navigation' }).waitFor()
  await page.waitForTimeout(300)
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused()
})
