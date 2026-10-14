import { useEffect, useMemo, useState } from 'react'
import { API_ORIGIN, apiRequest } from './api.js'

const propertyTypes = [
  ['apartment', 'Apartment / flat'],
  ['independent-house', 'Independent house'],
  ['villa', 'Villa'],
  ['land', 'Land / plot'],
  ['commercial', 'Commercial property'],
  ['office', 'Office'],
  ['other', 'Other'],
]

function formatPrice(price, purpose) {
  const amount = `₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Number(price))}`
  return purpose === 'rent' || purpose === 'lease' ? `${amount} / month` : amount
}

function PropertyResults() {
  const [query, setQuery] = useState(new URLSearchParams(window.location.search).get('q') ?? '')
  const [submittedQuery, setSubmittedQuery] = useState(query)
  const [propertyType, setPropertyType] = useState('all')
  const [purpose, setPurpose] = useState('all')
  const [sortOrder, setSortOrder] = useState('newest')
  const [listings, setListings] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true
    const params = new URLSearchParams()
    if (submittedQuery.trim()) params.set('q', submittedQuery.trim())
    if (propertyType !== 'all') params.set('type', propertyType)
    if (purpose !== 'all') params.set('purpose', purpose)

    async function loadListings() {
      setIsLoading(true)
      setError('')
      try {
        const result = await apiRequest(`/property-listings?${params.toString()}`)
        if (isMounted) setListings(result.listings)
      } catch (requestError) {
        if (isMounted) setError(requestError.message)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadListings()

    return () => {
      isMounted = false
    }
  }, [submittedQuery, propertyType, purpose])

  const sortedListings = useMemo(() => [...listings].sort((first, second) => (
    sortOrder === 'price-low'
      ? Number(first.price) - Number(second.price)
      : sortOrder === 'price-high'
        ? Number(second.price) - Number(first.price)
        : new Date(second.createdAt) - new Date(first.createdAt)
  )), [listings, sortOrder])

  function handleSearch(event) {
    event.preventDefault()
    setSubmittedQuery(query)
    const trimmedQuery = query.trim()
    const nextUrl = trimmedQuery ? `/properties?q=${encodeURIComponent(trimmedQuery)}` : '/properties'
    window.history.replaceState(null, '', nextUrl)
  }

  return (
    <main className="container py-5">
      <header className="mb-4">
        <h1 className="h2 fw-bold mb-2">Find a property</h1>
        <p className="text-secondary mb-0">
          Browse listed properties and filter by location, property type, or listing purpose.
        </p>
      </header>

      <form className="card border-0 shadow-sm mb-4" onSubmit={handleSearch}>
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-lg-6">
              <label className="form-label fw-semibold" htmlFor="propertySearch">Location or keyword</label>
              <input
                className="form-control"
                id="propertySearch"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="e.g. Pune, apartment, garden"
              />
            </div>
            <div className="col-sm-6 col-lg-2">
              <label className="form-label fw-semibold" htmlFor="propertyTypeFilter">Property type</label>
              <select
                className="form-select"
                id="propertyTypeFilter"
                value={propertyType}
                onChange={(event) => setPropertyType(event.target.value)}
              >
                <option value="all">All types</option>
                {propertyTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </div>
            <div className="col-sm-6 col-lg-2">
              <label className="form-label fw-semibold" htmlFor="propertyPurposeFilter">Listing purpose</label>
              <select
                className="form-select"
                id="propertyPurposeFilter"
                value={purpose}
                onChange={(event) => setPurpose(event.target.value)}
              >
                <option value="all">Sale or rent</option>
                <option value="sale">For sale</option>
                <option value="rent">For rent</option>
                <option value="lease">For lease</option>
              </select>
            </div>
            <div className="col-lg-2">
              <button className="btn btn-primary w-100" type="submit">Search</button>
            </div>
          </div>
        </div>
      </form>

      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-3">
        <p className="mb-0" aria-live="polite">
          <strong>{isLoading ? '…' : listings.length}</strong> {listings.length === 1 ? 'property' : 'properties'} found
        </p>
        <div className="d-flex align-items-center gap-2">
          <label className="form-label mb-0" htmlFor="propertySort">Sort by</label>
          <select
            className="form-select form-select-sm"
            id="propertySort"
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value)}
          >
            <option value="newest">Newest</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
          </select>
        </div>
      </div>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {isLoading ? (
        <div className="text-center py-5" role="status">Loading properties...</div>
      ) : sortedListings.length > 0 ? (
        <section className="row g-4" aria-label="Property search results">
          {sortedListings.map((listing) => (
            <div className="col-md-6 col-xl-4" key={listing.id}>
              <article className="card h-100 border-0 shadow-sm overflow-hidden">
                {listing.imageUrl ? (
                  <img
                    className="card-img-top"
                    src={`${API_ORIGIN}${listing.imageUrl}`}
                    alt={`Photos for ${listing.title}`}
                    loading="lazy"
                    style={{ height: '220px', objectFit: 'cover' }}
                  />
                ) : (
                  <div className="bg-light d-flex align-items-center justify-content-center text-secondary" style={{ height: '220px' }}>
                    No property photos
                  </div>
                )}
                <div className="card-body d-flex flex-column">
                  <div className="d-flex justify-content-between gap-2 mb-2">
                    <span className="badge text-bg-primary">{listing.type}</span>
                    <span className="badge text-bg-light border text-capitalize">{listing.purpose}</span>
                  </div>
                  <h2 className="h5 card-title">{listing.title}</h2>
                  <p className="text-secondary mb-2">{listing.locality}, {listing.city}</p>
                  <p className="card-text text-secondary flex-grow-1">{listing.description}</p>
                  <div className="d-flex justify-content-between align-items-center border-top pt-3">
                    <div>
                      <div className="fw-bold">{formatPrice(listing.price, listing.purpose)}</div>
                      <div className="small text-secondary">{listing.areaSqft} sq. ft.</div>
                    </div>
                    <span className="small text-secondary">{listing.providerName}</span>
                  </div>
                </div>
              </article>
            </div>
          ))}
        </section>
      ) : !error ? (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">
            <h2 className="h5">No matching properties</h2>
            <p className="text-secondary mb-0">Try a different keyword or remove one of the filters.</p>
          </div>
        </div>
      ) : null}
    </main>
  )
}

export default PropertyResults
