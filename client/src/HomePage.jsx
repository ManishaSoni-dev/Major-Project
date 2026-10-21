import { useEffect, useState } from 'react'
import HomeComments from './HomeComments.jsx'
import ListingImages from './ListingImages.jsx'
import { apiRequest } from './api.js'
import './HomePage.css'

const categories = [
  { label: 'Buy / Rent Property', icon: 'home', href: '/properties', color: 'blue' },
  { label: 'PG / Hostels', icon: 'building', href: '/properties?q=PG', color: 'green' },
  { label: 'Shops & Offices', icon: 'shop', href: '/properties?q=office', color: 'red' },
  { label: 'Property Dealers', icon: 'person', href: '/properties', color: 'purple' },
  { label: 'Plumber', icon: 'wrench', href: '/services?q=plumbing', color: 'blue' },
  { label: 'Electrician', icon: 'bolt', href: '/services?q=electrical', color: 'yellow' },
  { label: 'Carpenter', icon: 'hammer', href: '/services?q=carpentry', color: 'purple' },
  { label: 'Interior Designer', icon: 'brush', href: '/services?q=interior+designer', color: 'green' },
]

const benefits = [
  { icon: 'home', title: 'Wide Range of Properties', detail: 'Find your ideal home, office, or shop with ease.' },
  { icon: 'people', title: 'Trusted Service Providers', detail: 'Connect with skilled professionals in your area.' },
  { icon: 'bolt', title: 'Easy Search & Filters', detail: 'Save time with smart search and advanced filters.' },
  { icon: 'heart', title: 'Details at a Glance', detail: 'Review photos, prices, locations, and provider details in one place.' },
]

function Icon({ name, size = 24 }) {
  const paths = {
    home: <><path d="m3 10 9-7 9 7" /><path d="M5 9v12h14V9M9 21v-7h6v7" /></>,
    building: <><rect x="4" y="3" width="16" height="18" rx="1" /><path d="M8 7h2m4 0h2M8 11h2m4 0h2M8 15h2m4 0h2M10 21v-3h4v3" /></>,
    shop: <><path d="M3 10h18l-2-7H5l-2 7Z" /><path d="M5 10v11h14V10M9 21v-6h6v6" /><path d="M3 10a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" /></>,
    person: <><circle cx="12" cy="7" r="4" /><path d="M5 21v-2a7 7 0 0 1 14 0v2M9 21v-3m6 3v-3" /></>,
    wrench: <><path d="M14.7 6.3a5 5 0 0 0-6.4 6.4L3 18l3 3 5.3-5.3a5 5 0 0 0 6.4-6.4L14 13l-3-3 3.7-3.7Z" /></>,
    bolt: <path d="m13 2-9 12h7l-1 8 10-13h-7l1-7Z" />,
    hammer: <><path d="m14 5 5 5M3 21l9-9m-3-9 9 9m-6-12 9 9-4 4-9-9 4-4Z" /></>,
    brush: <><path d="m14 6 4-4 4 4-4 4M2 22c5 0 8-2 8-7l8-8-4-4-8 8c-5 0-7 3-7 8v3h3Z" /></>,
    people: <><circle cx="9" cy="8" r="4" /><path d="M2 21v-2a7 7 0 0 1 14 0v2m1-13a4 4 0 0 1 0 8m2 1a6 6 0 0 1 3 5" /></>,
    heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />,
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5" /></>,
  }

  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  )
}

function formatPrice(price) {
  return `₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Number(price))}`
}

