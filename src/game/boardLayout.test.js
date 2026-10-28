import { describe, expect, it } from 'vitest'
import { getBoardLayout } from './boardLayout.js'

describe('getBoardLayout', () => {
  it('chooses a complete rectangular grid for each supported board size', () => {
    for (let pairCount = 4; pairCount <= 8; pairCount += 1) {
      const cardCount = pairCount * 2
      const layout = getBoardLayout(cardCount, { width: 1440, height: 900 })

      expect(cardCount % layout.columns).toBe(0)
      expect(layout.columns * layout.rows).toBe(cardCount)
    }
  })

  it('uses large cards on a desktop-sized screen', () => {
    const layout = getBoardLayout(16, { width: 1440, height: 900 })

    expect(layout.cardSize).toBeGreaterThanOrEqual(150)
  })

  it('keeps cards readable on a phone even if the board needs vertical scrolling', () => {
    const layout = getBoardLayout(16, { width: 375, height: 844 })

    expect(layout.cardSize).toBeGreaterThanOrEqual(90)
  })

  it('returns no columns for an empty board', () => {
    expect(getBoardLayout(0, { width: 375, height: 667 })).toMatchObject({
      columns: 0,
      rows: 0,
    })
  })
})
