import { useEffect, useReducer, useRef, useState } from 'react'
import { createDeck, MAX_LEVEL } from './game/levels.js'
import { maxErrorsForLevel } from './game/errors.js'
import { drawPacts } from './game/pacts.js'
import { getBoardLayout } from './game/boardLayout.js'
import { createInitialGameState, gameReducer } from './game/gameReducer.js'
import './App.css'
import Menu from '../Menu.jsx'
import { useAudio } from './hooks/useAudio.js'

const translations = {
  fr: {
    options: 'Options',
    scores: 'Meilleurs scores',
    start: 'Commencer le jeu',
    best: 'Meilleur score',
    back: 'Retour au menu',
    language: 'Langue',
    ambientVolume: 'Volume de l’ambiance',
    effectsVolume: 'Volume des effets',
    mute: 'Couper le son',
    unmute: 'Activer le son',
    level: 'Niveau',
    score: 'Score',
    errors: 'Erreurs',
    gameOver: 'Partie terminée',
    won: 'Victoire ! Tu as trouvé toutes les paires.',
    thanks: 'Merci d’avoir joué à MIMIR !',
    newRecord: 'Nouveau meilleur score !',
    levelComplete: 'Niveau terminé !',
    nextLevel: 'Niveau suivant',
    continue: 'Continuer',
    quitGame: 'Quitter la partie',
    choosePact: 'Choisis un pacte pour ce niveau',
    noPact: 'Aucun pacte',
    pact: 'Pacte',
    time: 'Temps',
    replay: 'Rejouer',
    home: 'Accueil',
    instructions: 'Retrouve les paires de cartes identiques.',
    optionsComing: 'Régle le son et la langue du jeu.',
    levelWord: 'Niveau',
  },
  en: {
    options: 'Options',
    scores: 'High scores',
    start: 'Start game',
    best: 'Best score',
    back: 'Back to menu',
    language: 'Language',
    ambientVolume: 'Ambient volume',
    effectsVolume: 'Sound effects volume',
    mute: 'Mute sound',
    unmute: 'Unmute sound',
    level: 'Level',
    score: 'Score',
    errors: 'Mistakes',
    gameOver: 'Game over',
    won: 'Victory! You found every pair.',
    thanks: 'Thank you for playing MIMIR!',
    newRecord: 'New high score!',
    levelComplete: 'Level complete!',
    nextLevel: 'Next level',
    continue: 'Continue',
    quitGame: 'Quit game',
    choosePact: 'Choose a pact for this level',
    noPact: 'No pact',
    pact: 'Pact',
    time: 'Time',
    replay: 'Play again',
    home: 'Home',
    instructions: 'Find all matching pairs.',
    optionsComing: 'Adjust game sound and language.',
    levelWord: 'Level',
  },
}

function readSettings() {
  try {
    const saved = JSON.parse(window.localStorage.getItem('mimir-settings') || '{}')
    return {
      ambientVolume: Number.isFinite(saved.ambientVolume) ? saved.ambientVolume : 0.25,
      effectsVolume: Number.isFinite(saved.effectsVolume) ? saved.effectsVolume : 0.65,
      isMuted: Boolean(saved.isMuted),
      language: saved.language === 'en' ? 'en' : 'fr',
    }
  } catch {
    return {
      ambientVolume: 0.25,
      effectsVolume: 0.65,
      isMuted: false,
      language: 'fr',
    }
  }
}

function shuffleCards(cardsToShuffle) {
  const shuffledCards = [...cardsToShuffle]

  for (let index = shuffledCards.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    ;[shuffledCards[index], shuffledCards[randomIndex]] = [
      shuffledCards[randomIndex],
      shuffledCards[index],
    ]
  }

  return shuffledCards
}

function shuffleUnmatchedCards(cards) {
  const unmatched = shuffleCards(cards.filter((card) => !card.isMatched))
  let unmatchedIndex = 0

  return cards.map((card) =>
    card.isMatched ? card : unmatched[unmatchedIndex++]
  )
}

