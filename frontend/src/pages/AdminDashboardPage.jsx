import React, { useState, useEffect } from 'react';
import api from '../api/axios';

export const AdminDashboardPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/dashboard/')
      .then((res) => setAnalytics(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;

  const metrics = analytics?.metrics || {};

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Platform Administration</h2>
          <p className="text-muted">Global oversight across events, bookings, and platform activity</p>
        </div>
        <a href="http://127.0.0.1:8000/admin/" target="_blank" rel="noreferrer" className="btn btn-outline-dark">
          <i className="bi bi-shield-lock me-1"></i> Open Django Admin
        </a>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="card shadow-sm border-0 p-4">
            <h6 className="text-muted text-uppercase small">Total Live Events</h6>
            <h2 className="fw-bold text-primary">{metrics.total_events || 0}</h2>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm border-0 p-4">
            <h6 className="text-muted text-uppercase small">Total Platform Bookings</h6>
            <h2 className="fw-bold text-success">{metrics.total_bookings || 0}</h2>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm border-0 p-4">
            <h6 className="text-muted text-uppercase small">Gross Platform Sales</h6>
            <h2 className="fw-bold text-dark">${(metrics.total_revenue || 0).toFixed(2)}</h2>
          </div>
        </div>
      </div>

      <div className="card shadow-sm border-0 p-4">
        <h5 className="fw-bold mb-3">Recent Event Performance</h5>
        <div className="table-responsive">
          <table className="table align-middle">
            <thead className="table-light">
              <tr>
                <th>Event Title</th>
                <th>Total Bookings</th>
                <th>Tickets Sold</th>
                <th>Gross Revenue</th>
              </tr>
            </thead>
            <tbody>
              {(analytics?.sales_by_event || []).map((e) => (
                <tr key={e.event_id}>
                  <td className="fw-semibold">{e.event__title}</td>
                  <td>{e.bookings_count}</td>
                  <td>{e.tickets_sold}</td>
                  <td className="fw-bold text-primary">${parseFloat(e.revenue).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
