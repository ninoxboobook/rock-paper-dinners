import { useStore } from '../store/useStore'
import { cuisineEmoji } from '../lib/cuisine'

export function VenueDetail() {
  const selectedId = useStore((s) => s.selectedId)
  const venues = useStore((s) => s.venues)
  const close = useStore((s) => s.closeVenue)
  const favourites = useStore((s) => s.favourites)
  const toggleFavourite = useStore((s) => s.toggleFavourite)

  const venue = venues.find((v) => v.id === selectedId)
  if (!venue) return null
  const fav = favourites.includes(venue.id)

  return (
    <div className="sheet-backdrop" onClick={close}>
      <div className="sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={venue.name}>
        <div className="sheet-grip" />
        <div className="sheet-hero">
          <div className="sheet-emoji" aria-hidden>
            {cuisineEmoji(venue.cuisine)}
          </div>
          <div>
            <h2 className="sheet-name">{venue.name}</h2>
            <p className="sheet-meta">
              {venue.cuisine}
              {venue.suburb ? ` · ${venue.suburb}` : ''}
              {venue.city ? `, ${venue.city}` : ''}
            </p>
          </div>
        </div>

        {venue.description && <p className="sheet-desc">{venue.description}</p>}
        {venue.address && <p className="sheet-address">📍 {venue.address}</p>}

        <div className="sheet-actions">
          <a className="btn btn--ghost" href={venue.mapsUrl} target="_blank" rel="noreferrer">
            🗺️ Maps
          </a>
          {venue.instagramUrl && (
            <a className="btn btn--ghost" href={venue.instagramUrl} target="_blank" rel="noreferrer">
              📷 Instagram
            </a>
          )}
          <button className={`btn ${fav ? 'btn--gold' : 'btn--ghost'}`} onClick={() => toggleFavourite(venue.id)}>
            {fav ? '★ Shortlisted' : '☆ Shortlist'}
          </button>
        </div>

        <button className="sheet-close" onClick={close}>
          Close
        </button>
      </div>
    </div>
  )
}
