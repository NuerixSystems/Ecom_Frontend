import { useState } from 'react'
import { categoryImage, products as bundledProducts } from '../data/products.js'
import placeholderImg from '../assets/images/product-placeholder.svg'

// Finds the photo that ships inside the frontend bundle for a product, matched
// by slug (best), then id, then name. Cart / wishlist / enquiry lines come from
// the backend, where `image` is usually empty (the seed can't store bundled
// Vite images), so without this lookup they would never show the real photo.
function bundledImage(product) {
  if (!product) return undefined
  const slug = product.slug
  const name = product.name?.trim().toLowerCase()
  const match =
    (slug && bundledProducts.find((p) => p.slug === slug)) ||
    (product.productId != null && bundledProducts.find((p) => p.id === product.productId && p.name === product.name)) ||
    (name && bundledProducts.find((p) => p.name.toLowerCase() === name))
  return match?.image
}

// Shows the product photo. Fallback chain, so a card/cart line never shows a
// broken-image icon:
//   1. the product's own photo (API `image` / gallery `src`)
//   2. the photo bundled with the site for that product
//   3. its category image
//   4. a generic placeholder
// Every URL that fails to load is remembered and skipped, so the next step in
// the chain is tried automatically. (The old version reset its "failed" flag in
// an effect, which could undo the fallback and leave a broken image on screen.)
export default function ProductImage({ product, src, className = '' }) {
  const [failed, setFailed] = useState([])

  const candidates = [src || product?.image, bundledImage(product), categoryImage(product?.category), placeholderImg]
    .filter(Boolean)
    .filter((url, i, all) => all.indexOf(url) === i)

  const current = candidates.find((url) => !failed.includes(url)) || placeholderImg
  const isPhoto = current === (src || product?.image) || current === bundledImage(product)

  return (
    <div className={`relative overflow-hidden bg-[#F1E9DD] ${className}`}>
      <img
        key={current}
        src={current}
        alt={product?.name || 'Product'}
        loading="lazy"
        onError={() => setFailed((prev) => (prev.includes(current) ? prev : [...prev, current]))}
        className={isPhoto ? 'h-full w-full object-cover' : 'h-full w-full object-contain p-[6%]'}
      />
    </div>
  )
}
