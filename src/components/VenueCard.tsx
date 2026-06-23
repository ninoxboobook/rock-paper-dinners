import type { Venue } from '../types'
import { cuisineIcon } from '../lib/cuisineIcon'
import { useStore } from '../store/useStore'
import { StarIcon, MapsIcon } from '../lib/icons'

// Show just the street on the card (suburb is already in the meta line).
function streetOnly(address: string, suburb: string): string {
  if (!address) return ''
  return address.replace(new RegExp(`,?\\s*${suburb}\\s*$`, 'i'), '').trim()
}

interface Props {
  venue: Venue
  onClick?: () => void
  compact?: boolean
}

export function VenueCard({ venue, onClick, compact }: Props) {
  const favourites = useStore((s) => s.favourites)
  const toggleFavourite = useStore((s) => s.toggleFavourite)
  const fav = favourites.includes(venue.id)
  const Cuisine = cuisineIcon(venue.cuisineShort)
  const street = streetOnly(venue.address, venue.suburb)

  return (
    <article className={`card ${compact ? 'card--compact' : ''}`} onClick={onClick}>
      <div className="card-emoji" aria-hidden>
        <Cuisine size={26} weight="fill" />
      </div>
      <div className="card-body">
        <div className="card-head">
          <h3 className="card-name">{venue.name}</h3>
          <button
            className={`star ${fav ? 'star--on' : ''}`}
            aria-label={fav ? 'Remove from shortlist' : 'Add to shortlist'}
            onClick={(e) => {
              e.stopPropagation()
              toggleFavourite(venue.id)
            }}
          >
            <StarIcon size={22} weight={fav ? 'fill' : 'regular'} />
          </button>
        </div>
        <p className="card-meta">
          <span className="card-cuisine">{venue.cuisineShort}</span>
          {venue.suburb && (
            <>
              <span className="dot">·</span>
              <span className="card-suburb">{venue.suburb}</span>
            </>
          )}
        </p>
        {street && (
          <p className="card-address">
            <MapsIcon size={13} weight="fill" /> {street}
          </p>
        )}
        {!compact && venue.description && <p className="card-desc">{venue.description}</p>}
      </div>
    </article>
  )
}
