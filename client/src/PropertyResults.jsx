import { useMemo, useState } from 'react'

const propertyListings = [
  {
    id: 1,
    title: 'Bright 2-bedroom apartment near metro',
    type: 'Apartment / flat',
    purpose: 'Rent',
    price: 32000,
    priceLabel: '₹32,000 / month',
    area: '1,050 sq. ft.',
    location: 'Andheri West, Mumbai',
    description: 'Semi-furnished apartment close to transit, shops, and everyday amenities.',
    views: 128,
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80',
    alt: 'Bright modern apartment living room',
  },
  {
    id: 2,
    title: 'Family house with garden',
    type: 'Independent house',
    purpose: 'Sale',
    price: 12500000,
    priceLabel: '₹1.25 Cr',
    area: '2,200 sq. ft.',
    location: 'Baner, Pune',
    description: 'Spacious family home with a garden and nearby schools and local shops.',
    views: 96,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80',
    alt: 'Modern independent house with a landscaped garden',
  },
  {
    id: 3,
    title: 'Furnished studio apartment',
    type: 'Apartment / flat',
    purpose: 'Rent',
    price: 18500,
    priceLabel: '₹18,500 / month',
    area: '520 sq. ft.',
    location: 'HSR Layout, Bengaluru',
    description: 'Fully furnished studio in a convenient neighborhood.',
    views: 91,
    image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=80',
    alt: 'Furnished studio apartment interior',
  },
  {
    id: 4,
    title: 'Residential plot in a growing area',
    type: 'Land / plot',
    purpose: 'Sale',
    price: 4800000,
    priceLabel: '₹48 lakh',
    area: '1,200 sq. ft.',
    location: 'Wagholi, Pune',
    description: 'Residential plot with road access and nearby services.',
    views: 74,
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=80',
    alt: 'Open green land under a blue sky',
  },
  {
    id: 5,
    title: 'Contemporary 3-bedroom apartment',
    type: 'Apartment / flat',
    purpose: 'Sale',
    price: 8900000,
    priceLabel: '₹89 lakh',
    area: '1,480 sq. ft.',
    location: 'Kharadi, Pune',
    description: 'Modern apartment with a balcony and shared residential amenities.',
    views: 146,
    image: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=900&q=80',
    alt: 'Contemporary apartment interior with open living space',
  },
  {
    id: 6,
    title: 'Retail space on a main road',
    type: 'Commercial property',
    purpose: 'Rent',
    price: 55000,
    priceLabel: '₹55,000 / month',
    area: '900 sq. ft.',
    location: 'Indiranagar, Bengaluru',
    description: 'Street-facing commercial space suitable for a retail business.',
    views: 62,
    image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80',
    alt: 'Bright commercial space with large windows',
  },
]

const propertyTypes = [
  'Apartment / flat',
  'Independent house',
  'Villa',
  'Land / plot',
  'Commercial property',
  'Office',
]

function PropertyResults() {
  const searchParams = new URLSearchParams(window.location.search)
  const initialQuery = searchParams.get('q') ?? ''
  const [query, setQuery] = useState(initialQuery)
  const [propertyType, setPropertyType] = useState('all')
  const [purpose, setPurpose] = useState('all')
  const [sortOrder, setSortOrder] = useState('popular')

  const filteredListings = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const results = propertyListings.filter((listing) => {
      const matchesQuery = !normalizedQuery
        || `${listing.title} ${listing.type} ${listing.location} ${listing.description}`
          .toLowerCase()
          .includes(normalizedQuery)
      const matchesType = propertyType === 'all' || listing.type === propertyType
      const matchesPurpose = purpose === 'all' || listing.purpose.toLowerCase() === purpose
      return matchesQuery && matchesType && matchesPurpose
    })

    return results.sort((first, second) => {
      if (sortOrder === 'price-low') return first.price - second.price
      if (sortOrder === 'price-high') return second.price - first.price
      return second.views - first.views
    })
  }, [query, propertyType, purpose, sortOrder])

  function handleSearch(event) {
    event.preventDefault()
    const search = query.trim()
    const nextUrl = search ? `/properties?q=${encodeURIComponent(search)}` : '/properties'
    window.history.replaceState(null, '', nextUrl)
  }

  return (
    <main className="container py-5">
      <header className="mb-4">
        <h1 className="h2 fw-bold mb-2">Find a property</h1>
        <p className="text-secondary mb-0">
          Browse properties and narrow results by your location, property type, or listing purpose.
        </p>
      </header>

      <div className="alert alert-info" role="note">
        These are sample listings for demonstration. Real provider listings will appear when the site is connected to a backend.
      </div>

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
                {propertyTypes.map((type) => <option key={type} value={type}>{type}</option>)}
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
          <strong>{filteredListings.length}</strong> sample {filteredListings.length === 1 ? 'property' : 'properties'} found
        </p>
        <div className="d-flex align-items-center gap-2">
          <label className="form-label mb-0" htmlFor="propertySort">Sort by</label>
          <select
            className="form-select form-select-sm"
            id="propertySort"
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value)}
          >
            <option value="popular">Most popular</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
          </select>
        </div>
      </div>

      {filteredListings.length > 0 ? (
        <section className="row g-4" aria-label="Property search results">
          {filteredListings.map((listing) => (
            <div className="col-md-6 col-xl-4" key={listing.id}>
              <article className="card h-100 border-0 shadow-sm overflow-hidden">
                <img
                  className="card-img-top"
                  src={listing.image}
                  alt={listing.alt}
                  loading="lazy"
                  style={{ height: '220px', objectFit: 'cover' }}
                />
                <div className="card-body d-flex flex-column">
                  <div className="d-flex justify-content-between gap-2 mb-2">
                    <span className="badge text-bg-primary">{listing.type}</span>
                    <span className="badge text-bg-light border">{listing.purpose}</span>
                  </div>
                  <h2 className="h5 card-title">{listing.title}</h2>
                  <p className="text-secondary mb-2">{listing.location}</p>
                  <p className="card-text text-secondary flex-grow-1">{listing.description}</p>
                  <div className="d-flex justify-content-between align-items-center border-top pt-3">
                    <div>
                      <div className="fw-bold">{listing.priceLabel}</div>
                      <div className="small text-secondary">{listing.area}</div>
                    </div>
                    <span className="small text-secondary">{listing.views} views</span>
                  </div>
                </div>
              </article>
            </div>
          ))}
        </section>
      ) : (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">
            <h2 className="h5">No matching sample properties</h2>
            <p className="text-secondary mb-0">Try a different keyword or remove one of the filters.</p>
          </div>
        </div>
      )}
    </main>
  )
}

export default PropertyResults
