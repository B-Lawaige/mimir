export function getBoardLayout(cardCount, viewport) {
  const gap = Math.min(12, Math.max(6, viewport.width * 0.012))
  const cardSize = Math.max(
    46,
    Math.min(100, viewport.width * 0.09, viewport.height * 0.1)
  )

  if (!cardCount) {
    return { columns: 0, cardSize, gap }
  }

  const availableWidth = viewport.width - 24
  const availableHeight = viewport.height - 220
  const maxColumns = Math.max(
    1,
    Math.floor((availableWidth + gap) / (cardSize + gap))
  )
  const maxRows = Math.max(
    1,
    Math.floor((availableHeight + gap) / (cardSize + gap))
  )
  const targetRatio = availableWidth / Math.max(1, availableHeight)
  const columns = Array.from({ length: cardCount }, (_, index) => index + 1)
    .filter((count) => cardCount % count === 0)
    .reduce((bestColumns, count) => {
      const rows = cardCount / count
      const overflow =
        Math.max(0, count - maxColumns) + Math.max(0, rows - maxRows)
      const ratioDifference = Math.abs(Math.log(count / rows / targetRatio))
      const score = ratioDifference + overflow * 4
      const bestRows = cardCount / bestColumns
      const bestOverflow =
        Math.max(0, bestColumns - maxColumns) + Math.max(0, bestRows - maxRows)
      const bestScore =
        Math.abs(Math.log(bestColumns / bestRows / targetRatio)) +
        bestOverflow * 4

      return score < bestScore ? count : bestColumns
    }, 1)

  return { columns, cardSize, gap }
}
