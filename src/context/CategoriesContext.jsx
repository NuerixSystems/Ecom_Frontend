import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { fetchCategories } from '../api/categories.js'
import { categories as localCategories } from '../data/products.js'

const CategoriesContext = createContext(null)

// Fetches the live category list from GET /api/v1/categories so nav menus,
// the Shop filter bar, and the Home category marquee reflect real backend
// data. The API doesn't host category images yet, so images stay exactly as
// they were: bundled local assets from src/data/products.js, matched up by
// category id and kept in their existing (curated) order — only the name is
// taken from the live API, and only categories the API confirms still exist
// are shown, so nothing changes visually until the backend catalog does.
export function CategoriesProvider({ children }) {
  const [remote, setRemote] = useState(null) // null = not loaded yet
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchCategories()
      setRemote(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err?.message || 'Something went wrong while loading categories.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const categories = useMemo(() => {
    if (!remote) return []
    const liveById = new Map(remote.map((c) => [c.id, c]))
    return localCategories
      .filter((c) => liveById.has(c.id))
      .map((c) => ({ ...c, name: liveById.get(c.id)?.name || c.name }))
  }, [remote])

  const value = useMemo(
    () => ({ categories, loading, error, refetch: load }),
    [categories, loading, error, load],
  )

  return <CategoriesContext.Provider value={value}>{children}</CategoriesContext.Provider>
}

export function useCategories() {
  const ctx = useContext(CategoriesContext)
  if (!ctx) throw new Error('useCategories must be used within a CategoriesProvider')
  return ctx
}
