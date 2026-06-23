import { useStore } from '../store/useStore'
import type { ViewKey } from '../types'

const TABS: { key: ViewKey; label: string; icon: string }[] = [
  { key: 'play', label: 'Play', icon: '🎰' },
  { key: 'map', label: 'Map', icon: '🗺️' },
  { key: 'browse', label: 'Browse', icon: '🍽️' },
]

export function BottomNav() {
  const view = useStore((s) => s.view)
  const setView = useStore((s) => s.setView)
  return (
    <nav className="bottom-nav">
      {TABS.map((t) => (
        <button
          key={t.key}
          className={`nav-btn ${view === t.key ? 'nav-btn--active' : ''}`}
          onClick={() => setView(t.key)}
        >
          <span className="nav-icon" aria-hidden>
            {t.icon}
          </span>
          <span className="nav-label">{t.label}</span>
        </button>
      ))}
    </nav>
  )
}
