import { useEffect, useState } from 'react'
import { apiRequest } from './api.js'

function formatCommentDate(value) {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function HomeComments({ compact = false }) {
  const [comments, setComments] = useState([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [showAll, setShowAll] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let isMounted = true

    apiRequest('/comments')
      .then((result) => {
        if (isMounted) setComments(result.comments)
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

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setNotice('')
    setIsSubmitting(true)

    try {
      const result = await apiRequest('/comments', {
        method: 'POST',
        body: { name, email, message },
      })
      setComments((current) => [result.comment, ...current].slice(0, 100))
      setName('')
      setEmail('')
      setMessage('')
      setNotice('Your comment has been posted.')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className={`home-comments ${compact ? 'home-comments-compact' : 'container pb-5'}`} aria-labelledby="community-comments-title">
      <div className={compact ? '' : 'row justify-content-center'}>
        <div className={compact ? '' : 'col-lg-9'}>
          <div className="home-comments-heading">
            <h2 className="home-section-heading" id="community-comments-title">
              <svg aria-hidden="true" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z" />
              </svg>
              Comments &amp; Reviews
            </h2>
            {compact && comments.length > 3 && (
              <button
                className="home-view-all home-comments-toggle"
                type="button"
                onClick={() => setShowAll((current) => !current)}
              >
                {showAll ? 'Show less' : 'View All'} <span aria-hidden="true">→</span>
              </button>
            )}
          </div>
          {!compact && <p className="text-secondary">Share feedback with the community.</p>}

          {compact ? (
            <details className="home-comment-form-toggle">
              <summary>Leave a comment</summary>
              <form className="card border-0 shadow-sm mt-2 mb-3" onSubmit={handleSubmit}>
                <div className="card-body">
                  {renderCommentFields()}
                </div>
              </form>
            </details>
          ) : (
            <form className="card border-0 shadow-sm mb-4" onSubmit={handleSubmit}>
              <div className="card-body">
                {renderCommentFields()}
              </div>
            </form>
          )}

          <h3 className="visually-hidden">What people are saying</h3>
          {isLoading ? (
            <p role="status">Loading comments...</p>
          ) : error && comments.length === 0 ? (
            <p className="text-secondary">Comments could not be loaded. Please try again later.</p>
          ) : comments.length === 0 ? (
            <p className="text-secondary">No comments yet. Be the first to share your feedback.</p>
          ) : (
            <div className="home-comments-list">
              {(compact && !showAll ? comments.slice(0, 3) : comments).map((comment) => (
                <article className="home-comment-card" key={comment.id}>
                  <div className="home-comment-avatar" aria-hidden="true">
                    {comment.name?.trim().charAt(0).toUpperCase() || '?'}
                  </div>
                  <div className="home-comment-body">
                    <div className="home-comment-meta">
                      <strong>{comment.name || 'Community member'}</strong>
                      <time dateTime={comment.createdAt}>{formatCommentDate(comment.createdAt)}</time>
                    </div>
                    <p>{comment.message}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )

  function renderCommentFields() {
    return (
      <>
        <div className="mb-3">
          <label className="form-label fw-semibold" htmlFor="commentName">Name</label>
          <input
            className="form-control"
            id="commentName"
            type="text"
            maxLength={100}
            autoComplete="name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
        <div className="mb-3">
          <label className="form-label fw-semibold" htmlFor="commentEmail">Email (optional)</label>
          <input
            className="form-control"
            id="commentEmail"
            type="email"
            maxLength={254}
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <div className="mb-3">
          <label className="form-label fw-semibold" htmlFor="commentMessage">Comment</label>
          <textarea
            className="form-control"
            id="commentMessage"
            rows="3"
            maxLength={2000}
            required
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
        </div>
        {error && <div className="alert alert-danger" role="alert">{error}</div>}
        {notice && <div className="alert alert-success" role="status">{notice}</div>}
        <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Posting...' : 'Post comment'}
        </button>
      </>
    )
  }
}

export default HomeComments
