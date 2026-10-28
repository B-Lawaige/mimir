const MAX_CARD_SIZE = 200
const PREFERRED_MIN_CARD_SIZE = 90

export function getBoardLayout(cardCount, viewport) {
  const gap = Math.min(16, Math.max(8, viewport.width * 0.012))

  if (!cardCount) {
    return { columns: 0, rows: 0, cardSize: PREFERRED_MIN_CARD_SIZE, gap }
  }

  const availableWidth = Math.max(240, viewport.width - 48)
  const availableHeight = Math.max(160, viewport.height - 230)
  const targetRatio = availableWidth / availableHeight
  const layouts = Array.from({ length: cardCount }, (_, index) => index + 1)
    .filter((columns) => cardCount % columns === 0)
    .map((columns) => {
      const rows = cardCount / columns
      const widthPerCard =
        (availableWidth - gap * (columns - 1)) / columns
      const heightPerCard = (availableHeight - gap * (rows - 1)) / rows
      const cardSize = Math.max(
        46,
        Math.min(
          MAX_CARD_SIZE,
          widthPerCard,
          Math.max(PREFERRED_MIN_CARD_SIZE, heightPerCard)
        )
      )

      return {
        columns,
        rows,
        cardSize,
        ratioDifference: Math.abs(Math.log(columns / rows / targetRatio)),
      }
    })

  const bestSize = Math.max(...layouts.map((layout) => layout.cardSize))
  const bestLayout = layouts
    .filter((layout) => layout.cardSize >= bestSize - 1)
    .reduce((best, layout) =>
      layout.ratioDifference < best.ratioDifference ? layout : best
    )

  return { ...bestLayout, gap: Math.round(gap) }
}
