import { useMemo, useState } from 'react'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useStore, filterVenues } from '../store/useStore'
import { cuisineEmoji } from '../lib/cuisine'
import { FilterSheet } from '../components/FilterSheet'

const MELB_CENTER: [number, number] = [-37.8136, 144.9631]

function emojiIcon(emoji: string) {
  return L.divIcon({
    className: 'emoji-pin-wrap',
    html: `<div class="emoji-pin">${emoji}</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 38],
    popupAnchor: [0, -36],
  })
}

export function MapView() {
  const { venues, groups, suburbs, search, onlyShortlist, favourites } = useStore()
  const openVenue = useStore((s) => s.openVenue)
  const [filterOpen, setFilterOpen] = useState(false)

  const pins = useMemo(
    () =>
      filterVenues(venues, { groups, suburbs, search, onlyShortlist, favourites }).filter(
        (v) => v.lat != null && v.lng != null,
      ),
    [venues, groups, suburbs, search, onlyShortlist, favourites],
  )

  const filterCount = groups.length + suburbs.length + (onlyShortlist ? 1 : 0)

  return (
    <div className="view map-view">
      <div className="map-overlay-bar">
        <button className="pill" onClick={() => setFilterOpen(true)}>
          🎛 Filters{filterCount ? ` · ${filterCount}` : ''}
        </button>
        <span className="pool-count">{pins.length} pins</span>
      </div>

      <MapContainer center={MELB_CENTER} zoom={12} className="map" zoomControl={false} preferCanvas>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {pins.map((v) => (
          <Marker
            key={v.id}
            position={[v.lat as number, v.lng as number]}
            icon={emojiIcon(cuisineEmoji(v.cuisine))}
            eventHandlers={{ click: () => openVenue(v.id) }}
          />
        ))}
      </MapContainer>

      <FilterSheet open={filterOpen} onClose={() => setFilterOpen(false)} />
    </div>
  )
}
