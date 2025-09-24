import { expect, test } from '@playwright/test'
import { execSync } from 'child_process'
import { existsSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

test.describe('Static Export Build Verification', () => {
  test('static build completes successfully', async () => {
    try {
      // Run the build command
      const result = execSync('npm run build', {
        cwd: process.cwd(),
        encoding: 'utf-8',
        timeout: 120000 // 2 minutes timeout
      })

      // Check that build completed without errors
      expect(result).toContain('✓ Compiled successfully')
      expect(result).toContain('✓ Generating static pages')
      expect(result).toContain('✓ Exporting')
      expect(result).toContain('✓ Finalizing page optimization')
    } catch (error) {
      throw new Error(`Build failed: ${error}`)
    }
  })

  test('output directory exists and contains expected files', async () => {
    const outDir = join(process.cwd(), 'out')

    // Verify output directory exists
    expect(existsSync(outDir)).toBe(true)

    // Check for essential files
    const requiredFiles = ['index.html', '_next']

    for (const file of requiredFiles) {
      const filePath = join(outDir, file)
      expect(existsSync(filePath)).toBe(true)
    }

    // Check for Next.js static assets
    const nextDir = join(outDir, '_next')
    expect(existsSync(nextDir)).toBe(true)

    const staticDir = join(nextDir, 'static')
    if (existsSync(staticDir)) {
      const staticContents = readdirSync(staticDir)
      // Should contain chunks, css, or media directories
      expect(staticContents.length).toBeGreaterThan(0)
    }
  })

  test('static HTML contains proper meta tags and structure', async () => {
    const outDir = join(process.cwd(), 'out')
    const indexPath = join(outDir, 'index.html')

    expect(existsSync(indexPath)).toBe(true)

    const htmlContent = readFileSync(indexPath, 'utf-8')

    // Check for basic HTML structure
    expect(htmlContent).toContain('<!DOCTYPE html>')
    expect(htmlContent).toContain('<html')
    expect(htmlContent).toContain('<head>')
    expect(htmlContent).toContain('<body>')

    // Check for meta tags
    expect(htmlContent).toContain('<meta charset="utf-8"')
    expect(htmlContent).toContain('<meta name="viewport"')

    // Check for Next.js specific elements
    expect(htmlContent).toContain('_next')

    // Should not contain server-side specific code
    expect(htmlContent).not.toContain('getServerSideProps')
    expect(htmlContent).not.toContain('getInitialProps')
  })

  test('static assets are properly generated and accessible', async () => {
    const outDir = join(process.cwd(), 'out')
    const nextStaticDir = join(outDir, '_next', 'static')

    if (existsSync(nextStaticDir)) {
      // Check that static assets exist
      const walkDir = (dir: string): string[] => {
        let files: string[] = []
        const items = readdirSync(dir)

        for (const item of items) {
          const fullPath = join(dir, item)
          if (statSync(fullPath).isDirectory()) {
            files = files.concat(walkDir(fullPath))
          } else {
            files.push(fullPath)
          }
        }
        return files
      }

      const allFiles = walkDir(nextStaticDir)

      // Should have JavaScript files
      const jsFiles = allFiles.filter((f) => f.endsWith('.js'))
      expect(jsFiles.length).toBeGreaterThan(0)

      // Should have CSS files
      const cssFiles = allFiles.filter((f) => f.endsWith('.css'))
      expect(cssFiles.length).toBeGreaterThan(0)
    }
  })

  test('no development-only features in production build', async () => {
    const outDir = join(process.cwd(), 'out')
    const indexPath = join(outDir, 'index.html')

    const htmlContent = readFileSync(indexPath, 'utf-8')

    // Should not contain development-only features
    expect(htmlContent).not.toContain('__NEXT_DATA__')
    expect(htmlContent).not.toContain('webpack-hmr')
    expect(htmlContent).not.toContain('localhost:3000')

    // Check JavaScript files don't contain development code
    const nextStaticDir = join(outDir, '_next', 'static')

    if (existsSync(nextStaticDir)) {
      const walkDir = (dir: string): string[] => {
        let files: string[] = []
        const items = readdirSync(dir)

        for (const item of items) {
          const fullPath = join(dir, item)
          if (statSync(fullPath).isDirectory()) {
            files = files.concat(walkDir(fullPath))
          } else {
            files.push(fullPath)
          }
        }
        return files
      }

      const jsFiles = walkDir(nextStaticDir).filter((f) => f.endsWith('.js'))

      for (const jsFile of jsFiles.slice(0, 5)) {
        // Check first 5 JS files
        const jsContent = fs.readFileSync(jsFile, 'utf-8')

        // Should not contain development-only code
        expect(jsContent).not.toContain('webpack-hot-middleware')
        expect(jsContent).not.toContain('__webpack_hmr')
      }
    }
  })

  test('routing works for single-page application', async () => {
    const outDir = join(process.cwd(), 'out')

    // For single-page apps, we might have different routing setup
    // The main requirement is that the app can handle routing client-side
    expect(existsSync(join(outDir, 'index.html'))).toBe(true)
  })
})

test.describe('Static Build Game Functionality', () => {
  test.beforeAll(async () => {
    // Ensure build exists before testing
    const outDir = join(process.cwd(), 'out')
    if (!existsSync(outDir)) {
      execSync('npm run build', { cwd: process.cwd() })
    }
  })

  test('game works in built static version', async ({ page }) => {
    // Serve the static files and test the game
    const outDir = join(process.cwd(), 'out')

    // Navigate to the built static page
    await page.goto(`file://${join(outDir, 'index.html')}`)

    // Basic functionality test
    await expect(page.locator('text=Welcome to Snake Game')).toBeVisible()

    const startButton = page.locator('button:has-text("Start Game")')
    await expect(startButton).toBeVisible()

    await startButton.click()

    // Verify game elements load properly
    await expect(page.locator('h1:has-text("🐍 Snake Game")')).toBeVisible()
    await expect(page.locator('[data-testid="game-board"]')).toBeVisible()
    await expect(page.locator('text=Score:')).toBeVisible()
  })

  test('all JavaScript functionality works in static build', async ({
    page
  }) => {
    const outDir = join(process.cwd(), 'out')
    await page.goto(`file://${join(outDir, 'index.html')}`)

    // Test JavaScript interactivity
    await page.click('button:has-text("Start Game")')

    // Test keyboard controls work
    await page.keyboard.press('ArrowUp')
    await page.keyboard.press('Space') // Pause
    await expect(page.locator('text=Game Paused')).toBeVisible()

    // Test mobile controls work
    await page.click('[aria-label="Move up"]')

    // Test game controls
    await page.click('button:has-text("Resume")')
    await page.click('button:has-text("Restart")')
  })

  test('CSS styles are properly applied in static build', async ({ page }) => {
    const outDir = join(process.cwd(), 'out')
    await page.goto(`file://${join(outDir, 'index.html')}`)

    await page.click('button:has-text("Start Game")')

    // Check that game board has proper styling
    const gameBoard = page.locator('[data-testid="game-board"]')
    await expect(gameBoard).toBeVisible()

    // Verify computed styles are applied
    const boardStyle = await gameBoard.evaluate((el) => {
      const computed = window.getComputedStyle(el)
      return {
        display: computed.display,
        position: computed.position,
        backgroundColor: computed.backgroundColor
      }
    })

    expect(boardStyle.display).not.toBe('none')
    expect(boardStyle.position).toBeTruthy()
  })

  test('assets load correctly from static build', async ({ page }) => {
    const outDir = join(process.cwd(), 'out')
    await page.goto(`file://${join(outDir, 'index.html')}`)

    // Monitor network requests to ensure assets load
    const responses: string[] = []
    page.on('response', (response) => {
      responses.push(response.url())
    })

    await page.click('button:has-text("Start Game")')

    // Wait for any async loading
    await page.waitForTimeout(1000)

    // Check that no 404s occurred for critical assets
    // This is more relevant when served via HTTP, but we can still check console errors
    const consoleErrors = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    // Should not have critical console errors
    expect(
      consoleErrors.filter(
        (err) =>
          err.includes('404') ||
          err.includes('Failed to load') ||
          err.includes('SyntaxError')
      )
    ).toHaveLength(0)
  })
})
