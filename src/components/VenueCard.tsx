import type { Venue } from '../types'
import { cuisineEmoji } from '../lib/cuisine'
import { useStore } from '../store/useStore'

interface Props {
  venue: Venue
  onClick?: () => void
  compact?: boolean
}

export function VenueCard({ venue, onClick, compact }: Props) {
  const favourites = useStore((s) => s.favourites)
  const toggleFavourite = useStore((s) => s.toggleFavourite)
  const fav = favourites.includes(venue.id)

  return (
    <article className={`card ${compact ? 'card--compact' : ''}`} onClick={onClick}>
      <div className="card-emoji" aria-hidden>
        {cuisineEmoji(venue.cuisine)}
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
            {fav ? '★' : '☆'}
          </button>
        </div>
        <p className="card-meta">
          <span className="card-cuisine">{venue.cuisine}</span>
          {venue.suburb && (
            <>
              <span className="dot">·</span>
              <span className="card-suburb">{venue.suburb}</span>
            </>
          )}
        </p>
        {!compact && venue.description && <p className="card-desc">{venue.description}</p>}
      </div>
    </article>
  )
}
