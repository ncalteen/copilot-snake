import { expect, test } from '@playwright/test'

test.describe('Snake Game Responsive Design', () => {
  const viewports = [
    { name: 'Mobile Small', width: 320, height: 568 },
    { name: 'Mobile iPhone SE', width: 375, height: 667 },
    { name: 'Mobile iPhone 12', width: 390, height: 844 },
    { name: 'Tablet Portrait', width: 768, height: 1024 },
    { name: 'Tablet Landscape', width: 1024, height: 768 },
    { name: 'Desktop Small', width: 1200, height: 800 },
    { name: 'Desktop Medium', width: 1440, height: 900 },
    { name: 'Desktop Large', width: 1920, height: 1080 },
    { name: '4K', width: 3840, height: 2160 }
  ]

  viewports.forEach(({ name, width, height }) => {
    test(`game renders correctly on ${name} (${width}x${height})`, async ({
      page
    }) => {
      await page.setViewportSize({ width, height })
      await page.goto('/')

      // Start screen should be visible and properly sized
      await expect(page.locator('text=Welcome to Snake Game')).toBeVisible()

      const startButton = page.locator('button:has-text("Start Game")')
      await expect(startButton).toBeVisible()

      // Verify start button is clickable (not cut off)
      const startButtonBox = await startButton.boundingBox()
      expect(startButtonBox).toBeTruthy()
      expect(startButtonBox!.x).toBeGreaterThanOrEqual(0)
      expect(startButtonBox!.y).toBeGreaterThanOrEqual(0)

      // Start the game
      await startButton.click()

      // Verify game title is visible
      await expect(page.locator('h1:has-text("🐍 Snake Game")')).toBeVisible()

      // Verify game board is present and properly sized
      const gameBoard = page.locator('[data-testid="game-board"]')
      await expect(gameBoard).toBeVisible()

      const gameBoardBox = await gameBoard.boundingBox()
      expect(gameBoardBox).toBeTruthy()

      // Game board should not exceed viewport width
      expect(gameBoardBox!.width).toBeLessThanOrEqual(width)

      // Game board should not take up the entire height (leave space for UI)
      expect(gameBoardBox!.height).toBeLessThanOrEqual(height * 0.8)

      // Verify essential UI elements are visible
      await expect(page.locator('text=Score:')).toBeVisible()
      await expect(page.locator('text=Length:')).toBeVisible()
      await expect(page.locator('button:has-text("Pause")')).toBeVisible()
      await expect(page.locator('button:has-text("Restart")')).toBeVisible()

      // Mobile-specific checks
      if (width < 768) {
        // Mobile controls should be visible on small screens
        await expect(page.locator('[aria-label="Move up"]')).toBeVisible()
        await expect(page.locator('[aria-label="Move down"]')).toBeVisible()
        await expect(page.locator('[aria-label="Move left"]')).toBeVisible()
        await expect(page.locator('[aria-label="Move right"]')).toBeVisible()

        // Mobile controls should be properly sized for touch
        const upButton = page.locator('[aria-label="Move up"]')
        const upButtonBox = await upButton.boundingBox()
        expect(upButtonBox).toBeTruthy()
        expect(upButtonBox!.width).toBeGreaterThanOrEqual(40) // Minimum touch target
        expect(upButtonBox!.height).toBeGreaterThanOrEqual(40)
      }
    })
  })

  test('mobile touch controls work correctly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Start the game
    await page.click('button:has-text("Start Game")')

    // Test touch controls
    const controls = [
      { label: 'Move up', selector: '[aria-label="Move up"]' },
      { label: 'Move down', selector: '[aria-label="Move down"]' },
      { label: 'Move left', selector: '[aria-label="Move left"]' },
      { label: 'Move right', selector: '[aria-label="Move right"]' }
    ]

    for (const control of controls) {
      const element = page.locator(control.selector)
      await expect(element).toBeVisible()

      // Test that the element can be tapped/clicked
      await element.click()

      // Verify element provides visual feedback (should have active states)
      // We can't easily test CSS transitions, but we can verify the element is interactive
      await expect(element).toBeEnabled()
    }
  })

  test('game board maintains aspect ratio across different screen sizes', async ({
    page
  }) => {
    await page.goto('/')
    await page.click('button:has-text("Start Game")')

    const testSizes = [
      { width: 320, height: 568 },
      { width: 768, height: 1024 },
      { width: 1200, height: 800 },
      { width: 1920, height: 1080 }
    ]

    for (const size of testSizes) {
      await page.setViewportSize(size)

      const gameBoard = page.locator('[data-testid="game-board"]')
      await expect(gameBoard).toBeVisible()

      const boardBox = await gameBoard.boundingBox()
      expect(boardBox).toBeTruthy()

      // Game board should maintain square aspect ratio
      const aspectRatio = boardBox!.width / boardBox!.height
      expect(aspectRatio).toBeCloseTo(1, 1) // Should be close to 1 (square)
    }
  })

  test('text and UI elements remain readable at different screen sizes', async ({
    page
  }) => {
    const testSizes = [
      { width: 320, height: 568 },
      { width: 768, height: 1024 },
      { width: 1920, height: 1080 }
    ]

    for (const size of testSizes) {
      await page.setViewportSize(size)
      await page.goto('/')
      await page.click('button:has-text("Start Game")')

      // Check that key text elements are visible and have reasonable sizes
      const title = page.locator('h1:has-text("🐍 Snake Game")')
      await expect(title).toBeVisible()

      const titleBox = await title.boundingBox()
      expect(titleBox).toBeTruthy()
      expect(titleBox!.height).toBeGreaterThan(20) // Minimum readable text height

      // Check score display
      const scoreText = page.locator('text=Score:')
      await expect(scoreText).toBeVisible()

      const scoreBox = await scoreText.boundingBox()
      expect(scoreBox).toBeTruthy()
      expect(scoreBox!.height).toBeGreaterThan(16) // Minimum readable text height

      // Check buttons are properly sized
      const pauseButton = page.locator('button:has-text("Pause")')
      await expect(pauseButton).toBeVisible()

      const buttonBox = await pauseButton.boundingBox()
      expect(buttonBox).toBeTruthy()
      expect(buttonBox!.height).toBeGreaterThan(32) // Minimum button height

      if (size.width < 768) {
        // On mobile, buttons should be larger for easier tapping
        expect(buttonBox!.height).toBeGreaterThan(40)
      }
    }
  })

  test('layout does not break with extreme aspect ratios', async ({ page }) => {
    // Test very wide screen
    await page.setViewportSize({ width: 2560, height: 1080 })
    await page.goto('/')
    await page.click('button:has-text("Start Game")')

    await expect(page.locator('h1:has-text("🐍 Snake Game")')).toBeVisible()
    await expect(page.locator('[data-testid="game-board"]')).toBeVisible()

    // Test very tall screen
    await page.setViewportSize({ width: 390, height: 1200 })
    await expect(page.locator('h1:has-text("🐍 Snake Game")')).toBeVisible()
    await expect(page.locator('[data-testid="game-board"]')).toBeVisible()

    // Mobile controls should still be visible and functional
    await expect(page.locator('[aria-label="Move up"]')).toBeVisible()
  })

  test('game remains playable after orientation changes', async ({ page }) => {
    // Start in portrait mode
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    await page.click('button:has-text("Start Game")')

    // Verify game is running
    await expect(page.locator('[data-testid="game-board"]')).toBeVisible()

    // Switch to landscape mode
    await page.setViewportSize({ width: 844, height: 390 })

    // Game should still be visible and functional
    await expect(page.locator('[data-testid="game-board"]')).toBeVisible()
    await expect(page.locator('button:has-text("Pause")')).toBeVisible()

    // Controls should still work
    await expect(page.locator('[aria-label="Move up"]')).toBeVisible()
    await page.click('[aria-label="Move up"]')
  })

  test('containers and layout adapt properly to content', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await page.click('button:has-text("Start Game")')

    // Check that container elements don't overflow
    const container = page.locator('.container').first()
    const containerBox = await container.boundingBox()

    if (containerBox) {
      expect(containerBox.width).toBeLessThanOrEqual(375)
      expect(containerBox.x).toBeGreaterThanOrEqual(0)
    }

    // Check that game board container centers properly
    const gameBoard = page.locator('[data-testid="game-board"]')
    const boardBox = await gameBoard.boundingBox()

    if (boardBox) {
      // Board should be horizontally centered
      const centerX = boardBox.x + boardBox.width / 2
      const viewportCenterX = 375 / 2
      expect(Math.abs(centerX - viewportCenterX)).toBeLessThan(50) // Allow some margin
    }
  })
})
