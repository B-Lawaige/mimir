import { useState, useEffect} from 'react'
import { createDeck, MAX_LEVEL } from './game/levels.js'

  function shuffleCards(cardsToShuffle) {
  const shuffledCards = [...cardsToShuffle]

  for (let index = shuffledCards.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    ;[shuffledCards[index], shuffledCards[randomIndex]] = [
      shuffledCards[randomIndex],
      shuffledCards[index],
    ]
  }

  return shuffledCards.map((card) => ({
    ...card,
    isFlipped: false,
    isMatched: false,
  }))
}

function App() {

  const [isPlaying, setIsPlaying] = useState(false)

  const [cards, setCards] = useState(() => shuffleCards(createDeck(1)))

  const [level, setLevel] = useState(1)

  const [flippedIds, setFlippedIds] = useState([])

  const [errors, setErrors] = useState(0)

  const [isGameOver, setIsGameOver] = useState(false)

  const [score, setScore] = useState(0)

  const [bestScore, setBestScore] = useState(() => {
  const savedScore = Number(
    window.localStorage.getItem('memory-best-score')
  )
  return Number.isFinite(savedScore) ? savedScore : 0
  })

  const [isWon, setIsWon] = useState(false)

  const [isLevelComplete, setIsLevelComplete] = useState(false)

  const startGame = () => {
  setCards(shuffleCards(createDeck(1)))
  setFlippedIds([])
  setErrors(0)
  setScore(0)
  setIsGameOver(false)
  setIsWon(false)
  setIsPlaying(true)
  setLevel(1)
  setIsLevelComplete(false)
  }

  const nextLevel = () => {
  const nextLevelNumber = level + 1

  setLevel(nextLevelNumber)
  setCards(shuffleCards(createDeck(nextLevelNumber)))
  setFlippedIds([])
  setErrors(0)
  setIsLevelComplete(false)
  }

  const handleCardClick = (clickedCardId) => {
    const clickedCard = cards.find((card) => card.id === clickedCardId)

    if (
      !clickedCard ||
      isGameOver ||
      isWon ||
      isLevelComplete ||
      clickedCard.isMatched ||
      clickedCard.isFlipped ||
      flippedIds.length === 2
    ) {
      return
    }

    const nextFlippedIds = [...flippedIds, clickedCardId]
    const firstCard = cards.find((card) => card.id === flippedIds[0])
    
    const isPair = nextFlippedIds.length === 2 && firstCard?.symbol === clickedCard.symbol
    
      const completesLevel =
    isPair &&
    cards.every(
      (card) =>
        card.isMatched ||
        card.id === clickedCardId ||
        card.id === flippedIds[0]
    )  
      
        if (isPair) {
      const bonus = completesLevel ? 50 * (4 - errors) : 0
      setScore((currentScore) => currentScore + 100 + bonus)
    }

    if (completesLevel) {
      if (level === MAX_LEVEL) {
        setIsWon(true)
      } else {
        setIsLevelComplete(true)
      }
    }

    // const completesGame =
    //   isPair &&
    //   cards.every(
    //     (card) =>
    //       card.isMatched ||
    //       card.id === clickedCardId ||
    //       card.id === flippedIds[0]
    //   )

    // if (completesGame) {
    // //   setIsWon(true)
    // }

    if (nextFlippedIds.length === 2 && !isPair) {
    const nextErrors = errors + 1
    setErrors(nextErrors)

    if (nextErrors >= 4) {
        setIsGameOver(true)
      }
    }

    setCards((currentCards) =>
      currentCards.map((card) => {
        const isClickedCard = card.id === clickedCardId
        const isFirstCardOfPair = isPair && card.id === flippedIds[0]

        if (!isClickedCard && !isFirstCardOfPair) {
          return card
        }

        return {
          ...card,
          isFlipped: true,
          ...(isPair ? { isMatched: true } : {}),
        }
      })
    )

    setFlippedIds(isPair ? [] : nextFlippedIds)
  }

  useEffect(() => {
    if (flippedIds.length !== 2) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setCards((currentCards) =>
        currentCards.map((card) =>
          flippedIds.includes(card.id) && !card.isMatched
            ? { ...card, isFlipped: false }
            : card
        )
      )
      setFlippedIds([])
    }, 900)
  
    return () => window.clearTimeout(timeoutId)
  }, [flippedIds])

  useEffect(() => {
  if ((!isGameOver && !isWon) || score <= bestScore) {
    return
  }

  setBestScore(score)
  window.localStorage.setItem('memory-best-score', String(score))
}, [isGameOver, isWon, score, bestScore])

  return (
    <main className="game">
      <h1>Memory</h1>
      <p>Retrouve les paires de cartes identiques !</p>
      <button type="button" onClick={startGame}>
        Commencer une partie
      </button>
      {isPlaying && <p>Niveau : {level} / {MAX_LEVEL}</p>}
      {isPlaying && <p>Score : {score}</p>}
      <p>Meilleur score : {bestScore}</p>
      {isPlaying && <p>Erreurs : {errors} / 4</p>}
      {isGameOver && <p>Partie terminée !</p>}
      {isWon && <p>Bravo, tu as trouvé toutes les paires !</p>}
      {isLevelComplete && (
        <div>
          <p>Niveau terminé !</p>
          <button type="button" onClick={nextLevel}>
            Niveau suivant
          </button>
        </div>
      )}
     {isPlaying && (
        <section className="board" aria-label="Plateau de jeu">
          {cards.map((card) => (
        <button
          key={card.id}
          type="button"
          onClick={() => handleCardClick(card.id)}
          className={`card ${card.isMatched ? 'card--matched' : ''}`}
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