/**
 * Multiplayer game state hook
 * Extends the single-player useGameState pattern for dual-player gameplay
 */

'use client'

import { useReducer, useCallback, useEffect, useRef } from 'react'
import { GameState, Direction, DEFAULT_GAME_CONFIG, Food } from '@/types/game'
import {
  MultiplayerGameState,
  MultiplayerAction,
  MultiplayerActionType,
  GameMode,
  MatchEndReason,
  PlayerEntity,
  INITIAL_PLAYER_STATS
} from '@/types/multiplayer'
import {
  MultiplayerGameManager,
  MultiplayerEvent
} from '@/lib/multiplayer/MultiplayerGameManager'
import {
  getGameModeConfig,
  getFoodCountForMode,
  DEFAULT_PLAYER_CONFIG
} from '@/lib/multiplayer/multiplayerConfig'

/**
 * Initial multiplayer game state
 */
const createInitialState = (
  gameMode: GameMode = GameMode.COMPETITIVE
): MultiplayerGameState => {
  const modeConfig = getGameModeConfig(gameMode)

  return {
    state: GameState.IDLE,
    gameMode,
    modeConfig,
    player1: {
      identity: {
        id: 1,
        ...DEFAULT_PLAYER_CONFIG.player1
      },
      snake: {
        body: [
          { x: 5, y: 10 },
          { x: 4, y: 10 },
          { x: 3, y: 10 }
        ],
        direction: Direction.RIGHT,
        nextDirection: Direction.RIGHT
      },
      stats: { ...INITIAL_PLAYER_STATS },
      isReady: false,
      isAlive: true,
      hasCollision: false,
      currentInput: null
    },
    player2: {
      identity: {
        id: 2,
        ...DEFAULT_PLAYER_CONFIG.player2
      },
      snake: {
        body: [
          { x: 15, y: 10 },
          { x: 16, y: 10 },
          { x: 17, y: 10 }
        ],
        direction: Direction.LEFT,
        nextDirection: Direction.LEFT
      },
      stats: { ...INITIAL_PLAYER_STATS },
      isReady: false,
      isAlive: true,
      hasCollision: false,
      currentInput: null
    },
    food: [],
    board: DEFAULT_GAME_CONFIG.board,
    speed: DEFAULT_GAME_CONFIG.initialSpeed,
    isPaused: false,
    match: null
  }
}

/**
 * Multiplayer game state reducer
 * @param state Current game state
 * @param action Action to process
 * @returns New game state
 */
