import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Venue, ViewKey } from '../types'
import { cuisineGroup } from '../lib/cuisine'

interface State {
  venues: Venue[]
  setVenues: (v: Venue[]) => void

  view: ViewKey
  setView: (v: ViewKey) => void

  // filters
  groups: string[]
  toggleGroup: (g: string) => void
  suburbs: string[]
  toggleSuburb: (s: string) => void
  search: string
  setSearch: (s: string) => void
  onlyShortlist: boolean
  setOnlyShortlist: (b: boolean) => void
  clearFilters: () => void

  // shortlist (persisted)
  favourites: string[]
  toggleFavourite: (id: string) => void

  // ui
  selectedId: string | null
  openVenue: (id: string) => void
  closeVenue: () => void
  winnerId: string | null
  setWinner: (id: string | null) => void
}

export const useStore = create<State>()(
  persist(
    (set) => ({
      venues: [],
      setVenues: (v) => set({ venues: v }),

      view: 'play',
      setView: (view) => set({ view }),

      groups: [],
      toggleGroup: (g) =>
        set((s) => ({
          groups: s.groups.includes(g) ? s.groups.filter((x) => x !== g) : [...s.groups, g],
        })),
      suburbs: [],
      toggleSuburb: (sub) =>
        set((s) => ({
          suburbs: s.suburbs.includes(sub) ? s.suburbs.filter((x) => x !== sub) : [...s.suburbs, sub],
        })),
      search: '',
      setSearch: (search) => set({ search }),
      onlyShortlist: false,
      setOnlyShortlist: (onlyShortlist) => set({ onlyShortlist }),
      clearFilters: () => set({ groups: [], suburbs: [], search: '', onlyShortlist: false }),

      favourites: [],
      toggleFavourite: (id) =>
        set((s) => ({
          favourites: s.favourites.includes(id)
            ? s.favourites.filter((x) => x !== id)
            : [...s.favourites, id],
        })),

      selectedId: null,
      openVenue: (id) => set({ selectedId: id }),
      closeVenue: () => set({ selectedId: null }),
      winnerId: null,
      setWinner: (winnerId) => set({ winnerId }),
    }),
    {
      name: 'rpd-store',
      partialize: (s) => ({ favourites: s.favourites, groups: s.groups, suburbs: s.suburbs }),
    },
  ),
)

// Derived helper: apply the active filters to a venue list.
export function filterVenues(
  venues: Venue[],
  opts: { groups: string[]; suburbs: string[]; search: string; onlyShortlist: boolean; favourites: string[] },
): Venue[] {
  const q = opts.search.trim().toLowerCase()
  return venues.filter((v) => {
    if (opts.onlyShortlist && !opts.favourites.includes(v.id)) return false
    if (opts.groups.length && !opts.groups.includes(cuisineGroup(v.cuisine))) return false
    if (opts.suburbs.length && !opts.suburbs.includes(v.suburb)) return false
    if (q) {
      const hay = `${v.name} ${v.cuisine} ${v.suburb} ${v.description}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })
}
