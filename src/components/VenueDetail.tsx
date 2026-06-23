import { useStore } from '../store/useStore'
import { cuisineIcon } from '../lib/cuisineIcon'
import { MapsIcon, InstagramIcon, StarIcon } from '../lib/icons'

export function VenueDetail() {
  const selectedId = useStore((s) => s.selectedId)
  const venues = useStore((s) => s.venues)
  const close = useStore((s) => s.closeVenue)
  const favourites = useStore((s) => s.favourites)
  const toggleFavourite = useStore((s) => s.toggleFavourite)

  const venue = venues.find((v) => v.id === selectedId)
  if (!venue) return null
  const fav = favourites.includes(venue.id)
  const Cuisine = cuisineIcon(venue.cuisineShort)

  return (
    <div className="sheet-backdrop" onClick={close}>
      <div className="sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={venue.name}>
        <div className="sheet-grip" />
        <div className="sheet-hero">
          <div className="sheet-emoji" aria-hidden>
            <Cuisine size={34} weight="fill" />
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
        {venue.address && (
          <p className="sheet-address">
            <MapsIcon size={15} weight="fill" /> {venue.address}
          </p>
        )}

        <div className="sheet-actions">
          <a className="btn btn--ghost" href={venue.mapsUrl} target="_blank" rel="noreferrer">
            <MapsIcon size={18} weight="fill" /> Maps
          </a>
          {venue.instagramUrl && (
            <a className="btn btn--ghost" href={venue.instagramUrl} target="_blank" rel="noreferrer">
              <InstagramIcon size={18} /> Instagram
            </a>
          )}
          <button className={`btn ${fav ? 'btn--gold' : 'btn--ghost'}`} onClick={() => toggleFavourite(venue.id)}>
            <StarIcon size={18} weight={fav ? 'fill' : 'regular'} /> {fav ? 'Shortlisted' : 'Shortlist'}
          </button>
        </div>

        <button className="sheet-close" onClick={close}>
          Close
        </button>
      </div>
    </div>
  )
}
