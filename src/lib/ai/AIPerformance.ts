/**
 * AI Performance monitoring utilities for tracking and optimizing AI operations
 * Monitors decision-making performance, memory usage, and frame rate impact
 */

import { AIID, AIPerformanceMetrics, IAIPerformanceMonitor } from '@/types/ai'

/**
 * Performance threshold constants for monitoring
 */
const PERFORMANCE_THRESHOLDS = {
  /** Maximum acceptable decision time in milliseconds */
  MAX_DECISION_TIME: 16, // ~1 frame at 60fps
  /** Warning threshold for decision time */
  WARNING_DECISION_TIME: 8,
  /** Maximum allowed metrics history entries */
  MAX_METRICS_HISTORY: 1000,
  /** Cleanup interval in milliseconds */
  CLEANUP_INTERVAL: 30000 // 30 seconds
} as const

/**
 * Performance warning types
 */
export enum PerformanceWarning {
  SLOW_DECISION = 'SLOW_DECISION',
  HIGH_COLLISION_RATE = 'HIGH_COLLISION_RATE',
  MEMORY_PRESSURE = 'MEMORY_PRESSURE',
  FRAME_DROP = 'FRAME_DROP'
}

/**
 * Performance event interface
 */
export interface PerformanceEvent {
  type: PerformanceWarning
  npcId: AIID
  timestamp: number
  details: string
  severity: 'low' | 'medium' | 'high'
}

/**
 * AI Performance Monitor implementation
 */
export class AIPerformanceMonitor implements IAIPerformanceMonitor {
  private metrics: Map<AIID, AIPerformanceMetrics> = new Map()
  private metricsHistory: Map<AIID, number[]> = new Map()
  private performanceEvents: PerformanceEvent[] = []
  private cleanupInterval: NodeJS.Timeout | null = null
  private enabled: boolean = true

  constructor(enabled: boolean = true) {
    this.enabled = enabled
    if (this.enabled) {
      this.startCleanupInterval()
    }
  }

  /**
   * Start monitoring an NPC
   */
  startMonitoring(npcId: AIID): void {
    if (!this.enabled) return

    const metrics: AIPerformanceMetrics = {
      npcId,
      decisionTime: 0,
      decisionsCount: 0,
      averageDecisionTime: 0,
      collisions: 0,
      foodConsumed: 0,
      timeAlive: 0,
      lastUpdate: performance.now()
    }

    this.metrics.set(npcId, metrics)
    this.metricsHistory.set(npcId, [])
  }

  /**
   * Stop monitoring an NPC
   */
  stopMonitoring(npcId: AIID): void {
    this.metrics.delete(npcId)
    this.metricsHistory.delete(npcId)

    // Remove related performance events
    this.performanceEvents = this.performanceEvents.filter(
      (event) => event.npcId !== npcId
    )
  }

  /**
   * Record a decision timing
   */
  recordDecision(npcId: AIID, processingTime: number): void {
    if (!this.enabled) return

    const metrics = this.metrics.get(npcId)
    if (!metrics) return

    const now = performance.now()

    // Update metrics
    metrics.decisionTime = processingTime
    metrics.decisionsCount++
    metrics.timeAlive += now - metrics.lastUpdate
    metrics.lastUpdate = now

    // Calculate average decision time
    const history = this.metricsHistory.get(npcId) || []
    history.push(processingTime)

    // Keep history within limits
    if (history.length > PERFORMANCE_THRESHOLDS.MAX_METRICS_HISTORY) {
      history.shift()
    }

    metrics.averageDecisionTime =
      history.reduce((a, b) => a + b, 0) / history.length

    // Check for performance warnings
    this.checkPerformanceThresholds(npcId, processingTime)
  }

  /**
   * Record a collision event
   */
  recordCollision(npcId: AIID): void {
    if (!this.enabled) return

    const metrics = this.metrics.get(npcId)
    if (!metrics) return

    metrics.collisions++

    // Check for high collision rate
    if (metrics.collisions > 0 && metrics.decisionsCount > 100) {
      const collisionRate = metrics.collisions / (metrics.decisionsCount / 100)
      if (collisionRate > 10) {
        // More than 10% collision rate
        this.addPerformanceEvent({
          type: PerformanceWarning.HIGH_COLLISION_RATE,
          npcId,
          timestamp: performance.now(),
          details: `High collision rate: ${collisionRate.toFixed(1)}%`,
          severity: 'medium'
        })
      }
    }
  }

  /**
   * Record food consumption
   */
  recordFoodConsumed(npcId: AIID): void {
    if (!this.enabled) return

    const metrics = this.metrics.get(npcId)
    if (!metrics) return

    metrics.foodConsumed++
  }

  /**
   * Get metrics for an NPC
   */
  getMetrics(npcId: AIID): AIPerformanceMetrics | undefined {
    return this.metrics.get(npcId)
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): Map<AIID, AIPerformanceMetrics> {
    return new Map(this.metrics)
  }

  /**
   * Clear metrics for an NPC
   */
  clearMetrics(npcId: AIID): void {
    this.metrics.delete(npcId)
    this.metricsHistory.delete(npcId)
  }

  /**
   * Clear all metrics
   */
  clearAllMetrics(): void {
    this.metrics.clear()
    this.metricsHistory.clear()
    this.performanceEvents = []
  }

  /**
   * Get recent performance events
   */
  getPerformanceEvents(limit: number = 50): readonly PerformanceEvent[] {
    return this.performanceEvents
      .slice(-limit)
      .sort((a, b) => b.timestamp - a.timestamp)
  }

