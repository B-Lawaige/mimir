const symbols = [
  '🍎', '🍋', '🍇', '🍊', '🍓', '🍒',
  '🍉', '🍍', '🥝', '🥑', '🥕', '🌽',
]

export const MAX_LEVEL = 10
const MAX_PAIRS = 12

export function pairsForLevel(level) {
  return Math.min(3 + level - 1, MAX_PAIRS)
}

export function createDeck(level) {
  const pairCount = pairsForLevel(level)

  return symbols.slice(0, pairCount).flatMap((symbol, index) => [
    { id: `level-${level}-pair-${index}-a`, symbol },
    { id: `level-${level}-pair-${index}-b`, symbol },
  ])
}
