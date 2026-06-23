import { useMemo } from 'react'
import { useStore } from '../store/useStore'
import { cuisineGroup } from '../lib/cuisine'

export function FilterSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const venues = useStore((s) => s.venues)
  const groups = useStore((s) => s.groups)
  const toggleGroup = useStore((s) => s.toggleGroup)
  const suburbs = useStore((s) => s.suburbs)
  const toggleSuburb = useStore((s) => s.toggleSuburb)
  const clearFilters = useStore((s) => s.clearFilters)

  const groupOptions = useMemo(() => {
    const counts = new Map<string, number>()
    venues.forEach((v) => {
      const g = cuisineGroup(v.cuisine)
      counts.set(g, (counts.get(g) ?? 0) + 1)
    })
    return [...counts.entries()].sort((a, b) => b[1] - a[1])
  }, [venues])

  const suburbOptions = useMemo(() => {
    const counts = new Map<string, number>()
    venues.forEach((v) => v.suburb && counts.set(v.suburb, (counts.get(v.suburb) ?? 0) + 1))
    return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  }, [venues])

  if (!open) return null

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet sheet--tall" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Filters">
        <div className="sheet-grip" />
        <div className="filter-head">
          <h2>Filter</h2>
          <button className="link-btn" onClick={clearFilters}>
            Reset
          </button>
        </div>

        <h3 className="filter-label">Cuisine</h3>
        <div className="chips">
          {groupOptions.map(([g, n]) => (
            <button
              key={g}
              className={`chip ${groups.includes(g) ? 'chip--on' : ''}`}
              onClick={() => toggleGroup(g)}
            >
              {g} <span className="chip-count">{n}</span>
            </button>
          ))}
        </div>

        <h3 className="filter-label">Suburb</h3>
        <div className="chips">
          {suburbOptions.map(([s, n]) => (
            <button
              key={s}
              className={`chip ${suburbs.includes(s) ? 'chip--on' : ''}`}
              onClick={() => toggleSuburb(s)}
            >
              {s} <span className="chip-count">{n}</span>
            </button>
          ))}
        </div>

        <button className="btn btn--primary sheet-done" onClick={onClose}>
          Done
        </button>
      </div>
    </div>
  )
}
