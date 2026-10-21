import { useEffect, useState } from 'react'
import { apiRequest } from './api.js'

function formatPrice(price, pricingUnit) {
  const amount = `₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Number(price))}`
  return `${amount} / ${pricingUnit}`
}

function ServiceDashboard() {
  const [listings, setListings] = useState([])
  const [provider, setProvider] = useState(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    Promise.all([apiRequest('/auth/me'), apiRequest('/service-listings/mine')])
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

  return (
    <main className="container py-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h1 className="h2 fw-bold mb-1">Service Provider Dashboard</h1>
          <p className="text-secondary mb-0">
            {provider ? `Welcome, ${provider.fullName}. Manage your service listings here.` : 'Manage your service listings.'}
          </p>
        </div>
        <div className="d-flex gap-2">
          <a className="btn btn-primary" href="/service-listing">Add a service</a>
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

      <section className="row g-3 mb-4" aria-label="Service listing summary">
        {[
          ['Total listings', listings.length],
          ['Active listings', activeCount],
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

      <section className="card border-0 shadow-sm">
        <div className="card-header bg-white py-3">
          <h2 className="h5 fw-bold mb-0">Your service listings</h2>
        </div>
        {isLoading ? (
          <div className="card-body py-5 text-center" role="status">Loading your listings...</div>
        ) : listings.length === 0 ? (
          <div className="card-body text-center py-5">
            <p className="mb-3">You have no service listings yet.</p>
            <a className="btn btn-primary" href="/service-listing">Create your first listing</a>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th scope="col">Service</th>
                  <th scope="col">Category</th>
                  <th scope="col">Starting price</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {listings.map((listing) => (
                  <tr key={listing.id}>
                    <td className="fw-semibold">{listing.title}</td>
                    <td>{listing.category}</td>
                    <td>{formatPrice(listing.price, listing.pricingUnit)}</td>
                    <td>
                      <span className={`badge ${listing.status === 'active' ? 'text-bg-success' : 'text-bg-secondary'}`}>
                        {listing.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}

export default ServiceDashboard
