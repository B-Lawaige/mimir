import { maxErrorsForLevel } from './errors.js'

export const PACTS = [
  {
    id: 'bottomless-well',
    label: 'Puits sans fond',
    labelEn: 'Bottomless Well',
    description: 'Erreurs illimitées, mais les points sont réduits de 75 %.',
    descriptionEn: 'Unlimited mistakes, but score gains are reduced by 75%.',
    minLevel: 5,
    modifiers: { unlimitedErrors: true, scoreMultiplier: 0.25 },
  },
  {
    id: 'mimir-eye',
    label: 'Œil de Mimir',
    labelEn: 'Eye of Mimir',
    description: 'Toute la grille est révélée 5 secondes. Points réduits de 25 %.',
    descriptionEn: 'The full grid is revealed for 5 seconds. Score gains reduced by 25%.',
    minLevel: 5,
    modifiers: { previewFraction: 1, previewDuration: 5000, scoreMultiplier: 0.75 },
  },
  {
    id: 'reflection',
    label: 'Reflet',
    labelEn: 'Reflection',
    description: 'La moitié des cartes est révélée 4 secondes, sans contrepartie.',
    descriptionEn: 'Half the cards are revealed for 4 seconds, with no penalty.',
    minLevel: 5,
    modifiers: { previewFraction: 0.5, previewDuration: 4000, scoreMultiplier: 1 },
  },
  {
    id: 'wager',
    label: 'Pari',
    labelEn: 'Wager',
    description: 'Points doublés, mais deux erreurs autorisées en moins.',
    descriptionEn: 'Double points, but two fewer mistakes allowed.',
    minLevel: 8,
    modifiers: { scoreMultiplier: 2, errorAdjustment: -2 },
  },
  {
    id: 'race',
    label: 'Course',
    labelEn: 'Race',
    description: 'Points ×1,5. Un compte à rebours de 60 secondes.',
    descriptionEn: 'Score ×1.5. A 60-second countdown.',
    minLevel: 5,
    modifiers: { scoreMultiplier: 1.5, timeLimitSeconds: 60 },
  },
  {
    id: 'whirlpool',
    label: 'Tourbillon',
    labelEn: 'Whirlpool',
    description: 'Points doublés, les cartes non trouvées sont remélangées après une erreur.',
    descriptionEn: 'Double points; unmatched cards are shuffled after a mistake.',
    minLevel: 8,
    modifiers: { scoreMultiplier: 2, shuffleOnError: true },
  },
  {
    id: 'breath',
    label: 'Souffle',
    labelEn: 'Breath',
    description: 'Deux erreurs supplémentaires, les cartes ratées restent visibles 0,5 seconde.',
    descriptionEn: 'Two extra mistakes; mismatched cards stay visible for 0.5 seconds.',
    minLevel: 5,
    modifiers: { errorAdjustment: 2, mismatchDuration: 500 },
  },
]

export function defaultModifiers(level) {
  return {
    maxErrors: maxErrorsForLevel(level),
    unlimitedErrors: false,
    scoreMultiplier: 1,
    previewFraction: 0,
    previewDuration: 0,
    timeLimitSeconds: 0,
    shuffleOnError: false,
    mismatchDuration: 900,
  }
}

export function modifiersForPact(level, pact) {
  const defaults = defaultModifiers(level)
  if (!pact) return defaults

  const modifiers = { ...defaults, ...pact.modifiers }
  if (modifiers.errorAdjustment) {
    modifiers.maxErrors = Math.max(2, defaults.maxErrors + modifiers.errorAdjustment)
  }
  if (modifiers.unlimitedErrors) {
    modifiers.maxErrors = null
  }

  return modifiers
}

export function drawPacts(level, random = Math.random) {
  const eligible = PACTS.filter((pact) => pact.minLevel <= level)
  const shuffled = [...eligible]

  for (let index = shuffled.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(random() * (index + 1))
    ;[shuffled[index], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[index],
    ]
  }

  return shuffled.slice(0, 3)
}
