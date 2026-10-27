import { describe, expect, it } from 'vitest'
import { createDeck, pairsForLevel } from './levels.js'

describe('pairsForLevel', () => {
  it('starts with 3 pairs at level 1', () => {
    expect(pairsForLevel(1)).toBe(3)
  })

  it('increases to 12 pairs at level 10', () => {
    expect(pairsForLevel(10)).toBe(12)
  })

  it('does not exceed the 12-pair limit', () => {
    expect(pairsForLevel(11)).toBe(12)
  })
})

describe('createDeck', () => {
  it('creates 6 cards at level 1 and 24 at level 10', () => {
    expect(createDeck(1)).toHaveLength(6)
    expect(createDeck(10)).toHaveLength(24)
  })

  it('creates pairs with unique card IDs', () => {
    const deck = createDeck(4)
    const symbols = [...new Set(deck.map((card) => card.symbol))]

    expect(new Set(deck.map((card) => card.id)).size).toBe(deck.length)
    expect(
      symbols.every(
        (symbol) => deck.filter((card) => card.symbol === symbol).length === 2
      )
    ).toBe(true)
  })
})
