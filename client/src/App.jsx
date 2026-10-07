import { useState } from 'react'
import ProviderRegistration from './ProviderRegistration.jsx'
import PropertyDashboard from './PropertyDashboard.jsx'
import PropertyListing from './PropertyListing.jsx'
import PropertyResults from './PropertyResults.jsx'
import ServiceListing from './ServiceListing.jsx'
import ServiceResults from './ServiceResults.jsx'
import WorkGallery from './WorkGallery.jsx'

function App() {
  const [searchType, setSearchType] = useState('property')
  const [searchTerm, setSearchTerm] = useState('')
  const [searchNotice, setSearchNotice] = useState('')
  const isProviderRegistration = window.location.pathname === '/provider-registration'
  const isPropertyDashboard = window.location.pathname === '/property-dashboard'
  const isPropertyListing = window.location.pathname === '/property-listing'
  const isPropertyResults = window.location.pathname === '/properties'
  const isServiceListing = window.location.pathname === '/service-listing'
  const isServiceResults = window.location.pathname === '/services'

  function handleSearch(event) {
    event.preventDefault()

    if (!searchTerm.trim()) {
      setSearchNotice('Enter a location or keyword to search.')
      return
    }

    if (searchType === 'property') {
      window.location.assign(`/properties?q=${encodeURIComponent(searchTerm.trim())}`)
      return
    }

    window.location.assign(`/services?q=${encodeURIComponent(searchTerm.trim())}`)
  }

  return (
    <>
      <nav className="navbar navbar-expand-md navbar-dark bg-dark">
        <div className="container">
          <a className="navbar-brand text-white" href="/">
            SmartServe
          </a>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <a className="nav-link text-white" href="/">Home</a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-white" href="/services">Services</a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-white" href="/properties">Properties</a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-white" href="/provider-registration">
                  Provider Register
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-white" href="/property-dashboard">
                  Property Dashboard
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-white" href="/property-listing">
                  List a Property
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-white" href="/service-listing">
                  List a Service
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {isProviderRegistration ? (
        <ProviderRegistration />
      ) : isPropertyDashboard ? (
        <PropertyDashboard />
      ) : isPropertyListing ? (
        <PropertyListing />
      ) : isPropertyResults ? (
        <PropertyResults />
      ) : isServiceListing ? (
        <ServiceListing />
      ) : isServiceResults ? (
        <ServiceResults />
      ) : (
        <main>
          <section className="container-fluid bg-light py-5">
            <div className="container text-center">
              <h1 className="display-4 fw-bold">Find the Right Service or Property</h1>
              <p className="lead mt-3">
                Find trusted service providers and properties in one place.
              </p>

              <form className="row justify-content-center mt-4 text-start" onSubmit={handleSearch}>
                <div className="col-lg-3 col-md-4 mb-3">
                  <label className="form-label fw-semibold" htmlFor="searchType">I want to</label>
                  <select
                    className="form-select"
                    id="searchType"
                    value={searchType}
                    onChange={(event) => {
                      setSearchType(event.target.value)
                      setSearchNotice('')
                    }}
                  >
                    <option value="property">Find a Property</option>
                    <option value="service">Find a Service Provider</option>
                  </select>
                </div>
                <div className="col-lg-6 col-md-5 mb-3">
                  <label className="form-label fw-semibold" htmlFor="searchTerm">
                    {searchType === 'property' ? 'Location or property type' : 'Location or service'}
                  </label>
                  <input
                    className="form-control"
                    id="searchTerm"
                    type="search"
                    value={searchTerm}
                    onChange={(event) => {
                      setSearchTerm(event.target.value)
                      setSearchNotice('')
                    }}
                    placeholder={
                      searchType === 'property'
                        ? 'e.g. 2-bedroom flat in Pune'
                        : 'e.g. plumber in Pune'
                    }
                    autoComplete="off"
                  />
                </div>
                <div className="col-lg-2 col-md-3 mb-3 d-flex align-items-end">
                  <button className="btn btn-primary w-100" type="submit">Search</button>
                </div>
                {searchNotice && (
                  <div className="col-lg-11" role="status" aria-live="polite">
                    <div className="alert alert-info mb-0">{searchNotice}</div>
                  </div>
                )}
              </form>
            </div>
          </section>
          <WorkGallery />
        </main>
      )}
    </>
  )
}

export default App