function multiplayerGameStateReducer(
  state: MultiplayerGameState,
  action: MultiplayerAction
): MultiplayerGameState {
  switch (action.type) {
    case MultiplayerActionType.INIT_MULTIPLAYER: {
      const gameMode =
        (action.payload?.gameMode as GameMode) || GameMode.COMPETITIVE
      return createInitialState(gameMode)
    }

    case MultiplayerActionType.START_MATCH: {
      // Both players must be ready
      if (!state.player1.isReady || !state.player2.isReady) {
        return state
      }

      return {
        ...state,
        state: GameState.PLAYING,
        match: {
          matchId: `match_${Date.now()}`,
          startTime: Date.now(),
          endTime: null,
          winnerId: null,
          endReason: null,
          duration: 0,
          round: 1
        }
      }
    }

    case MultiplayerActionType.TOGGLE_READY_PLAYER1:
      return {
        ...state,
        player1: {
          ...state.player1,
          isReady: !state.player1.isReady
        }
      }

    case MultiplayerActionType.TOGGLE_READY_PLAYER2:
      return {
        ...state,
        player2: {
          ...state.player2,
          isReady: !state.player2.isReady
        }
      }

    case MultiplayerActionType.CHANGE_DIRECTION_PLAYER1: {
      const direction = action.payload?.direction as Direction
      if (!direction) return state

      return {
        ...state,
        player1: {
          ...state.player1,
          currentInput: direction
        }
      }
    }

    case MultiplayerActionType.CHANGE_DIRECTION_PLAYER2: {
      const direction = action.payload?.direction as Direction
      if (!direction) return state

      return {
        ...state,
        player2: {
          ...state.player2,
          currentInput: direction
        }
      }
    }

    case MultiplayerActionType.SWITCH_MODE: {
      const newMode = (action.payload?.gameMode as GameMode) || state.gameMode
      return {
        ...createInitialState(newMode),
        gameMode: newMode,
        modeConfig: getGameModeConfig(newMode)
      }
    }

    case MultiplayerActionType.END_MATCH: {
      const winnerId = action.payload?.winnerId as 1 | 2 | null
      const endReason = action.payload?.endReason as MatchEndReason

      return {
        ...state,
        state: GameState.GAME_OVER,
        match: state.match
          ? {
              ...state.match,
              endTime: Date.now(),
              winnerId: winnerId || null,
              endReason: endReason || null,
              duration: Math.floor((Date.now() - state.match.startTime) / 1000)
            }
          : null
      }
    }

    case MultiplayerActionType.RESET_MULTIPLAYER:
      return createInitialState(state.gameMode)

    case MultiplayerActionType.UPDATE_MATCH_STATS: {
      const player1State = action.payload?.player1 as PlayerEntity | undefined
      const player2State = action.payload?.player2 as PlayerEntity | undefined
      const food = action.payload?.food as Food[] | undefined

      const updates: Partial<MultiplayerGameState> = {}

      if (player1State) updates.player1 = player1State
      if (player2State) updates.player2 = player2State
      if (food) updates.food = food

      return {
        ...state,
        ...updates
      }
    }

    default:
      return state
  }
}

/**
 * Custom hook for multiplayer game state management
 * Integrates with MultiplayerGameManager for player coordination
 * @param initialMode Initial game mode
 * @returns Multiplayer game state and action creators
 */
