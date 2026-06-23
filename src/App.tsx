import { lazy, Suspense, useEffect } from 'react'
import { useStore } from './store/useStore'
import { BottomNav } from './components/BottomNav'
import { VenueDetail } from './components/VenueDetail'
import { PlayView } from './views/PlayView'
import venuesData from './data/venues.json'
import type { Venue } from './types'

// Map + Browse pull in Leaflet / react-dom/server — load them on demand so the
// default Play screen stays light.
const MapView = lazy(() => import('./views/MapView').then((m) => ({ default: m.MapView })))
const BrowseView = lazy(() => import('./views/BrowseView').then((m) => ({ default: m.BrowseView })))

export default function App() {
  const view = useStore((s) => s.view)
  const setVenues = useStore((s) => s.setVenues)
  const selectedId = useStore((s) => s.selectedId)

  useEffect(() => {
    setVenues(venuesData as Venue[])
  }, [setVenues])

  return (
    <div className="app">
      <main className="app-main">
        {view === 'play' && <PlayView />}
        <Suspense fallback={<div className="view" />}>
          {view === 'map' && <MapView />}
          {view === 'browse' && <BrowseView />}
        </Suspense>
      </main>
      <BottomNav />
      {selectedId && <VenueDetail />}
    </div>
  )
}
