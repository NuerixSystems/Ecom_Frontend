import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { useWishlist } from '../context/WishlistContext.jsx'
import { useCategories } from '../context/CategoriesContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { LOGIN_ENABLED } from '../config/features.js'
import { CartIcon, ChevronRightIcon, CloseIcon, HeartIcon, LogoMark, MenuIcon, SearchIcon, UserIcon } from './icons.jsx'
import SearchBar from './SearchBar.jsx'
import ShopMenu from './ShopMenu.jsx'

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'Shop' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

const iconBtn =
  'relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-cracker-navy sm:h-10 sm:w-10 transition-colors hover:bg-orange-50 hover:text-cracker-orange focus:outline-none focus-visible:ring-2 focus-visible:ring-cracker-orange/60'

export default function Header() {
  const { count } = useCart()
  const { count: wishCount } = useWishlist()
  const { categories } = useCategories()
  const { isAuthenticated } = useAuth()
  const [open, setOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileCats, setMobileCats] = useState(false)
  const { pathname } = useLocation()

  // Close the mobile menu whenever the route changes.
  useEffect(() => { setOpen(false); setSearchOpen(false); setMobileCats(false) }, [pathname])

  const desktopLink = ({ isActive }) =>
    `font-display text-[15px] font-semibold tracking-wide transition-colors ${
      isActive ? 'text-cracker-red' : 'text-cracker-navy hover:text-cracker-orange'
    }`

  const mobileLink = ({ isActive }) =>
    `block rounded-lg px-3 py-3 font-display text-base font-semibold transition-colors ${
      isActive ? 'bg-orange-50 text-cracker-red' : 'text-cracker-navy hover:bg-orange-50/70 hover:text-cracker-orange'
    }`

  return (
    <header className="sticky top-0 z-30 border-b border-orange-100 bg-[#FFFAF2]/95 shadow-[0_2px_12px_rgba(11,19,48,0.06)] backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-3 sm:gap-4 sm:px-6 md:grid md:h-[72px] md:grid-cols-[1fr_auto_1fr] lg:grid-cols-[auto_auto_minmax(0,1fr)_auto] lg:gap-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex min-w-0 shrink items-center gap-2 sm:shrink-0 sm:gap-2.5" aria-label="Karpaga Crackers home">
          <LogoMark className="h-8 w-8 shrink-0 sm:h-10 sm:w-10" />
          <span className="flex flex-col leading-none">
            <span className="whitespace-nowrap font-display text-[16px] font-bold tracking-tight text-cracker-red sm:text-[20px]">
              Karpaga Crackers
            </span>
            <span className="mt-1 whitespace-nowrap text-[9px] font-medium tracking-[0.1em] text-cracker-navy/60 sm:text-[10px] sm:tracking-[0.14em]">
              Premium Festive Crackers
            </span>
          </span>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-6 md:flex xl:gap-10" aria-label="Main">
          {navItems.map((item) =>
            item.to === '/shop' ? (
              <ShopMenu key={item.to} linkClass={desktopLink} />
            ) : (
              <NavLink key={item.to} to={item.to} className={desktopLink}>
                {item.label}
              </NavLink>
            )
          )}
        </nav>

        {/* Desktop search */}
        <SearchBar className="hidden lg:block" />

        {/* Actions */}
        <div className="flex shrink-0 items-center sm:gap-2 md:justify-self-end">
          <button
            className={`${iconBtn} lg:hidden`}
            aria-label={searchOpen ? 'Close search' : 'Search'}
            aria-expanded={searchOpen}
            onClick={() => { setSearchOpen((v) => !v); setOpen(false) }}
          >
            {searchOpen ? <CloseIcon className="h-[22px] w-[22px]" /> : <SearchIcon className="h-[22px] w-[22px]" />}
          </button>
          <Link to="/wishlist" className={iconBtn} aria-label={wishCount > 0 ? `Wishlist, ${wishCount} items` : 'Wishlist'}>
            <HeartIcon className="h-[22px] w-[22px]" />
            {wishCount > 0 && (
              <span className="absolute right-0 top-0 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-cracker-red px-1 text-[10px] font-bold leading-none text-white ring-2 ring-[#FFFAF2]">
                {wishCount > 99 ? '99+' : wishCount}
              </span>
            )}
          </Link>
          <Link to="/cart" className={iconBtn} aria-label={count > 0 ? `Enquiry list, ${count} items` : 'Enquiry list'}>
            <CartIcon className="h-[22px] w-[22px]" />
            {count > 0 && (
              <span className="absolute right-0 top-0 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-cracker-red px-1 text-[10px] font-bold leading-none text-white ring-2 ring-[#FFFAF2]">
                {count > 99 ? '99+' : count}
              </span>
            )}
          </Link>
          {LOGIN_ENABLED && (
            <Link
              to={isAuthenticated ? '/account' : '/login'}
              className={`${iconBtn} hidden sm:inline-flex`}
              aria-label={isAuthenticated ? 'My account' : 'Log in'}
            >
              <UserIcon className="h-[22px] w-[22px]" />
            </Link>
          )}
          <button
            className={`${iconBtn} md:hidden`}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => { setOpen((v) => !v); setSearchOpen(false) }}
          >
            {open ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile / tablet search */}
      {searchOpen && (
        <div className="border-t border-orange-100 bg-[#FFFAF2] px-4 py-3 lg:hidden">
          <SearchBar autoFocus onDone={() => setSearchOpen(false)} />
        </div>
      )}

      {/* Mobile navigation */}
      {open && (
        <nav id="mobile-nav" className="border-t border-orange-100 bg-[#FFFAF2] px-4 py-3 md:hidden" aria-label="Mobile">
          {navItems.map((item) =>
            item.to === '/shop' ? (
              <div key={item.to}>
                <div className="flex items-center">
                  <NavLink to="/shop" className={(s) => `${mobileLink(s)} flex-1`}>{item.label}</NavLink>
                  <button
                    type="button"
                    onClick={() => setMobileCats((v) => !v)}
                    className="flex h-11 w-11 items-center justify-center rounded-lg text-cracker-navy hover:bg-orange-50/70"
                    aria-label="Shop categories"
                    aria-expanded={mobileCats}
                  >
                    <ChevronRightIcon className={`h-5 w-5 transition-transform ${mobileCats ? '-rotate-90' : 'rotate-90'}`} />
                  </button>
                </div>
                {mobileCats && (
                  <ul className="mb-2 grid max-h-[50vh] grid-cols-2 gap-1 overflow-y-auto pl-3">
                    {categories.map((c) => (
                      <li key={c.id}>
                        <Link to={`/shop?category=${c.id}`} onClick={() => setOpen(false)} className="block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-cracker-orange">
                          {c.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <NavLink key={item.to} to={item.to} className={mobileLink}>
                {item.label}
              </NavLink>
            )
          )}
          {LOGIN_ENABLED && (
            <NavLink to={isAuthenticated ? '/account' : '/login'} className={mobileLink}>
              {isAuthenticated ? 'My Account' : 'Login'}
            </NavLink>
          )}
        </nav>
      )}
    </header>
  )
}
