import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { fetchCategories } from '../api/categories.js'
import { categories as localCategories } from '../data/products.js'

const CategoriesContext = createContext(null)

export function CategoriesProvider({ children }) {
  const [remote, setRemote] = useState(null)
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

  const localById = new Map(localCategories.map((c) => [c.id, c]))

  return remote.map((apiCategory) => {
    const local = localById.get(apiCategory.id)

    return {
      id: apiCategory.id,
      name: apiCategory.name || local?.name || apiCategory.id,
      image: local?.image || null,
    }
  })
}, [remote])

  const value = useMemo(
    () => ({ categories, loading, error, refetch: load }),
    [categories, loading, error, load],
  )

  return (
    <CategoriesContext.Provider value={value}>
      {children}
    </CategoriesContext.Provider>
  )
}

export function useCategories() {
  const ctx = useContext(CategoriesContext)

  if (!ctx) {
    throw new Error('useCategories must be used within a CategoriesProvider')
  }

  return ctx
}