import { expect, test } from '@playwright/test'

test('preserves the institutional Mission-first home and adds Community', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('AI Agents should enlarge human possibility')
  await expect(page.getByLabel('Primary navigation').getByRole('link', { name: 'Community', exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'A public network of many active participants.' })).toBeVisible()
  await expect(page.getByText('Community members — all time')).toHaveCount(0)
  await expect(page.getByText('Donation intake is not active.')).toBeVisible()
})

test('Community consolidates Learn, Gather, and People without exposing an empty count', async ({ page }) => {
  await page.goto('/community')
  await expect(page.getByRole('heading', { level: 1, name: 'A community of many active participants.' })).toBeVisible()
  await expect(page.getByText('Learning resources are being prepared.')).toBeVisible()
  await expect(page.getByText('Events are being planned.')).toBeVisible()
  await expect(page.getByText('Profiles are being prepared.')).toBeVisible()
  await expect(page.locator('.member-measure')).toHaveCount(0)
  await expect(page.locator('.community-hero__figure img')).toBeVisible()
})

test('retired empty pages preserve their URLs as Community section redirects', async ({ page }) => {
  await page.goto('/community/learn')
  await expect(page).toHaveURL(/\/community#program$/)
  await expect(page.getByText('Learning resources are being prepared.')).toBeVisible()
  await page.goto('/community/gather')
  await expect(page).toHaveURL(/\/community#program$/)
  await expect(page.getByText('Events are being planned.')).toBeVisible()
  await page.goto('/community/people')
  await expect(page).toHaveURL(/\/community#people$/)
  await expect(page.getByText('Profiles are being prepared.')).toBeVisible()
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
  for (const name of ['Overview', 'Community program', 'People', 'Stay connected', 'Contribute']) {
    await expect(communityNav.getByRole('link', { name, exact: true })).toBeVisible()
  }
  for (const name of ['Apply', 'Submit resource', 'Code of Conduct']) {
    await expect(communityNav.getByRole('link', { name, exact: true })).toHaveCount(0)
  }
  await expect(communityNav.getByRole('link', { name: 'Contribute', exact: true })).toHaveAttribute('aria-current', 'page')
  await expect(page.locator('.community-subnav')).toHaveCount(0)
})

test('Community section links update selection and leave headings below the sticky header', async ({ page }) => {
  await page.goto('/community')
  const communityNav = page.getByRole('navigation', { name: 'Community navigation' })
  const stickyHeader = page.locator('.site-header')

  for (const item of [
    { name: 'Community program', hash: '#program', heading: 'Learn and gather in public.' },
    { name: 'People', hash: '#people', heading: 'People behind the work.' },
    { name: 'Stay connected', hash: '#register', heading: 'Register for community updates.' },
  ]) {
    const link = communityNav.getByRole('link', { name: item.name, exact: true })
    await link.click()
    await expect(page).toHaveURL(new RegExp(`${item.hash}$`))
    await expect(link).toHaveAttribute('aria-current', 'location')

    const headerBox = await stickyHeader.boundingBox()
    const heading = page.getByRole('heading', { name: item.heading })
    await expect(heading).toBeInViewport()
    const headingBox = await heading.boundingBox()
    expect(headerBox).not.toBeNull()
    expect(headingBox).not.toBeNull()
    expect(headingBox!.y).toBeGreaterThan(headerBox!.height)
  }
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
