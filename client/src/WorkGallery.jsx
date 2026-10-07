import { useState } from 'react'

const galleryItems = [
  {
    id: 'property-modern-home',
    type: 'property',
    label: 'Property',
    title: 'Modern family home',
    detail: 'Residential property · Bengaluru',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80',
    alt: 'Modern home with a landscaped front yard',
  },
  {
    id: 'service-plumbing',
    type: 'service',
    label: 'Service work',
    title: 'Kitchen plumbing installation',
    detail: 'Plumbing · Example portfolio',
    image: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=900&q=80',
    alt: 'Plumbing fixtures and tools in a kitchen',
  },
  {
    id: 'property-interior',
    type: 'property',
    label: 'Property',
    title: 'Bright contemporary interior',
    detail: 'Apartment · Mumbai',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80',
    alt: 'Bright contemporary living room with large windows',
  },
  {
    id: 'service-electrical',
    type: 'service',
    label: 'Service work',
    title: 'Electrical installation',
    detail: 'Electrical · Example portfolio',
    image: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=900&q=80',
    alt: 'Electrician working on an electrical installation',
  },
  {
    id: 'property-kitchen',
    type: 'property',
    label: 'Property',
    title: 'Renovated open-plan home',
    detail: 'Residential property · Pune',
    image: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=900&q=80',
    alt: 'Renovated home interior with an open-plan living area',
  },
  {
    id: 'service-carpentry',
    type: 'service',
    label: 'Service work',
    title: 'Custom woodwork',
    detail: 'Carpentry · Example portfolio',
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=900&q=80',
    alt: 'Carpentry tools arranged on a wooden workbench',
  },
]

function WorkGallery() {
  const [filter, setFilter] = useState('all')
  const visibleItems = galleryItems.filter((item) => filter === 'all' || item.type === filter)

  return (
    <section className="container py-5" aria-labelledby="work-gallery-title">
      <div className="d-flex flex-column flex-md-row align-items-md-end justify-content-between gap-3 mb-4">
        <div>
          <h2 className="h2 fw-bold mb-2" id="work-gallery-title">Properties &amp; previous work</h2>
          <p className="text-secondary mb-0">
            Get inspired by property examples and service-provider portfolio work.
          </p>
        </div>
        <div className="btn-group" role="group" aria-label="Filter gallery">
          {[
            ['all', 'All'],
            ['property', 'Properties'],
            ['service', 'Service work'],
          ].map(([value, label]) => (
            <button
              className={`btn ${filter === value ? 'btn-primary' : 'btn-outline-primary'}`}
              type="button"
              key={value}
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="alert alert-light border small" role="note">
        Sample showcase images for demonstration only; these are not submitted SmartServe listings or verified provider work.
      </div>

      <div className="row g-4">
        {visibleItems.map((item) => (
          <div className="col-sm-6 col-lg-4" key={item.id}>
            <article className="card h-100 border-0 shadow-sm overflow-hidden">
              <img
                className="card-img-top"
                src={item.image}
                alt={item.alt}
                loading="lazy"
                style={{ height: '220px', objectFit: 'cover' }}
              />
              <div className="card-body">
                <span className="badge text-bg-primary mb-2">{item.label}</span>
                <h3 className="h5 card-title">{item.title}</h3>
                <p className="card-text text-secondary mb-0">{item.detail}</p>
              </div>
            </article>
          </div>
        ))}
      </div>
    </section>
  )
}

export default WorkGallery
