const iconModules = import.meta.glob('../../icon/**/*.svg', {
  eager: true,
  import: 'default',
  query: '?url',
})

const icons = Object.entries(iconModules).map(([path, src]) => ({
  id: path,
  name: path.split('/').pop().replace(/\.svg$/, '').replaceAll('-', ' '),
  src,
}))

export const MAX_LEVEL = 10
const MAX_PAIRS = 12

function chooseRandomIcons(count) {
  const shuffledIcons = [...icons]

  for (let index = shuffledIcons.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    ;[shuffledIcons[index], shuffledIcons[randomIndex]] = [
      shuffledIcons[randomIndex],
      shuffledIcons[index],
    ]
  }

  return shuffledIcons.slice(0, count)
}

export function pairsForLevel(level) {
  return Math.min(3 + level - 1, MAX_PAIRS)
}

export function createDeck(level) {
  const pairCount = pairsForLevel(level)
  const selectedIcons = chooseRandomIcons(pairCount)

  return selectedIcons.flatMap((icon, index) => [
    { id: `level-${level}-pair-${index}-a`, symbol: icon.id, icon },
    { id: `level-${level}-pair-${index}-b`, symbol: icon.id, icon },
  ])
}
