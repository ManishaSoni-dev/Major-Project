import { useState } from 'react'

const initialListings = [
  {
    id: 1,
    title: '2-Bedroom Apartment',
    location: 'Andheri West, Mumbai',
    type: 'For rent',
    price: '₹32,000 / month',
    status: 'Active',
    views: 128,
    inquiries: 8,
  },
  {
    id: 2,
    title: 'Family House with Garden',
    location: 'Baner, Pune',
    type: 'For sale',
    price: '₹1.25 Cr',
    status: 'Pending review',
    views: 64,
    inquiries: 3,
  },
  {
    id: 3,
    title: 'Studio Apartment',
    location: 'HSR Layout, Bengaluru',
    type: 'For rent',
    price: '₹18,500 / month',
    status: 'Paused',
    views: 91,
    inquiries: 5,
  },
]

function PropertyDashboard() {
  const [listings, setListings] = useState(initialListings)
  const [notice, setNotice] = useState('')
  const registrationPreview = new URLSearchParams(window.location.search).get('registration') === 'preview'
  const activeCount = listings.filter((listing) => listing.status === 'Active').length
  const totalInquiries = listings.reduce((total, listing) => total + listing.inquiries, 0)
  const totalViews = listings.reduce((total, listing) => total + listing.views, 0)

  function toggleListingStatus(id) {
    setListings((current) => current.map((listing) => {
      if (listing.id !== id || listing.status === 'Pending review') {
        return listing
      }

      return { ...listing, status: listing.status === 'Active' ? 'Paused' : 'Active' }
    }))
    setNotice('Listing status updated in this demo dashboard. Changes are not saved to an account.')
  }

  return (
    <main className="container py-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h1 className="h2 fw-bold mb-1">Property Provider Dashboard</h1>
          <p className="text-secondary mb-0">Manage your property listings and track customer interest.</p>
        </div>
        <a className="btn btn-primary" href="/property-listing">Add a property</a>
      </div>

      <div className="alert alert-info" role="note">
        Demo dashboard: the figures and listings below are sample data. Account and listing data are not connected to a backend yet.
      </div>
      {registrationPreview && (
        <div className="alert alert-warning" role="status">
          Your registration form passed its checks, but your details were not saved because account registration is not connected to a backend yet.
        </div>
      )}

      <section className="row g-3 mb-4" aria-label="Property listing summary">
        <div className="col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <p className="text-secondary mb-2">Total listings</p>
              <p className="h3 fw-bold mb-0">{listings.length}</p>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <p className="text-secondary mb-2">Active listings</p>
              <p className="h3 fw-bold mb-0">{activeCount}</p>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <p className="text-secondary mb-2">Total views</p>
              <p className="h3 fw-bold mb-0">{totalViews}</p>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <p className="text-secondary mb-2">Customer inquiries</p>
              <p className="h3 fw-bold mb-0">{totalInquiries}</p>
            </div>
          </div>
        </div>
      </section>

      {notice && <div className="alert alert-success" role="status">{notice}</div>}

      <section className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-white py-3">
          <h2 className="h5 fw-bold mb-0">Your property listings</h2>
        </div>
        {listings.length === 0 ? (
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
                  <th scope="col">Performance</th>
                  <th scope="col">Status</th>
                  <th scope="col"><span className="visually-hidden">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {listings.map((listing) => (
                  <tr key={listing.id}>
                    <td>
                      <div className="fw-semibold">{listing.title}</div>
                      <div className="small text-secondary">{listing.location}</div>
                    </td>
                    <td>
                      <div>{listing.type}</div>
                      <div className="small text-secondary">{listing.price}</div>
                    </td>
                    <td>
                      <div>{listing.views} views</div>
                      <div className="small text-secondary">{listing.inquiries} inquiries</div>
                    </td>
                    <td>
                      <span className={`badge ${
                        listing.status === 'Active'
                          ? 'text-bg-success'
                          : listing.status === 'Pending review'
                            ? 'text-bg-warning'
                            : 'text-bg-secondary'
                      }`}>
                        {listing.status}
                      </span>
                    </td>
                    <td className="text-end">
                      {listing.status !== 'Pending review' && (
                        <button
                          className="btn btn-sm btn-outline-primary"
                          type="button"
                          onClick={() => toggleListingStatus(listing.id)}
                        >
                          {listing.status === 'Active' ? 'Pause' : 'Activate'}
                        </button>
                      )}
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
          <h2 className="h5 fw-bold">Getting started</h2>
          <p className="text-secondary mb-3">
            Complete your provider profile and add clear photos and accurate details to help customers find your properties.
          </p>
          <a href="/provider-registration">Go to provider registration</a>
        </div>
      </section>
    </main>
  )
}

export default PropertyDashboard
