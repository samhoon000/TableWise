import { Link } from 'react-router-dom'
import { StarRating } from './star-rating.jsx'

export function PopularRestaurantCard({ restaurant }) {
  const { id, name, cuisine, rating, location, image } = restaurant

  return (
    <Link
      to={`/restaurants/${id}`}
      className="group relative flex w-[260px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:w-[280px]"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-semibold text-stone-900">{name}</h3>
        <p className="mt-0.5 text-sm text-teal-800/90">{cuisine}</p>
        <div className="mt-2 flex items-center gap-2 text-sm text-stone-600">
          <StarRating value={rating} />
          <span className="font-medium text-stone-800">{rating.toFixed(1)}</span>
        </div>
        <p className="mt-2 text-sm text-stone-500">{location}</p>
      </div>
    </Link>
  )
}
