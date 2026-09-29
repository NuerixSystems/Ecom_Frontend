import { Link } from 'react-router-dom'

export default function CategoryCard({ category }) {
  return (
    <Link to={`/shop?category=${category.id}`} className="flex flex-col items-center gap-3 group">
      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-cracker-navy ring-2 ring-cracker-gold/60 group-hover:ring-cracker-orange group-hover:scale-105 transition-all shadow-md">
        <img
          src={category.image}
          alt={category.name}
          loading="lazy"
          className="w-full h-full object-cover"
        />
      </div>
      <span className="text-sm font-medium text-gray-700 group-hover:text-cracker-orange transition-colors">{category.name}</span>
    </Link>
  )
}
