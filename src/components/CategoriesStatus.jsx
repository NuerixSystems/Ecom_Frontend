// Minimal loading / error state for category UI (Home marquee, Shop filter
// bar). Kept deliberately simple, matching the site's existing text style —
// no new visual design introduced.

export function CategoriesLoading({ label = 'Loading categories…' }) {
  return <p className="text-sm text-gray-500">{label}</p>
}

export function CategoriesError({ message, onRetry }) {
  return (
    <p className="text-sm text-gray-500">
      {message || "Couldn't load categories."}
      {onRetry && (
        <button onClick={onRetry} className="ml-2 font-medium text-cracker-red hover:underline">
          Try Again
        </button>
      )}
    </p>
  )
}
