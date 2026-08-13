import { expect, test } from '@playwright/test'

test('preserves the institutional Mission-first home and adds Community', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('AI Agents should enlarge human possibility')
  await expect(page.getByLabel('Primary navigation').getByRole('link', { name: 'Community', exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'A public network of many active participants.' })).toBeVisible()
  await expect(page.getByText('Community members — all time')).toHaveCount(0)
  await expect(page.getByText('Donation intake is not active.')).toBeVisible()
})

test('Landing, Mission, and Community share page-title and lead typography', async ({ page }) => {
  const routes = [
    { path: '/', title: '.home-hero h1', lead: '.home-hero__mission', sectionTitle: '.position-grid h2', body: '.community-heading > div > p' },
    { path: '/mission', title: '.article-hero h1', lead: '.article-hero__lead', sectionTitle: '.article-copy h2', body: '.article-copy section > p:not(.article-kicker)' },
    { path: '/community', title: '.community-hero h1', lead: '.community-hero__lead', sectionTitle: '.community-heading h2', body: '.community-role-list p' },
  ]

  for (const viewport of [{ width: 1440, height: 640 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport)
    const samples = []
    for (const route of routes) {
      await page.goto(route.path)
      await Promise.all([
        page.locator(route.title).waitFor(),
        page.locator(route.lead).waitFor(),
        page.locator(route.sectionTitle).first().waitFor(),
        page.locator(route.body).first().waitFor(),
      ])
      samples.push(await page.evaluate(({ titleSelector, leadSelector, sectionTitleSelector, bodySelector }) => {
        const title = getComputedStyle(document.querySelector(titleSelector)!)
        const lead = getComputedStyle(document.querySelector(leadSelector)!)
        const sectionTitle = getComputedStyle(document.querySelector(sectionTitleSelector)!)
        const body = getComputedStyle(document.querySelector(bodySelector)!)
        return {
          title: [title.fontSize, title.fontFamily, title.fontWeight, title.lineHeight, title.letterSpacing],
          lead: [lead.fontSize, lead.fontFamily, lead.fontWeight, lead.lineHeight],
          sectionTitle: [sectionTitle.fontSize, sectionTitle.fontFamily, sectionTitle.fontWeight, sectionTitle.lineHeight, sectionTitle.letterSpacing],
          body: [body.fontSize, body.fontFamily, body.fontWeight],
        }
      }, { titleSelector: route.title, leadSelector: route.lead, sectionTitleSelector: route.sectionTitle, bodySelector: route.body }))
    }

    expect(samples[1]).toEqual(samples[0])
    expect(samples[2]).toEqual(samples[0])
    if (viewport.height === 640) expect(parseFloat(samples[0].title[0])).toBeCloseTo(54.4, 1)
  }
})

test('Community consolidates Learn, Gather, and People without exposing an empty count', async ({ page }) => {
  await page.goto('/community')
  await expect(page.getByRole('heading', { level: 1, name: 'A community of many active participants.' })).toBeVisible()
  await expect(page.getByText(/being prepared|being planned|not open yet|check back soon/i)).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'Free AI Agent learning.' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Online and local events.' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'People behind the work.' })).toBeVisible()
  await expect(page.locator('.member-measure')).toHaveCount(0)
  await expect(page.locator('.community-hero__figure img')).toBeVisible()
})

test('Community uses a dedicated landscape illustration instead of the Governance image', async ({ page }) => {
  await page.goto('/community')
  const communityImage = page.locator('.community-hero__figure img')
  await expect(communityImage).toHaveAttribute('src', /community-convergence/)
  const communitySource = await communityImage.getAttribute('src')
  const dimensions = await communityImage.evaluate((image: HTMLImageElement) => ({ width: image.naturalWidth, height: image.naturalHeight }))
  expect(dimensions.width / dimensions.height).toBeCloseTo(5 / 3, 1)

  await page.goto('/governance')
  await expect(page.locator('.article-hero__figure img')).not.toHaveAttribute('src', communitySource!)
})

test('retired empty pages preserve their URLs as Community section redirects', async ({ page }) => {
  await page.goto('/community/learn')
  await expect(page).toHaveURL(/\/community#program$/)
  await expect(page.getByRole('heading', { name: 'Free AI Agent learning.' })).toBeVisible()
  await page.goto('/community/gather')
  await expect(page).toHaveURL(/\/community#program$/)
  await expect(page.getByRole('heading', { name: 'Online and local events.' })).toBeVisible()
  await page.goto('/community/people')
  await expect(page).toHaveURL(/\/community#people$/)
  await expect(page.getByRole('heading', { name: 'People behind the work.' })).toBeVisible()
})

test('Community registration is compact and reports backend unavailability after submission', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/community#register')

  const form = page.locator('.community-form--participant')
  await expect(form).toBeVisible()
  await expect(form.getByText(/not open|not ready|check back soon/i)).toHaveCount(0)
  await expect(form.getByRole('button', { name: 'Register for community updates' })).toBeEnabled()

  const formBox = await form.boundingBox()
  expect(formBox).not.toBeNull()
  expect(formBox!.width).toBeLessThanOrEqual(1088)
  expect(formBox!.height).toBeLessThanOrEqual(650)

  await form.getByRole('button', { name: 'Register for community updates' }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('heading', { name: 'We couldn’t submit the form.' })).toBeVisible()
  await expect(dialog).toContainText('Your information was not submitted.')
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
  for (const name of ['Overview', 'Program', 'People', 'Connect', 'Contribute']) {
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
    { name: 'Program', hash: '#program', heading: 'Learn and gather in public.' },
    { name: 'People', hash: '#people', heading: 'People behind the work.' },
    { name: 'Connect', hash: '#register', heading: 'Register for community updates.' },
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
