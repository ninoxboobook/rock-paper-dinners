import { useEffect } from 'react'
import { useStore } from './store/useStore'
import { BottomNav } from './components/BottomNav'
import { VenueDetail } from './components/VenueDetail'
import { PlayView } from './views/PlayView'
import { MapView } from './views/MapView'
import { BrowseView } from './views/BrowseView'
import venuesData from './data/venues.json'
import type { Venue } from './types'

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
        {view === 'map' && <MapView />}
        {view === 'browse' && <BrowseView />}
      </main>
      <BottomNav />
      {selectedId && <VenueDetail />}
    </div>
  )
}
