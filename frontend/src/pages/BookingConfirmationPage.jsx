import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import api from '../api/axios';

export const BookingConfirmationPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const [booking, setBooking] = useState(location.state?.booking || null);
  const [loading, setLoading] = useState(!booking);

  useEffect(() => {
    if (!booking) {
      api.get(`/bookings/${id}/`)
        .then((res) => setBooking(res.data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [id, booking]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container py-5 text-center">
        <h4>Booking not found.</h4>
        <Link to="/events" className="btn btn-primary mt-3">Browse Events</Link>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-7">
          <div className="card shadow-sm border-0 text-center p-4">
            <div className="text-success display-3 mb-3">
              <i className="bi bi-check-circle-fill"></i>
            </div>
            <h2 className="fw-bold mb-2">Booking Confirmed!</h2>
            <p className="text-muted mb-4">Your tickets are secured under reference below.</p>

            <div className="bg-light p-3 rounded mb-4">
              <span className="text-muted small text-uppercase fw-semibold d-block">Booking Reference</span>
              <span className="fs-3 fw-bold text-primary font-monospace">{booking.booking_reference}</span>
            </div>

            <div className="text-start mb-4">
              <div className="d-flex justify-content-between py-2 border-bottom">
                <span className="text-muted">Event</span>
                <span className="fw-semibold">{booking.event_title}</span>
              </div>
              <div className="d-flex justify-content-between py-2 border-bottom">
                <span className="text-muted">Ticket Tier</span>
                <span className="fw-semibold">{booking.ticket_type_name}</span>
              </div>
              <div className="d-flex justify-content-between py-2 border-bottom">
                <span className="text-muted">Quantity</span>
                <span className="fw-semibold">{booking.quantity}</span>
              </div>
              <div className="d-flex justify-content-between py-2 border-bottom">
                <span className="text-muted">Status</span>
                <span className="badge bg-success">{booking.status}</span>
              </div>
              {booking.booking_seats && booking.booking_seats.length > 0 && (
                <div className="d-flex justify-content-between py-2 border-bottom">
                  <span className="text-muted">Assigned Seats</span>
                  <span className="fw-semibold">
                    {booking.booking_seats.map((s) => `${s.section_name} R${s.row}-S${s.seat_number}`).join(', ')}
                  </span>
                </div>
              )}
              <div className="d-flex justify-content-between py-2 fs-5 fw-bold text-dark">
                <span>Total Amount</span>
                <span>${booking.total_amount}</span>
              </div>
            </div>

            <div className="d-flex gap-3 justify-content-center">
              <Link to="/my-bookings" className="btn btn-primary px-4">View My Bookings</Link>
              <Link to="/events" className="btn btn-outline-secondary px-4">Discover More</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
