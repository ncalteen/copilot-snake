import { expect, test } from '@playwright/test'

test('home page loads successfully', async ({ page }) => {
  // Navigate to the home page
  await page.goto('/')

  // Check that the Snake game title is present instead of Next.js logo
  await expect(page.locator('h1:has-text("🐍 Snake Game")')).toBeVisible()
})