  /**
   * Get performance summary for all NPCs
   */
  getPerformanceSummary(): {
    totalNPCs: number
    averageDecisionTime: number
    slowDecisions: number
    totalCollisions: number
    totalFoodConsumed: number
    performanceIssues: number
  } {
    const metrics = Array.from(this.metrics.values())

    if (metrics.length === 0) {
      return {
        totalNPCs: 0,
        averageDecisionTime: 0,
        slowDecisions: 0,
        totalCollisions: 0,
        totalFoodConsumed: 0,
        performanceIssues: 0
      }
    }

    const totalDecisionTime = metrics.reduce(
      (sum, m) => sum + m.averageDecisionTime,
      0
    )
    const slowDecisions = metrics.filter(
      (m) =>
        m.averageDecisionTime > PERFORMANCE_THRESHOLDS.WARNING_DECISION_TIME
    ).length

    return {
      totalNPCs: metrics.length,
      averageDecisionTime: totalDecisionTime / metrics.length,
      slowDecisions,
      totalCollisions: metrics.reduce((sum, m) => sum + m.collisions, 0),
      totalFoodConsumed: metrics.reduce((sum, m) => sum + m.foodConsumed, 0),
      performanceIssues: this.performanceEvents.length
    }
  }

  /**
   * Enable or disable performance monitoring
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled

    if (enabled && !this.cleanupInterval) {
      this.startCleanupInterval()
    } else if (!enabled && this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
  }

  /**
   * Check if monitoring is enabled
   */
  isEnabled(): boolean {
    return this.enabled
  }

  /**
   * Dispose of the monitor and clean up resources
   */
  dispose(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
    this.clearAllMetrics()
  }

  /**
   * Check performance thresholds and generate warnings
   */
  private checkPerformanceThresholds(
    npcId: AIID,
    processingTime: number
  ): void {
    if (processingTime > PERFORMANCE_THRESHOLDS.MAX_DECISION_TIME) {
      this.addPerformanceEvent({
        type: PerformanceWarning.SLOW_DECISION,
        npcId,
        timestamp: performance.now(),
        details: `Decision took ${processingTime.toFixed(2)}ms (max: ${PERFORMANCE_THRESHOLDS.MAX_DECISION_TIME}ms)`,
        severity:
          processingTime > PERFORMANCE_THRESHOLDS.MAX_DECISION_TIME * 2
            ? 'high'
            : 'medium'
      })
    }
  }

  /**
   * Add a performance event
   */
  private addPerformanceEvent(event: PerformanceEvent): void {
    this.performanceEvents.push(event)

    // Keep events list manageable
    if (this.performanceEvents.length > 200) {
      this.performanceEvents = this.performanceEvents.slice(-100)
    }
  }

  /**
   * Start the cleanup interval for old metrics
   */
  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupOldMetrics()
    }, PERFORMANCE_THRESHOLDS.CLEANUP_INTERVAL)
  }

  /**
   * Clean up old metrics and events
   */
  private cleanupOldMetrics(): void {
    const now = performance.now()
    const maxAge = 5 * 60 * 1000 // 5 minutes

    // Clean up old performance events
    this.performanceEvents = this.performanceEvents.filter(
      (event) => now - event.timestamp < maxAge
    )

    // Clean up metrics for NPCs that haven't been updated recently
    for (const [npcId, metrics] of this.metrics.entries()) {
      if (now - metrics.lastUpdate > maxAge) {
        this.stopMonitoring(npcId)
      }
    }
  }
}

/**
 * Global performance monitor instance
 */
let performanceMonitorInstance: AIPerformanceMonitor | null = null

/**
 * Get or create the global performance monitor instance
 */
export function getPerformanceMonitor(
  enabled: boolean = true
): IAIPerformanceMonitor {
  if (!performanceMonitorInstance) {
    performanceMonitorInstance = new AIPerformanceMonitor(enabled)
  }
  return performanceMonitorInstance
}

/**
 * Utility function to measure AI decision performance
 */
export function measureAIDecision<T>(
  npcId: AIID,
  operation: () => T,
  monitor?: IAIPerformanceMonitor
): T {
  const performanceMonitor = monitor || getPerformanceMonitor()

  if (!performanceMonitor.isEnabled()) {
    return operation()
  }

  const start = performance.now()
  try {
    const result = operation()
    const elapsed = performance.now() - start
    performanceMonitor.recordDecision(npcId, elapsed)
    return result
  } catch (error) {
    const elapsed = performance.now() - start
    performanceMonitor.recordDecision(npcId, elapsed)
    throw error
  }
}

/**
 * Performance utilities for frame rate monitoring
 */
export class FrameRateMonitor {
  private frameCount = 0
  private lastTime = 0
  private fps = 0
  private callback?: (fps: number) => void

  constructor(callback?: (fps: number) => void) {
    this.callback = callback
    this.lastTime = performance.now()
  }

  /**
   * Update frame count and calculate FPS
   */
  update(): void {
    this.frameCount++
    const currentTime = performance.now()
    const elapsed = currentTime - this.lastTime

    if (elapsed >= 1000) {
      // Update every second
      this.fps = (this.frameCount * 1000) / elapsed
      this.frameCount = 0
      this.lastTime = currentTime

      if (this.callback) {
        this.callback(this.fps)
      }

      // Check for frame drops
      if (this.fps < 50) {
        // Below 50 FPS threshold
        console.warn(`Frame rate drop detected: ${this.fps.toFixed(1)} FPS`)
      }
    }
  }

  /**
   * Get current FPS
   */
  getFPS(): number {
    return this.fps
  }
}
