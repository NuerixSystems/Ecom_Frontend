import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard.jsx'
import CategoryFilterBar from '../components/CategoryFilterBar.jsx'
import PageHero from '../components/PageHero.jsx'
import { ProductsError, ProductsLoading } from '../components/ProductsStatus.jsx'
import { CategoriesError, CategoriesLoading } from '../components/CategoriesStatus.jsx'
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon } from '../components/icons.jsx'
import { useProducts } from '../context/ProductsContext.jsx'
import { useCategories } from '../context/CategoriesContext.jsx'
import { getDiscountPercent } from '../utils/pricing.js'
import { searchProducts } from '../utils/search.js'
import PriceRangeSlider from '../components/PriceRangeSlider.jsx'
import { PRICE_MAX, PRICE_MIN, isFullPriceRange, matchesPrice, matchesStock } from '../utils/shopFilters.js'
import heroShopImg from '../assets/images/hero-shop.png'

const PAGE_SIZE = 12

const sortOptions = [
  { id: 'relevance', label: 'Relevance' },
  { id: 'price-asc', label: 'Price: Low to High' },
  { id: 'price-desc', label: 'Price: High to Low' },
  { id: 'rating', label: 'Rating' },
  { id: 'discount', label: 'Discount' },
]

export default function Shop() {
  const { products, loading, error, refetch } = useProducts()
  const { categories, loading: catLoading, error: catError, refetch: catRefetch } = useCategories()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeCategory = searchParams.get('category') || 'all'
  const searchQuery = (searchParams.get('search') || '').trim()
  const [priceRange, setPriceRange] = useState([PRICE_MIN, PRICE_MAX])
  const [openSections, setOpenSections] = useState({ price: true, availability: true })
  const toggleSection = (k) => setOpenSections((o) => ({ ...o, [k]: !o[k] }))
  const [showInStock, setShowInStock] = useState(true)
  const [showOutOfStock, setShowOutOfStock] = useState(true)
  const [sort, setSort] = useState('relevance')
  const [page, setPage] = useState(1)

  // Changing category keeps any active search (and vice versa).
  const setCategory = (id) => {
    const next = new URLSearchParams(searchParams)
    if (id === 'all') next.delete('category')
    else next.set('category', id)
    setSearchParams(next)
  }

  const clearSearch = () => {
    const next = new URLSearchParams(searchParams)
    next.delete('search')
    setSearchParams(next)
  }

  const categoryCounts = useMemo(() => {
    const counts = {}
    products.forEach((p) => { counts[p.category] = (counts[p.category] || 0) + 1 })
    return counts
  }, [products])

  const clearFilters = () => {
    setSearchParams({})
    setPriceRange([PRICE_MIN, PRICE_MAX])
    setShowInStock(true)
    setShowOutOfStock(true)
  }

  const filtered = useMemo(() => {
    // With a search: only matching products, ranked by relevance.
    const scores = searchQuery ? new Map(searchProducts(products, categories, searchQuery).map((r) => [r.product.id, r.score])) : null
    const base = scores ? products.filter((p) => scores.has(p.id)) : products
    const list = base.filter((p) => {
      const catMatch = activeCategory === 'all' || p.category === activeCategory
      const priceMatch = matchesPrice(p.price, priceRange[0], priceRange[1])
      const stockMatch = matchesStock(p.inStock, showInStock, showOutOfStock)
      return catMatch && priceMatch && stockMatch
    })
    if (sort === 'price-asc') return [...list].sort((a, b) => a.price - b.price)
    if (sort === 'price-desc') return [...list].sort((a, b) => b.price - a.price)
    if (sort === 'rating') return [...list].sort((a, b) => b.rating - a.rating || b.reviews - a.reviews)
    if (sort === 'discount') return [...list].sort((a, b) => getDiscountPercent(b.mrp, b.price) - getDiscountPercent(a.mrp, a.price))
    if (scores) return [...list].sort((a, b) => scores.get(b.id) - scores.get(a.id))
    return list
  }, [products, categories, activeCategory, searchQuery, priceRange, showInStock, showOutOfStock, sort])

  // Go back to page 1 whenever the filters change.
  useEffect(() => setPage(1), [activeCategory, searchQuery, priceRange, showInStock, showOutOfStock, sort])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const start = (page - 1) * PAGE_SIZE
  const visible = filtered.slice(start, start + PAGE_SIZE)

  const pageBtn = (active) =>
    `flex h-8 min-w-8 items-center justify-center rounded border px-2 text-sm transition-colors ${
      active ? 'border-cracker-red bg-cracker-red text-white' : 'border-gray-300 bg-white text-gray-600 hover:border-cracker-orange hover:text-cracker-orange'
    }`

  return (
    <div>
      <PageHero title="Our Products" subtitle="Premium Quality Crackers for Every Celebration" image={heroShopImg} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8">
        <h3 className="font-semibold text-gray-800 mb-3">Categories</h3>
        {catLoading ? (
          <CategoriesLoading />
        ) : catError ? (
          <CategoriesError message={catError} onRetry={catRefetch} />
        ) : (
          <CategoryFilterBar
            categories={categories}
            activeCategory={activeCategory}
            totalCount={products.length}
            categoryCounts={categoryCounts}
            onSelect={setCategory}
          />
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-4 grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8 pb-16">
        <aside className="h-fit self-start rounded-sm border border-gray-200 bg-white md:sticky md:top-4">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
            <h2 className="text-lg font-medium text-gray-900">Filters</h2>
            {(!isFullPriceRange(priceRange[0], priceRange[1]) || !showInStock || !showOutOfStock) && (
              <button onClick={() => { setPriceRange([PRICE_MIN, PRICE_MAX]); setShowInStock(true); setShowOutOfStock(true) }} className="text-xs font-semibold uppercase tracking-wide text-cracker-red hover:text-cracker-orange">
                Clear all
              </button>
            )}
          </div>

          <section className="border-b border-gray-200 px-4 py-3">
            <button onClick={() => toggleSection('price')} className="flex w-full items-center justify-between text-xs font-semibold uppercase tracking-wide text-gray-800" aria-expanded={openSections.price}>
              Price
              <ChevronRightIcon className={`h-4 w-4 text-gray-500 transition-transform ${openSections.price ? '-rotate-90' : 'rotate-90'}`} />
            </button>
            {openSections.price && <div className="pt-1 pb-1"><PriceRangeSlider min={priceRange[0]} max={priceRange[1]} onChange={setPriceRange} /></div>}
          </section>

          <section className="px-4 py-3">
            <button onClick={() => toggleSection('availability')} className="flex w-full items-center justify-between text-xs font-semibold uppercase tracking-wide text-gray-800" aria-expanded={openSections.availability}>
              Availability
              <ChevronRightIcon className={`h-4 w-4 text-gray-500 transition-transform ${openSections.availability ? '-rotate-90' : 'rotate-90'}`} />
            </button>
            {openSections.availability && (
              <ul className="mt-3 space-y-3 text-sm text-gray-700">
                <li>
                  <label className="flex cursor-pointer items-center gap-2.5">
                    <input type="checkbox" className="h-4 w-4 accent-cracker-red" checked={showInStock} onChange={(e) => setShowInStock(e.target.checked)} />
                    In Stock
                  </label>
                </li>
                <li>
                  <label className="flex cursor-pointer items-center gap-2.5">
                    <input type="checkbox" className="h-4 w-4 accent-cracker-red" checked={showOutOfStock} onChange={(e) => setShowOutOfStock(e.target.checked)} />
                    Out of Stock
                  </label>
                </li>
              </ul>
            )}
          </section>
        </aside>

        <div>
          {searchQuery && (
            <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-gray-600">
              <span>Results for <span className="font-semibold text-cracker-navy">“{searchQuery}”</span></span>
              <button onClick={clearSearch} className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-white px-2.5 py-1 text-xs text-gray-600 hover:border-cracker-orange hover:text-cracker-orange">
                Clear search <CloseIcon className="h-3 w-3" />
              </button>
            </div>
          )}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <p className="text-sm text-gray-500">
              {filtered.length === 0
                ? 'Showing 0 products'
                : `Showing ${start + 1}-${start + visible.length} of ${filtered.length} products`}
            </p>
            <label className="flex items-center gap-2 text-sm text-gray-500">
              Sort by:
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-700 focus:border-cracker-orange focus:outline-none"
              >
                {sortOptions.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
              </select>
            </label>
          </div>

          {loading ? (
            <ProductsLoading />
          ) : error ? (
            <ProductsError message={error} onRetry={refetch} />
          ) : filtered.length === 0 ? (
            <div className="card flex flex-col items-center px-6 py-14 text-center">
              <h2 className="font-display text-lg font-bold text-cracker-navy">No products found</h2>
              <p className="mt-1 max-w-sm text-sm text-gray-500">
                {searchQuery
                  ? `Nothing matched “${searchQuery}”. Check the spelling, try a shorter word, or clear your filters.`
                  : activeCategory !== 'all' && !categories.some((c) => c.id === activeCategory)
                    ? 'We could not find that category.'
                    : 'There are no products here yet. Try another category or clear your filters.'}
              </p>
              <button onClick={clearFilters} className="btn-primary mt-5 text-sm">View All Products</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
              {visible.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}

          {!loading && !error && pageCount > 1 && (
            <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Pagination">
              <button className={pageBtn(false)} onClick={() => setPage((n) => Math.max(1, n - 1))} disabled={page === 1} aria-label="Previous page">
                <ChevronLeftIcon className="h-4 w-4" />
              </button>
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                <button key={n} className={pageBtn(n === page)} onClick={() => setPage(n)} aria-current={n === page ? 'page' : undefined}>
                  {n}
                </button>
              ))}
              <button className={pageBtn(false)} onClick={() => setPage((n) => Math.min(pageCount, n + 1))} disabled={page === pageCount} aria-label="Next page">
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </nav>
          )}
        </div>
      </div>
    </div>
  )
}