export function useMultiplayerGameState(
  initialMode: GameMode = GameMode.COMPETITIVE
) {
  const [gameState, dispatch] = useReducer(
    multiplayerGameStateReducer,
    initialMode,
    createInitialState
  )

  const gameManagerRef = useRef<MultiplayerGameManager | null>(null)

  /**
   * Initialize game manager
   */
  useEffect(() => {
    gameManagerRef.current = new MultiplayerGameManager(
      gameState.board,
      gameState.gameMode
    )

    // Setup event listeners
    const handleStateUpdate = () => {
      if (!gameManagerRef.current) return

      const [p1State, p2State] = gameManagerRef.current.getPlayerStates()
      const food = gameManagerRef.current.generateFood(
        getFoodCountForMode(gameState.gameMode)
      )

      dispatch({
        type: MultiplayerActionType.UPDATE_MATCH_STATS,
        payload: { player1: p1State, player2: p2State, food }
      })
    }

    gameManagerRef.current.addEventListener(
      MultiplayerEvent.STATE_UPDATE,
      handleStateUpdate
    )

    gameManagerRef.current.addEventListener(
      MultiplayerEvent.MATCH_END,
      (event) => {
        const matchData = event.data as {
          winnerId: 1 | 2 | null
          endReason: MatchEndReason
        }
        dispatch({
          type: MultiplayerActionType.END_MATCH,
          payload: matchData
        })
      }
    )

    return () => {
      gameManagerRef.current?.destroy()
    }
  }, [gameState.board, gameState.gameMode])

  /**
   * Initialize multiplayer game
   */
  const initMultiplayer = useCallback((mode?: GameMode) => {
    dispatch({
      type: MultiplayerActionType.INIT_MULTIPLAYER,
      payload: { gameMode: mode }
    })
  }, [])

  /**
   * Toggle player ready state
   */
  const togglePlayerReady = useCallback((playerId: 1 | 2) => {
    const actionType =
      playerId === 1
        ? MultiplayerActionType.TOGGLE_READY_PLAYER1
        : MultiplayerActionType.TOGGLE_READY_PLAYER2

    dispatch({ type: actionType })

    gameManagerRef.current?.togglePlayerReady(playerId)
  }, [])

  /**
   * Start multiplayer match
   */
  const startMatch = useCallback(() => {
    if (!gameState.player1.isReady || !gameState.player2.isReady) {
      return
    }

    dispatch({ type: MultiplayerActionType.START_MATCH })
    gameManagerRef.current?.startMatch()

    // Generate initial food
    const foodCount = getFoodCountForMode(gameState.gameMode)
    const food = gameManagerRef.current?.generateFood(foodCount) || []

    dispatch({
      type: MultiplayerActionType.UPDATE_MATCH_STATS,
      payload: { food }
    })
  }, [gameState.player1.isReady, gameState.player2.isReady, gameState.gameMode])

  /**
   * Change player direction
   */
  const changePlayerDirection = useCallback(
    (playerId: 1 | 2, direction: Direction) => {
      const actionType =
        playerId === 1
          ? MultiplayerActionType.CHANGE_DIRECTION_PLAYER1
          : MultiplayerActionType.CHANGE_DIRECTION_PLAYER2

      dispatch({ type: actionType, payload: { direction } })
      gameManagerRef.current?.changePlayerDirection(playerId, direction)
    },
    []
  )

  /**
   * Move players (called by game loop)
   */
  const movePlayers = useCallback(() => {
    if (gameState.state !== GameState.PLAYING || gameState.isPaused) {
      return
    }

    const manager = gameManagerRef.current
    if (!manager) return

    // Move both players
    manager.movePlayer(1)
    manager.movePlayer(2)

    // Check food consumption
    gameState.food.forEach((foodItem) => {
      if (manager.checkFoodConsumption(1, foodItem.position)) {
        manager.handleFoodConsumption(1, foodItem.value)
      }
      if (manager.checkFoodConsumption(2, foodItem.position)) {
        manager.handleFoodConsumption(2, foodItem.value)
      }
    })

    // Update game time
    manager.updateGameTime(gameState.speed / 1000)

    // Sync state
    const [p1State, p2State] = manager.getPlayerStates()
    const food = manager.generateFood(getFoodCountForMode(gameState.gameMode))

    dispatch({
      type: MultiplayerActionType.UPDATE_MATCH_STATS,
      payload: { player1: p1State, player2: p2State, food }
    })
  }, [
    gameState.state,
    gameState.isPaused,
    gameState.food,
    gameState.speed,
    gameState.gameMode
  ])

  /**
   * Switch game mode
   */
  const switchMode = useCallback((mode: GameMode) => {
    dispatch({
      type: MultiplayerActionType.SWITCH_MODE,
      payload: { gameMode: mode }
    })

    gameManagerRef.current?.setGameMode(mode)
  }, [])

  /**
   * Reset game
   */
  const resetGame = useCallback(() => {
    dispatch({ type: MultiplayerActionType.RESET_MULTIPLAYER })
    gameManagerRef.current?.resetPlayers()
  }, [])

  /**
   * End match manually
   */
  const endMatch = useCallback(
    (winnerId: 1 | 2 | null, endReason: MatchEndReason) => {
      dispatch({
        type: MultiplayerActionType.END_MATCH,
        payload: { winnerId, endReason }
      })

      gameManagerRef.current?.endMatch(winnerId, endReason)
    },
    []
  )

  return {
    gameState,
    gameManager: gameManagerRef.current,
    actions: {
      initMultiplayer,
      togglePlayerReady,
      startMatch,
      changePlayerDirection,
      movePlayers,
      switchMode,
      resetGame,
      endMatch
    }
  }
}

/**
 * Type definition for the hook return value
 */
export type MultiplayerGameStateHook = ReturnType<
  typeof useMultiplayerGameState
>
