export interface Venue {
  id: string
  name: string
  cuisine: string
  suburb: string
  city: string
  description: string
  address: string
  instagram: string
  instagramUrl: string
  mapsUrl: string
  lat: number | null
  lng: number | null
  geoPrecision: 'exact' | 'suburb' | 'none'
}

export type ViewKey = 'play' | 'map' | 'browse'
