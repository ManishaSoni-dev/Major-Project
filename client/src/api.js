const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'

export async function apiRequest(path, options = {}) {
  const headers = new Headers(options.headers)
  const isFormData = options.body instanceof FormData
  let body = options.body

  if (body && !isFormData && typeof body !== 'string') {
    headers.set('Content-Type', 'application/json')
    body = JSON.stringify(body)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    body,
    credentials: 'include',
  })

  if (response.status === 204) return null

  const result = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(result.error || `Request failed (${response.status}).`)
  }
  return result
}

export const API_ORIGIN = new URL(API_BASE_URL).origin
