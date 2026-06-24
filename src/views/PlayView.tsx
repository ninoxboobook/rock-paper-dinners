import { useMemo, useRef, useState } from 'react'
import { SlotMachine, type SlotHandle } from '../components/SlotMachine'
import { Confetti } from '../components/Confetti'
import { FilterSheet } from '../components/FilterSheet'
import { VenueCard } from '../components/VenueCard'
import { useShake } from '../hooks/useShake'
import { useStore, filterVenues } from '../store/useStore'
import type { Venue } from '../types'
import { FilterIcon, StarIcon, ShakeIcon, ConfettiIcon, SpinIcon, DirectionsIcon, CloseIcon } from '../lib/icons'

export function PlayView() {
  const { venues, groups, suburbs, search, onlyShortlist, favourites } = useStore()
  const setOnlyShortlist = useStore((s) => s.setOnlyShortlist)
  const openVenue = useStore((s) => s.openVenue)

  const [phase, setPhase] = useState<'idle' | 'spinning' | 'result'>('idle')
  const [winner, setWinner] = useState<Venue | null>(null)
  const [winKey, setWinKey] = useState(0)
  const [filterOpen, setFilterOpen] = useState(false)
  const slotRef = useRef<SlotHandle>(null)

  const pool = useMemo(
    () => filterVenues(venues, { groups, suburbs, search, onlyShortlist, favourites }),
    [venues, groups, suburbs, search, onlyShortlist, favourites],
  )
  const poolRef = useRef(pool)
  poolRef.current = pool

  const doSpin = () => {
    if (poolRef.current.length === 0) return
    slotRef.current?.spin()
  }

  const { motionSupported, needsPermission, enabled, permission, enable } = useShake(doSpin)

  const filterCount = groups.length + suburbs.length

  return (
    <div className="view play-view">
      <header className="play-header">
        <h1 className="logo">
          Rock<span className="logo-dot">·</span>Paper<span className="logo-dot">·</span>Dinners
        </h1>
      </header>

      <div className="pool-bar">
        <button className="pill" onClick={() => setFilterOpen(true)}>
          <FilterIcon size={16} weight="bold" /> Filters{filterCount ? ` · ${filterCount}` : ''}
        </button>
        <button
          className={`pill ${onlyShortlist ? 'pill--on' : ''}`}
          onClick={() => setOnlyShortlist(!onlyShortlist)}
        >
          <StarIcon size={16} weight={onlyShortlist ? 'fill' : 'regular'} /> Shortlist
          {favourites.length ? ` · ${favourites.length}` : ''}
        </button>
        <span className="pool-count">{pool.length} in the draw</span>
      </div>

      <SlotMachine
        ref={slotRef}
        pool={pool}
        onStart={() => {
          setPhase('spinning')
          setWinner(null)
        }}
        onResult={(v) => {
          setWinner(v)
          setPhase('result')
          setWinKey((k) => k + 1)
        }}
      />

      {phase !== 'result' && (
      <div className="play-cta">
        <button
          className="spin-btn"
          onClick={doSpin}
          disabled={phase === 'spinning' || pool.length === 0}
        >
          {phase === 'spinning' ? 'Spinning…' : pool.length === 0 ? 'No venues match' : 'SPIN'}
        </button>

        {motionSupported && !enabled && (
          <button className="enable-shake" onClick={enable}>
            <ShakeIcon size={18} weight="fill" />{' '}
            {needsPermission ? 'Enable shake-to-spin' : 'Turn on shake-to-spin'}
          </button>
        )}
        {enabled && (
          <p className="hint hint--icon">
            <ShakeIcon size={16} weight="fill" /> Give your phone 3 good shakes
          </p>
        )}
        {!motionSupported && <p className="hint">Tap SPIN — no motion sensor on this device.</p>}
        {permission === 'denied' && <p className="hint hint--warn">Motion access denied — use the SPIN button.</p>}
      </div>
      )}

      {phase === 'result' && winner && (
        <div className="result-overlay" onClick={() => setPhase('idle')}>
          <Confetti key={winKey} />
          <div className="result-pop" onClick={(e) => e.stopPropagation()}>
            <button className="result-close" aria-label="Dismiss" onClick={() => setPhase('idle')}>
              <CloseIcon size={20} weight="bold" />
            </button>
            <p className="result-kicker">
              <ConfettiIcon size={18} weight="fill" /> Tonight you&apos;re eating at
            </p>
            <div onClick={() => openVenue(winner.id)} className="result-card-wrap">
              <VenueCard venue={winner} onClick={() => openVenue(winner.id)} />
            </div>
            <div className="result-actions">
              <button className="btn btn--primary" onClick={doSpin}>
                <SpinIcon size={18} weight="bold" /> Spin again
              </button>
              <a className="btn btn--ghost" href={winner.mapsUrl} target="_blank" rel="noreferrer">
                <DirectionsIcon size={18} weight="fill" /> Directions
              </a>
            </div>
          </div>
        </div>
      )}

      <FilterSheet open={filterOpen} onClose={() => setFilterOpen(false)} />
    </div>
  )
}
