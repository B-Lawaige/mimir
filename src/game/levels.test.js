import { describe, expect, it } from 'vitest'
import { createDeck, pairsForLevel } from './levels.js'

describe('pairsForLevel', () => {
  it('uses the requested pair count for every level', () => {
    expect(Array.from({ length: 10 }, (_, index) => pairsForLevel(index + 1)))
      .toEqual([4, 4, 5, 5, 6, 6, 6, 7, 7, 8])
  })

  it('keeps the final level pair count for levels above the game limit', () => {
    expect(pairsForLevel(11)).toBe(8)
  })
})

describe('createDeck', () => {
  it('creates 8 cards at level 1 and 16 at level 10', () => {
    expect(createDeck(1)).toHaveLength(8)
    expect(createDeck(10)).toHaveLength(16)
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
