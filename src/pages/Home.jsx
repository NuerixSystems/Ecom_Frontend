import { Link } from 'react-router-dom'
import CategoryMarquee from '../components/CategoryMarquee.jsx'
import { AwardIcon, BoxIcon, ShieldIcon, UsersIcon } from '../components/icons.jsx'
import ProductCard from '../components/ProductCard.jsx'
import { ProductsError, ProductsLoading } from '../components/ProductsStatus.jsx'
import { CategoriesError, CategoriesLoading } from '../components/CategoriesStatus.jsx'
import { useProducts } from '../context/ProductsContext.jsx'
import { useCategories } from '../context/CategoriesContext.jsx'
import { getDiscountPercent } from '../utils/pricing.js'
import lanternImg from '../assets/images/lantern-story.jpg'
import ctaCelebrationsImg from '../assets/images/cta-celebrations.png'

export default function Home() {
  const { products, loading, error, refetch, trendingProducts } = useProducts()
  const { categories, loading: catLoading, error: catError, refetch: catRefetch } = useCategories()
  const trending = trendingProducts(4)
  // Best deals = the biggest discounts first (discount % is derived from mrp + price).
  const deals = [...products]
    .sort((a, b) => getDiscountPercent(b.mrp, b.price) - getDiscountPercent(a.mrp, a.price))
    .slice(0, 4)
  const topDiscount = deals.length ? getDiscountPercent(deals[0].mrp, deals[0].price) : 0

  return (
    <div className="pb-16 overflow-x-clip">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 text-center">
        <h2 className="font-display text-2xl font-bold text-cracker-navy">Categories</h2>
        <p className="text-gray-500 text-sm mb-8">Find Your Favourite Crackers</p>
        {catLoading ? (
          <CategoriesLoading />
        ) : catError ? (
          <CategoriesError message={catError} onRetry={catRefetch} />
        ) : (
          <CategoryMarquee categories={categories} />
        )}
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-14">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl font-bold text-cracker-navy">Trending Products</h2>
            <p className="text-gray-500 text-sm">Our Bestsellers</p>
          </div>
          <Link to="/shop" className="text-cracker-red text-sm font-medium">View All →</Link>
        </div>
        {loading ? (
          <ProductsLoading label="Loading trending products…" />
        ) : error ? (
          <ProductsError message={error} onRetry={refetch} />
        ) : trending.length === 0 ? null : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {trending.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-14">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl font-bold text-cracker-navy">Offers &amp; Best Deals</h2>
            <p className="text-gray-500 text-sm">{topDiscount > 0 ? `Up to ${topDiscount}% OFF on festival favourites` : 'Festival favourites at great prices'}</p>
          </div>
          <Link to="/shop" className="text-cracker-red text-sm font-medium">View All →</Link>
        </div>
        {loading ? (
          <ProductsLoading label="Loading deals…" />
        ) : error ? (
          <ProductsError message={error} onRetry={refetch} />
        ) : deals.length === 0 ? null : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {deals.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-16">
        <div
          className="relative overflow-hidden rounded-2xl text-white px-8 py-10 text-center bg-cover bg-center"
          style={{ backgroundImage: `url(${lanternImg})` }}
        >
          <div className="absolute inset-0 bg-cracker-navy/60" />
          <div className="relative">
            <h3 className="font-display text-2xl font-bold mb-2">More Than Just Crackers</h3>
            <p className="text-gray-200 text-sm mb-5">We bring joy, happiness and togetherness to your celebrations.</p>
            <Link to="/about" className="btn-primary inline-block">Our Story →</Link>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-14 text-center">
        <h2 className="font-display text-xl font-bold text-cracker-navy mb-8">Why Choose Karpaga Crackers?</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { Icon: AwardIcon, title: 'Premium Quality', desc: 'Better quality products' },
            { Icon: ShieldIcon, title: 'Safe & Certified', desc: 'Safety is our priority' },
            { Icon: BoxIcon, title: 'Wide Variety', desc: 'All types of crackers' },
            { Icon: UsersIcon, title: 'Trusted by Thousands', desc: 'Happy customers' },
          ].map(({ Icon, ...f }) => (
            <div key={f.title} className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center text-cracker-orange"><Icon className="h-7 w-7" /></div>
              <p className="font-semibold text-sm">{f.title}</p>
              <p className="text-xs text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-14">
        <div
          className="relative overflow-hidden rounded-2xl text-white text-center px-6 py-14 bg-cover bg-center"
          style={{ backgroundImage: `url(${ctaCelebrationsImg})` }}
        >
          <div className="absolute inset-0 bg-cracker-navy/55" />
          <div className="relative">
            <h3 className="font-display text-2xl font-bold mb-2">Make Your Celebrations Extra Special</h3>
            <p className="text-gray-200 text-sm mb-5">Shop now and light up your world!</p>
            <Link to="/shop" className="btn-primary inline-block">Shop Now →</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