function App() {
  const [game, dispatch] = useReducer(
    gameReducer,
    undefined,
    createInitialGameState
  )
  const [bestScore, setBestScore] = useState(() => {
    const savedScore = Number(window.localStorage.getItem('memory-best-score'))
    return Number.isFinite(savedScore) ? savedScore : 0
  })
  const [settings, setSettings] = useState(readSettings)
  const [screen, setScreen] = useState('menu')
  const [recordNotification, setRecordNotification] = useState(false)
  const [viewport, setViewport] = useState(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }))
  const [isMuted, setIsMuted] = useState(settings.isMuted)
  const { audioError, playEffect, startAmbience } = useAudio({
    ambientVolume: settings.ambientVolume,
    effectsVolume: settings.effectsVolume,
    isMuted,
  })
  const previousGameRef = useRef(game)
  const startingBestScoreRef = useRef(bestScore)
  const recordNotificationShownRef = useRef(false)
  const t = translations[settings.language]
  const boardLayout = getBoardLayout(game.cards.length, viewport)
  const updateSettings = (updates) => {
    setSettings((current) => {
      const next = { ...current, ...updates }
      window.localStorage.setItem('mimir-settings', JSON.stringify(next))
      return next
    })
  }

  const startGame = () => {
    startingBestScoreRef.current = bestScore
    recordNotificationShownRef.current = false
    setRecordNotification(false)
    startAmbience()
    dispatch({
      type: 'START_GAME',
      cards: shuffleCards(createDeck(1)),
    })
    setScreen('game')
  }

  const nextLevel = () => {
    const nextLevelNumber = game.level + 1
    dispatch({
      type: 'NEXT_LEVEL',
      cards:
        nextLevelNumber < 5
          ? shuffleCards(createDeck(nextLevelNumber))
          : undefined,
      pacts: nextLevelNumber >= 5 ? drawPacts(nextLevelNumber) : undefined,
    })
  }

  const choosePact = (pactId) => {
    const cards = shuffleCards(createDeck(game.level))
    const pact = game.pactOptions.find((option) => option.id === pactId)
    const previewIds = pact?.modifiers.previewFraction
      ? (() => {
          if (pact.modifiers.previewFraction === 1) {
            return cards.map((card) => card.id)
          }

          const symbols = [...new Set(cards.map((card) => card.symbol))]
          const previewSymbols = shuffleCards(symbols).slice(
            0,
            Math.ceil(symbols.length * pact.modifiers.previewFraction)
          )
          return cards
            .filter((card) => previewSymbols.includes(card.symbol))
            .map((card) => card.id)
        })()
      : []

    dispatch({
      type: 'CHOOSE_PACT',
      pactId,
      cards,
      previewIds,
    })
  }

  useEffect(() => {
    document.documentElement.lang = settings.language
  }, [settings.language])

  useEffect(() => {
    const updateViewport = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener('resize', updateViewport)
    return () => window.removeEventListener('resize', updateViewport)
  }, [])

  useEffect(() => {
    if (game.status !== 'checking') {
      return
    }

    const timeoutId = window.setTimeout(() => {
      dispatch({
        type: 'HIDE_MISMATCHED_CARDS',
        cards: game.modifiers.shuffleOnError
          ? shuffleUnmatchedCards(game.cards)
          : undefined,
      })
    }, game.modifiers.mismatchDuration)

    return () => window.clearTimeout(timeoutId)
  }, [game.status, game.modifiers, game.cards])

  useEffect(() => {
    if (game.status !== 'preview') return

    const timeoutId = window.setTimeout(() => {
      dispatch({ type: 'PREVIEW_COMPLETE' })
    }, game.modifiers.previewDuration)

    return () => window.clearTimeout(timeoutId)
  }, [game.status, game.modifiers])

  useEffect(() => {
    if (game.status !== 'playing' || !game.timeRemaining) return

    const timeoutId = window.setTimeout(() => {
      dispatch({ type: 'TIME_EXPIRED' })
    }, game.timeRemaining * 1000)

    return () => window.clearTimeout(timeoutId)
  }, [game.status, game.timeRemaining])


  useEffect(() => {
    if (game.score <= bestScore) {
      return
    }

    if (
      startingBestScoreRef.current > 0 &&
      game.score > startingBestScoreRef.current &&
      !recordNotificationShownRef.current
    ) {
      recordNotificationShownRef.current = true
      setRecordNotification(true)
    }

    setBestScore(game.score)
    window.localStorage.setItem('memory-best-score', String(game.score))
  }, [game.status, game.score, bestScore])

  useEffect(() => {
    if (!recordNotification) return

    const timeoutId = window.setTimeout(() => {
      setRecordNotification(false)
    }, 3000)

    return () => window.clearTimeout(timeoutId)
  }, [recordNotification])

  useEffect(() => {
    const previousGame = previousGameRef.current

    if (game !== previousGame) {
      if (game.status === 'checking') {
        playEffect('error')
      } else if (game.score > previousGame.score) {
        playEffect('pair')
      }

      if (game.status === 'levelComplete' || game.status === 'won') {
        playEffect('levelComplete')
      } else if (game.status === 'gameOver') {
        playEffect('gameOver')
      }
    }

    previousGameRef.current = game
  }, [game, playEffect])

  return (
    <main className={`mimir-app ${screen === 'game' ? 'mimir-app--game' : ''}`}>
      {screen === 'menu' && (
        <Menu
          labels={t}
          onStart={startGame}
          onMenuAction={() => playEffect('menu')}
          onOptions={() => setScreen('options')}
          onScores={() => setScreen('scores')}
        />
      )}

      {screen === 'options' && (
        <section className="secondary-panel options-panel" aria-labelledby="options-title">
          <p className="eyebrow">MIMIR</p>
          <h1 id="options-title">{t.options}</h1>
          <label className="setting-row">
            <span>{t.language}</span>
            <select
              value={settings.language}
              onChange={(event) => updateSettings({ language: event.target.value })}
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
            </select>
          </label>
          <label className="setting-row">
            <span>{t.ambientVolume} ({Math.round(settings.ambientVolume * 100)}%)</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.ambientVolume}
              onChange={(event) => updateSettings({ ambientVolume: Number(event.target.value) })}
            />
          </label>
          <label className="setting-row">
            <span>{t.effectsVolume} ({Math.round(settings.effectsVolume * 100)}%)</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.effectsVolume}
              onChange={(event) => updateSettings({ effectsVolume: Number(event.target.value) })}
            />
          </label>
          <button
            className="back-button"
            type="button"
            onClick={() => {
              const nextMuted = !isMuted
              setIsMuted(nextMuted)
              updateSettings({ isMuted: nextMuted })
            }}
          >
            {isMuted ? t.unmute : t.mute}
          </button>
          <button className="back-button" type="button" onClick={() => setScreen('menu')}>
            {t.back}
          </button>
        </section>
      )}

      {screen === 'scores' && (
        <section className="secondary-panel" aria-labelledby="scores-title">
          <p className="eyebrow">MIMIR</p>
          <h1 id="scores-title">{t.scores}</h1>
          <p className="score-display">{bestScore}</p>
          <button className="back-button" type="button" onClick={() => setScreen('menu')}>
            {t.back}
          </button>
        </section>
      )}

      {screen === 'game' && (
        <section className="game-panel" aria-labelledby="gameplay-title">
          <header className="game-header">
            <div>
              <p className="eyebrow">MIMIR</p>
              <h1 id="gameplay-title">MIMIR</h1>
            </div>
            <button className="back-button" type="button" onClick={() => setScreen('menu')}>
              {t.home}
            </button>
          </header>
          <p>{t.instructions}</p>
          <div className="game-hud">
            <p>{t.level}: {game.level} / {MAX_LEVEL}</p>
            <p>{t.score}: {game.score}</p>
            <p>
              {t.errors}: {game.errors} / {game.modifiers.unlimitedErrors
                ? '∞'
                : game.modifiers.maxErrors ?? maxErrorsForLevel(game.level)}
            </p>
            {game.timeRemaining && (
              <p>{t.time}: {game.timeRemaining}s</p>
            )}
            {game.pact && (
              <p>{t.pact}: {settings.language === 'fr' ? game.pact.label : game.pact.labelEn}</p>
            )}
          </div>
          {game.status === 'levelComplete' && (
            <div className="dialog-backdrop">
              <section className="game-dialog" role="dialog" aria-modal="true" aria-labelledby="level-dialog-title">
                <h2 id="level-dialog-title">{t.levelComplete}</h2>
                <button className="back-button" type="button" onClick={nextLevel}>
                  {t.continue}
                </button>
                <button className="back-button" type="button" onClick={() => setScreen('menu')}>
                  {t.quitGame}
                </button>
              </section>
            </div>
          )}
          {game.status === 'choosingPact' && (
            <div className="dialog-backdrop">
              <section className="game-dialog pact-dialog" role="dialog" aria-modal="true" aria-labelledby="pact-dialog-title">
                <h2 id="pact-dialog-title">{t.choosePact}</h2>
                <div className="pact-options">
                  {game.pactOptions.map((pact) => (
                    <button
                      className="pact-option"
                      key={pact.id}
                      type="button"
                      onClick={() => choosePact(pact.id)}
                    >
                      <strong>{settings.language === 'fr' ? pact.label : pact.labelEn}</strong>
                      <span>{settings.language === 'fr' ? pact.description : pact.descriptionEn}</span>
                    </button>
                  ))}
                </div>
                <button className="back-button" type="button" onClick={() => choosePact(null)}>
                  {t.noPact}
                </button>
              </section>
            </div>
          )}
          {game.status !== 'idle' && game.status !== 'choosingPact' && (
            <section
              className="board"
              aria-label={t.instructions}
              style={{
                '--board-columns': boardLayout.columns,
                '--board-rows': boardLayout.rows,
                '--card-size': `${boardLayout.cardSize}px`,
                '--card-gap': `${boardLayout.gap}px`,
              }}
            >
              {game.cards.map((card) => (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => {
                    playEffect('flip')
                    dispatch({ type: 'FLIP_CARD', id: card.id })
                  }}
                  className={`card ${card.isMatched ? 'card--matched' : ''}`}
                  aria-label={
                    card.isFlipped
                      ? settings.language === 'fr'
                        ? `Carte ${card.icon.name}${card.isMatched ? ', paire trouvée' : ''}`
                        : `Card ${card.icon.name}${card.isMatched ? ', matched pair' : ''}`
                      : settings.language === 'fr'
                        ? 'Carte cachée'
                        : 'Hidden card'
                  }
                  disabled={
                    game.status !== 'playing' || card.isMatched || card.isFlipped
                  }
                >
                  {card.isFlipped ? (
                    <img className="card-icon" src={card.icon.src} alt="" />
                  ) : (
                    'ᚠ'
                  )}
                </button>
              ))}
            </section>
          )}
          {bestScore > 0 && (
            <p className="game-best-score">{t.best}: {bestScore}</p>
          )}
        </section>
      )}

      {['gameOver', 'won'].includes(game.status) && screen === 'game' && (
        <div className="end-dialog-backdrop">
          <section
            className="end-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="end-dialog-title"
          >
            <p className="eyebrow">MIMIR</p>
            <h2 id="end-dialog-title">
              {game.status === 'won' ? t.won : t.gameOver}
            </h2>
            {game.status === 'won' && <p>{t.thanks}</p>}
            <p>{t.score}: {game.score}</p>
            <button className="back-button" type="button" onClick={startGame}>
              {t.replay}
            </button>
            <button className="back-button" type="button" onClick={() => setScreen('menu')}>
              {t.home}
            </button>
          </section>
        </div>
      )}
      {recordNotification && (
        <p className="record-notification" role="status" aria-live="polite">
          {t.newRecord}
        </p>
      )}
      {audioError && <p className="audio-error" role="status">{audioError}</p>}
    </main>
  )
}

export default App
