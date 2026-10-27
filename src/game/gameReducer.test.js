import { describe, expect, it } from 'vitest'
import { createDeck } from './levels.js'
import {
  createInitialGameState,
  gameReducer,
  MAX_ERRORS,
  POINTS_PER_PAIR,
} from './gameReducer.js'

function startGame() {
  return gameReducer(createInitialGameState(), {
    type: 'START_GAME',
    cards: createDeck(1),
  })
}

function flipPair(state, firstId, secondId) {
  const withFirstCard = gameReducer(state, { type: 'FLIP_CARD', id: firstId })
  return gameReducer(withFirstCard, { type: 'FLIP_CARD', id: secondId })
}

function completeLevel(state) {
  let nextState = state
  const symbols = [...new Set(state.cards.map((card) => card.symbol))]

  for (const symbol of symbols) {
    const pair = state.cards.filter((card) => card.symbol === symbol)
    nextState = flipPair(nextState, pair[0].id, pair[1].id)
  }

  return nextState
}

describe('gameReducer', () => {
  it('starts a new game with a fresh level 1 state', () => {
    const state = gameReducer(
      { ...createInitialGameState(), score: 500, level: 4 },
      { type: 'START_GAME', cards: createDeck(1) }
    )

    expect(state.status).toBe('playing')
    expect(state.level).toBe(1)
    expect(state.score).toBe(0)
    expect(state.errors).toBe(0)
    expect(state.cards.every((card) => !card.isFlipped && !card.isMatched)).toBe(true)
  })

  it('flips a card and ignores a repeated click on it', () => {
    const state = startGame()
    const cardId = state.cards[0].id
    const flipped = gameReducer(state, { type: 'FLIP_CARD', id: cardId })

    expect(flipped.flippedIds).toEqual([cardId])
    expect(flipped.cards.find((card) => card.id === cardId).isFlipped).toBe(true)
    expect(gameReducer(flipped, { type: 'FLIP_CARD', id: cardId })).toBe(flipped)
  })

  it('marks a matching pair and awards points', () => {
    const state = startGame()
    const pair = state.cards.filter(
      (card) => card.symbol === state.cards[0].symbol
    )
    const matched = flipPair(state, pair[0].id, pair[1].id)

    expect(matched.status).toBe('playing')
    expect(matched.score).toBe(POINTS_PER_PAIR)
    expect(matched.flippedIds).toEqual([])
    expect(
      matched.cards
        .filter((card) => pair.some((pairCard) => pairCard.id === card.id))
        .every((card) => card.isFlipped && card.isMatched)
    ).toBe(true)
  })

  it('counts a mismatch and blocks more flips until mismatched cards are hidden', () => {
    const state = startGame()
    const first = state.cards[0]
    const otherSymbolCard = state.cards.find(
      (card) => card.symbol !== first.symbol
    )
    const checking = flipPair(state, first.id, otherSymbolCard.id)

    expect(checking.status).toBe('checking')
    expect(checking.errors).toBe(1)
    expect(
      gameReducer(checking, {
        type: 'FLIP_CARD',
        id: state.cards.find((card) => card.id !== first.id && card.id !== otherSymbolCard.id).id,
      })
    ).toBe(checking)

    const resolved = gameReducer(checking, { type: 'HIDE_MISMATCHED_CARDS' })
    expect(resolved.status).toBe('playing')
    expect(resolved.flippedIds).toEqual([])
    expect(resolved.cards.filter((card) => !card.isMatched).every((card) => !card.isFlipped)).toBe(true)
  })

  it('ends the game after the fourth error is resolved', () => {
    let state = startGame()
    const first = state.cards[0]
    const otherSymbolCard = state.cards.find(
      (card) => card.symbol !== first.symbol
    )

    for (let error = 0; error < MAX_ERRORS; error++) {
      state = flipPair(state, first.id, otherSymbolCard.id)
      expect(state.status).toBe('checking')
      state = gameReducer(state, { type: 'HIDE_MISMATCHED_CARDS' })
    }

    expect(state.status).toBe('gameOver')
    expect(state.errors).toBe(MAX_ERRORS)
  })

  it('awards the level bonus and advances to the next level', () => {
    const completed = completeLevel(startGame())

    expect(completed.status).toBe('levelComplete')
    expect(completed.score).toBe(3 * POINTS_PER_PAIR + 4 * 50)

    const nextLevel = gameReducer(completed, {
      type: 'NEXT_LEVEL',
      cards: createDeck(2),
    })
    expect(nextLevel.status).toBe('playing')
    expect(nextLevel.level).toBe(2)
    expect(nextLevel.score).toBe(completed.score)
    expect(nextLevel.errors).toBe(0)
    expect(nextLevel.cards).toHaveLength(8)
  })

  it('wins after completing the final level', () => {
    let state = startGame()

    for (let level = 1; level < 10; level++) {
      state = completeLevel(state)
      state = gameReducer(state, {
        type: 'NEXT_LEVEL',
        cards: createDeck(level + 1),
      })
    }

    const completed = completeLevel(state)

    expect(completed.status).toBe('won')
    expect(completed.level).toBe(10)
  })
})
