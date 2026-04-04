export function StarRating({ value, size = 'sm' }) {
  const rounded = Math.round(value)
  const sizeClass = size === 'lg' ? 'text-xl' : 'text-sm'

  return (
    <span
      className={`inline-flex items-center gap-0.5 text-amber-500 ${sizeClass}`}
      aria-label={`${value} out of 5 stars`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < rounded ? '' : 'text-stone-300'}>
          ★
        </span>
      ))}
    </span>
  )
}
