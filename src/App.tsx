import { useCallback, useEffect, useRef, useState } from 'react'
import { DECKS, slides } from './slides'
import './App.css'

export default function App() {
  const [i, setI] = useState(0)
  const [uiHidden, setUiHidden] = useState(false)
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

  // Preload neighbours so transitions never flash
  useEffect(() => {
    ;[i + 1, i + 2, i - 1].forEach((n) => {
      if (slides[n]) {
        const img = new Image()
        img.src = slides[n].image
      }
    })
  }, [i])

  const [hoveredFrame, setHoveredFrame] = useState<string | null>(null)

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
                    <img
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
                      <img src={src} alt="" draggable={false} />
                      <span>{String(k + 1).padStart(2, '0')}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <img src={s.image} alt={s.title} draggable={false} />
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