function ListingSection({ kind, listings, isLoading, error }) {
  const isProperty = kind === 'property'
  const title = isProperty ? 'Property Listings' : 'Service Listings'
  const subtitle = isProperty
    ? 'Explore residential and commercial properties available in your area.'
    : 'Find local service providers for your home and property.'
  const href = isProperty ? '/properties' : '/services'

  return (
    <section className={`container home-popular-section ${isProperty ? '' : 'home-popular-services'}`} aria-labelledby={`${kind}-listings-title`}>
      <div className="d-flex align-items-end justify-content-between gap-3 mb-3">
        <div>
          <h2 className="h3 fw-bold mb-1" id={`${kind}-listings-title`}>{title}</h2>
          <p className="text-secondary mb-0">{subtitle}</p>
        </div>
        <a className="home-view-all" href={href}>View All <span aria-hidden="true">→</span></a>
      </div>

      {isLoading ? (
        <p className="text-secondary" role="status">Loading {isProperty ? 'properties' : 'services'}...</p>
      ) : error ? (
        <div className="alert alert-light border mb-0" role="status">{error}</div>
      ) : listings.length === 0 ? (
        <div className="alert alert-light border mb-0">
          No {isProperty ? 'properties' : 'services'} have been published yet.
        </div>
      ) : (
        <div className="home-listing-grid">
          {listings.map((listing) => {
            const badge = isProperty
              ? listing.purpose === 'rent' ? 'For Rent' : listing.purpose === 'lease' ? 'For Lease' : 'For Sale'
              : listing.category
            const location = isProperty
              ? [listing.locality, listing.city].filter(Boolean).join(', ')
              : listing.serviceAreas
            const price = isProperty
              ? `${formatPrice(listing.price)}${listing.purpose === 'sale' ? '' : ' / month'}`
              : `${formatPrice(listing.price)} / ${listing.pricingUnit}`
            const listingHref = `${href}?q=${encodeURIComponent(listing.title)}`

            return (
              <article className="home-listing-card" key={`${kind}-${listing.id}`}>
                <div className="home-listing-photo">
                  <ListingImages
                    images={listing.images}
                    title={listing.title}
                    emptyLabel={isProperty ? 'No property photos' : 'No work photos'}
                    height={160}
                    linkHref={listingHref}
                  />
                  <span className={`home-listing-badge ${isProperty ? 'is-property' : 'is-service'}`}>
                    {badge}
                  </span>
                </div>
                <div className="home-listing-content">
                  <h3><a href={listingHref}>{listing.title}</a></h3>
                  <p className="home-listing-location">
                    <span aria-hidden="true">⌖</span> {location || (isProperty ? listing.type : listing.providerName)}
                  </p>
                  <div className="home-listing-footer">
                    <span className="fw-bold">{price}</span>
                    <a className="home-listing-kind" href={listingHref}>
                      {isProperty ? 'View property' : 'View service'} <span aria-hidden="true">→</span>
                    </a>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}

function PopularListings() {
  const [properties, setProperties] = useState([])
  const [services, setServices] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    Promise.all([
      apiRequest('/property-listings'),
      apiRequest('/service-listings'),
    ])
      .then(([properties, services]) => {
        if (!isMounted) return
        setProperties(properties.listings.slice(0, 5))
        setServices(services.listings.slice(0, 5))
      })
      .catch((requestError) => {
        if (isMounted) setError(requestError.message)
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <>
      <ListingSection kind="property" listings={properties} isLoading={isLoading} error={error} />
      <ListingSection kind="service" listings={services} isLoading={isLoading} error={error} />
    </>
  )
}

function HomePage() {
  const [searchType, setSearchType] = useState('property')
  const [searchTerm, setSearchTerm] = useState('')
  const [searchNotice, setSearchNotice] = useState('')

  function handleSearch(event) {
    event.preventDefault()
    if (!searchTerm.trim()) {
      setSearchNotice('Enter a location or keyword to search.')
      return
    }
    const route = searchType === 'property' ? '/properties' : '/services'
    window.location.assign(`${route}?q=${encodeURIComponent(searchTerm.trim())}`)
  }

  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="container home-hero-inner">
          <div className="home-hero-copy">
            <p className="home-eyebrow">Find your perfect space &amp; trusted services</p>
            <h1>Smart Property &amp; Local Services Marketplace</h1>
            <p className="home-hero-description">
              Search for properties, find trusted service providers, and make your life easier — all in one place.
            </p>
            <form className="home-search" onSubmit={handleSearch}>
              <label className="visually-hidden" htmlFor="homeSearchType">Search category</label>
              <select
                id="homeSearchType"
                value={searchType}
                onChange={(event) => {
                  setSearchType(event.target.value)
                  setSearchNotice('')
                }}
              >
                <option value="property">Properties</option>
                <option value="service">Services</option>
              </select>
              <span className="home-search-divider" aria-hidden="true" />
              <label className="visually-hidden" htmlFor="homeSearchTerm">What are you looking for?</label>
              <input
                id="homeSearchTerm"
                type="search"
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value)
                  setSearchNotice('')
                }}
                placeholder="What are you looking for?"
              />
              <button type="submit"><Icon name="search" size={17} /> Search</button>
            </form>
            {searchNotice && <p className="home-search-notice" role="status">{searchNotice}</p>}
          </div>
          <div className="home-hero-message" aria-hidden="true">
            Better Homes<br />Better Services<br />A Smarter You
            <span />
          </div>
        </div>
      </section>

      <section className="container home-categories" aria-label="Popular categories">
        <div className="home-category-intro">
          <h2>Find What You Need</h2>
          <p>Quick access to the most popular categories</p>
        </div>
        {categories.map((category) => (
          <a className="home-category" href={category.href} key={category.label}>
            <span className={`home-category-icon is-${category.color}`}><Icon name={category.icon} /></span>
            <span>{category.label}</span>
          </a>
        ))}
        <a className="home-category home-category-all" href="/properties" aria-label="View all listings">
          <span className="home-category-icon is-teal"><span aria-hidden="true">→</span></span>
          <span>View All</span>
        </a>
      </section>

      <section className="home-benefits" aria-label="Why choose SmartServe">
        <div className="container home-benefit-grid">
          {benefits.map((benefit) => (
            <article className="home-benefit" key={benefit.title}>
              <span className="home-benefit-icon"><Icon name={benefit.icon} size={30} /></span>
              <h2>{benefit.title}</h2>
              <p>{benefit.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <PopularListings />

      <section className="container home-community" aria-label="Community feedback and location">
        <div className="home-community-panel">
          <HomeComments compact />
        </div>
        <div className="home-community-panel">
          <h2 className="home-section-heading"><Icon name="home" size={21} /> Find Us on Map</h2>
          <div className="home-map-frame">
            <iframe
              title="Map centered on Chandigarh"
              src="https://www.openstreetmap.org/export/embed.html?bbox=76.7214%2C30.6980%2C76.8374%2C30.7686&amp;layer=mapnik&amp;marker=30.7333%2C76.7794"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="home-map-caption">
            <span><Icon name="building" size={19} /> SmartServe Marketplace<br /><small>Chandigarh, India</small></span>
            <a
              href="https://www.openstreetmap.org/?mlat=30.7333&amp;mlon=76.7794#map=13/30.7333/76.7794"
              target="_blank"
              rel="noreferrer"
            >
              Chandigarh, India <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </section>

      <section className="container home-bottom-cta" aria-label="Get started with SmartServe">
        <div className="home-bottom-icon"><Icon name="people" size={36} /></div>
        <div>
          <h2>Ready to find your perfect space or trusted service?</h2>
          <p>Search available properties and local services in your area.</p>
        </div>
        <a className="btn" href="#homeSearchTerm">Get Started <span aria-hidden="true">→</span></a>
        <span className="home-bottom-decoration" aria-hidden="true"><Icon name="home" size={76} /></span>
      </section>

    </main>
  )
}

export default HomePage
