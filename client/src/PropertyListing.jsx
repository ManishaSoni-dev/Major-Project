import { useEffect, useRef, useState } from 'react'
import { apiRequest } from './api.js'

function PropertyListing() {
  const [submitted, setSubmitted] = useState(false)
  const [notice, setNotice] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedPhotos, setSelectedPhotos] = useState([])
  const [photoPreviews, setPhotoPreviews] = useState([])
  const photoPreviewUrls = useRef([])

  useEffect(() => {
    return () => {
      photoPreviewUrls.current.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [])

  function handlePhotoSelection(event) {
    const photos = Array.from(event.currentTarget.files || [])
    event.currentTarget.value = ''
    if (selectedPhotos.length + photos.length > 8) {
      setNotice('You can add up to 8 photos. Remove a photo before adding another.')
      return
    }
    if (photos.some((photo) => photo.size > 5 * 1024 * 1024)) {
      setNotice('Each photo must be 5 MB or smaller.')
      return
    }
    if (photos.some((photo) => !['image/jpeg', 'image/png', 'image/webp'].includes(photo.type))) {
      setNotice('Photos must be JPEG, PNG, or WebP images.')
      return
    }

    setNotice('')
    const addedPhotos = photos.map((photo) => {
      const url = URL.createObjectURL(photo)
      photoPreviewUrls.current.push(url)
      return { file: photo, url }
    })
    setSelectedPhotos((current) => [...current, ...addedPhotos])
    setPhotoPreviews((current) => [
      ...current,
      ...addedPhotos.map(({ file, url }) => ({ name: file.name, url })),
    ])
  }

  function removePhoto(url) {
    URL.revokeObjectURL(url)
    photoPreviewUrls.current = photoPreviewUrls.current.filter((item) => item !== url)
    setSelectedPhotos((current) => current.filter((photo) => photo.url !== url))
    setPhotoPreviews((current) => current.filter((photo) => photo.url !== url))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setNotice('')
    setSubmitted(false)
    setIsSubmitting(true)

    try {
      const formData = new FormData(event.currentTarget)
      for (const photo of selectedPhotos) {
        formData.append('photos', photo.file)
      }
      await apiRequest('/property-listings', {
        method: 'POST',
        body: formData,
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
            <a className="text-decoration-none" href="/property-dashboard">
              &larr; Back to dashboard
            </a>
            <h1 className="h2 fw-bold mt-3 mb-1">Create a property listing</h1>
            <p className="text-secondary mb-0">
              Add the details customers need to learn about your property.
            </p>
          </div>

          <div className="alert alert-info" role="note">
            Your listing will be saved and published. Contact details come from your provider profile.
          </div>

          {submitted && (
            <div className="alert alert-success" role="status">
              Your property listing was saved. You can manage it from your dashboard.
              {' '}<a href="/property-dashboard" className="alert-link">Open dashboard</a>
            </div>
          )}
          {notice && <div className="alert alert-danger" role="alert">{notice}</div>}
          <form className="card border-0 shadow-sm" onSubmit={handleSubmit}>
            <div className="card-body p-4 p-md-5">
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label" htmlFor="listingPhotos">Add property photos</label>
                  <input
                    className="form-control"
                    id="listingPhotos"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePhotoSelection}
                  />
                  <div className="form-text">
                    Choose one JPEG, PNG, or WebP image at a time. Select another file to add it; up to 8 photos, 5 MB each.
                    {photoPreviews.length > 0 && ` ${photoPreviews.length} photos selected.`}
                  </div>
                  {photoPreviews.length > 0 && (
                    <div className="d-flex flex-wrap gap-2 mt-3" aria-label="Selected property photo previews">
                      {photoPreviews.map((preview) => (
                        <div className="position-relative" key={preview.url}>
                          <img
                            src={preview.url}
                            alt={`Selected property photo: ${preview.name}`}
                            className="rounded object-fit-cover border"
                            style={{ width: '100px', height: '80px' }}
                          />
                          <button
                            className="btn-close position-absolute top-0 end-0 m-1 bg-white rounded-circle p-1"
                            type="button"
                            aria-label={`Remove ${preview.name}`}
                            onClick={() => removePhoto(preview.url)}
                          />
                        </div>
                      ))}
                    </div>
                  )}
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
                <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving listing...' : 'Publish property listing'}
                </button>
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
