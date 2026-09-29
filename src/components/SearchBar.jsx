import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useProducts } from '../context/ProductsContext.jsx'
import { useCategories } from '../context/CategoriesContext.jsx'
import { searchCategories, searchProducts } from '../utils/search.js'
import { formatINR } from '../utils/pricing.js'
import { CloseIcon, SearchIcon } from './icons.jsx'
import ProductImage from './ProductImage.jsx'

const MAX_PRODUCTS = 5
const MAX_CATEGORIES = 3

// Wraps the matching part of `text` in <strong>.
function Highlight({ text, query }) {
  const q = query.trim()
  const i = q ? text.toLowerCase().indexOf(q.toLowerCase()) : -1
  if (i < 0) return text
  return (
    <>
      {text.slice(0, i)}
      <strong className="font-semibold text-cracker-red">{text.slice(i, i + q.length)}</strong>
      {text.slice(i + q.length)}
    </>
  )
}

export default function SearchBar({ autoFocus = false, onDone, className = '' }) {
  const navigate = useNavigate()
  const { products } = useProducts()
  const { categories } = useCategories()
  const { pathname, search } = useLocation()
  const uid = useId()
  const listId = `${uid}-list`
  const wrapRef = useRef(null)
  const inputRef = useRef(null)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  // Narrow boxes (tablet header, small phones) get a short placeholder so it is never cut off.
  const [compact, setCompact] = useState(false)

  // Reflect the active shop search in the box; clear it elsewhere.
  useEffect(() => {
    setQuery(pathname === '/shop' ? new URLSearchParams(search).get('search') || '' : '')
  }, [pathname, search])

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus()
  }, [autoFocus])

  useEffect(() => {
    const el = inputRef.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const measure = () => setCompact(el.clientWidth < 300)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Close on outside click / tap.
  useEffect(() => {
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('touchstart', onDown, { passive: true })
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('touchstart', onDown)
    }
  }, [])

  const q = query.trim()

  // Suggestion rows in display order: products, categories, "view all".
  const items = useMemo(() => {
    if (!q) return []
    const productHits = searchProducts(products, categories, q).slice(0, MAX_PRODUCTS).map((r) => ({ type: 'product', product: r.product }))
    const categoryHits = searchCategories(categories, q).slice(0, MAX_CATEGORIES).map((c) => ({ type: 'category', category: c }))
    return [...productHits, ...categoryHits, { type: 'all' }]
  }, [q, products, categories])

  const showList = open && q.length > 0
  const hasMatches = items.length > 1
  const categoryName = (id) => categories.find((c) => c.id === id)?.name

  const finish = () => {
    setOpen(false)
    setActive(-1)
    inputRef.current?.blur()
    onDone?.()
  }

  const goSearch = () => {
    if (!q) return
    navigate(`/shop?search=${encodeURIComponent(q)}`)
    finish()
  }

  const activate = (item) => {
    if (item.type === 'product') {
      navigate(`/product/${item.product.id}`)
      finish()
    } else if (item.type === 'category') {
      navigate(`/shop?category=${item.category.id}`)
      finish()
    } else {
      goSearch()
    }
  }

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      if (open) { e.preventDefault(); setOpen(false); setActive(-1) }
      return
    }
    if (!items.length) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setOpen(true)
      setActive((i) => (i + 1) % items.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setOpen(true)
      setActive((i) => (i <= 0 ? items.length - 1 : i - 1))
    } else if (e.key === 'Enter' && showList && active >= 0) {
      e.preventDefault()
      activate(items[active])
    }
  }

  const optionId = (i) => `${uid}-opt-${i}`
  const rowCls = (i) =>
    `flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors ${i === active ? 'bg-orange-50' : 'hover:bg-orange-50/60'}`

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <form
        role="search"
        onSubmit={(e) => { e.preventDefault(); goSearch() }}
        className="relative"
      >
        <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-cracker-navy/50" />
        <input
          ref={inputRef}
          type="text"
          inputMode="search"
          enterKeyHint="search"
          autoComplete="off"
          spellCheck="false"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); setActive(-1) }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={compact ? 'Search crackers...' : 'Search crackers, products, categories...'}
          aria-label="Search crackers, products, categories"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={showList && active >= 0 ? optionId(active) : undefined}
          className="h-10 w-full rounded-full border border-orange-200 bg-white pl-10 pr-10 text-base text-gray-800 placeholder:text-gray-400 focus:border-cracker-orange focus:outline-none focus:ring-2 focus:ring-cracker-orange/30 sm:text-sm"
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(''); setActive(-1); inputRef.current?.focus() }}
            className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 hover:text-cracker-red focus:outline-none focus-visible:ring-2 focus-visible:ring-cracker-orange/60"
            aria-label="Clear search"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        )}
      </form>

      {showList && (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-40 mt-2 max-h-[70vh] overflow-y-auto rounded-xl border border-orange-100 bg-white py-1 shadow-lg"
        >
          {!hasMatches && (
            <li role="presentation" className="px-3 py-3 text-sm text-gray-500">No matches for “{q}”</li>
          )}
          {items.map((item, i) => {
            const common = {
              id: optionId(i),
              role: 'option',
              'aria-selected': i === active,
              onMouseEnter: () => setActive(i),
              onMouseDown: (e) => e.preventDefault(), // keep input focus until click completes
              onClick: () => activate(item),
            }
            const prev = items[i - 1]
            const heading =
              item.type === 'product' && i === 0 ? 'Products'
              : item.type === 'category' && prev?.type !== 'category' ? 'Categories'
              : null
            return (
              <li key={i} role="presentation">
                {heading && <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">{heading}</p>}
                {item.type === 'product' && (
                  <button type="button" {...common} className={rowCls(i)}>
                    <ProductImage product={item.product} className="h-10 w-14 shrink-0 rounded" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-gray-800"><Highlight text={item.product.name} query={q} /></span>
                      <span className="block truncate text-xs text-gray-500">{categoryName(item.product.category)}</span>
                    </span>
                    <span className="shrink-0 text-sm font-semibold text-cracker-red">{formatINR(item.product.price)}</span>
                  </button>
                )}
                {item.type === 'category' && (
                  <button type="button" {...common} className={rowCls(i)}>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-cracker-navy ring-1 ring-cracker-gold/60">
                      <img src={item.category.image} alt="" className="h-full w-full object-cover" />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-gray-800"><Highlight text={item.category.name} query={q} /></span>
                    <span className="shrink-0 text-xs text-gray-400">Category</span>
                  </button>
                )}
                {item.type === 'all' && (
                  <button type="button" {...common} className={`${rowCls(i)} border-t border-orange-100 font-medium text-cracker-red`}>
                    <SearchIcon className="h-4 w-4 shrink-0" />
                    <span className="truncate">View all results for “{q}”</span>
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
