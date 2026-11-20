import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow-sm">
      <div className="container">
        <Link className="navbar-brand fw-bold text-primary fs-3 d-flex align-items-center gap-2" to="/">
          <i className="bi bi-ticket-perforated-fill text-primary"></i>
          <span className="text-white">Venue</span><span className="text-primary">Vista</span>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink className="nav-link" to="/">Home</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/events">Events</NavLink>
            </li>
            {isAuthenticated && user?.role === 'ATTENDEE' && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/my-bookings">My Bookings</NavLink>
              </li>
            )}
            {isAuthenticated && (user?.role === 'PRODUCER' || user?.role === 'ADMIN' || user?.role === 'CONTENT_MANAGER') && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/producer/events">Manage Events</NavLink>
              </li>
            )}
            {isAuthenticated && (user?.role === 'PRODUCER' || user?.role === 'ADMIN') && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/analytics">Analytics</NavLink>
              </li>
            )}
            {isAuthenticated && user?.role === 'ADMIN' && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/admin/dashboard">Admin Panel</NavLink>
              </li>
            )}
          </ul>

          <ul className="navbar-nav ms-auto align-items-center">
            {isAuthenticated ? (
              <li className="nav-item dropdown">
                <div className="d-flex align-items-center gap-3">
                  <span className="badge bg-secondary rounded-pill px-3 py-2">
                    {user?.role}
                  </span>
                  <Link to="/profile" className="text-light text-decoration-none fw-semibold">
                    <i className="bi bi-person-circle me-1"></i>
                    {user?.username}
                  </Link>
                  <button onClick={handleLogout} className="btn btn-outline-danger btn-sm">
                    <i className="bi bi-box-arrow-right me-1"></i>Logout
                  </button>
                </div>
              </li>
            ) : (
              <div className="d-flex gap-2">
                <Link to="/login" className="btn btn-outline-light btn-sm px-3">Login</Link>
                <Link to="/register" className="btn btn-primary btn-sm px-3">Register</Link>
              </div>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};
