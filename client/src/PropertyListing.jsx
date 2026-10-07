import { useState } from 'react'

function PropertyListing() {
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(event) {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <main className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-9 col-xl-8">
          <div className="mb-4">
            <a className="text-decoration-none" href="/property-dashboard">
              &larr; Back to dashboard
            </a>
            <h1 className="h2 fw-bold mt-3 mb-1">Create a property listing</h1>
            <p className="text-secondary mb-0">
              Add the details customers need to learn about your property.
            </p>
          </div>

          <div className="alert alert-info" role="note">
            Listing submission is not connected to a backend yet. Your information will not be saved or published.
          </div>

          {submitted && (
            <div className="alert alert-warning" role="status">
              The form passed validation, but your listing was not saved because listing submission is not connected yet.
            </div>
          )}
          <form className="card border-0 shadow-sm" onSubmit={handleSubmit}>
            <div className="card-body p-4 p-md-5">
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label" htmlFor="listingPhotos">Property photos</label>
                  <input
                    className="form-control"
                    id="listingPhotos"
                    name="photos"
                    type="file"
                    accept="image/*"
                    multiple
                  />
                  <div className="form-text">You can select multiple images. Photos will not be uploaded until listing submission is connected.</div>
                </div>

                <div className="col-12">
                  <label className="form-label" htmlFor="listingTitle">Listing title</label>
                  <input
                    className="form-control"
                    id="listingTitle"
                    name="title"
                    placeholder="e.g. Bright 2-bedroom apartment near metro"
                    maxLength={100}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label" htmlFor="listingCategory">Property type</label>
                  <select className="form-select" id="listingCategory" name="category" defaultValue="" required>
                    <option value="" disabled>Select property type</option>
                    <option value="apartment">Apartment / flat</option>
                    <option value="independent-house">Independent house</option>
                    <option value="villa">Villa</option>
                    <option value="land">Land / plot</option>
                    <option value="commercial">Commercial property</option>
                    <option value="office">Office</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label" htmlFor="listingPurpose">Listing for</label>
                  <select className="form-select" id="listingPurpose" name="purpose" defaultValue="" required>
                    <option value="" disabled>Select sale or rent</option>
                    <option value="sale">Sale</option>
                    <option value="rent">Rent</option>
                    <option value="lease">Lease</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label" htmlFor="furnishingStatus">Furnishing status</label>
                  <select className="form-select" id="furnishingStatus" name="furnishingStatus" defaultValue="" required>
                    <option value="" disabled>Select furnishing status</option>
                    <option value="unfurnished">Unfurnished</option>
                    <option value="semi-furnished">Semi-furnished</option>
                    <option value="fully-furnished">Fully furnished</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label" htmlFor="listingPrice">Price (INR)</label>
                  <div className="input-group">
                    <span className="input-group-text" aria-hidden="true">₹</span>
                    <input
                      className="form-control"
                      id="listingPrice"
                      name="price"
                      type="number"
                      min="1"
                      step="1"
                      placeholder="e.g. 25000"
                      required
                    />
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="form-label" htmlFor="listingArea">Area (sq. ft.)</label>
                  <input
                    className="form-control"
                    id="listingArea"
                    name="area"
                    type="number"
                    min="1"
                    step="1"
                    placeholder="e.g. 1200"
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label" htmlFor="listingBedrooms">Bedrooms</label>
                  <select className="form-select" id="listingBedrooms" name="bedrooms" defaultValue="na">
                    <option value="na">Not applicable</option>
                    <option value="studio">Studio</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5+">5 or more</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label" htmlFor="listingBathrooms">Bathrooms</label>
                  <select className="form-select" id="listingBathrooms" name="bathrooms" defaultValue="na">
                    <option value="na">Not applicable</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4+">4 or more</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label" htmlFor="listingCity">City</label>
                  <input
                    className="form-control"
                    id="listingCity"
                    name="city"
                    autoComplete="address-level2"
                    placeholder="e.g. Mumbai"
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label" htmlFor="listingLocality">Locality / neighborhood</label>
                  <input
                    className="form-control"
                    id="listingLocality"
                    name="locality"
                    placeholder="e.g. Andheri West"
                    required
                  />
                </div>

                <div className="col-12">
                  <label className="form-label" htmlFor="listingAddress">Address</label>
                  <textarea
                    className="form-control"
                    id="listingAddress"
                    name="address"
                    rows="2"
                    autoComplete="street-address"
                    placeholder="Street, building, or nearby landmark"
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label" htmlFor="contactName">Contact name</label>
                  <input
                    className="form-control"
                    id="contactName"
                    name="contactName"
                    autoComplete="name"
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label" htmlFor="contactPhone">Contact mobile number</label>
                  <input
                    className="form-control"
                    id="contactPhone"
                    name="contactPhone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    pattern="[6-9][0-9]{9}"
                    maxLength={10}
                    title="Enter exactly 10 digits, starting with 6, 7, 8, or 9."
                    placeholder="10-digit Indian mobile number"
                    required
                  />
                </div>

                <div className="col-12">
                  <label className="form-label" htmlFor="listingDescription">Description</label>
                  <textarea
                    className="form-control"
                    id="listingDescription"
                    name="description"
                    rows="5"
                    maxLength={2000}
                    placeholder="Describe the property, its features, and any important details."
                    required
                  />
                </div>

              </div>

              <div className="d-flex flex-column flex-sm-row gap-2 mt-4">
                <button className="btn btn-primary" type="submit">Preview listing</button>
                <a className="btn btn-outline-secondary" href="/property-dashboard">Cancel</a>
              </div>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}

export default PropertyListing
