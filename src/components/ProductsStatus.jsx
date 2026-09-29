// Shared loading / error / empty state for anywhere the Products API is
// used. Reuses the site's existing `.card` look (see Shop.jsx's old "No
// products found" block) instead of introducing new UI.

export function ProductsLoading({ label = 'Loading products…' }) {
  return (
    <div className="card flex flex-col items-center px-6 py-14 text-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-cracker-orange border-t-transparent" aria-hidden="true" />
      <p className="mt-4 text-sm text-gray-500">{label}</p>
    </div>
  )
}

export function ProductsError({ message, onRetry }) {
  return (
    <div className="card flex flex-col items-center px-6 py-14 text-center">
      <h2 className="font-display text-lg font-bold text-cracker-navy">Couldn&apos;t load products</h2>
      <p className="mt-1 max-w-sm text-sm text-gray-500">{message || 'Something went wrong while loading products. Please try again.'}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-primary mt-5 text-sm">Try Again</button>
      )}
    </div>
  )
}

export function ProductsEmpty({ title = 'No products found', message = 'There are no products here yet.', action }) {
  return (
    <div className="card flex flex-col items-center px-6 py-14 text-center">
      <h2 className="font-display text-lg font-bold text-cracker-navy">{title}</h2>
      <p className="mt-1 max-w-sm text-sm text-gray-500">{message}</p>
      {action}
    </div>
  )
}
