import { useEffect, useState } from 'react'
import { apiRequest } from './api.js'
import ListingImages from './ListingImages.jsx'

function formatPrice(price) {
  return `₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Number(price))}`
}

function PropertyDashboard() {
  const [listings, setListings] = useState([])
  const [provider, setProvider] = useState(null)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    Promise.all([apiRequest('/auth/me'), apiRequest('/property-listings/mine')])
      .then(([account, result]) => {
        if (!isMounted) return
        setProvider(account.provider)
        setListings(result.listings)
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

  async function toggleListingStatus(listing) {
    const nextStatus = listing.status === 'active' ? 'paused' : 'active'
    setError('')
    setNotice('')
    try {
      await apiRequest(`/property-listings/${listing.id}/status`, {
        method: 'POST',
        body: { status: nextStatus },
      })
      setListings((current) => current.map((item) => (
        item.id === listing.id ? { ...item, status: nextStatus } : item
      )))
      setNotice(`Listing ${nextStatus === 'active' ? 'activated' : 'paused'}.`)
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  async function signOut() {
    setError('')
    try {
      await apiRequest('/auth/logout', { method: 'POST' })
      window.location.assign('/provider-login')
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const activeCount = listings.filter((listing) => listing.status === 'active').length
  const pausedCount = listings.filter((listing) => listing.status === 'paused').length

  return (
    <main className="container py-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h1 className="h2 fw-bold mb-1">Property Provider Dashboard</h1>
          <p className="text-secondary mb-0">
            {provider ? `Welcome, ${provider.fullName}. Manage your property listings here.` : 'Manage your property listings.'}
          </p>
        </div>
        <div className="d-flex gap-2">
          <a className="btn btn-primary" href="/property-listing">Add a property</a>
          <button className="btn btn-outline-secondary" type="button" onClick={signOut}>Sign out</button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
          {error.includes('Sign in') || error.includes('session expired')
            ? <> <a className="alert-link" href="/provider-login">Sign in</a> to view your listings.</>
            : null}
        </div>
      )}
      {notice && <div className="alert alert-success" role="status">{notice}</div>}

      <section className="row g-3 mb-4" aria-label="Property listing summary">
        {[
          ['Total listings', listings.length],
          ['Active listings', activeCount],
          ['Paused listings', pausedCount],
        ].map(([label, value]) => (
          <div className="col-sm-6 col-xl-4" key={label}>
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <p className="text-secondary mb-2">{label}</p>
                <p className="h3 fw-bold mb-0">{isLoading ? '—' : value}</p>
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-white py-3">
          <h2 className="h5 fw-bold mb-0">Your property listings</h2>
        </div>
        {isLoading ? (
          <div className="card-body py-5 text-center" role="status">Loading your listings...</div>
        ) : listings.length === 0 ? (
          <div className="card-body text-center py-5">
            <p className="mb-3">You have no property listings yet.</p>
            <a className="btn btn-primary" href="/property-listing">Create your first listing</a>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th scope="col">Property</th>
                  <th scope="col">Type &amp; price</th>
                  <th scope="col">Purpose</th>
                  <th scope="col">Status</th>
                  <th scope="col"><span className="visually-hidden">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {listings.map((listing) => (
                  <tr key={listing.id}>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <div className="flex-shrink-0" style={{ width: '160px' }}>
                          <ListingImages
                            images={listing.images}
                            title={listing.title}
                            emptyLabel="No photos uploaded"
                            height={120}
                            autoPlay
                          />
                        </div>
                        <div>
                          <div className="fw-semibold">{listing.title}</div>
                          <div className="small text-secondary">{listing.locality}, {listing.city}</div>
                          {listing.images?.length > 1 && (
                            <div className="small text-secondary">{listing.images.length} photos</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>{listing.type}</div>
                      <div className="small text-secondary">{formatPrice(listing.price)}</div>
                    </td>
                    <td className="text-capitalize">{listing.purpose}</td>
                    <td>
                      <span className={`badge ${listing.status === 'active' ? 'text-bg-success' : 'text-bg-secondary'}`}>
                        {listing.status}
                      </span>
                    </td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        type="button"
                        onClick={() => toggleListingStatus(listing)}
                      >
                        {listing.status === 'active' ? 'Pause' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card border-0 shadow-sm">
        <div className="card-body">
          <h2 className="h5 fw-bold">Need to list a service too?</h2>
          <p className="text-secondary mb-3">Create a service listing from your provider account.</p>
          <a href="/service-listing">List a service</a>
        </div>
      </section>
    </main>
  )
}

export default PropertyDashboard
