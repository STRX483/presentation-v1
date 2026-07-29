import { useCallback, useEffect, useRef, useState } from 'react'
import { DECKS, slides } from './slides'
import './App.css'

function ProgressiveImg({
  src,
  alt = '',
  className = '',
  draggable = false,
  onLoad,
}: {
  src: string
  alt?: string
  className?: string
  draggable?: boolean
  onLoad?: () => void
}) {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let active = true
    const img = new Image()
    img.src = src
    if (img.complete) {
      setLoaded(true)
      onLoad?.()
    } else {
      img.onload = () => {
        if (active) {
          setLoaded(true)
          onLoad?.()
        }
      }
    }
    return () => {
      active = false
    }
  }, [src, onLoad])

  return (
    <img
      src={src}
      alt={alt}
      draggable={draggable}
      className={`p-img ${loaded ? 'p-img-loaded' : 'p-img-loading'} ${className}`.trim()}
    />
  )
}

export default function App() {
  const [i, setI] = useState(0)
  const [uiHidden, setUiHidden] = useState(false)
  const [hoveredFrame, setHoveredFrame] = useState<string | null>(null)

  // Preloader & Intro Overlay State
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [isIntroActive, setIsIntroActive] = useState(true)
  const [isIntroFading, setIsIntroFading] = useState(false)

  const touchX = useRef<number | null>(null)
  const total = slides.length
  const slide = slides[i]
  const deck = DECKS[slide.deck]

  const go = useCallback(
    (next: number) => setI(Math.min(total - 1, Math.max(0, next))),
    [total],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (['ArrowRight', 'PageDown', ' ', 'Enter'].includes(e.key)) {
        e.preventDefault()
        go(i + 1)
      } else if (['ArrowLeft', 'PageUp', 'Backspace'].includes(e.key)) {
        e.preventDefault()
        go(i - 1)
      } else if (e.key === 'Home') go(0)
      else if (e.key === 'End') go(total - 1)
      else if (e.key.toLowerCase() === 'f') document.documentElement.requestFullscreen?.()
      else if (e.key.toLowerCase() === 'h') setUiHidden((v) => !v)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, i, total])

  // Initial Slide 1 Preload & Intro Screen dismissal
  useEffect(() => {
    let isMounted = true
    const img0 = new Image()
    img0.src = slides[0].image

    const updateProgress = (pct: number) => {
      if (isMounted) setLoadingProgress((prev) => Math.max(prev, pct))
    }

    // Smooth fake progress while downloading
    const timer1 = setTimeout(() => updateProgress(35), 150)
    const timer2 = setTimeout(() => updateProgress(70), 400)

    const onComplete = () => {
      updateProgress(100)
      setTimeout(() => {
        if (isMounted) setIsIntroFading(true)
        setTimeout(() => {
          if (isMounted) setIsIntroActive(false)
        }, 800)
      }, 300)
    }

    if (img0.complete) {
      onComplete()
    } else {
      img0.onload = onComplete
      img0.onerror = onComplete
    }

    return () => {
      isMounted = false
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [])

  // Sequential background step-by-step preloader for remaining slides
  useEffect(() => {
    if (isIntroActive) return

    let isMounted = true
    const allUrls: string[] = []

    slides.forEach((s) => {
      if (s.image && !allUrls.includes(s.image)) allUrls.push(s.image)
      if (s.frames) {
        s.frames.forEach((f) => {
          if (!allUrls.includes(f)) allUrls.push(f)
        })
      }
    })

    // Step-by-step queue
    let queueIndex = 0
    const preloadNext = () => {
      if (!isMounted || queueIndex >= allUrls.length) return
      const url = allUrls[queueIndex]
      queueIndex++
      const img = new Image()
      img.src = url
      img.onload = () => {
        if (isMounted) setTimeout(preloadNext, 120)
      }
      img.onerror = () => {
        if (isMounted) setTimeout(preloadNext, 120)
      }
    }

    const startTimer = setTimeout(preloadNext, 400)
    return () => {
      isMounted = false
      clearTimeout(startTimer)
    }
  }, [isIntroActive])

  // Reset hovered frame on slide change
  useEffect(() => {
    setHoveredFrame(null)
  }, [i])

  return (
    <div
      className="deck"
      style={{ '--accent': deck.accent } as React.CSSProperties}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return
        const dx = e.changedTouches[0].clientX - touchX.current
        if (Math.abs(dx) > 50) go(dx < 0 ? i + 1 : i - 1)
        touchX.current = null
      }}
    >
      {/* Intro Loading Overlay */}
      {isIntroActive && (
        <div className={`intro-overlay ${isIntroFading ? 'fading' : ''}`}>
          <div className="intro-content">
            <span className="intro-badge">HSE: SURVIVE x ПРОИЗВЕДЕНИЕ</span>
            <h2 className="intro-title">Загрузка презентации</h2>
            <div className="intro-bar">
              <span style={{ width: `${loadingProgress}%` }} />
            </div>
            <span className="intro-percent">{loadingProgress}%</span>
          </div>
        </div>
      )}

      <div className="progress">
        <span style={{ width: `${((i + 1) / total) * 100}%` }} />
      </div>

      {slides.map((s, n) => {
        const isActive = n === i
        const isBoard = Boolean(s.frames)
        const bgImages = isBoard ? (s.frames || []) : []
        const currentActiveBg = isBoard ? hoveredFrame : s.image

        return (
          <figure
            key={s.image}
            className={`stage ${isActive ? 'active' : ''} ${isBoard ? 'board' : ''}`}
            aria-hidden={!isActive}
          >
            {isBoard ? (
              <>
                <div className="board-bg-layer">
                  {Array.from(new Set(bgImages)).map((imgSrc) => (
                    <ProgressiveImg
                      key={imgSrc}
                      src={imgSrc}
                      alt=""
                      className={`board-bg-img ${imgSrc === currentActiveBg ? 'active' : ''}`}
                      draggable={false}
                    />
                  ))}
                  <div className="board-scrim" />
                </div>
                <div className="frames" onMouseLeave={() => setHoveredFrame(null)}>
                  {s.frames?.map((src, k) => (
                    <div
                      className={`frame ${hoveredFrame === src ? 'hovered' : ''}`}
                      key={`${src}-${k}`}
                      onMouseEnter={() => setHoveredFrame(src)}
                    >
                      <ProgressiveImg src={src} alt="" draggable={false} />
                      <span>{String(k + 1).padStart(2, '0')}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <ProgressiveImg src={s.image} alt={s.title} draggable={false} />
            )}
          </figure>
        )
      })}

      <div className="scrim" />

      <div className={`layer ${uiHidden ? 'hidden' : ''}`}>
        <header>
          <span className="badge">{deck.label}</span>
          <span className="count">
            {String(i + 1).padStart(2, '0')} / {total}
          </span>
        </header>

        <div className="caption" key={i}>
          {slide.kicker && <p className="kicker">{slide.kicker}</p>}
          <h1>{slide.title}</h1>
          {slide.body?.map((line) => (
            <p key={line} className="body">
              {line}
            </p>
          ))}
        </div>

        <nav>
          <button onClick={() => go(i - 1)} disabled={i === 0} aria-label="Назад">
            ←
          </button>
          <div className="dots">
            {slides.map((s, n) => (
              <button
                key={s.image}
                className={n === i ? 'on' : ''}
                style={{ background: n === i ? DECKS[s.deck].accent : undefined }}
                onClick={() => go(n)}
                aria-label={`Слайд ${n + 1}`}
              />
            ))}
          </div>
          <button onClick={() => go(i + 1)} disabled={i === total - 1} aria-label="Вперёд">
            →
          </button>
        </nav>
      </div>

      <button className="edge left" onClick={() => go(i - 1)} aria-label="Назад" />
      <button className="edge right" onClick={() => go(i + 1)} aria-label="Вперёд" />
    </div>
  )
}