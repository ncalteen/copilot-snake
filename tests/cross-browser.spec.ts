import { expect, test, devices } from '@playwright/test'

// Define browser configurations to test
const browsers = [
  { name: 'Chromium', ...devices['Desktop Chrome'] },
  { name: 'Firefox', ...devices['Desktop Firefox'] },
  { name: 'WebKit', ...devices['Desktop Safari'] },
  { name: 'Mobile Chrome', ...devices['Pixel 5'] },
  { name: 'Mobile Safari', ...devices['iPhone 12'] },
  { name: 'Tablet Chrome', ...devices['Galaxy Tab S4'] }
]

browsers.forEach((browser) => {
  test.describe(`Cross-Browser Compatibility: ${browser.name}`, () => {
    test.use(browser)

    test(`game loads and functions correctly on ${browser.name}`, async ({
      page
    }) => {
      await page.goto('/')

      // Test start screen loads
      await expect(page.locator('text=Welcome to Snake Game')).toBeVisible()
      await expect(page.locator('button:has-text("Start Game")')).toBeVisible()

      // Start the game
      await page.click('button:has-text("Start Game")')

      // Verify core game elements
      await expect(page.locator('h1:has-text("🐍 Snake Game")')).toBeVisible()
      await expect(page.locator('[data-testid="game-board"]')).toBeVisible()
      await expect(page.locator('text=Score:')).toBeVisible()
      await expect(page.locator('text=Length:')).toBeVisible()

      // Test basic controls
      await expect(page.locator('button:has-text("Pause")')).toBeVisible()
      await expect(page.locator('button:has-text("Restart")')).toBeVisible()

      // Verify game board rendering
      const gameBoard = page.locator('[data-testid="game-board"]')
      const boardBox = await gameBoard.boundingBox()
      expect(boardBox).toBeTruthy()
      expect(boardBox!.width).toBeGreaterThan(100)
      expect(boardBox!.height).toBeGreaterThan(100)
    })

    test(`keyboard controls work on ${browser.name}`, async ({ page }) => {
      await page.goto('/')
      await page.click('button:has-text("Start Game")')

      // Test arrow key controls
      await page.keyboard.press('ArrowUp')
      await page.keyboard.press('ArrowDown')
      await page.keyboard.press('ArrowLeft')
      await page.keyboard.press('ArrowRight')

      // Test WASD controls
      await page.keyboard.press('KeyW')
      await page.keyboard.press('KeyS')
      await page.keyboard.press('KeyA')
      await page.keyboard.press('KeyD')

      // Test space bar for pause
      await page.keyboard.press('Space')
      await expect(page.locator('text=Game Paused')).toBeVisible()

      // Resume with space
      await page.keyboard.press('Space')
      await expect(page.locator('button:has-text("Pause")')).toBeVisible()
    })

    test(`touch controls work on ${browser.name}`, async ({ page }) => {
      await page.goto('/')
      await page.click('button:has-text("Start Game")')

      // Mobile controls should be visible
      const mobileControls = [
        '[aria-label="Move up"]',
        '[aria-label="Move down"]',
        '[aria-label="Move left"]',
        '[aria-label="Move right"]'
      ]

      for (const control of mobileControls) {
        const element = page.locator(control)
        await expect(element).toBeVisible()

        // Test that the control can be tapped
        await element.click()

        // Verify it's interactive
        await expect(element).toBeEnabled()
      }
    })

    test(`game state management works on ${browser.name}`, async ({ page }) => {
      await page.goto('/')
      await page.click('button:has-text("Start Game")')

      // Test pause functionality
      await page.click('button:has-text("Pause")')
      await expect(page.locator('text=Game Paused')).toBeVisible()
      await expect(page.locator('button:has-text("Resume")')).toBeVisible()

      // Test resume functionality
      await page.click('button:has-text("Resume")')
      await expect(page.locator('button:has-text("Pause")')).toBeVisible()

      // Test restart functionality
      await page.click('button:has-text("Restart")')
      await expect(page.locator('[data-testid="game-board"]')).toBeVisible()
      await expect(page.locator('button:has-text("Pause")')).toBeVisible()
    })

    test(`audio controls work on ${browser.name}`, async ({ page }) => {
      await page.goto('/')
      await page.click('button:has-text("Start Game")')

      // Find audio control button
      const audioButton = page
        .locator(
          'button[aria-label*="sound"], button[aria-label*="audio"], button[title*="sound"], button[title*="audio"]'
        )
        .first()

      if (await audioButton.isVisible()) {
        // Test audio toggle functionality
        await audioButton.click()
        await audioButton.click()

        // Verify button remains interactive
        await expect(audioButton).toBeEnabled()
      }
    })

    test(`CSS styling renders correctly on ${browser.name}`, async ({
      page
    }) => {
      await page.goto('/')
      await page.click('button:has-text("Start Game")')

      // Check that critical styling is applied
      const gameBoard = page.locator('[data-testid="game-board"]')

      const styles = await gameBoard.evaluate((el) => {
        const computed = window.getComputedStyle(el)
        return {
          display: computed.display,
          borderRadius: computed.borderRadius,
          backgroundColor: computed.backgroundColor,
          position: computed.position
        }
      })

      expect(styles.display).not.toBe('none')
      expect(styles.display).toBeTruthy()

      // Should have some styling applied
      expect(styles.borderRadius).toBeTruthy()
      expect(styles.backgroundColor).toBeTruthy()
    })

    test(`responsive layout works on ${browser.name}`, async ({ page }) => {
      await page.goto('/')
      await page.click('button:has-text("Start Game")')

      // Test different viewport sizes
      const viewports = [
        { width: 320, height: 568 },
        { width: 768, height: 1024 },
        { width: 1200, height: 800 }
      ]

      for (const viewport of viewports) {
        await page.setViewportSize(viewport)

        // Core elements should remain visible
        await expect(page.locator('h1:has-text("🐍 Snake Game")')).toBeVisible()
        await expect(page.locator('[data-testid="game-board"]')).toBeVisible()

        // Game board should fit in viewport
        const gameBoard = page.locator('[data-testid="game-board"]')
        const boardBox = await gameBoard.boundingBox()

        if (boardBox) {
          expect(boardBox.width).toBeLessThanOrEqual(viewport.width)
          expect(boardBox.height).toBeLessThanOrEqual(viewport.height * 0.8)
        }
      }
    })

    test(`performance is acceptable on ${browser.name}`, async ({ page }) => {
      await page.goto('/')

      // Measure page load time
      const startTime = Date.now()
      await page.click('button:has-text("Start Game")')
      await expect(page.locator('[data-testid="game-board"]')).toBeVisible()
      const loadTime = Date.now() - startTime

      // Game should load within reasonable time (5 seconds)
      expect(loadTime).toBeLessThan(5000)

      // Check for console errors that might indicate performance issues
      const consoleErrors: string[] = []
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text())
        }
      })

      // Let game run briefly to check for runtime errors
      await page.waitForTimeout(2000)

      // Should not have critical console errors
      const criticalErrors = consoleErrors.filter(
        (error) =>
          error.includes('ReferenceError') ||
          error.includes('TypeError') ||
          error.includes('SyntaxError') ||
          error.includes('Maximum call stack')
      )

      expect(criticalErrors).toHaveLength(0)
    })

    test(`JavaScript features work correctly on ${browser.name}`, async ({
      page
    }) => {
      await page.goto('/')
      await page.click('button:has-text("Start Game")')

      // Test modern JavaScript features
      const jsFeatureTest = await page.evaluate(() => {
        // Test ES6+ features that the game might use
        try {
          // Arrow functions
          const arrow = () => true

          // Template literals
          const template = `test`

          // Destructuring
          const { length } = [1, 2, 3]

          // Classes
          class Test {
            method() {
              return true
            }
          }
          const test = new Test()

          // Promises
          const promise = Promise.resolve(true)

          // Local storage
          const storageTest = localStorage.setItem && localStorage.getItem

          return {
            arrow: arrow(),
            template: template === 'test',
            destructuring: length === 3,
            classes: test.method(),
            promises: promise instanceof Promise,
            localStorage: Boolean(storageTest)
          }
        } catch (error) {
          return { error: error.message }
        }
      })

      // All modern JS features should work
      expect(jsFeatureTest.arrow).toBe(true)
      expect(jsFeatureTest.template).toBe(true)
      expect(jsFeatureTest.destructuring).toBe(true)
      expect(jsFeatureTest.classes).toBe(true)
      expect(jsFeatureTest.promises).toBe(true)
      expect(jsFeatureTest.localStorage).toBe(true)
      expect(jsFeatureTest.error).toBeUndefined()
    })

    test(`game logic consistency on ${browser.name}`, async ({ page }) => {
      await page.goto('/')
      await page.click('button:has-text("Start Game")')

      // Test that game state updates consistently
      const initialScore = await page.locator('text=Score:').textContent()
      expect(initialScore).toContain('0')

      // Test that game board cells exist and are properly structured
      const cells = page.locator('[data-testid^="cell-"]')
      const cellCount = await cells.count()
      expect(cellCount).toBeGreaterThan(0)

      // Test that snake and food are rendered
      const snakeCell = page.locator('[data-type="snake-head"]')
      const foodCell = page.locator('[data-type="food"]')

      await expect(snakeCell).toBeVisible()
      await expect(foodCell).toBeVisible()

      // Test that game responds to input consistently
      await page.keyboard.press('ArrowUp')
      await page.waitForTimeout(100)
      await page.keyboard.press('ArrowDown')

      // Game should still be running and responsive
      await expect(page.locator('[data-testid="game-board"]')).toBeVisible()
    })
  })
})

