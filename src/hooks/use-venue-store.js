import { useContext } from 'react'
import { VenueContext } from '../context/venue-context.js'

export function useVenueStore() {
  const ctx = useContext(VenueContext)
  if (!ctx) throw new Error('useVenueStore must be used within VenueStoreProvider')
  return ctx
}
