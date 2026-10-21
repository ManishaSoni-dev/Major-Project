import { useEffect, useState } from 'react'
import HomePage from './HomePage.jsx'
import { apiRequest } from './api.js'
import ProviderLogin from './ProviderLogin.jsx'
import ProviderRegistration from './ProviderRegistration.jsx'
import PropertyDashboard from './PropertyDashboard.jsx'
import PropertyListing from './PropertyListing.jsx'
import PropertyResults from './PropertyResults.jsx'
import ServiceDashboard from './ServiceDashboard.jsx'
import ServiceListing from './ServiceListing.jsx'
import ServiceResults from './ServiceResults.jsx'

function App() {
  const [provider, setProvider] = useState(null)
  const [isProviderChecked, setIsProviderChecked] = useState(false)
  const [providerStatusError, setProviderStatusError] = useState('')
  const [signOutError, setSignOutError] = useState('')
  const [isSigningOut, setIsSigningOut] = useState(false)

  useEffect(() => {
    let isMounted = true

    apiRequest('/auth/me')
      .then((result) => {
        if (isMounted) setProvider(result.provider)
      })
      .catch((error) => {
        if (!isMounted) return
        if (
          error.message !== 'Sign in as a provider to continue.'
          && error.message !== 'Your provider session expired. Please sign in again.'
        ) {
          setProviderStatusError(error.message)
        }
      })
      .finally(() => {
        if (isMounted) setIsProviderChecked(true)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const isHome = window.location.pathname === '/'
  const isProviderRegistration = window.location.pathname === '/provider-registration'
  const isProviderLogin = window.location.pathname === '/provider-login'
  const isPropertyDashboard = window.location.pathname === '/property-dashboard'
  const isServiceDashboard = window.location.pathname === '/service-dashboard'
  const isPropertyListing = window.location.pathname === '/property-listing'
  const isPropertyResults = window.location.pathname === '/properties'
  const isServiceListing = window.location.pathname === '/service-listing'
  const isServiceResults = window.location.pathname === '/services'
  const providerTypes = provider?.providerTypes ?? []
  const providesProperties = providerTypes.includes('property')
  const providesServices = providerTypes.includes('service')

  async function handleSignOut() {
    setSignOutError('')
    setIsSigningOut(true)
    try {
      await apiRequest('/auth/logout', { method: 'POST' })
      window.location.assign('/provider-login')
    } catch (error) {
      setSignOutError(error.message)
      setIsSigningOut(false)
    }
  }

  return (
    <>
      <nav className="navbar navbar-expand-lg site-navbar">
        <div className="container">
          <a className="navbar-brand" href="/" aria-label="SmartServe home">
            <span className="site-brand-mark" aria-hidden="true">
              <svg width="31" height="31" viewBox="0 0 32 32" fill="none">
                <path d="M3 14.2 16 3l13 11.2v14.3h-9v-9h-8v9H3V14.2Z" fill="currentColor" />
                <path d="M19.5 4h7v7.2" stroke="#18345b" strokeWidth="3" strokeLinejoin="round" />
              </svg>
            </span>
            <span>
              <span className="site-brand-name">SmartServe</span>
              <span className="site-brand-tagline">Properties · Services · Your Local Marketplace</span>
            </span>
          </a>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#siteNavbar"
            aria-controls="siteNavbar"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>

          <div className="collapse navbar-collapse" id="siteNavbar">
            <ul className="navbar-nav mx-auto">
              <li className="nav-item">
                <a className={`nav-link ${isHome ? 'active' : ''}`} href="/">Home</a>
              </li>
              <li className="nav-item">
                <a className={`nav-link ${isPropertyResults ? 'active' : ''}`} href="/properties">Properties</a>
              </li>
              <li className="nav-item">
                <a className={`nav-link ${isServiceResults ? 'active' : ''}`} href="/services">Services</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/provider-registration">Providers</a>
              </li>
              {isProviderChecked && provider && (
                <li className="nav-item dropdown">
                  <button
                    className={`nav-link dropdown-toggle${isPropertyDashboard || isPropertyListing || isServiceDashboard || isServiceListing ? ' active' : ''}`}
                    id="providerMenu"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    aria-label="Provider menu"
                    title="Provider menu"
                  >
                    <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                  <ul className="dropdown-menu" aria-labelledby="providerMenu">
                    {providesProperties && (
                      <>
                        <li><a className={`dropdown-item ${isPropertyDashboard ? 'active' : ''}`} href="/property-dashboard">Property Dashboard</a></li>
                        <li><a className={`dropdown-item ${isPropertyListing ? 'active' : ''}`} href="/property-listing">List Property</a></li>
                      </>
                    )}
                    {providesServices && (
                      <>
                        <li><a className={`dropdown-item ${isServiceDashboard ? 'active' : ''}`} href="/service-dashboard">Service Dashboard</a></li>
                        <li><a className={`dropdown-item ${isServiceListing ? 'active' : ''}`} href="/service-listing">List Service</a></li>
                      </>
                    )}
                  </ul>
                </li>
              )}
            </ul>
            <div className="site-nav-actions">
              <a className="site-nav-search" href="/#homeSearchTerm" aria-label="Search properties or services">
                <svg aria-hidden="true" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="10.8" cy="10.8" r="6.8" />
                  <path d="m16 16 5 5" />
                </svg>
              </a>
              {providerStatusError && (
                <span className="small text-danger" role="status" title={providerStatusError}>
                  Account status unavailable
                </span>
              )}
              {isProviderChecked && !provider && (
                <>
                  <a className="site-nav-login" href="/provider-login">Sign In</a>
                  <a className="site-nav-signup" href="/provider-registration">Sign Up</a>
                </>
              )}
              {isProviderChecked && provider && (
                <>
                  {signOutError && <span className="small text-danger" role="alert">{signOutError}</span>}
                  <button
                    className="site-nav-login"
                    type="button"
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                  >
                    {isSigningOut ? 'Signing out...' : 'Sign out'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {isProviderRegistration ? (
        <ProviderRegistration />
      ) : isProviderLogin ? (
        <ProviderLogin />
      ) : isPropertyDashboard ? (
        <PropertyDashboard />
      ) : isServiceDashboard ? (
        <ServiceDashboard />
      ) : isPropertyListing ? (
        <PropertyListing />
      ) : isPropertyResults ? (
        <PropertyResults />
      ) : isServiceListing ? (
        <ServiceListing />
      ) : isServiceResults ? (
        <ServiceResults />
      ) : (
        <HomePage />
      )}
    </>
  )
}

export default App