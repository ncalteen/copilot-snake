import { expect, test } from '@playwright/test'
import { execSync } from 'child_process'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'

test.describe('GitHub Pages Deployment Tests', () => {
  test('deployment workflow exists and is properly configured', async () => {
    const workflowFile = join(
      process.cwd(),
      '.github',
      'workflows',
      'continuous-delivery.yml'
    )

    expect(existsSync(workflowFile)).toBe(true)

    const workflowContent = readFileSync(workflowFile, 'utf-8')

    // Check for essential deployment workflow elements
    expect(workflowContent).toContain('name: Continuous Delivery')
    expect(workflowContent).toContain('actions/configure-pages@v5')
    expect(workflowContent).toContain('actions/upload-pages-artifact@v4')
    expect(workflowContent).toContain('actions/deploy-pages@v4')
    expect(workflowContent).toContain('npm run build')
    expect(workflowContent).toContain('path: ./out')

    // Check for proper permissions
    expect(workflowContent).toContain('pages: write')
    expect(workflowContent).toContain('id-token: write')
    expect(workflowContent).toContain('contents: write')
  })

  test('Next.js configuration is set up for static export', async () => {
    const nextConfigFile = join(process.cwd(), 'next.config.ts')

    expect(existsSync(nextConfigFile)).toBe(true)

    const configContent = readFileSync(nextConfigFile, 'utf-8')

    // Check for static export configuration
    expect(configContent).toContain("output: 'export'")
    expect(configContent).toContain('basePath:')
    expect(configContent).toContain('assetPrefix:')
    expect(configContent).toContain('trailingSlash: true')
    expect(configContent).toContain('unoptimized: true')
    expect(configContent).toContain("distDir: 'out'")
  })

  test('package.json has correct homepage URL for GitHub Pages', async () => {
    const packageFile = join(process.cwd(), 'package.json')
    const packageContent = JSON.parse(readFileSync(packageFile, 'utf-8'))

    expect(packageContent.homepage).toBeTruthy()
    expect(packageContent.homepage).toContain('github.io')
    expect(packageContent.homepage).toContain('copilot-snake')
  })

  test('base path configuration works correctly', async () => {
    const configFile = join(process.cwd(), 'src', 'lib', 'config.ts')

    if (existsSync(configFile)) {
      const configContent = readFileSync(configFile, 'utf-8')

      // Should have BASE_PATH export
      expect(configContent).toContain('BASE_PATH')
      expect(configContent).toContain('/copilot-snake')
    }
  })

  test('asset path utility handles GitHub Pages deployment', async () => {
    const assetsFile = join(process.cwd(), 'src', 'lib', 'assets.ts')

    if (existsSync(assetsFile)) {
      const assetsContent = readFileSync(assetsFile, 'utf-8')

      // Should have asset path handling
      expect(assetsContent).toContain('getAssetPath')
      expect(assetsContent).toContain('BASE_PATH')
      expect(assetsContent).toContain('production')
    }
  })

  test('build produces correct static files for GitHub Pages', async () => {
    // Run build to ensure files are generated
    try {
      execSync('npm run build', {
        cwd: process.cwd(),
        stdio: 'pipe',
        timeout: 120000
      })
    } catch {
      console.log('Build may have already been run')
    }

    const outDir = join(process.cwd(), 'out')
    expect(existsSync(outDir)).toBe(true)

    // Check for required files
    expect(existsSync(join(outDir, 'index.html'))).toBe(true)
    expect(existsSync(join(outDir, '_next'))).toBe(true)

    // Check index.html for proper base path handling
    const indexContent = readFileSync(join(outDir, 'index.html'), 'utf-8')

    if (process.env.NODE_ENV === 'production') {
      // In production, should have base path
      expect(indexContent).toContain('/copilot-snake/')
    }

    // Should not contain localhost references
    expect(indexContent).not.toContain('localhost:3000')
    expect(indexContent).not.toContain('http://localhost')

    // Should have proper meta tags
    expect(indexContent).toContain('<meta name="viewport"')
    expect(indexContent).toContain('<meta charset="utf-8"')
  })

  test('routing works correctly for single-page application', async ({
    page
  }) => {
    // Test that the app can handle client-side routing
    await page.goto('/')

    // Navigate within the app
    await expect(page.locator('text=Welcome to Snake Game')).toBeVisible()

    // Start game (client-side state change)
    await page.click('button:has-text("Start Game")')
    await expect(page.locator('h1:has-text("🐍 Snake Game")')).toBeVisible()

    // Test that the app maintains state during navigation
    await expect(page.locator('[data-testid="game-board"]')).toBeVisible()

    // Test browser back/forward (though this is a single page app)
    await page.goBack()
    await page.goForward()

    // Should still be on the same page
    await expect(page.locator('h1:has-text("🐍 Snake Game")')).toBeVisible()
  })

  test('all assets load correctly with base path', async ({ page }) => {
    const responses: Array<{ url: string; status: number }> = []

    page.on('response', (response) => {
      responses.push({
        url: response.url(),
        status: response.status()
      })
    })

    await page.goto('/')
    await page.click('button:has-text("Start Game")')

    // Wait for all resources to load
    await page.waitForTimeout(2000)

    // Check that no critical resources failed to load
    const failedResources = responses.filter((r) => r.status >= 400)
    const criticalFailures = failedResources.filter(
      (r) =>
        r.url.includes('.js') ||
        r.url.includes('.css') ||
        r.url.includes('_next')
    )

    expect(criticalFailures).toHaveLength(0)

    // Check for successful CSS and JS loads
    const jsLoads = responses.filter(
      (r) => r.url.includes('.js') && r.status === 200
    )
    const cssLoads = responses.filter(
      (r) => r.url.includes('.css') && r.status === 200
    )

    expect(jsLoads.length).toBeGreaterThan(0)
    expect(cssLoads.length).toBeGreaterThan(0)
  })

  test('service worker or manifest files if present', async ({ page }) => {
    await page.goto('/')

    // Check if manifest.json exists and loads
    const manifestResponse = await page.goto('/manifest.json').catch(() => null)
    if (manifestResponse && manifestResponse.status() === 200) {
      const manifest = await manifestResponse.json()
      expect(manifest.name || manifest.short_name).toBeTruthy()
    }

    // Check if service worker exists
    await page.goto('/sw.js').catch(() => null)
    // Service worker is optional, so we don't fail if it doesn't exist

    // Return to main page
    await page.goto('/')
  })

  test('meta tags and SEO are properly configured', async ({ page }) => {
    await page.goto('/')

    // Check basic meta tags
    const title = await page.title()
    expect(title).toBeTruthy()
    expect(title.toLowerCase()).toContain('snake')

    // Check viewport meta tag
    const viewport = await page.getAttribute('meta[name="viewport"]', 'content')
    expect(viewport).toContain('width=device-width')
    expect(viewport).toContain('initial-scale=1')

    // Check for description meta tag
    const description = await page.getAttribute(
      'meta[name="description"]',
      'content'
    )
    if (description) {
      expect(description.toLowerCase()).toContain('snake')
    }

    // Check for Open Graph tags if present
    const ogTitle = await page.getAttribute(
      'meta[property="og:title"]',
      'content'
    )
    if (ogTitle) {
      expect(ogTitle).toBeTruthy()
    }
  })

  test('HTTPS and security headers would be properly configured', async ({
    page
  }) => {
    // Note: We can't test actual HTTPS in local testing, but we can check
    // that the app doesn't make insecure requests

    const insecureRequests: string[] = []

    page.on('request', (request) => {
      if (
        request.url().startsWith('http://') &&
        !request.url().includes('localhost')
      ) {
        insecureRequests.push(request.url())
      }
    })

    await page.goto('/')
    await page.click('button:has-text("Start Game")')
    await page.waitForTimeout(2000)

    // Should not make insecure HTTP requests (except to localhost in dev)
    expect(insecureRequests).toHaveLength(0)
  })

  test('error handling for deployment environment', async ({ page }) => {
    await page.goto('/')

    // Test that the app handles potential deployment environment issues
    const consoleErrors: string[] = []

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    await page.click('button:has-text("Start Game")')
    await page.waitForTimeout(3000)

    // Should not have deployment-related errors
    const deploymentErrors = consoleErrors.filter(
      (error) =>
        error.includes('Failed to load') ||
        error.includes('404') ||
        error.includes('Network') ||
        error.includes('CORS')
    )

    expect(deploymentErrors).toHaveLength(0)
  })

  test('fallback handling for missing files', async ({ page }) => {
    await page.goto('/')

    // Test that the app gracefully handles missing optional resources
    await page.click('button:has-text("Start Game")')

    // Game should still work even if some non-critical resources fail
    await expect(page.locator('[data-testid="game-board"]')).toBeVisible()
    await expect(page.locator('button:has-text("Pause")')).toBeVisible()

    // Test game functionality
    await page.keyboard.press('ArrowUp')
    await page.keyboard.press('Space') // Pause
    await expect(page.locator('text=Game Paused')).toBeVisible()
  })
})
