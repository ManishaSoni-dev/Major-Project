import { useState } from 'react'

function ProviderRegistration() {
  const [notice, setNotice] = useState('')
  const [providerType, setProviderType] = useState('')
  const [propertyProviderRoles, setPropertyProviderRoles] = useState([])
  const [selectedCategories, setSelectedCategories] = useState([])
  const [serviceAreaInput, setServiceAreaInput] = useState('')
  const [serviceAreas, setServiceAreas] = useState([])
  const [propertyLocationInput, setPropertyLocationInput] = useState('')
  const [propertyLocations, setPropertyLocations] = useState([])

  const serviceCategories = [
    'Plumbing',
    'Electrical',
    'Home repair',
    'Appliance repair',
    'Cleaning',
    'Carpentry',
    'Painting',
    'HVAC',
    'Landscaping',
    'Other',
  ]
  const providesServices = providerType === 'service' || providerType === 'both'
  const providesProperties = providerType === 'property' || providerType === 'both'
  const propertyRoles = [
    ['owner', 'Property owner'],
    ['landlord', 'Landlord'],
    ['dealer', 'Property dealer'],
    ['broker', 'Broker / agent'],
    ['manager', 'Property manager'],
    ['builder', 'Builder / developer'],
    ['other', 'Other'],
  ]

  function togglePropertyRole(role) {
    setPropertyProviderRoles((current) => (
      current.includes(role)
        ? current.filter((item) => item !== role)
        : [...current, role]
    ))
  }

  function toggleCategory(category) {
    setSelectedCategories((current) => (
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category]
    ))
  }

  function addServiceArea() {
    const area = serviceAreaInput.trim()
    if (!area || serviceAreas.some((item) => item.toLowerCase() === area.toLowerCase())) {
      return
    }

    setServiceAreas((current) => [...current, area])
    setServiceAreaInput('')
  }

  function addPropertyLocation() {
    const location = propertyLocationInput.trim()
    if (!location || propertyLocations.some((item) => item.toLowerCase() === location.toLowerCase())) {
      return
    }

    setPropertyLocations((current) => [...current, location])
    setPropertyLocationInput('')
  }

  function validatePhoneNumber(event) {
    const phone = event.currentTarget.value.trim()

    event.currentTarget.setCustomValidity(
      phone && !/^[6-9]\d{9}$/.test(phone)
        ? 'Enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.'
        : '',
    )
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (providesProperties && propertyProviderRoles.length === 0) {
      setNotice('Select at least one property provider type.')
      return
    }
    if (providesProperties && propertyLocations.length === 0) {
      setNotice('Add at least one property location.')
      return
    }
    if (providesServices && selectedCategories.length === 0) {
      setNotice('Select at least one service category.')
      return
    }
    if (providesServices && serviceAreas.length === 0) {
      setNotice('Add at least one service area.')
      return
    }
    window.location.assign('/property-dashboard?registration=preview')
  }

  return (
    <main className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8 col-xl-7">
          <div className="text-center mb-4">
            <h1 className="fw-bold">Provider Registration</h1>
            <p className="text-secondary mb-0">
              Create a provider profile to offer services or list a property on SmartServe.
            </p>
          </div>

          <form className="card shadow-sm border-0" onSubmit={handleSubmit}>
            <div className="card-body p-4 p-md-5">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label" htmlFor="providerName">Full name</label>
                  <input className="form-control" id="providerName" name="providerName" autoComplete="name" required />
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="providerType">I want to</label>
                  <select
                    className="form-select"
                    id="providerType"
                    name="providerType"
                    value={providerType}
                    onChange={(event) => setProviderType(event.target.value)}
                    required
                  >
                    <option value="" disabled>Select provider type</option>
                    <option value="service">Offer a service</option>
                    <option value="property">List a property</option>
                    <option value="both">Offer a service and list a property</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="providerEmail">Email address</label>
                  <input
                    className="form-control"
                    id="providerEmail"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="providerPhone">Phone number</label>
                  <input
                    className="form-control"
                    id="providerPhone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    inputMode="numeric"
                    maxLength={10}
                    pattern="[6-9][0-9]{9}"
                    title="Enter exactly 10 digits, starting with 6, 7, 8, or 9."
                    onChange={validatePhoneNumber}
                    required
                  />
                  <div className="form-text">Enter a 10-digit Indian mobile number without a country code.</div>
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="businessName">Business or listing name</label>
                  <input
                    className="form-control"
                    id="businessName"
                    name="businessName"
                    placeholder={
                      providerType === 'property'
                        ? ' Sunny 2-bedroom apartment'
                        : providerType === 'service'
                          ? ' ABC Plumbing'
                          : ' ABC Plumbing or Sunny 2-bedroom apartment'
                    }
                    required
                  />
                </div>
                {providesServices && (
                  <>
                    <fieldset className="col-12">
                      <legend className="form-label">Service categories</legend>
                      <p className="form-text mt-0">Select all the services you provide.</p>
                      <div className="row g-2">
                        {serviceCategories.map((category) => (
                          <div className="col-6 col-md-4" key={category}>
                            <label className="form-check">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                name="serviceCategories"
                                value={category}
                                checked={selectedCategories.includes(category)}
                                onChange={() => toggleCategory(category)}
                              />
                              <span className="form-check-label">{category}</span>
                            </label>
                          </div>
                        ))}
                      </div>
                    </fieldset>

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
                        <button
                          className="btn btn-outline-primary"
                          type="button"
                          onClick={addServiceArea}
                        >
                          Add area
                        </button>
                      </div>
                      <div className="form-text">Add every area where you provide services.</div>
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
                                  onClick={() => setServiceAreas((current) => current.filter((item) => item !== area))}
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
                  </>
                )}
                {providesProperties && (
                  <>
                    <fieldset className="col-12">
                      <legend className="form-label">Property provider type</legend>
                      <p className="form-text mt-0">Select all roles that apply.</p>
                      <div className="row g-2">
                        {propertyRoles.map(([value, label]) => (
                          <div className="col-6 col-md-4" key={value}>
                            <label className="form-check">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                name="propertyProviderRoles"
                                value={value}
                                checked={propertyProviderRoles.includes(value)}
                                onChange={() => togglePropertyRole(value)}
                              />
                              <span className="form-check-label">{label}</span>
                            </label>
                          </div>
                        ))}
                      </div>
                    </fieldset>
                    <div className="col-md-6">
                      <label className="form-label" htmlFor="propertyCategory">Property category</label>
                      <input
                        className="form-control"
                        id="propertyCategory"
                        name="propertyCategory"
                        placeholder="e.g. Apartment or House"
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label" htmlFor="propertyLocationInput">Property locations</label>
                      <div className="input-group">
                        <input
                          className="form-control"
                          id="propertyLocationInput"
                          value={propertyLocationInput}
                          onChange={(event) => setPropertyLocationInput(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                              event.preventDefault()
                              addPropertyLocation()
                            }
                          }}
                          placeholder="Enter a city, neighborhood, or postal code"
                        />
                        <button
                          className="btn btn-outline-primary"
                          type="button"
                          onClick={addPropertyLocation}
                        >
                          Add location
                        </button>
                      </div>
                      <div className="form-text">Add every location where you have a property to list.</div>
                      {propertyLocations.length > 0 && (
                        <ul className="list-inline mt-2 mb-0" aria-label="Selected property locations">
                          {propertyLocations.map((location) => (
                            <li className="list-inline-item mb-2" key={location}>
                              <span className="badge text-bg-light border p-2">
                                {location}
                                <button
                                  className="btn-close ms-2"
                                  type="button"
                                  aria-label={`Remove ${location}`}
                                  onClick={() => setPropertyLocations((current) => current.filter((item) => item !== location))}
                                />
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                      {propertyLocations.map((location) => (
                        <input key={location} type="hidden" name="propertyLocations" value={location} />
                      ))}
                    </div>
                  </>
                )}
                <div className="col-12">
                  <label className="form-label" htmlFor="providerDescription">About your service or property</label>
                  <textarea
                    className="form-control"
                    id="providerDescription"
                    name="description"
                    rows="4"
                    placeholder="Share details that will help customers learn about your offering."
                    required
                  />
                </div>
              </div>

              {notice && <div className="alert alert-info mt-4 mb-0" role="status">{notice}</div>}

              <button className="btn btn-primary w-100 mt-4" type="submit">
                Submit registration
              </button>
              <p className="small text-secondary text-center mt-3 mb-0">
                Submitting this form does not create an account yet.
              </p>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}

export default ProviderRegistration
