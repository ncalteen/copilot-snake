import { expect, test } from '@playwright/test'

test.describe('Snake Game Performance Tests', () => {
  test('page loads within acceptable time', async ({ page }) => {
    const startTime = Date.now()

    await page.goto('/')

    // Wait for critical elements to be visible
    await expect(page.locator('text=Welcome to Snake Game')).toBeVisible()
    await expect(page.locator('button:has-text("Start Game")')).toBeVisible()

    const loadTime = Date.now() - startTime

    // Page should load within 3 seconds
    expect(loadTime).toBeLessThan(3000)
  })

  test('game startup time is acceptable', async ({ page }) => {
    await page.goto('/')

    const startTime = Date.now()
    await page.click('button:has-text("Start Game")')

    // Wait for game elements to be ready
    await expect(page.locator('[data-testid="game-board"]')).toBeVisible()
    await expect(page.locator('text=Score:')).toBeVisible()

    const gameStartTime = Date.now() - startTime

    // Game should start within 1 second
    expect(gameStartTime).toBeLessThan(1000)
  })

  test('game runs smoothly without memory leaks', async ({ page }) => {
    await page.goto('/')
    await page.click('button:has-text("Start Game")')

    // Get initial memory usage
    const initialMemory = await page.evaluate(() => {
      if ('memory' in performance) {
        return (
          performance as unknown as { memory: { usedJSHeapSize: number } }
        ).memory.usedJSHeapSize
      }
      return 0
    })

    // Let game run for a while
    await page.waitForTimeout(5000)

    // Simulate game interactions
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('ArrowUp')
      await page.waitForTimeout(100)
      await page.keyboard.press('ArrowDown')
      await page.waitForTimeout(100)
    }

    // Pause and resume multiple times
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Space') // Pause
      await page.waitForTimeout(200)
      await page.keyboard.press('Space') // Resume
      await page.waitForTimeout(200)
    }

    // Get final memory usage
    const finalMemory = await page.evaluate(() => {
      if ('memory' in performance) {
        return (
          performance as unknown as { memory: { usedJSHeapSize: number } }
        ).memory.usedJSHeapSize
      }
      return 0
    })

    // Memory usage should not increase dramatically (allow for 50MB increase)
    if (initialMemory > 0 && finalMemory > 0) {
      const memoryIncrease = finalMemory - initialMemory
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024) // 50MB
    }
  })

  test('game maintains consistent frame rate', async ({ page }) => {
    await page.goto('/')
    await page.click('button:has-text("Start Game")')

    // Measure frame rate over several seconds
    const frameRateTest = await page.evaluate(async () => {
      return new Promise((resolve) => {
        let frameCount = 0
        const startTime = performance.now()

        const countFrames = () => {
          frameCount++
          if (performance.now() - startTime < 3000) {
            // 3 seconds
            requestAnimationFrame(countFrames)
          } else {
            const elapsed = (performance.now() - startTime) / 1000
            const fps = frameCount / elapsed
            resolve(fps)
          }
        }

        requestAnimationFrame(countFrames)
      })
    })

    // Frame rate should be reasonable (at least 30 FPS)
    expect(frameRateTest).toBeGreaterThan(30)
  })

  test('rapid input handling does not cause performance issues', async ({
    page
  }) => {
    await page.goto('/')
    await page.click('button:has-text("Start Game")')

    const startTime = Date.now()

    // Simulate rapid key presses
    for (let i = 0; i < 100; i++) {
      await page.keyboard.press('ArrowUp')
      await page.keyboard.press('ArrowDown')
      await page.keyboard.press('ArrowLeft')
      await page.keyboard.press('ArrowRight')
    }

    const endTime = Date.now()
    const totalTime = endTime - startTime

    // Should handle rapid input within reasonable time (5 seconds)
    expect(totalTime).toBeLessThan(5000)

    // Game should still be responsive
    await expect(page.locator('[data-testid="game-board"]')).toBeVisible()
    await expect(page.locator('button:has-text("Pause")')).toBeVisible()
  })

  test('mobile touch performance is acceptable', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await page.click('button:has-text("Start Game")')

    const startTime = Date.now()

    // Simulate rapid touch inputs
    const controls = [
      '[aria-label="Move up"]',
      '[aria-label="Move down"]',
      '[aria-label="Move left"]',
      '[aria-label="Move right"]'
    ]

    for (let i = 0; i < 50; i++) {
      for (const control of controls) {
        await page.click(control)
      }
    }

    const endTime = Date.now()
    const totalTime = endTime - startTime

    // Touch handling should be fast (3 seconds for 200 touches)
    expect(totalTime).toBeLessThan(3000)

    // Game should remain responsive
    await expect(page.locator('[data-testid="game-board"]')).toBeVisible()
  })

  test('DOM manipulation performance is efficient', async ({ page }) => {
    await page.goto('/')
    await page.click('button:has-text("Start Game")')

    // Measure DOM query performance
    const domPerformance = await page.evaluate(() => {
      const iterations = 1000
      const startTime = performance.now()

      // Simulate DOM queries that the game might perform
      for (let i = 0; i < iterations; i++) {
        void document.querySelector('[data-testid="game-board"]')
        void document.querySelectorAll('[data-testid^="cell-"]')
        void (document.getElementById('root') || document.body)
      }

      const endTime = performance.now()
      return endTime - startTime
    })

    // DOM queries should be fast (less than 100ms for 1000 iterations)
    expect(domPerformance).toBeLessThan(100)
  })

  test('game state updates are performant', async ({ page }) => {
    await page.goto('/')
    await page.click('button:has-text("Start Game")')

    // Test multiple rapid state changes
    const stateChangeTest = await page.evaluate(async () => {
      const startTime = performance.now()

      // Simulate rapid state changes (pause/resume)
      for (let i = 0; i < 50; i++) {
        // Trigger pause (if pause button exists)
        const pauseBtn = document.querySelector('button:has-text("Pause")')
        if (pauseBtn) {
          ;(pauseBtn as HTMLButtonElement).click()
        }

        // Small delay
        await new Promise((resolve) => setTimeout(resolve, 10))

        // Trigger resume (if resume button exists)
        const resumeBtn = document.querySelector('button:has-text("Resume")')
        if (resumeBtn) {
          ;(resumeBtn as HTMLButtonElement).click()
        }

        await new Promise((resolve) => setTimeout(resolve, 10))
      }

      const endTime = performance.now()
      return endTime - startTime
    })

    // State changes should be handled efficiently
    expect(stateChangeTest).toBeLessThan(5000) // 5 seconds for 50 state changes
  })

  test('no excessive console warnings or errors', async ({ page }) => {
    const consoleMessages: { type: string; text: string }[] = []

    page.on('console', (msg) => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text()
      })
    })

    await page.goto('/')
    await page.click('button:has-text("Start Game")')

    // Let the game run for a bit
    await page.waitForTimeout(3000)

    // Interact with the game
    await page.keyboard.press('ArrowUp')
    await page.keyboard.press('Space') // Pause
    await page.keyboard.press('Space') // Resume

    // Filter out acceptable messages
    const errors = consoleMessages.filter(
      (msg) =>
        msg.type === 'error' &&
        !msg.text.includes('Lighthouse') && // Ignore Lighthouse warnings
        !msg.text.includes('Chrome DevTools') // Ignore DevTools warnings
    )

    const warnings = consoleMessages.filter(
      (msg) =>
        msg.type === 'warning' &&
        !msg.text.includes('DevTools') &&
        !msg.text.includes('extension')
    )

    // Should have minimal console errors and warnings
    expect(errors.length).toBeLessThanOrEqual(2)
    expect(warnings.length).toBeLessThanOrEqual(5)
  })

  test('bundle size is optimized', async ({ page }) => {
    await page.goto('/')

    // Get information about loaded resources
    const resourceSizes = await page.evaluate(() => {
      return performance.getEntriesByType('resource').map((entry) => ({
        name: entry.name,
        size: (entry as unknown as { transferSize?: number }).transferSize || 0,
        type: entry.name.split('.').pop()
      }))
    })

    // Calculate total JavaScript size
    const jsSize = resourceSizes
      .filter((resource) => resource.type === 'js')
      .reduce((total, resource) => total + resource.size, 0)

    // Calculate total CSS size
    const cssSize = resourceSizes
      .filter((resource) => resource.type === 'css')
      .reduce((total, resource) => total + resource.size, 0)

    // JavaScript bundle should be reasonable (less than 500KB as per requirements)
    expect(jsSize).toBeLessThan(500 * 1024) // 500KB

    // CSS should be minimal (less than 50KB)
    expect(cssSize).toBeLessThan(50 * 1024) // 50KB
  })

  test('game handles window resize efficiently', async ({ page }) => {
    await page.goto('/')
    await page.click('button:has-text("Start Game")')

    const startTime = Date.now()

    // Simulate multiple window resizes
    const resizes = [
      { width: 1200, height: 800 },
      { width: 800, height: 600 },
      { width: 375, height: 667 },
      { width: 768, height: 1024 },
      { width: 1920, height: 1080 }
    ]

    for (const size of resizes) {
      await page.setViewportSize(size)
      await page.waitForTimeout(100) // Allow layout to settle

      // Verify game board is still visible and properly sized
      await expect(page.locator('[data-testid="game-board"]')).toBeVisible()
    }

    const totalTime = Date.now() - startTime

    // Resize handling should be fast
    expect(totalTime).toBeLessThan(3000)
  })

  test('accessibility performance is acceptable', async ({ page }) => {
    await page.goto('/')
    await page.click('button:has-text("Start Game")')

    // Test keyboard navigation performance
    const keyboardNavTime = await page.evaluate(async () => {
      const startTime = performance.now()

      // Simulate rapid tab navigation
      for (let i = 0; i < 20; i++) {
        const event = new KeyboardEvent('keydown', { key: 'Tab' })
        document.dispatchEvent(event)
        await new Promise((resolve) => setTimeout(resolve, 10))
      }

      return performance.now() - startTime
    })

    // Keyboard navigation should be responsive
    expect(keyboardNavTime).toBeLessThan(1000)

    // Test focus management
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')

    // Focus should be properly managed without significant delay
    const focusedElement = await page.evaluate(
      () => document.activeElement?.tagName
    )
    expect(focusedElement).toBeTruthy()
  })
})
