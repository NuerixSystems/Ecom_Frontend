import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center">
      <h1 className="font-display text-2xl font-bold text-cracker-navy mb-2">Page not found</h1>
      <p className="text-sm text-gray-500">The page you are looking for does not exist or has moved.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link to="/" className="btn-primary inline-block">Go to Home</Link>
        <Link to="/shop" className="inline-block rounded-lg border border-cracker-red px-5 py-2.5 font-semibold text-cracker-red hover:bg-orange-50">Browse Shop</Link>
      </div>
    </div>
  )
}
