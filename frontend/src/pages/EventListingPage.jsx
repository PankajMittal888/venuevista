import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export const EventListingPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [timeFrame, setTimeFrame] = useState('');

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (category) params.category = category;
      if (timeFrame) params.time_frame = timeFrame;

      const res = await api.get('/events/', { params });
      setEvents(res.data.results || res.data);
    } catch (err) {
      console.error('Failed to load events', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [category, timeFrame]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchEvents();
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Discover Events</h2>
          <p className="text-muted">Browse upcoming concerts, shows, and conferences</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card shadow-sm border-0 p-3 mb-4">
        <form onSubmit={handleSearchSubmit} className="row g-3 align-items-center">
          <div className="col-md-5">
            <div className="input-group">
              <span className="input-group-text bg-light"><i className="bi bi-search"></i></span>
              <input
                type="text"
                className="form-control"
                placeholder="Search event, venue, or artist..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-3">
            <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">All Categories</option>
              <option value="CONCERT">Concert</option>
              <option value="CONFERENCE">Conference</option>
              <option value="THEATER">Theater</option>
              <option value="SPORTS">Sports</option>
              <option value="WORKSHOP">Workshop</option>
            </select>
          </div>
          <div className="col-md-2">
            <select className="form-select" value={timeFrame} onChange={(e) => setTimeFrame(e.target.value)}>
              <option value="">All Dates</option>
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
            </select>
          </div>
          <div className="col-md-2">
            <button type="submit" className="btn btn-primary w-100">Filter</button>
          </div>
        </form>
      </div>

      {/* Event Cards */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      ) : events.length === 0 ? (
        <div className="card text-center p-5 border-0 shadow-sm">
          <i className="bi bi-calendar-x fs-1 text-muted mb-3"></i>
          <h4>No Events Found</h4>
          <p className="text-muted">Try adjusting your filters or search keywords.</p>
        </div>
      ) : (
        <div className="row g-4">
          {events.map((event) => (
            <div key={event.id} className="col-md-6 col-lg-4">
              <div className="card h-100 shadow-sm border-0 overflow-hidden">
                <div
                  style={{
                    height: '180px',
                    backgroundColor: '#e9ecef',
                    backgroundImage: event.image_url ? `url(${event.image_url})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {!event.image_url && <i className="bi bi-image fs-1 text-muted"></i>}
                </div>
                <div className="card-body d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle">
                      {event.category}
                    </span>
                    <span className="text-muted small">
                      <i className="bi bi-people me-1"></i>Cap: {event.capacity}
                    </span>
                  </div>
                  <h5 className="card-title fw-bold mb-2">{event.title}</h5>
                  <p className="card-text text-muted small mb-3 flex-grow-1">
                    {event.description ? event.description.slice(0, 100) + '...' : 'No description provided.'}
                  </p>
                  <div className="text-muted small mb-3">
                    <div><i className="bi bi-geo-alt me-1 text-danger"></i>{event.venue}</div>
                    <div><i className="bi bi-calendar-event me-1 text-primary"></i>{new Date(event.start_time).toLocaleString()}</div>
                  </div>
                  <Link to={`/events/${event.id}`} className="btn btn-outline-primary w-100 mt-auto">
                    View & Book Tickets
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
