import { useState } from 'react'

export function MenuSection({ menuCategories }) {
  const [active, setActive] = useState(menuCategories[0]?.category ?? '')

  if (!menuCategories?.length) return null

  const current = menuCategories.find((c) => c.category === active) ?? menuCategories[0]

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-lg font-semibold text-stone-900">Menu</h2>
      <p className="mt-1 text-sm text-stone-600">Browse courses by category—typical of dining apps.</p>

      <div className="mt-6 -mx-1 flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {menuCategories.map((cat) => (
          <button
            key={cat.category}
            type="button"
            onClick={() => setActive(cat.category)}
            className={[
              'shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition',
              active === cat.category
                ? 'border-teal-700 bg-teal-700 text-white shadow-sm'
                : 'border-stone-200 bg-white text-stone-700 hover:border-teal-300 hover:bg-teal-50',
            ].join(' ')}
          >
            {cat.category}
          </button>
        ))}
      </div>

      <div className="mt-6 max-h-[min(520px,55vh)] overflow-y-auto pr-1">
        <div className="grid gap-4 sm:grid-cols-2">
          {current.items.map((item) => (
            <article
              key={item.name}
              className="flex gap-4 rounded-xl border border-stone-100 bg-stone-50/50 p-4 transition hover:border-stone-200 hover:bg-white"
            >
              {item.image ? (
                <img
                  src={item.image}
                  alt=""
                  className="h-24 w-24 shrink-0 rounded-lg object-cover sm:h-28 sm:w-28"
                />
              ) : (
                <div
                  className="flex h-24 w-24 shrink-0 items-center justify-center rounded-lg bg-stone-200/60 text-xs text-stone-500 sm:h-28 sm:w-28"
                  aria-hidden
                >
                  No photo
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-stone-900">{item.name}</h3>
                  <span
                    className={[
                      'rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                      item.diet === 'veg'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800',
                    ].join(' ')}
                    title={item.diet === 'veg' ? 'Vegetarian' : 'Non-vegetarian'}
                  >
                    {item.diet === 'veg' ? 'Veg' : 'Non-veg'}
                  </span>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-stone-600">{item.description}</p>
                <p className="mt-2 text-sm font-semibold text-teal-800">{item.price}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
