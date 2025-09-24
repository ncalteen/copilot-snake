import { expect, test } from '@playwright/test'

test('home page loads successfully', async ({ page }) => {
  // Navigate to the home page
  await page.goto('/')

  // Check that the page loads by verifying the Next.js logo is present
  await expect(page.locator('img[alt="Next.js logo"]')).toBeVisible()
})
