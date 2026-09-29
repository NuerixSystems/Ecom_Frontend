import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { fetchProducts } from '../api/products.js'

const ProductsContext = createContext(null)

// Fetches the product catalog from GET /api/v1/products once and shares it
// with the whole app, so every page reads from the same live data instead of
// the old static src/data/products.js list. Categories are fetched
// separately by CategoriesContext (see that file).
export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchProducts()
      setProducts(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err?.message || 'Something went wrong while loading products.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const value = useMemo(
    () => ({
      products,
      loading,
      error,
      refetch: load,
      getProduct: (id) => products.find((p) => String(p.id) === String(id)),
      // Same-category products first, then the rest (mirrors the old
      // data/products.js helper of the same name).
      relatedProducts: (product, count = 4) => {
        const others = products.filter((p) => p.id !== product.id)
        const same = others.filter((p) => p.category === product.category)
        const rest = others.filter((p) => p.category !== product.category)
        return [...same, ...rest].slice(0, count)
      },
      trendingProducts: (count = 4) => products.filter((p) => p.trending).slice(0, count),
    }),
    [products, loading, error, load],
  )

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>
}

export function useProducts() {
  const ctx = useContext(ProductsContext)
  if (!ctx) throw new Error('useProducts must be used within a ProductsProvider')
  return ctx
}
