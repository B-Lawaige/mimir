import { useCallback, useEffect, useRef, useState } from 'react'

const audioAssets = import.meta.glob('../../sound/*.mp3', {
  eager: true,
  import: 'default',
  query: '?url',
})

const ambientTrack = audioAssets['../../sound/ambiance.mp3']
const effectTracks = {
  menu: audioAssets['../../sound/clicMenu.mp3'],
  flip: audioAssets['../../sound/retournement.mp3'],
  pair: audioAssets['../../sound/paireTrouve.mp3'],
  error: audioAssets['../../sound/error.mp3'],
  levelComplete: audioAssets['../../sound/levelComplete.mp3'],
  gameOver: audioAssets['../../sound/levelFail.mp3'],
}

export function useAudio({ ambientVolume, effectsVolume, isMuted }) {
  const ambientRef = useRef(null)
  const effectsRef = useRef({})
  const startingRef = useRef(null)
  const [audioError, setAudioError] = useState('')

  useEffect(() => {
    if (ambientTrack) {
      ambientRef.current = new Audio(ambientTrack)
      ambientRef.current.loop = true
      ambientRef.current.preload = 'auto'
      ambientRef.current.load()
    }

    effectsRef.current = Object.fromEntries(
      Object.entries(effectTracks)
        .filter(([, source]) => Boolean(source))
        .map(([name, source]) => {
          const audio = new Audio(source)
          audio.preload = 'auto'
          audio.load()
          return [name, audio]
        })
    )

    return () => {
      ambientRef.current?.pause()
      ambientRef.current = null
      Object.values(effectsRef.current).forEach((audio) => audio.pause())
      effectsRef.current = {}
    }
  }, [])

  useEffect(() => {
    if (ambientRef.current) {
      ambientRef.current.volume = ambientVolume
      ambientRef.current.muted = isMuted
    }

    Object.values(effectsRef.current).forEach((audio) => {
      audio.volume = effectsVolume
      audio.muted = isMuted
    })
  }, [ambientVolume, effectsVolume, isMuted])

  const startAmbience = useCallback(() => {
    if (!ambientTrack) {
      setAudioError('Fichier ambiance.mp3 introuvable dans le dossier sound.')
      return Promise.resolve(false)
    }

    if (!ambientRef.current) {
      ambientRef.current = new Audio(ambientTrack)
      ambientRef.current.loop = true
      ambientRef.current.preload = 'auto'
    }

    ambientRef.current.volume = ambientVolume
    ambientRef.current.muted = isMuted

    if (!ambientRef.current.paused) {
      return Promise.resolve(true)
    }

    if (!startingRef.current) {
      startingRef.current = ambientRef.current.play()
        .then(() => {
          setAudioError('')
          return true
        })
        .catch(() => {
          setAudioError(
            'La musique sera disponible après une interaction avec la page.'
          )
          return false
        })
        .finally(() => {
          startingRef.current = null
        })
    }

    return startingRef.current
  }, [ambientVolume, isMuted])

  const playEffect = useCallback((name) => {
    const effect = effectsRef.current[name]

    if (!effect) {
      setAudioError(`Fichier audio manquant pour l’effet « ${name} ».`)
      return
    }

    effect.currentTime = 0
    effect.play().catch(() => {
      setAudioError(`Impossible de lire l’effet sonore « ${name} ».`)
    })
  }, [])

  useEffect(() => {
    const activateAudio = () => {
      startAmbience().then((started) => {
        if (started) {
          document.removeEventListener('pointerdown', activateAudio)
          document.removeEventListener('keydown', activateAudio)
        }
      })
    }

    document.addEventListener('pointerdown', activateAudio)
    document.addEventListener('keydown', activateAudio)

    return () => {
      document.removeEventListener('pointerdown', activateAudio)
      document.removeEventListener('keydown', activateAudio)
    }
  }, [startAmbience])

  return { audioError, playEffect, startAmbience }
}
