import { useMemo, useState } from 'react'
import { useStore, filterVenues } from '../store/useStore'
import { VenueCard } from '../components/VenueCard'
import { FilterSheet } from '../components/FilterSheet'
import { FilterIcon, StarIcon, SearchIcon } from '../lib/icons'

export function BrowseView() {
  const { venues, groups, suburbs, search, onlyShortlist, favourites } = useStore()
  const setSearch = useStore((s) => s.setSearch)
  const setOnlyShortlist = useStore((s) => s.setOnlyShortlist)
  const openVenue = useStore((s) => s.openVenue)
  const [filterOpen, setFilterOpen] = useState(false)

  const list = useMemo(
    () => filterVenues(venues, { groups, suburbs, search, onlyShortlist, favourites }),
    [venues, groups, suburbs, search, onlyShortlist, favourites],
  )

  const filterCount = groups.length + suburbs.length

  return (
    <div className="view browse-view">
      <div className="browse-bar">
        <div className="search-wrap">
          <SearchIcon className="search-icon" size={18} />
          <input
            className="search"
            type="search"
            placeholder="Search name, cuisine, suburb…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="pill pill--icon" onClick={() => setFilterOpen(true)} aria-label="Filters">
          <FilterIcon size={18} weight="bold" />
          {filterCount ? <span className="pill-count">{filterCount}</span> : null}
        </button>
        <button
          className={`pill pill--icon ${onlyShortlist ? 'pill--on' : ''}`}
          onClick={() => setOnlyShortlist(!onlyShortlist)}
          aria-label="Shortlist only"
        >
          <StarIcon size={18} weight={onlyShortlist ? 'fill' : 'regular'} />
          {favourites.length ? <span className="pill-count">{favourites.length}</span> : null}
        </button>
      </div>

      <p className="browse-count">{list.length} places</p>

      <div className="card-list">
        {list.map((v) => (
          <VenueCard key={v.id} venue={v} onClick={() => openVenue(v.id)} />
        ))}
        {list.length === 0 && <p className="empty">No venues match. Try clearing filters.</p>}
      </div>

      <FilterSheet open={filterOpen} onClose={() => setFilterOpen(false)} />
    </div>
  )
}
