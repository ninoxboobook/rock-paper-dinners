import { useStore } from '../store/useStore'
import type { ViewKey } from '../types'
import { PlayIcon, MapIcon, BrowseIcon } from '../lib/icons'

const TABS: { key: ViewKey; label: string; Icon: typeof PlayIcon }[] = [
  { key: 'play', label: 'Play', Icon: PlayIcon },
  { key: 'map', label: 'Map', Icon: MapIcon },
  { key: 'browse', label: 'Browse', Icon: BrowseIcon },
]

export function BottomNav() {
  const view = useStore((s) => s.view)
  const setView = useStore((s) => s.setView)
  return (
    <nav className="bottom-nav">
      {TABS.map(({ key, label, Icon }) => {
        const active = view === key
        return (
          <button
            key={key}
            className={`nav-btn ${active ? 'nav-btn--active' : ''}`}
            onClick={() => setView(key)}
          >
            <span className="nav-icon">
              <Icon size={25} weight={active ? 'fill' : 'regular'} />
            </span>
            <span className="nav-label">{label}</span>
          </button>
        )
      })}
    </nav>
  )
}
