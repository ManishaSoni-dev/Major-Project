import { useRef, useState } from 'react'
import { API_ORIGIN } from './api.js'

function ListingImages({ images, title, emptyLabel }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const touchStartX = useRef(null)

  if (!images?.length) {
    return (
      <div
        className="bg-light d-flex align-items-center justify-content-center text-secondary"
        style={{ minHeight: '150px' }}
      >
        {emptyLabel}
      </div>
    )
  }

  const imageIndex = activeIndex % images.length

  function showPreviousImage() {
    setActiveIndex((index) => (index - 1 + images.length) % images.length)
  }

  function showNextImage() {
    setActiveIndex((index) => (index + 1) % images.length)
  }

  function handleTouchStart(event) {
    touchStartX.current = event.changedTouches[0].clientX
  }

  function handleTouchEnd(event) {
    if (touchStartX.current === null) return

    const swipeDistance = event.changedTouches[0].clientX - touchStartX.current
    touchStartX.current = null
    if (Math.abs(swipeDistance) < 40) return
    if (swipeDistance > 0) showPreviousImage()
    else showNextImage()
  }

  return (
    <div
      className="position-relative bg-light overflow-hidden"
      aria-label={`${images.length} photos for ${title}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <img
        className="w-100 object-fit-cover"
        src={`${API_ORIGIN}${images[imageIndex]}`}
        alt={`${title}, photo ${imageIndex + 1} of ${images.length}`}
        loading="lazy"
        style={{ height: '220px' }}
      />
      {images.length > 1 && (
        <>
          <button
            className="btn btn-light rounded-circle position-absolute top-50 start-0 translate-middle-y ms-2 shadow-sm d-flex align-items-center justify-content-center"
            type="button"
            aria-label="Show previous photo"
            onClick={showPreviousImage}
            style={{ width: '38px', height: '38px', padding: 0 }}
          >
            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <button
            className="btn btn-light rounded-circle position-absolute top-50 end-0 translate-middle-y me-2 shadow-sm d-flex align-items-center justify-content-center"
            type="button"
            aria-label="Show next photo"
            onClick={showNextImage}
            style={{ width: '38px', height: '38px', padding: 0 }}
          >
            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
          <span className="badge rounded-pill text-bg-dark position-absolute bottom-0 end-0 m-2">
            {imageIndex + 1} / {images.length}
          </span>
        </>
      )}
    </div>
  )
}

export default ListingImages