test.describe('Cross-Browser Feature Compatibility', () => {
  browsers.forEach((browser) => {
    test(`Web APIs compatibility on ${browser.name}`, async ({ page }) => {
      test.use(browser)

      await page.goto('/')

      // Test Web API support that the game might use
      const apiSupport = await page.evaluate(() => {
        return {
          localStorage: typeof localStorage !== 'undefined',
          sessionStorage: typeof sessionStorage !== 'undefined',
          requestAnimationFrame: typeof requestAnimationFrame !== 'undefined',
          addEventListener: typeof document.addEventListener !== 'undefined',
          querySelector: typeof document.querySelector !== 'undefined',
          classList: typeof document.body.classList !== 'undefined',
          touchEvents: 'ontouchstart' in window,
          keyboardEvents: typeof KeyboardEvent !== 'undefined',
          audioContext:
            typeof AudioContext !== 'undefined' ||
            typeof (window as unknown as { webkitAudioContext?: unknown })
              .webkitAudioContext !== 'undefined'
        }
      })

      // Core APIs should be supported
      expect(apiSupport.localStorage).toBe(true)
      expect(apiSupport.requestAnimationFrame).toBe(true)
      expect(apiSupport.addEventListener).toBe(true)
      expect(apiSupport.querySelector).toBe(true)
      expect(apiSupport.classList).toBe(true)
      expect(apiSupport.keyboardEvents).toBe(true)

      // Touch events should be supported on mobile browsers
      if (browser.name.includes('Mobile')) {
        expect(apiSupport.touchEvents).toBe(true)
      }
    })
  })
})
