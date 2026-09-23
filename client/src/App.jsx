function App() {
  return (
    
  <>
    <nav className="navbar navbar-expand-md navbar-dark bg-dark">
      <div className="container">
        <a className="navbar-brand text-white" href="#">
          SmartServe
        </a>

        <button 
        className="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav">

          <span className="navbar-toggler-icon"></span>             
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <a className="nav-link text-white" href="#">
                Home
              </a>
            </li>

            <li className="nav-item">
              <a className="nav-link text-white" href="#">
                services
              </a>
            </li>

            <li className="nav-item">
              <a className="nav-link text-white" href="#">
                Properties  
              </a>
            </li>

            <li className="nav-item">
              <a className="nav-link text-white" href="#">
                Login
              </a>
            </li> 
          </ul>
        </div>
      </div>
    </nav>
    
    <div className="container-fluid by-light py-5">
      <div className="container text-center">

        <h1 className="display-4 fw-bold">
          Find the Right Service or Property
        </h1>

        <p className="lead mt-3">
          Find trusted service providers and properties in one place.
        </p>

        <div className="row justify-content-center mt-4">

        <div className="col-md-4 mb-2">
          <select className="form-select">
            <option>Select Category</option>
            <option>Property</option>
            <option>Local Service</option>
          </select>
        </div>

        <div className="col-md-4 mb-2">
          <input
          type="text"
          className="form-control"
          placeholder="What are you looking for?"
          />
        </div>

        <div className="col-md-2 mb-2">
          <button className="btn btn-primary w-100">
            Search
          </button>
        </div>

      </div>
    
    </div> 
     </div>     
    </>
  )
}

export default App