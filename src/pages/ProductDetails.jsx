import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import { useProducts } from '../context/ProductsContext.jsx'
import { useCategories } from '../context/CategoriesContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import { useAddToCart } from '../hooks/useAddToCart.js'
import { useWishlist } from '../context/WishlistContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import StarRating from '../components/StarRating.jsx'
import ProductCard from '../components/ProductCard.jsx'
import ProductImage from '../components/ProductImage.jsx'
import PriceDisplay from '../components/PriceDisplay.jsx'
import { ProductsError, ProductsLoading } from '../components/ProductsStatus.jsx'
import { formatINR } from '../utils/pricing.js'
import { HeartIcon, MinusIcon, PlusIcon } from '../components/icons.jsx'
import { ApiError } from '../api/client.js'

export default function ProductDetails() {
  const { id } = useParams()
  const { loading, error, refetch, getProduct, relatedProducts } = useProducts()
  const { categories } = useCategories()
  const product = getProduct(id)
  const { addToCart } = useCart()
  const { canShop } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [qty, setQty] = useState(1)
  const [tab, setTab] = useState('description')
  const [activeImg, setActiveImg] = useState(0)
  const { isWished, toggleWishlist } = useWishlist()
  const [cartError, setCartError] = useState('')
  const [buying, setBuying] = useState(false)
  const { add: addAndOpenCart, adding: addingToCart } = useAddToCart()
  const adding = buying || addingToCart

  // Related products reuse this component: start each product from a clean state.
  useEffect(() => {
    setQty(1)
    setTab('description')
    setActiveImg(0)
    setCartError('')
  }, [id])

  if (loading) {
    return <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20"><ProductsLoading label="Loading product…" /></div>
  }

  if (error) {
    return <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20"><ProductsError message={error} onRetry={refetch} /></div>
  }

  if (!product) {
    return <p className="text-center py-20 text-gray-500">Product not found. <Link to="/shop" className="text-cracker-red">Back to Shop</Link></p>
  }

  const wished = isWished(product.id)
  const related = relatedProducts(product)
  const gallery = product.images?.length ? product.images : [null]
  const categoryName = categories.find((c) => c.id === product.category)?.name

  // Shared flow (login redirect for anonymous visitors is handled inside it): backend add (new line or quantity increase), success toast
  // then navigate to the cart page.
  const handleAddToCart = () => {
    setCartError('')
    return addAndOpenCart(product, qty)
  }

  // Backend wishlist requires a logged-in customer -- send an anonymous
  // visitor to login instead of calling an API that would just 401.
  const handleToggleWishlist = () => {
    if (!canShop) {
      navigate('/login', { state: { from: location.pathname } })
      return
    }
    toggleWishlist(product.id).catch(() => {})
  }

  const handleBuyNow = async () => {
    if (!canShop) {
      navigate('/login', { state: { from: location.pathname } })
      return
    }
    setCartError('')
    setBuying(true)
    try {
      await addToCart(product, qty)
      navigate('/contact')
    } catch (err) {
      setCartError(err instanceof ApiError ? err.message : 'Could not add this item to your cart.')
    } finally {
      setBuying(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-gray-500">
        <Link to="/" className="hover:text-cracker-orange">Home</Link>
        <span aria-hidden="true">/</span>
        <Link to="/shop" className="hover:text-cracker-orange">Shop</Link>
        {categoryName && (
          <>
            <span aria-hidden="true">/</span>
            <Link to={`/shop?category=${product.category}`} className="hover:text-cracker-orange">{categoryName}</Link>
          </>
        )}
        <span aria-hidden="true">/</span>
        <span className="text-gray-700">{product.name}</span>
      </nav>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div>
          <ProductImage product={product} src={gallery[activeImg]} className="aspect-[3/2] rounded-2xl shadow-sm border border-orange-100" />
          {gallery.length > 1 && (
            <div className="flex gap-3 mt-4">
              {gallery.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`overflow-hidden rounded-lg border-2 ${i === activeImg ? 'border-cracker-red' : 'border-orange-100'}`}
                  aria-label={`View image ${i + 1}`}
                >
                  <ProductImage product={product} src={img} className="h-14 w-20" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="font-display text-2xl font-bold text-cracker-navy">{product.name}</h1>
          <div className="mt-2"><StarRating rating={product.rating} reviews={product.reviews} reviewsLabel size="lg" /></div>
          <div className="flex items-center gap-3 mt-4">
            <PriceDisplay mrp={product.mrp} price={product.price} size="lg" />
            {product.inStock ? (
              <span className="inline-flex items-center gap-1.5 text-green-600 text-sm font-medium">
                <span className="h-2 w-2 rounded-full bg-green-600" /> In Stock
              </span>
            ) : (
              <span className="text-sm font-medium text-gray-500">Out of Stock</span>
            )}
          </div>
          <p className="text-gray-600 text-sm mt-4 leading-relaxed">{product.desc}</p>
          <ul className="mt-4 space-y-1 text-sm text-gray-600 list-disc list-inside">
            {product.bullets.map((b) => <li key={b}>{b}</li>)}
          </ul>

          <div className="flex items-center gap-4 mt-6">
            <div className="flex items-center rounded-lg border border-gray-300 bg-white">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-3 text-gray-600 hover:text-cracker-red" aria-label="Decrease quantity"><MinusIcon className="h-4 w-4" /></button>
              <span className="min-w-8 text-center text-sm font-medium">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="px-3 py-3 text-gray-600 hover:text-cracker-red" aria-label="Increase quantity"><PlusIcon className="h-4 w-4" /></button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock || adding}
              className="btn-primary flex-1 py-3 disabled:opacity-50"
            >
              Add to Cart
            </button>
          </div>
          <button
            onClick={handleBuyNow}
            disabled={!product.inStock || adding}
            className="mt-3 w-full rounded-lg border border-cracker-red py-3 font-semibold text-cracker-red transition-colors hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Buy Now
          </button>
          {cartError && (
            <p role="alert" className="mt-3 text-sm text-cracker-red">{cartError}</p>
          )}
          <button
            onClick={handleToggleWishlist}
            className={`mt-4 inline-flex items-center gap-2 text-sm transition-colors ${wished ? 'text-cracker-red' : 'text-gray-500 hover:text-cracker-red'}`}
            aria-pressed={wished}
          >
            <HeartIcon filled={wished} className="h-[18px] w-[18px]" /> {wished ? 'Added to Wishlist' : 'Add to Wishlist'}
          </button>
        </div>
      </div>

      <div className="mt-12 border-b flex gap-8 text-sm">
        {['description', 'specifications', 'reviews'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-3 capitalize font-medium ${tab === t ? 'text-cracker-red border-b-2 border-cracker-red' : 'text-gray-500'}`}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="py-6 text-sm text-gray-600 max-w-2xl leading-relaxed">
        {tab === 'description' && <p>{product.desc}</p>}
        {tab === 'specifications' && (
          <ul className="space-y-1.5">
            <li><span className="font-medium text-gray-800">Category:</span> {categoryName}</li>
            <li><span className="font-medium text-gray-800">Price:</span> {formatINR(product.price)}{product.mrp > product.price && <span className="text-gray-400"> (MRP <span className="line-through">{formatINR(product.mrp)}</span>)</span>}</li>
            {product.bullets.map((b) => <li key={b}>{b}</li>)}
          </ul>
        )}
        {tab === 'reviews' && <p>{product.reviews} customers rated this product {product.rating} / 5.</p>}
      </div>

      <div className="mt-10">
        <h2 className="font-display text-xl font-bold text-cracker-navy mb-5">Related Products</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {related.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </div>
  )
}
