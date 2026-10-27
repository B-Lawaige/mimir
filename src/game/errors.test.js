import { describe, expect, it } from 'vitest'
import { maxErrorsForLevel } from './errors.js'

describe('maxErrorsForLevel', () => {
  it('allows 4 errors through level 3', () => {
    expect(maxErrorsForLevel(1)).toBe(4)
    expect(maxErrorsForLevel(3)).toBe(4)
  })

  it('allows 5 errors from level 4 through level 6', () => {
    expect(maxErrorsForLevel(4)).toBe(5)
    expect(maxErrorsForLevel(6)).toBe(5)
  })

  it('allows 6 errors from level 7 onward', () => {
    expect(maxErrorsForLevel(7)).toBe(6)
    expect(maxErrorsForLevel(10)).toBe(6)
  })
})
