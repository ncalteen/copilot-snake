/**
 * Game difficulty scaling and progression logic
 * Implements progressive speed increases and difficulty transitions
 */

import { GameConfig } from '@/types/game'

/**
 * Difficulty level enumeration
 */
export enum DifficultyLevel {
  BEGINNER = 'BEGINNER',
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
  EXPERT = 'EXPERT',
  MASTER = 'MASTER'
}

/**
 * Difficulty configuration interface
 */
export interface DifficultyConfig {
  level: DifficultyLevel
  speed: number // milliseconds per move
  scoreMultiplier: number
  description: string
}

/**
 * Predefined difficulty configurations
 */
export const DIFFICULTY_CONFIGS: Record<DifficultyLevel, DifficultyConfig> = {
  [DifficultyLevel.BEGINNER]: {
    level: DifficultyLevel.BEGINNER,
    speed: 300,
    scoreMultiplier: 0.5,
    description: 'Very slow pace, perfect for learning'
  },
  [DifficultyLevel.EASY]: {
    level: DifficultyLevel.EASY,
    speed: 200,
    scoreMultiplier: 0.8,
    description: 'Slow pace, good for beginners'
  },
  [DifficultyLevel.MEDIUM]: {
    level: DifficultyLevel.MEDIUM,
    speed: 150,
    scoreMultiplier: 1.0,
    description: 'Standard pace, balanced difficulty'
  },
  [DifficultyLevel.HARD]: {
    level: DifficultyLevel.HARD,
    speed: 100,
    scoreMultiplier: 1.2,
    description: 'Fast pace, challenging gameplay'
  },
  [DifficultyLevel.EXPERT]: {
    level: DifficultyLevel.EXPERT,
    speed: 75,
    scoreMultiplier: 1.5,
    description: 'Very fast pace, expert level'
  },
  [DifficultyLevel.MASTER]: {
    level: DifficultyLevel.MASTER,
    speed: 50,
    scoreMultiplier: 2.0,
    description: 'Maximum speed, master level'
  }
}

/**
 * Calculates new game speed based on current score
 * Uses logarithmic progression to prevent jarring speed changes
 * @param score Current game score
 * @param config Game configuration
 * @returns New speed value (milliseconds per move)
 */
export function calculateSpeedFromScore(
  score: number,
  config: GameConfig
): number {
  if (score <= 0) {
    return config.initialSpeed
  }

  // Calculate speed reduction based on score
  // Each 50 points reduces speed by speedIncrement
  const speedReduction = Math.floor(score / 50) * config.speedIncrement
  const newSpeed = config.initialSpeed - speedReduction

  // Ensure speed doesn't go below minimum
  return Math.max(newSpeed, config.minSpeed)
}

/**
 * Calculates speed using exponential progression curve
 * Provides more aggressive difficulty scaling
 * @param score Current game score
 * @param config Game configuration
 * @param factor Exponential factor (default: 0.02)
 * @returns New speed value
 */
export function calculateExponentialSpeed(
  score: number,
  config: GameConfig,
  factor: number = 0.02
): number {
  if (score <= 0) {
    return config.initialSpeed
  }

  // Exponential decay formula: initialSpeed * e^(-factor * score)
  const speedReduction =
    config.initialSpeed * (1 - Math.exp((-factor * score) / 100))
  const newSpeed = config.initialSpeed - speedReduction

  return Math.max(newSpeed, config.minSpeed)
}

/**
 * Determines difficulty level based on current score
 * @param score Current game score
 * @returns Appropriate difficulty level
 */
export function getDifficultyLevelFromScore(score: number): DifficultyLevel {
  if (score < 50) return DifficultyLevel.BEGINNER
  if (score < 150) return DifficultyLevel.EASY
  if (score < 300) return DifficultyLevel.MEDIUM
  if (score < 500) return DifficultyLevel.HARD
  if (score < 800) return DifficultyLevel.EXPERT
  return DifficultyLevel.MASTER
}

/**
 * Gets the appropriate speed for a given score with smooth transitions
 * Combines score-based calculation with level-based constraints
 * @param score Current game score
 * @param config Game configuration
 * @returns Smooth speed transition value
 */
export function getSmoothDifficultySpeed(
  score: number,
  config: GameConfig
): number {
  const level = getDifficultyLevelFromScore(score)
  const levelConfig = DIFFICULTY_CONFIGS[level]
  const calculatedSpeed = calculateSpeedFromScore(score, config)

  // Use the faster of the two speeds (lower number = faster)
  return Math.min(calculatedSpeed, levelConfig.speed)
}

/**
 * Calculates score multiplier based on current difficulty
 * @param score Current game score
 * @returns Score multiplier for current difficulty level
 */
export function getScoreMultiplier(score: number): number {
  const level = getDifficultyLevelFromScore(score)
  return DIFFICULTY_CONFIGS[level].scoreMultiplier
}

/**
 * Applies difficulty-adjusted score calculation
 * @param baseScore Base score value
 * @param currentScore Current total score for difficulty assessment
 * @returns Adjusted score value
 */
export function calculateAdjustedScore(
  baseScore: number,
  currentScore: number
): number {
  const multiplier = getScoreMultiplier(currentScore)
  return Math.floor(baseScore * multiplier)
}

/**
 * Checks if player should advance to next difficulty level
 * @param currentScore Current game score
 * @param previousScore Previous score when last checked
 * @returns True if difficulty level should increase
 */
export function shouldIncreaseDifficulty(
  currentScore: number,
  previousScore: number
): boolean {
  const currentLevel = getDifficultyLevelFromScore(currentScore)
  const previousLevel = getDifficultyLevelFromScore(previousScore)
  return currentLevel !== previousLevel
}

/**
 * Gets difficulty progression information
 * @param score Current game score
 * @returns Object containing current level info and progress to next level
 */
export function getDifficultyProgress(score: number) {
  const currentLevel = getDifficultyLevelFromScore(score)
  const currentConfig = DIFFICULTY_CONFIGS[currentLevel]

  // Define score thresholds for each level
  const thresholds = [0, 50, 150, 300, 500, 800]
  const levels = Object.values(DifficultyLevel)

  const currentLevelIndex = levels.indexOf(currentLevel)
  const nextThreshold = thresholds[currentLevelIndex + 1] || Infinity
  const currentThreshold = thresholds[currentLevelIndex] || 0

  const progress =
    nextThreshold === Infinity
      ? 1
      : (score - currentThreshold) / (nextThreshold - currentThreshold)

  return {
    currentLevel,
    currentConfig,
    nextLevel: levels[currentLevelIndex + 1] || null,
    progress: Math.min(progress, 1),
    scoreToNext: nextThreshold === Infinity ? 0 : nextThreshold - score
  }
}

/**
 * Creates a custom difficulty configuration
 * @param speed Game speed in milliseconds per move
 * @param scoreMultiplier Score multiplier for this difficulty
 * @param description Custom description
 * @returns Custom difficulty configuration
 */
export function createCustomDifficulty(
  speed: number,
  scoreMultiplier: number,
  description: string
): DifficultyConfig {
  return {
    level: DifficultyLevel.MEDIUM, // Default level for custom configs
    speed,
    scoreMultiplier,
    description
  }
}
