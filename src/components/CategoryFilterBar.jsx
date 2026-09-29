// Horizontal, image-led category filter for the Shop page.
// Scrolls on narrow screens, wraps into rows once there's room (sm and up).
export default function CategoryFilterBar({ categories, activeCategory, totalCount, categoryCounts, onSelect }) {
  const chipBase =
    'flex shrink-0 items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-4 text-sm font-medium transition-colors whitespace-nowrap'
  const chipActive = 'border-cracker-red bg-cracker-red/10 text-cracker-red'
  const chipInactive = 'border-gray-200 bg-white text-gray-600 hover:border-cracker-orange hover:text-cracker-orange'

  return (
    <div className="flex gap-2 overflow-x-auto pb-3 [scrollbar-width:none] sm:flex-wrap sm:overflow-visible [&::-webkit-scrollbar]:hidden">
      <button
        onClick={() => onSelect('all')}
        className={`${chipBase} ${activeCategory === 'all' ? chipActive : chipInactive} py-2 pl-4`}
      >
        All Products <span className="text-xs opacity-70">({totalCount})</span>
      </button>
      {categories.map((c) => (
        <button
          key={c.id}
          onClick={() => onSelect(c.id)}
          className={`${chipBase} ${activeCategory === c.id ? chipActive : chipInactive}`}
        >
          <span className="h-7 w-7 shrink-0 overflow-hidden rounded-full bg-cracker-navy ring-1 ring-cracker-gold/50">
            <img src={c.image} alt="" className="h-full w-full object-cover" />
          </span>
          {c.name} <span className="text-xs opacity-70">({categoryCounts[c.id] || 0})</span>
        </button>
      ))}
    </div>
  )
}
