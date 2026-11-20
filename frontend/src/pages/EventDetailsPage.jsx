import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export const EventDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [event, setEvent] = useState(null);
  const [ticketTypes, setTicketTypes] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const [eventRes, ticketsRes, sectionsRes] = await Promise.all([
          api.get(`/events/${id}/`),
          api.get(`/tickets/?event=${id}`),
          api.get(`/seating/sections/?event=${id}`),
        ]);
        setEvent(eventRes.data);
        const tickets = ticketsRes.data.results || ticketsRes.data;
        setTicketTypes(tickets);
        if (tickets.length > 0) setSelectedTicket(tickets[0]);
        setSections(sectionsRes.data.results || sectionsRes.data);
      } catch (err) {
        setError('Failed to load event information.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const handleSeatToggle = (seat) => {
    if (seat.status !== 'AVAILABLE') return;
    if (selectedSeats.some((s) => s.id === seat.id)) {
      setSelectedSeats(selectedSeats.filter((s) => s.id !== seat.id));
    } else {
      if (selectedSeats.length >= quantity) {
        alert(`You have already selected ${quantity} seat(s) matching your ticket quantity.`);
        return;
      }
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const handleBooking = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!selectedTicket) {
      alert('Please select a ticket type.');
      return;
    }

    const hasSeating = sections.some((sec) => sec.seats && sec.seats.length > 0);
    if (hasSeating && selectedSeats.length !== quantity) {
      alert(`Please select ${quantity} seat(s) from the seating layout.`);
      return;
    }

    setBookingLoading(true);
    setError('');
    try {
      const payload = {
        event: event.id,
        ticket_type: selectedTicket.id,
        quantity: parseInt(quantity),
        seat_ids: selectedSeats.map((s) => s.id),
      };
      const res = await api.post('/bookings/', payload);
      navigate(`/booking-confirmation/${res.data.id}`, { state: { booking: res.data } });
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.seat_ids || 'Failed to complete booking.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container py-5 text-center">
        <h3>Event Not Found</h3>
      </div>
    );
  }

  const hasSeating = sections.some((sec) => sec.seats && sec.seats.length > 0);

  return (
    <div className="container py-4">
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-4">
        {/* Left Column: Event Details & Seating */}
        <div className="col-lg-8">
          <div className="card shadow-sm border-0 p-4 mb-4">
            <span className="badge bg-primary mb-2 align-self-start">{event.category}</span>
            <h2 className="fw-bold mb-3">{event.title}</h2>
            <div className="text-muted mb-4 d-flex flex-wrap gap-4">
              <div><i className="bi bi-geo-alt-fill text-danger me-1"></i><strong>Venue:</strong> {event.venue}, {event.address}</div>
              <div><i className="bi bi-calendar3 text-primary me-1"></i><strong>Date:</strong> {new Date(event.start_time).toLocaleString()}</div>
            </div>
            <h5 className="fw-bold">About This Event</h5>
            <p className="text-secondary">{event.description || 'No detailed description available.'}</p>
          </div>

          {/* Interactive Seating Layout if exists */}
          {hasSeating && (
            <div className="card shadow-sm border-0 p-4">
              <h4 className="fw-bold mb-3">Choose Your Seats</h4>
              <p className="text-muted small mb-4">
                Click on available seats to pick your row and seat number ({selectedSeats.length}/{quantity} selected).
              </p>

              <div className="d-flex justify-content-center gap-4 mb-4">
                <span className="small"><span className="badge bg-success me-1">●</span> Available</span>
                <span className="small"><span className="badge bg-primary me-1">●</span> Selected</span>
                <span className="small"><span className="badge bg-secondary me-1">●</span> Booked</span>
              </div>

              {sections.map((section) => (
                <div key={section.id} className="mb-4">
                  <h6 className="fw-bold text-center bg-light py-2 rounded">Section: {section.name}</h6>
                  <div className="d-flex flex-wrap justify-content-center gap-2 py-3">
                    {section.seats?.map((seat) => {
                      const isSelected = selectedSeats.some((s) => s.id === seat.id);
                      let btnClass = 'btn-outline-success';
                      if (seat.status === 'BOOKED') btnClass = 'btn-secondary disabled';
                      else if (isSelected) btnClass = 'btn-primary';

                      return (
                        <button
                          key={seat.id}
                          type="button"
                          className={`btn btn-sm ${btnClass}`}
                          style={{ width: '48px', height: '48px' }}
                          onClick={() => handleSeatToggle(seat)}
                          disabled={seat.status !== 'AVAILABLE'}
                        >
                          <small className="d-block text-truncate" style={{ fontSize: '10px' }}>R{seat.row}</small>
                          <strong>{seat.seat_number}</strong>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Ticket Selection & Checkout */}
        <div className="col-lg-4">
          <div className="card shadow-sm border-0 p-4 sticky-top" style={{ top: '80px' }}>
            <h4 className="fw-bold mb-3">Select Tickets</h4>

            {ticketTypes.length === 0 ? (
              <div className="alert alert-warning">No ticket types available yet for this event.</div>
            ) : (
              <div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Ticket Type</label>
                  <select
                    className="form-select"
                    value={selectedTicket?.id || ''}
                    onChange={(e) => {
                      const t = ticketTypes.find((x) => x.id === parseInt(e.target.value));
                      setSelectedTicket(t);
                    }}
                  >
                    {ticketTypes.map((t) => (
                      <option key={t.id} value={t.id} disabled={t.available_quantity === 0}>
                        {t.name} (${t.price}) - {t.available_quantity} available
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    max={selectedTicket?.available_quantity || 1}
                    className="form-control"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  />
                </div>

                <hr />

                <div className="d-flex justify-content-between mb-2">
                  <span>Price per ticket</span>
                  <span className="fw-semibold">${selectedTicket?.price || '0.00'}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Quantity</span>
                  <span className="fw-semibold">× {quantity}</span>
                </div>
                <div className="d-flex justify-content-between fs-5 fw-bold text-primary mb-4">
                  <span>Total Due</span>
                  <span>${((parseFloat(selectedTicket?.price || 0) * quantity) || 0).toFixed(2)}</span>
                </div>

                <button
                  className="btn btn-primary w-100 py-3 fw-bold"
                  onClick={handleBooking}
                  disabled={bookingLoading || !selectedTicket || selectedTicket.available_quantity === 0}
                >
                  {bookingLoading ? (
                    <span className="spinner-border spinner-border-sm me-2"></span>
                  ) : (
                    'Confirm Demo Booking'
                  )}
                </button>
                <p className="text-center text-muted small mt-2">
                  Demo mode: Instant booking without live payment gateway.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
