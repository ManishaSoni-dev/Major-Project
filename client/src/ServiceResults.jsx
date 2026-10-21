import { useEffect, useMemo, useState } from 'react'
import { apiRequest } from './api.js'
import ListingImages from './ListingImages.jsx'

const categories = [
  ['plumbing', 'Plumbing'],
  ['electrical', 'Electrical'],
  ['home-repair', 'Home repair'],
  ['appliance-repair', 'Appliance repair'],
  ['cleaning', 'Cleaning'],
  ['carpentry', 'Carpentry'],
  ['painting', 'Painting'],
  ['hvac', 'HVAC / air conditioning'],
  ['landscaping', 'Landscaping / gardening'],
  ['other', 'Other'],
]

function ServiceResults() {
  const [query, setQuery] = useState(new URLSearchParams(window.location.search).get('q') ?? '')
  const [submittedQuery, setSubmittedQuery] = useState(query)
  const [category, setCategory] = useState('all')
  const [sortOrder, setSortOrder] = useState('newest')
  const [providers, setProviders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true
    const params = new URLSearchParams()
    if (submittedQuery.trim()) params.set('q', submittedQuery.trim())
    if (category !== 'all') params.set('category', category)

    async function loadListings() {
      setIsLoading(true)
      setError('')
      try {
        const result = await apiRequest(`/service-listings?${params.toString()}`)
        if (isMounted) setProviders(result.listings)
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
  }, [submittedQuery, category])

  const sortedProviders = useMemo(() => [...providers].sort((first, second) => (
    sortOrder === 'price-low'
      ? Number(first.price) - Number(second.price)
      : sortOrder === 'price-high'
        ? Number(second.price) - Number(first.price)
        : new Date(second.createdAt) - new Date(first.createdAt)
  )), [providers, sortOrder])

  function handleSearch(event) {
    event.preventDefault()
    setSubmittedQuery(query)
    const trimmedQuery = query.trim()
    const nextUrl = trimmedQuery ? `/services?q=${encodeURIComponent(trimmedQuery)}` : '/services'
    window.history.replaceState(null, '', nextUrl)
  }

  function priceLabel(provider) {
    const amount = `₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Number(provider.price))}`
    return `${amount} / ${provider.pricingUnit}`
  }

  return (
    <main className="container py-5">
      <header className="mb-4">
        <h1 className="h2 fw-bold mb-2">Find a service provider</h1>
        <p className="text-secondary mb-0">
          Search listed services by keyword or location, filter by category, and contact providers directly.
        </p>
      </header>

      <form className="card border-0 shadow-sm mb-4" onSubmit={handleSearch}>
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-lg-7">
              <label className="form-label fw-semibold" htmlFor="serviceSearch">Service or location</label>
              <input
                className="form-control"
                id="serviceSearch"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="e.g. plumber in Pune"
              />
            </div>
            <div className="col-sm-8 col-lg-3">
              <label className="form-label fw-semibold" htmlFor="serviceCategoryFilter">Service category</label>
              <select
                className="form-select"
                id="serviceCategoryFilter"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                <option value="all">All services</option>
                {categories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </div>
            <div className="col-sm-4 col-lg-2">
              <button className="btn btn-primary w-100" type="submit">Search</button>
            </div>
          </div>
        </div>
      </form>

      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-3">
        <p className="mb-0" aria-live="polite">
          <strong>{isLoading ? '…' : providers.length}</strong> {providers.length === 1 ? 'service' : 'services'} found
        </p>
        <div className="d-flex align-items-center gap-2">
          <label className="form-label mb-0" htmlFor="serviceSort">Sort by</label>
          <select
            className="form-select form-select-sm"
            id="serviceSort"
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
        <div className="text-center py-5" role="status">Loading services...</div>
      ) : sortedProviders.length > 0 ? (
        <section className="row g-4" aria-label="Service provider search results">
          {sortedProviders.map((provider) => (
            <div className="col-md-6 col-xl-4" key={provider.id}>
              <article className="card h-100 border-0 shadow-sm overflow-hidden">
                <ListingImages images={provider.images} title={provider.title} emptyLabel="No work photos" />
                <div className="card-body d-flex flex-column">
                  <span className="badge text-bg-primary align-self-start mb-2">{provider.category}</span>
                  <h2 className="h5 card-title">{provider.title}</h2>
                  <p className="text-secondary mb-2">{provider.providerName}</p>
                  <p className="card-text text-secondary flex-grow-1">{provider.description}</p>
                  <p className="small text-secondary mb-3">
                    <strong>Service areas:</strong> {provider.serviceAreas}
                  </p>
                  <div className="border-top pt-3 mb-3">
                    <div className="fw-semibold mb-1">Contact provider</div>
                    {provider.contactPhone && (
                      <div className="small">
                        <span className="text-secondary me-1">Phone:</span>
                        <a href={`tel:${provider.contactPhone}`}>{provider.contactPhone}</a>
                      </div>
                    )}
                    {provider.contactEmail && (
                      <div className="small text-break">
                        <span className="text-secondary me-1">Email:</span>
                        <a href={`mailto:${provider.contactEmail}`}>{provider.contactEmail}</a>
                      </div>
                    )}
                  </div>
                  <div className="border-top pt-3">
                    <span className="fw-bold">{priceLabel(provider)}</span>
                  </div>
                </div>
              </article>
            </div>
          ))}
        </section>
      ) : !error ? (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">
            <h2 className="h5">No matching services</h2>
            <p className="text-secondary mb-0">Try another keyword or choose a different service category.</p>
          </div>
        </div>
      ) : null}
    </main>
  )
}

export default ServiceResults
