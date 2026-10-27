import { MAX_LEVEL } from './levels.js'

export const MAX_ERRORS = 4
export const POINTS_PER_PAIR = 100
export const LEVEL_COMPLETION_BONUS = 50

export function createInitialGameState() {
  return {
    status: 'idle',
    level: 1,
    cards: [],
    flippedIds: [],
    errors: 0,
    score: 0,
  }
}

export function gameReducer(state, action) {
  switch (action.type) {
    case 'START_GAME':
      return {
        ...createInitialGameState(),
        status: 'playing',
        cards: action.cards.map((card) => ({
          ...card,
          isFlipped: false,
          isMatched: false,
        })),
      }

    case 'FLIP_CARD': {
      if (state.status !== 'playing') {
        return state
      }

      const clickedCard = state.cards.find((card) => card.id === action.id)

      if (!clickedCard || clickedCard.isFlipped || clickedCard.isMatched) {
        return state
      }

      const firstCardId = state.flippedIds[0]
      const firstCard = state.cards.find((card) => card.id === firstCardId)

      if (!firstCard) {
        return {
          ...state,
          cards: state.cards.map((card) =>
            card.id === action.id ? { ...card, isFlipped: true } : card
          ),
          flippedIds: [action.id],
        }
      }

      const isPair = firstCard.symbol === clickedCard.symbol

      if (!isPair) {
        return {
          ...state,
          status: 'checking',
          errors: state.errors + 1,
          cards: state.cards.map((card) =>
            card.id === action.id ? { ...card, isFlipped: true } : card
          ),
          flippedIds: [firstCardId, action.id],
        }
      }

      const matchedIds = [firstCardId, action.id]
      const cards = state.cards.map((card) =>
        matchedIds.includes(card.id)
          ? { ...card, isFlipped: true, isMatched: true }
          : card
      )
      const completesLevel = cards.every((card) => card.isMatched)
      const bonus = completesLevel
        ? LEVEL_COMPLETION_BONUS * (MAX_ERRORS - state.errors)
        : 0

      return {
        ...state,
        status: completesLevel
          ? state.level === MAX_LEVEL
            ? 'won'
            : 'levelComplete'
          : 'playing',
        cards,
        flippedIds: [],
        score: state.score + POINTS_PER_PAIR + bonus,
      }
    }

    case 'HIDE_MISMATCHED_CARDS':
      if (state.status !== 'checking') {
        return state
      }

      return {
        ...state,
        status: state.errors >= MAX_ERRORS ? 'gameOver' : 'playing',
        cards: state.cards.map((card) =>
          state.flippedIds.includes(card.id) && !card.isMatched
            ? { ...card, isFlipped: false }
            : card
        ),
        flippedIds: [],
      }

    case 'NEXT_LEVEL':
      if (state.status !== 'levelComplete' || state.level >= MAX_LEVEL) {
        return state
      }

      return {
        ...state,
        status: 'playing',
        level: state.level + 1,
        cards: action.cards.map((card) => ({
          ...card,
          isFlipped: false,
          isMatched: false,
        })),
        flippedIds: [],
        errors: 0,
      }

    default:
      return state
  }
}
