import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { getMenuForRestaurant } from '../data/restaurant-menus.js'

export function MenuSection({ restaurantId }) {
  const menu = getMenuForRestaurant(restaurantId)
  const [modalIndex, setModalIndex] = useState(null)

  const pages = menu?.pages ?? []

  const openModal = (index) => setModalIndex(index)
  const closeModal = useCallback(() => setModalIndex(null), [])

  const nextImage = useCallback((e) => {
    if (e) e.stopPropagation()
    setModalIndex((prev) => (prev !== null ? (prev + 1) % pages.length : null))
  }, [pages.length])

  const prevImage = useCallback((e) => {
    if (e) e.stopPropagation()
    setModalIndex((prev) => (prev !== null ? (prev - 1 + pages.length) % pages.length : null))
  }, [pages.length])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (modalIndex === null) return
      if (e.key === 'Escape') closeModal()
      if (e.key === 'ArrowRight') nextImage()
      if (e.key === 'ArrowLeft') prevImage()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [modalIndex, closeModal, nextImage, prevImage])

  useEffect(() => {
    if (modalIndex !== null) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [modalIndex])

  if (!pages.length) {
    return (
      <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-xl font-semibold text-stone-900 mb-4">Menu</h2>
        <p className="text-sm text-stone-500 italic">Menu not available</p>
      </section>
    )
  }

  return (
    <>
      <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-xl font-semibold text-stone-900 mb-6">Menu</h2>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {pages.map((page, idx) => (
            <div
              key={idx}
              className="group cursor-pointer"
              onClick={() => openModal(idx)}
            >
              <div className="overflow-hidden rounded-xl border border-stone-200 shadow-sm transition-all group-hover:-translate-y-1 group-hover:shadow-md group-hover:border-teal-300">
                <img
                  src={page.src}
                  alt={page.label}
                  className="aspect-[3/4] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <p className="mt-2 text-center text-sm font-medium text-stone-700">{page.label}</p>
            </div>
          ))}
        </div>
      </section>

      {modalIndex !== null && createPortal(
        <>
          {/* Dim overlay — fixed to viewport */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-[2px] animate-[fadeIn_200ms_ease]"
            style={{ zIndex: 9998 }}
            onClick={closeModal}
          />

          {/* Centered popup — fixed to viewport, NOT inside any scrollable parent */}
          <div
            className="fixed w-[90%] sm:w-[70%] md:w-[60%] rounded-2xl bg-white shadow-2xl animate-[scaleIn_250ms_ease]"
            style={{
              zIndex: 9999,
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              maxHeight: '80vh',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close ❌ */}
            <button
              type="button"
              className="absolute -right-3 -top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white text-stone-500 shadow-md border border-stone-200 transition hover:bg-stone-100 hover:text-stone-800"
              onClick={closeModal}
              title="Close"
            >
              ❌
            </button>

            {/* Image */}
            <div className="relative flex items-center justify-center overflow-hidden rounded-2xl" style={{ maxHeight: '80vh' }}>
              {/* Previous */}
              <button
                type="button"
                className="absolute left-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-stone-700 shadow-md transition hover:bg-white hover:scale-105"
                onClick={prevImage}
                title="Previous"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </button>

              <img
                src={pages[modalIndex].src}
                alt={pages[modalIndex].label}
                className="w-full rounded-2xl object-contain"
                style={{ maxHeight: '78vh' }}
              />

              {/* Next */}
              <button
                type="button"
                className="absolute right-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-stone-700 shadow-md transition hover:bg-white hover:scale-105"
                onClick={nextImage}
                title="Next"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </button>
            </div>

            {/* Page indicator */}
            <div className="py-2.5 text-center text-xs font-medium text-stone-500">
              {pages[modalIndex].label} — {modalIndex + 1} / {pages.length}
            </div>
          </div>
        </>,
        document.body,
      )}
    </>
  )
}

