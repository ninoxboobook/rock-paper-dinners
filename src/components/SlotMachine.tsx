import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import type { Venue } from '../types'
import { cuisineEmoji } from '../lib/cuisine'

const TILE = 84 // px, must match .reel-tile height in CSS
const STRIP = 34 // tiles per reel strip
const LAND = STRIP - 2 // index the winner lands on (centre of the 3-tile window)
const DURATIONS = [2200, 2700, 3200] // staggered reel stop times (ms)

export interface SlotHandle {
  spin: () => void
}

interface Props {
  pool: Venue[]
  onStart: () => void
  onResult: (v: Venue) => void
}

function randomEmoji(pool: Venue[]): string {
  if (!pool.length) return '🍽️'
  return cuisineEmoji(pool[Math.floor(Math.random() * pool.length)].cuisine)
}

function buildStrip(pool: Venue[], winnerEmoji: string): string[] {
  const strip = Array.from({ length: STRIP }, () => randomEmoji(pool))
  strip[LAND] = winnerEmoji
  return strip
}

function vibrate(ms: number | number[]) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(ms)
    } catch {
      /* ignore */
    }
  }
}

export const SlotMachine = forwardRef<SlotHandle, Props>(function SlotMachine(
  { pool, onStart, onResult },
  ref,
) {
  const [strips, setStrips] = useState<string[][]>([
    buildStrip([], '🍜'),
    buildStrip([], '🍕'),
    buildStrip([], '🍣'),
  ])
  const [spinning, setSpinning] = useState(false)
  const hasSpun = useRef(false)
  const reelRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)]

  // Seed idle reels with appetising emojis from the pool (instead of blank plates),
  // once before the first spin.
  useEffect(() => {
    if (hasSpun.current || spinning || pool.length === 0) return
    setStrips([
      buildStrip(pool, randomEmoji(pool)),
      buildStrip(pool, randomEmoji(pool)),
      buildStrip(pool, randomEmoji(pool)),
    ])
  }, [pool, spinning])

  useImperativeHandle(ref, () => ({
    spin() {
      if (spinning || pool.length === 0) return
      hasSpun.current = true
      setSpinning(true)
      onStart()
      vibrate(20)

      const winner = pool[Math.floor(Math.random() * pool.length)]
      const winnerEmoji = cuisineEmoji(winner.cuisine)
      const newStrips = [
        buildStrip(pool, winnerEmoji),
        buildStrip(pool, winnerEmoji),
        buildStrip(pool, winnerEmoji),
      ]
      setStrips(newStrips)

      // Reset reels to top with no transition, then animate to the landing offset.
      requestAnimationFrame(() => {
        reelRefs.forEach((r) => {
          const el = r.current
          if (!el) return
          el.style.transition = 'none'
          el.style.transform = 'translateY(0px)'
        })
        // force reflow so the reset transform is committed before we animate
        void reelRefs[0].current?.offsetHeight
        requestAnimationFrame(() => {
          reelRefs.forEach((r, i) => {
            const el = r.current
            if (!el) return
            const offset = -(LAND - 1) * TILE // bring LAND tile into the centre row
            el.style.transition = `transform ${DURATIONS[i]}ms cubic-bezier(.12,.74,.2,1)`
            el.style.transform = `translateY(${offset}px)`
          })
        })
      })

      // settle each reel with a tick of haptic feedback
      DURATIONS.forEach((d, i) => {
        window.setTimeout(() => vibrate(i === DURATIONS.length - 1 ? [40, 30, 90] : 25), d)
      })
      window.setTimeout(() => {
        setSpinning(false)
        onResult(winner)
      }, DURATIONS[DURATIONS.length - 1] + 120)
    },
  }))

  return (
    <div className={`slot ${spinning ? 'is-spinning' : ''}`} aria-hidden>
      <div className="slot-frame">
        {strips.map((strip, i) => (
          <div className="reel-window" key={i}>
            <div className="reel-strip" ref={reelRefs[i]}>
              {strip.map((emoji, j) => (
                <div className="reel-tile" key={j}>
                  <span>{emoji}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div className="slot-payline" />
      </div>
    </div>
  )
})
