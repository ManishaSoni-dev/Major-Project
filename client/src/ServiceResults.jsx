import { useMemo, useState } from 'react'

const serviceProviders = [
  {
    id: 1,
    name: 'ABC Plumbing Services',
    category: 'Plumbing',
    location: 'Andheri West, Mumbai',
    serviceAreas: 'Andheri, Juhu, Goregaon',
    price: 500,
    priceLabel: 'From ₹500 / visit',
    rating: 4.8,
    reviews: 64,
    description: 'Repairs, installations, and emergency plumbing for homes and small businesses.',
    keywords: 'plumber plumbing',
    image: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=900&q=80',
    alt: 'Plumbing tools and fixtures',
  },
  {
    id: 2,
    name: 'Bright Spark Electrical',
    category: 'Electrical',
    location: 'Baner, Pune',
    serviceAreas: 'Baner, Aundh, Wakad',
    price: 400,
    priceLabel: 'From ₹400 / visit',
    rating: 4.7,
    reviews: 48,
    description: 'Home electrical repairs, lighting installation, and wiring maintenance.',
    keywords: 'electrician electrical',
    image: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=900&q=80',
    alt: 'Electrician completing an installation',
  },
  {
    id: 3,
    name: 'Careful Home Cleaning',
    category: 'Cleaning',
    location: 'HSR Layout, Bengaluru',
    serviceAreas: 'HSR Layout, Koramangala, BTM Layout',
    price: 800,
    priceLabel: 'From ₹800 / visit',
    rating: 4.9,
    reviews: 82,
    description: 'Deep cleaning and regular home cleaning with flexible appointment options.',
    keywords: 'cleaner cleaning housekeeper',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80',
    alt: 'Home cleaning supplies ready for a cleaning visit',
  },
  {
    id: 4,
    name: 'FixRight Appliance Repair',
    category: 'Appliance repair',
    location: 'Kharadi, Pune',
    serviceAreas: 'Kharadi, Viman Nagar, Hadapsar',
    price: 350,
    priceLabel: 'From ₹350 / visit',
    rating: 4.6,
    reviews: 39,
    description: 'Troubleshooting and repair for common household appliances.',
    keywords: 'repair technician appliance',
    image: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=900&q=80',
    alt: 'Technician working on equipment',
  },
  {
    id: 5,
    name: 'Woodcraft Carpentry',
    category: 'Carpentry',
    location: 'Indiranagar, Bengaluru',
    serviceAreas: 'Indiranagar, Domlur, Ulsoor',
    price: 600,
    priceLabel: 'From ₹600 / visit',
    rating: 4.8,
    reviews: 51,
    description: 'Furniture repairs, custom shelves, and made-to-measure woodwork.',
    keywords: 'carpenter carpentry woodwork',
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=900&q=80',
    alt: 'Carpentry tools arranged on a workbench',
  },
  {
    id: 6,
    name: 'Fresh Coat Painting',
    category: 'Painting',
    location: 'Wagholi, Pune',
    serviceAreas: 'Wagholi, Kharadi, Viman Nagar',
    price: 1200,
    priceLabel: 'From ₹1,200 / day',
    rating: 4.5,
    reviews: 27,
    description: 'Interior wall painting, touch-ups, and color refresh projects.',
    keywords: 'painter painting',
    image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=900&q=80',
    alt: 'Freshly painted interior wall',
  },
]

const categories = [
  'Plumbing',
  'Electrical',
  'Home repair',
  'Appliance repair',
  'Cleaning',
  'Carpentry',
  'Painting',
  'HVAC / air conditioning',
  'Landscaping / gardening',
]

function ServiceResults() {
  const searchParams = new URLSearchParams(window.location.search)
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [category, setCategory] = useState('all')
  const [sortOrder, setSortOrder] = useState('rating')

  const filteredProviders = useMemo(() => {
    const searchTerms = query.trim().toLowerCase().split(/\s+/).filter(
      (term) => !['in', 'near', 'at', 'the', 'a', 'an', 'for'].includes(term),
    )
    const results = serviceProviders.filter((provider) => {
      const searchableText = [
        provider.name,
        provider.category,
        provider.location,
        provider.serviceAreas,
        provider.description,
        provider.keywords,
      ].join(' ').toLowerCase()
      const matchesQuery = searchTerms.every((term) => searchableText.includes(term))
      const matchesCategory = category === 'all' || provider.category === category
      return matchesQuery && matchesCategory
    })

    return results.sort((first, second) => (
      sortOrder === 'price-low'
        ? first.price - second.price
        : sortOrder === 'price-high'
          ? second.price - first.price
          : second.rating - first.rating
    ))
  }, [query, category, sortOrder])

  function handleSearch(event) {
    event.preventDefault()
    const search = query.trim()
    const nextUrl = search ? `/services?q=${encodeURIComponent(search)}` : '/services'
    window.history.replaceState(null, '', nextUrl)
  }

  return (
    <main className="container py-5">
      <header className="mb-4">
        <h1 className="h2 fw-bold mb-2">Find a service provider</h1>
        <p className="text-secondary mb-0">
          Search by service or location, choose a category, and compare providers.
        </p>
      </header>

      <div className="alert alert-info" role="note">
        These are sample provider profiles for demonstration. Real provider listings will appear when the site is connected to a backend.
      </div>

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
                {categories.map((item) => <option key={item} value={item}>{item}</option>)}
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
          <strong>{filteredProviders.length}</strong> sample {filteredProviders.length === 1 ? 'provider' : 'providers'} found
        </p>
        <div className="d-flex align-items-center gap-2">
          <label className="form-label mb-0" htmlFor="serviceSort">Sort by</label>
          <select
            className="form-select form-select-sm"
            id="serviceSort"
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value)}
          >
            <option value="rating">Highest rated</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
          </select>
        </div>
      </div>

      {filteredProviders.length > 0 ? (
        <section className="row g-4" aria-label="Service provider search results">
          {filteredProviders.map((provider) => (
            <div className="col-md-6 col-xl-4" key={provider.id}>
              <article className="card h-100 border-0 shadow-sm overflow-hidden">
                <img
                  className="card-img-top"
                  src={provider.image}
                  alt={provider.alt}
                  loading="lazy"
                  style={{ height: '220px', objectFit: 'cover' }}
                />
                <div className="card-body d-flex flex-column">
                  <div className="d-flex justify-content-between gap-2 mb-2">
                    <span className="badge text-bg-primary">{provider.category}</span>
                    <span className="small" aria-label={`${provider.rating} out of 5 stars`}>
                      ★ {provider.rating} <span className="text-secondary">({provider.reviews})</span>
                    </span>
                  </div>
                  <h2 className="h5 card-title">{provider.name}</h2>
                  <p className="text-secondary mb-2">{provider.location}</p>
                  <p className="card-text text-secondary flex-grow-1">{provider.description}</p>
                  <p className="small text-secondary mb-3">
                    <strong>Service areas:</strong> {provider.serviceAreas}
                  </p>
                  <div className="d-flex justify-content-between align-items-center border-top pt-3">
                    <span className="fw-bold">{provider.priceLabel}</span>
                    <button className="btn btn-sm btn-outline-secondary" type="button" disabled>
                      Contact unavailable
                    </button>
                  </div>
                </div>
              </article>
            </div>
          ))}
        </section>
      ) : (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">
            <h2 className="h5">No matching sample providers</h2>
            <p className="text-secondary mb-0">Try another keyword or choose a different service category.</p>
          </div>
        </div>
      )}
    </main>
  )
}

export default ServiceResults
