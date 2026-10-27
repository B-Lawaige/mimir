import { useEffect, useReducer, useState } from 'react'
import { createDeck, MAX_LEVEL } from './game/levels.js'
import { createInitialGameState, gameReducer } from './game/gameReducer.js'

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

function App() {
  const [game, dispatch] = useReducer(
    gameReducer,
    undefined,
    createInitialGameState
  )
  const [bestScore, setBestScore] = useState(() => {
    const savedScore = Number(
      window.localStorage.getItem('memory-best-score')
    )
    return Number.isFinite(savedScore) ? savedScore : 0
  })

  const startGame = () => {
    dispatch({
      type: 'START_GAME',
      cards: shuffleCards(createDeck(1)),
    })
  }

  const nextLevel = () => {
    const nextLevelNumber = game.level + 1
    dispatch({
      type: 'NEXT_LEVEL',
      cards: shuffleCards(createDeck(nextLevelNumber)),
    })
  }

  useEffect(() => {
    if (game.status !== 'checking') {
      return
    }

    const timeoutId = window.setTimeout(() => {
      dispatch({ type: 'HIDE_MISMATCHED_CARDS' })
    }, 900)

    return () => window.clearTimeout(timeoutId)
  }, [game.status])

  useEffect(() => {
    if (
      !['gameOver', 'won'].includes(game.status) ||
      game.score <= bestScore
    ) {
      return
    }

    setBestScore(game.score)
    window.localStorage.setItem('memory-best-score', String(game.score))
  }, [game.status, game.score, bestScore])

  return (
    <main className="game">
      <h1>Memory</h1>
      <p>Retrouve les paires de cartes identiques !</p>
      <button type="button" onClick={startGame}>
        Commencer une partie
      </button>
      {game.status !== 'idle' && (
        <>
          <p>Niveau : {game.level} / {MAX_LEVEL}</p>
          <p>Score : {game.score}</p>
          <p>Erreurs : {game.errors} / 4</p>
        </>
      )}
      <p>Meilleur score : {bestScore}</p>
      {game.status === 'gameOver' && <p>Partie terminée !</p>}
      {game.status === 'won' && (
        <p>Bravo, tu as trouvé toutes les paires !</p>
      )}
      {game.status === 'levelComplete' && (
        <div>
          <p>Niveau terminé !</p>
          <button type="button" onClick={nextLevel}>
            Niveau suivant
          </button>
        </div>
      )}
      {game.status !== 'idle' && (
        <section className="board" aria-label="Plateau de jeu">
          {game.cards.map((card) => (
            <button
              key={card.id}
              type="button"
              onClick={() => dispatch({ type: 'FLIP_CARD', id: card.id })}
              className={`card ${card.isMatched ? 'card--matched' : ''}`}
              aria-label={
                card.isFlipped
                  ? `Carte ${card.symbol}${card.isMatched ? ', paire trouvée' : ''}`
                  : 'Carte cachée'
              }
              disabled={
                game.status !== 'playing' || card.isMatched || card.isFlipped
              }
            >
              {card.isFlipped ? card.symbol : '❓'}
            </button>
          ))}
        </section>
      )}
    </main>
  )
}

export default App
