import { expect, test } from '@playwright/test'

test('home page loads successfully', async ({ page }) => {
  // Navigate to the home page
  await page.goto('/')

  // Check that the page loads by verifying the Next.js logo is present
  await expect(page.locator('img[alt="Next.js logo"]')).toBeVisible()

  // Verify the page title
  await expect(page).toHaveTitle(/GitHub Copilot Snake/)

  // Check for the main content elements
  await expect(page.locator('text=Get started by editing')).toBeVisible()

  // Verify the "View Blocks" link is present
  await expect(
    page.locator('a[href="/blocks"]', { hasText: 'View Blocks' })
  ).toBeVisible()

  // Check that the theme chooser is present in the header
  await expect(page.locator('header')).toBeVisible()
})
