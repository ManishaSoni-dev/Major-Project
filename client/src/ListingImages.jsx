import { useEffect, useRef, useState } from 'react'
import { API_ORIGIN } from './api.js'
import './ListingImages.css'

function ListingImages({ images, title, emptyLabel, height = 220, autoPlay = false, linkHref }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const touchStartX = useRef(null)
  const imageCount = images?.length ?? 0

  useEffect(() => {
    if (!autoPlay || imageCount < 2) return undefined

    const intervalId = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % imageCount)
    }, 3000)

    return () => window.clearInterval(intervalId)
  }, [autoPlay, imageCount])

  if (!images?.length) {
    return (
      <div
        className="bg-light d-flex align-items-center justify-content-center text-secondary"
        style={{ minHeight: `${Math.min(height, 150)}px` }}
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
      className="listing-images position-relative bg-light overflow-hidden"
      aria-label={`${images.length} photos for ${title}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {linkHref ? (
        <a className="d-block" href={linkHref} aria-label={`View ${title}`}>
          <img
            className="w-100 object-fit-cover"
            src={`${API_ORIGIN}${images[imageIndex]}`}
            alt={`${title}, photo ${imageIndex + 1} of ${images.length}`}
            loading="lazy"
            style={{ height: `${height}px` }}
          />
        </a>
      ) : (
        <img
          className="w-100 object-fit-cover"
          src={`${API_ORIGIN}${images[imageIndex]}`}
          alt={`${title}, photo ${imageIndex + 1} of ${images.length}`}
          loading="lazy"
          style={{ height: `${height}px` }}
        />
      )}
      {images.length > 1 && !autoPlay && (
        <>
          <button
            className="listing-image-control btn btn-dark text-white rounded-circle position-absolute top-50 start-0 translate-middle-y ms-2 shadow d-flex align-items-center justify-content-center"
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
            className="listing-image-control btn btn-dark text-white rounded-circle position-absolute top-50 end-0 translate-middle-y me-2 shadow d-flex align-items-center justify-content-center"
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
