import { useState } from 'react'
import { apiRequest } from './api.js'

function ProviderLogin() {
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    const formData = new FormData(event.currentTarget)

    try {
      const result = await apiRequest('/auth/login', {
        method: 'POST',
        body: {
          email: formData.get('email'),
          password: formData.get('password'),
        },
      })
      const dashboardPath = result.provider.providerTypes.includes('service')
        && !result.provider.providerTypes.includes('property')
        ? '/service-dashboard'
        : '/property-dashboard'
      window.location.assign(dashboardPath)
    } catch (requestError) {
      setError(requestError.message)
      setIsSubmitting(false)
    }
  }

  return (
    <main className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-7 col-lg-5">
          <div className="text-center mb-4">
            <h1 className="fw-bold">Provider sign in</h1>
            <p className="text-secondary">Sign in to manage your listings.</p>
          </div>
          <form className="card border-0 shadow-sm" onSubmit={handleSubmit}>
            <div className="card-body p-4">
              {error && <div className="alert alert-danger" role="alert">{error}</div>}
              <div className="mb-3">
                <label className="form-label" htmlFor="loginEmail">Email address</label>
                <input
                  className="form-control"
                  id="loginEmail"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="loginPassword">Password</label>
                <input
                  className="form-control"
                  id="loginPassword"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                />
              </div>
              <button className="btn btn-primary w-100" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Signing in...' : 'Sign in'}
              </button>
              <p className="text-center small mt-3 mb-0">
                Need an account? <a href="/provider-registration">Register as a provider</a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}

export default ProviderLogin
