import { expect, type Locator, type Page } from '@playwright/test'

export const communityNavigationLabels = ['Overview', 'Program', 'People', 'Connect', 'Contribute'] as const

export function communityNavigation(page: Page) {
  return page.getByRole('navigation', { name: 'Community navigation' })
}

export async function selectInternationalLocation(form: Locator, country = 'Canada', cityOrRegion = 'Toronto') {
  const internationalSwitch = form.getByRole('switch', { name: 'Outside the United States' })
  if (await internationalSwitch.getAttribute('aria-checked') === 'false') await internationalSwitch.click()
  await form.getByLabel(/^Country/).selectOption({ label: country })
  await form.getByLabel(/^City or region/).fill(cityOrRegion)
}

export async function selectUnitedStatesLocation(form: Locator, state = 'CA', city = 'San Francisco') {
  const internationalSwitch = form.getByRole('switch', { name: 'Outside the United States' })
  if (await internationalSwitch.getAttribute('aria-checked') === 'true') await internationalSwitch.click()
  await form.getByLabel(/^State/).selectOption(state)
  await form.getByLabel(/^City/).fill(city)
}

export async function expectHeadingBelowStickyHeader(page: Page, headingName: string) {
  const header = page.locator('.site-header')
  const heading = page.getByRole('heading', { name: headingName })
  await expect(heading).toBeInViewport()

  const [headerBox, headingBox] = await Promise.all([header.boundingBox(), heading.boundingBox()])
  expect(headerBox).not.toBeNull()
  expect(headingBox).not.toBeNull()
  expect(headingBox!.y).toBeGreaterThan(headerBox!.height)
}
