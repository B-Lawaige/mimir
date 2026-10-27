import { describe, expect, it } from 'vitest'
import { getBoardLayout } from './boardLayout.js'

describe('getBoardLayout', () => {
  it('chooses a complete rectangular grid for each supported board size', () => {
    for (let pairCount = 3; pairCount <= 12; pairCount += 1) {
      const cardCount = pairCount * 2
      const layout = getBoardLayout(cardCount, { width: 1440, height: 900 })

      expect(cardCount % layout.columns).toBe(0)
      expect(layout.columns * (cardCount / layout.columns)).toBe(cardCount)
    }
  })

  it('keeps cards at a stable size across levels at the same viewport', () => {
    const viewport = { width: 1440, height: 900 }

    expect(getBoardLayout(6, viewport).cardSize).toBe(
      getBoardLayout(24, viewport).cardSize
    )
  })

  it('returns no columns for an empty board', () => {
    expect(getBoardLayout(0, { width: 375, height: 667 }).columns).toBe(0)
  })
})
