import { useState } from 'react'
import { apiRequest } from './api.js'

function ServiceListing() {
  const [submitted, setSubmitted] = useState(false)
  const [notice, setNotice] = useState('')
  const [serviceAreaInput, setServiceAreaInput] = useState('')
  const [serviceAreas, setServiceAreas] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  function addServiceArea() {
    const area = serviceAreaInput.trim()
    if (!area || serviceAreas.some((item) => item.toLowerCase() === area.toLowerCase())) {
      return
    }

    setServiceAreas((current) => [...current, area])
    setServiceAreaInput('')
    setNotice('')
    setSubmitted(false)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (serviceAreas.length === 0) {
      setSubmitted(false)
      setNotice('Add at least one service area before previewing your listing.')
      return
    }

    setNotice('')
    setSubmitted(false)
    setIsSubmitting(true)
    try {
      await apiRequest('/service-listings', {
        method: 'POST',
        body: new FormData(event.currentTarget),
      })
      setSubmitted(true)
    } catch (requestError) {
      setNotice(requestError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-9 col-xl-8">
          <div className="mb-4">
            <a className="text-decoration-none" href="/provider-registration">
              &larr; Back to provider registration
            </a>
            <h1 className="h2 fw-bold mt-3 mb-1">Create a service listing</h1>
            <p className="text-secondary mb-0">
              Tell customers what service you provide, where you work, and how to contact you.
            </p>
          </div>

          <div className="alert alert-info" role="note">
            Your service listing will be saved and published. Contact details come from your provider profile.
          </div>

          {submitted && (
            <div className="alert alert-success" role="status">
              Your service listing was saved.
            </div>
          )}
          {notice && <div className="alert alert-danger" role="alert">{notice}</div>}

          <form className="card border-0 shadow-sm" onSubmit={handleSubmit}>
            <div className="card-body p-4 p-md-5">
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label" htmlFor="servicePhotos">Previous work </label>
                  <input
                    className="form-control"
                    id="servicePhotos"
                    name="photos"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                  />
                  <div className="form-text">Upload up to 8 JPEG, PNG, or WebP images, up to 5 MB each.</div>
                </div>

                <div className="col-md-6">
                  <label className="form-label" htmlFor="serviceTitle">Service or business name</label>
                  <input
                    className="form-control"
                    id="serviceTitle"
                    name="title"
                    placeholder="e.g. ABC Plumbing Services"
                    maxLength={100}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label" htmlFor="serviceCategory">Service category</label>
                  <select className="form-select" id="serviceCategory" name="category" defaultValue="" required>
                    <option value="" disabled>Select a category</option>
                    <option value="plumbing">Plumbing</option>
                    <option value="electrical">Electrical</option>
                    <option value="home-repair">Home repair</option>
                    <option value="appliance-repair">Appliance repair</option>
                    <option value="cleaning">Cleaning</option>
                    <option value="carpentry">Carpentry</option>
                    <option value="painting">Painting</option>
                    <option value="hvac">HVAC / air conditioning</option>
                    <option value="landscaping">Landscaping / gardening</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label" htmlFor="servicePrice">Starting price (INR)</label>
                  <div className="input-group">
                    <span className="input-group-text" aria-hidden="true">₹</span>
                    <input
                      className="form-control"
                      id="servicePrice"
                      name="price"
                      type="number"
                      min="1"
                      step="1"
                      placeholder="e.g. 500"
                      required
                    />
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="form-label" htmlFor="servicePricingUnit">Price is per</label>
                  <select className="form-select" id="servicePricingUnit" name="pricingUnit" defaultValue="" required>
                    <option value="" disabled>Select pricing unit</option>
                    <option value="visit">Visit</option>
                    <option value="hour">Hour</option>
                    <option value="day">Day</option>
                    <option value="job">Job / project</option>
                  </select>
                </div>

                <div className="col-12">
                  <label className="form-label" htmlFor="serviceAreaInput">Service areas</label>
                  <div className="input-group">
                    <input
                      className="form-control"
                      id="serviceAreaInput"
                      value={serviceAreaInput}
                      onChange={(event) => setServiceAreaInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault()
                          addServiceArea()
                        }
                      }}
                      placeholder="Enter a city, neighborhood, or postal code"
                    />
                    <button className="btn btn-outline-primary" type="button" onClick={addServiceArea}>
                      Add area
                    </button>
                  </div>
                  <div className="form-text">Add all areas where you provide this service.</div>
                  {serviceAreas.length > 0 && (
                    <ul className="list-inline mt-2 mb-0" aria-label="Selected service areas">
                      {serviceAreas.map((area) => (
                        <li className="list-inline-item mb-2" key={area}>
                          <span className="badge text-bg-light border p-2">
                            {area}
                            <button
                              className="btn-close ms-2"
                              type="button"
                              aria-label={`Remove ${area}`}
                              onClick={() => {
                                setServiceAreas((current) => current.filter((item) => item !== area))
                                setSubmitted(false)
                              }}
                            />
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {serviceAreas.map((area) => (
                    <input key={area} type="hidden" name="serviceAreas" value={area} />
                  ))}
                </div>

                <div className="col-12">
                  <label className="form-label" htmlFor="serviceDescription">About your service</label>
                  <textarea
                    className="form-control"
                    id="serviceDescription"
                    name="description"
                    rows="5"
                    maxLength={2000}
                    placeholder="Describe your experience, services offered, and any important details."
                    required
                  />
                </div>
              </div>

              <div className="d-flex flex-column flex-sm-row gap-2 mt-4">
                <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving listing...' : 'Publish service listing'}
                </button>
                <a className="btn btn-outline-secondary" href="/">Cancel</a>
              </div>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}

export default ServiceListing
