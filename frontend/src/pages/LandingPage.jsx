import React from 'react';
import { Link } from 'react-router-dom';

export const LandingPage = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-dark text-white py-5 text-center position-relative overflow-hidden" style={{ minHeight: '65vh', display: 'flex', alignItems: 'center' }}>
        <div className="container position-relative z-1">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <span className="badge bg-primary px-3 py-2 text-uppercase mb-3 tracking-wide">Next-Gen Ticketing & Management</span>
              <h1 className="display-3 fw-bold mb-4">Experience Live Events with <span className="text-primary">VenueVista</span></h1>
              <p className="lead text-light mb-5 fs-4 opacity-75">
                Discover thrilling concerts, conferences, and festivals. Select your favourite seats interactively and secure tickets with instant confirmation.
              </p>
              <div className="d-flex justify-content-center gap-3">
                <Link to="/events" className="btn btn-primary btn-lg px-4 py-3 fw-semibold">
                  <i className="bi bi-compass me-2"></i>Explore Events
                </Link>
                <Link to="/register" className="btn btn-outline-light btn-lg px-4 py-3 fw-semibold">
                  <i className="bi bi-person-plus me-2"></i>Join Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-5 bg-light">
        <div className="container py-4">
          <div className="text-center mb-5">
            <h2 className="fw-bold">Platform Built for Everyone</h2>
            <p className="text-muted">From casual attendees to large festival organizers</p>
          </div>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm p-4 text-center">
                <div className="fs-1 text-primary mb-3"><i className="bi bi-ticket-detailed"></i></div>
                <h4 className="fw-bold">Tiered Ticketing</h4>
                <p className="text-muted">General Admission, VIP, or Premium passes with real-time stock allocation and zero overselling.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm p-4 text-center">
                <div className="fs-1 text-primary mb-3"><i className="bi bi-grid-3x3-gap"></i></div>
                <h4 className="fw-bold">Interactive Seating</h4>
                <p className="text-muted">Visual seat grid selection so attendees can pick exact sections and rows before booking.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm p-4 text-center">
                <div className="fs-1 text-primary mb-3"><i className="bi bi-graph-up-arrow"></i></div>
                <h4 className="fw-bold">Real-time Analytics</h4>
                <p className="text-muted">In-depth sales breakdowns, revenue timelines, and inventory metrics for event producers.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
