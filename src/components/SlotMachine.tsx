import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { Cherries, Bell, Diamond, Crown, Coin, Star, type Icon } from '@phosphor-icons/react'
import type { Venue } from '../types'

const TILE = 84 // px, must match .reel-tile height in CSS
const STRIP = 34 // tiles per reel strip
const LAND = STRIP - 2 // index the winner lands on (centre of the 3-tile window)
const DURATIONS = [2200, 2700, 3200] // staggered reel stop times (ms)

type Tone = 'red' | 'gold' | 'cream'
interface Sym {
  key: string
  kind: 'text' | 'icon'
  text?: string
  Icon?: Icon
  tone: Tone
}

// A cohesive classic-slot symbol set — typographic 7 / BAR plus Phosphor symbols.
const SYMBOLS: Sym[] = [
  { key: 'seven', kind: 'text', text: '7', tone: 'red' },
  { key: 'bar', kind: 'text', text: 'BAR', tone: 'gold' },
  { key: 'cherries', kind: 'icon', Icon: Cherries, tone: 'red' },
  { key: 'bell', kind: 'icon', Icon: Bell, tone: 'gold' },
  { key: 'diamond', kind: 'icon', Icon: Diamond, tone: 'cream' },
  { key: 'crown', kind: 'icon', Icon: Crown, tone: 'gold' },
  { key: 'coin', kind: 'icon', Icon: Coin, tone: 'gold' },
  { key: 'star', kind: 'icon', Icon: Star, tone: 'gold' },
]

export interface SlotHandle {
  spin: () => void
}

interface Props {
  pool: Venue[]
  onStart: () => void
  onResult: (v: Venue) => void
}

const randomSym = () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]

function buildStrip(jackpot: Sym): Sym[] {
  const strip = Array.from({ length: STRIP }, () => randomSym())
  strip[LAND] = jackpot
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

function Tile({ s }: { s: Sym }) {
  if (s.kind === 'text') {
    return <span className={`reel-sym reel-sym--text reel-sym--${s.tone}`}>{s.text}</span>
  }
  const I = s.Icon!
  return (
    <span className={`reel-sym reel-sym--${s.tone}`}>
      <I size={46} weight="fill" />
    </span>
  )
}

export const SlotMachine = forwardRef<SlotHandle, Props>(function SlotMachine(
  { pool, onStart, onResult },
  ref,
) {
  const [strips, setStrips] = useState<Sym[][]>([
    buildStrip(SYMBOLS[0]),
    buildStrip(SYMBOLS[2]),
    buildStrip(SYMBOLS[4]),
  ])
  const [spinning, setSpinning] = useState(false)
  const hasSpun = useRef(false)
  const reelRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)]

  // Seed idle reels with a varied, non-matching set once.
  useEffect(() => {
    if (hasSpun.current || spinning) return
    setStrips([buildStrip(randomSym()), buildStrip(randomSym()), buildStrip(randomSym())])
  }, [spinning])

  useImperativeHandle(ref, () => ({
    spin() {
      if (spinning || pool.length === 0) return
      setSpinning(true)
      hasSpun.current = true
      onStart()
      vibrate(20)

      const winner = pool[Math.floor(Math.random() * pool.length)]
      // every spin is a jackpot: all three reels land on the same random symbol
      const jackpot = randomSym()
      setStrips([buildStrip(jackpot), buildStrip(jackpot), buildStrip(jackpot)])

      requestAnimationFrame(() => {
        reelRefs.forEach((r) => {
          const el = r.current
          if (!el) return
          el.style.transition = 'none'
          el.style.transform = 'translateY(0px)'
        })
        void reelRefs[0].current?.offsetHeight
        requestAnimationFrame(() => {
          reelRefs.forEach((r, i) => {
            const el = r.current
            if (!el) return
            const offset = -(LAND - 1) * TILE
            el.style.transition = `transform ${DURATIONS[i]}ms cubic-bezier(.12,.74,.2,1)`
            el.style.transform = `translateY(${offset}px)`
          })
        })
      })

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
              {strip.map((s, j) => (
                <div className="reel-tile" key={j}>
                  <Tile s={s} />
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
