import { StarIcon } from './icons.jsx'

export default function StarRating({ rating, reviews, reviewsLabel = false, size = 'sm' }) {
  const full = Math.round(rating)
  const dim = size === 'lg' ? 'h-5 w-5' : 'h-3.5 w-3.5'
  return (
    <div className="flex items-center gap-1.5 text-sm" aria-label={`Rated ${rating} out of 5`}>
      <span className="flex gap-0.5 text-cracker-gold">
        {[1, 2, 3, 4, 5].map((i) => (
          <StarIcon key={i} filled={i <= full} className={`${dim} ${i <= full ? '' : 'text-gray-300'}`} />
        ))}
      </span>
      {reviews ? (
        <span className="text-xs text-gray-500">({reviews}{reviewsLabel ? ' reviews' : ''})</span>
      ) : null}
    </div>
  )
}
