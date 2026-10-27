import { MAX_LEVEL } from './levels.js'
import { maxErrorsForLevel } from './errors.js'
import { defaultModifiers, modifiersForPact } from './pacts.js'

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
    modifiers: defaultModifiers(1),
    pact: null,
    pactOptions: [],
    timeRemaining: null,
  }
}

export function gameReducer(state, action) {
  switch (action.type) {
    case 'START_GAME':
      return {
        ...createInitialGameState(),
        status: 'playing',
        modifiers: defaultModifiers(1),
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
        ? LEVEL_COMPLETION_BONUS *
          Math.max(
            0,
            (state.modifiers.maxErrors ??
              maxErrorsForLevel(state.level)) - state.errors
          )
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
        score:
          state.score +
          Math.round((POINTS_PER_PAIR + bonus) * state.modifiers.scoreMultiplier),
      }
    }

    case 'HIDE_MISMATCHED_CARDS':
      if (state.status !== 'checking') {
        return state
      }

      return {
        ...state,
        status:
        (state.modifiers.maxErrors !== null &&
        state.errors >= state.modifiers.maxErrors)
          ? 'gameOver'
          : 'playing',
        cards: action.cards
          ? action.cards.map((card) => ({
              ...card,
              isFlipped: card.isMatched,
            }))
          : state.cards.map((card) =>
              state.flippedIds.includes(card.id) && !card.isMatched
                ? { ...card, isFlipped: false }
                : card
            ),
        flippedIds: [],
      }

    case 'NEXT_LEVEL': {
      if (state.status !== 'levelComplete' || state.level >= MAX_LEVEL) {
        return state
      }

      const nextLevel = state.level + 1
      if (nextLevel >= 5) {
        return {
          ...state,
          status: 'choosingPact',
          level: nextLevel,
          errors: 0,
          pactOptions: action.pacts ?? [],
          pact: null,
          modifiers: defaultModifiers(nextLevel),
          timeRemaining: null,
        }
      }

      return {
        ...state,
        status: 'playing',
        level: nextLevel,
        cards: action.cards.map((card) => ({
          ...card,
          isFlipped: false,
          isMatched: false,
        })),
        flippedIds: [],
        errors: 0,
        pact: null,
        modifiers: defaultModifiers(nextLevel),
        timeRemaining: null,
      }
    }

    case 'CHOOSE_PACT': {
      if (state.status !== 'choosingPact') {
        return state
      }

      const pact =
        action.pactId === null
          ? null
          : state.pactOptions.find((option) => option.id === action.pactId) ?? null
      const modifiers = modifiersForPact(state.level, pact)
      const previewIds = modifiers.previewFraction
        ? action.previewIds ?? []
        : []

      return {
        ...state,
        status: previewIds.length ? 'preview' : 'playing',
        cards: action.cards.map((card) => ({
          ...card,
          isFlipped: previewIds.includes(card.id),
          isMatched: false,
        })),
        flippedIds: [],
        errors: 0,
        pact,
        modifiers,
        timeRemaining: modifiers.timeLimitSeconds || null,
      }
    }

    case 'PREVIEW_COMPLETE':
      if (state.status !== 'preview') return state
      return {
        ...state,
        status: 'playing',
        cards: state.cards.map((card) =>
          card.isMatched ? card : { ...card, isFlipped: false }
        ),
      }

    case 'TIME_EXPIRED':
      if (state.status !== 'playing' || !state.timeRemaining) return state
      return {
        ...state,
        errors: state.errors + 1,
        timeRemaining: null,
        status:
          state.modifiers.maxErrors !== null &&
          state.errors + 1 >= state.modifiers.maxErrors
            ? 'gameOver'
            : 'playing',
      }

    default:
      return state
  }
}
