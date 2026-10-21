function SiteFooter() {
  return (
    <footer className="home-footer">
      <div className="container home-footer-inner">
        <a className="home-footer-brand" href="/">
          <svg aria-hidden="true" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="m3 10 9-7 9 7M5 9v12h14V9M9 21v-7h6v7" />
          </svg>
          <span><strong>SmartServe</strong><small>Properties · Services · Your Local Marketplace</small></span>
        </a>
        <div className="home-footer-links">
          <strong>Quick Links</strong>
          <a href="/">Home</a>
          <a href="/properties">Properties</a>
          <a href="/services">Services</a>
          <a href="/provider-registration">Providers</a>
        </div>
        <div className="home-footer-links">
          <strong>Support</strong>
          <a href="/#community-comments-title">Help &amp; feedback</a>
          <a href="https://www.openstreetmap.org/?mlat=30.7333&amp;mlon=76.7794#map=13/30.7333/76.7794" target="_blank" rel="noreferrer">Our location</a>
          <a href="/provider-login">Provider sign in</a>
        </div>
        <div className="home-footer-links home-footer-social">
          <strong>Join SmartServe</strong>
          <a className="home-footer-join" href="/provider-registration">Register as a provider</a>
          <small>© 2026 SmartServe. All rights reserved.</small>
        </div>
      </div>
    </footer>
  )
}

export default SiteFooter
