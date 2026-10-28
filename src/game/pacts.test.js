import { describe, expect, it } from 'vitest'
import { PACTS } from './pacts.js'

describe('preview pacts', () => {
  it('reveals cards two seconds longer than before', () => {
    expect(PACTS.find((pact) => pact.id === 'mimir-eye').modifiers.previewDuration)
      .toBe(5000)
    expect(PACTS.find((pact) => pact.id === 'reflection').modifiers.previewDuration)
      .toBe(4000)
  })

  it('describes the updated preview duration in both languages', () => {
    expect(PACTS.find((pact) => pact.id === 'mimir-eye').description).toContain('5 secondes')
    expect(PACTS.find((pact) => pact.id === 'mimir-eye').descriptionEn).toContain('5 seconds')
    expect(PACTS.find((pact) => pact.id === 'reflection').description).toContain('4 secondes')
    expect(PACTS.find((pact) => pact.id === 'reflection').descriptionEn).toContain('4 seconds')
  })
})
