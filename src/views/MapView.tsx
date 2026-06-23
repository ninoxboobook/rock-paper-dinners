import { createElement, useMemo, useState } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import { useStore, filterVenues } from '../store/useStore'
import { cuisineIcon } from '../lib/cuisineIcon'
import { FilterSheet } from '../components/FilterSheet'
import { FilterIcon } from '../lib/icons'

const MELB_CENTER: [number, number] = [-37.8136, 144.9631]

function pinIcon(cuisine: string) {
  const svg = renderToStaticMarkup(createElement(cuisineIcon(cuisine), { size: 17, weight: 'fill' }))
  return L.divIcon({
    className: 'pin-wrap',
    html: `<div class="map-pin">${svg}</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 32],
    popupAnchor: [0, -30],
  })
}

// Themed cluster bubble sized by how many venues it holds.
function clusterIcon(cluster: { getChildCount: () => number }) {
  const count = cluster.getChildCount()
  const size = count < 10 ? 42 : count < 30 ? 52 : 62
  const tier = count < 10 ? 'sm' : count < 30 ? 'md' : 'lg'
  return L.divIcon({
    html: `<div class="cluster cluster--${tier}"><span>${count}</span></div>`,
    className: 'cluster-wrap',
    iconSize: L.point(size, size, true),
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
          <FilterIcon size={16} weight="bold" /> Filters{filterCount ? ` · ${filterCount}` : ''}
        </button>
        <span className="pool-count">{pins.length} pins</span>
      </div>

      <MapContainer center={MELB_CENTER} zoom={12} className="map" zoomControl={false} preferCanvas>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
        />
        <MarkerClusterGroup
          iconCreateFunction={clusterIcon}
          maxClusterRadius={55}
          showCoverageOnHover={false}
          spiderfyOnMaxZoom
          chunkedLoading
        >
          {pins.map((v) => (
            <Marker
              key={v.id}
              position={[v.lat as number, v.lng as number]}
              icon={pinIcon(v.cuisine)}
              eventHandlers={{ click: () => openVenue(v.id) }}
            />
          ))}
        </MarkerClusterGroup>
      </MapContainer>

      <FilterSheet open={filterOpen} onClose={() => setFilterOpen(false)} />
    </div>
  )
}
