import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useCategories } from '../context/CategoriesContext.jsx'
import { ChevronRightIcon } from './icons.jsx'

// "Shop" nav item: the label goes to /shop, the chevron (or hover, on desktop)
// opens a list of category links -> /shop?category=<id>.
export default function ShopMenu({ linkClass }) {
  const { categories } = useCategories()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const { pathname } = useLocation()

  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    if (!open) return
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('touchstart', onDown, { passive: true })
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('touchstart', onDown)
    }
  }, [open])

  const close = () => setOpen(false)
  const itemCls = 'block rounded-md px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-orange-50 hover:text-cracker-orange'

  return (
    <div
      ref={ref}
      className="relative flex items-center gap-1"
      onPointerEnter={(e) => { if (e.pointerType === 'mouse') setOpen(true) }}
      onPointerLeave={(e) => { if (e.pointerType === 'mouse') setOpen(false) }}
      onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false) }}
    >
      <NavLink to="/shop" className={linkClass}>Shop</NavLink>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Shop categories"
        aria-haspopup="true"
        aria-expanded={open}
        className="flex h-6 w-6 items-center justify-center rounded-full text-cracker-navy/70 hover:text-cracker-orange focus:outline-none focus-visible:ring-2 focus-visible:ring-cracker-orange/60"
      >
        <ChevronRightIcon className={`h-4 w-4 transition-transform ${open ? '-rotate-90' : 'rotate-90'}`} />
      </button>

      {open && (
        <div className="absolute left-1/2 top-full z-40 -translate-x-1/2 pt-3">
          <div className="max-h-[70vh] w-[min(92vw,560px)] overflow-y-auto rounded-xl border border-orange-100 bg-white p-3 shadow-lg">
            <Link to="/shop" onClick={close} className={`${itemCls} mb-1 border-b border-orange-100 font-semibold text-cracker-red`}>
              All Products
            </Link>
            <ul className="grid grid-cols-2 gap-x-2">
              {categories.map((c) => (
                <li key={c.id}>
                  <Link to={`/shop?category=${c.id}`} onClick={close} className={itemCls}>{c.name}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
