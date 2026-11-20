import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';

export const ManageTicketsPage = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  // New ticket form
  const [newTicket, setNewTicket] = useState({
    name: 'General Admission',
    tier: 'GENERAL',
    price: '25.00',
    total_quantity: 50,
  });

  // New section & seats form
  const [newSection, setNewSection] = useState({
    name: 'Main Floor',
    description: 'Ground area',
    rows: 'A,B,C',
    seats_per_row: 10,
  });

  const fetchData = async () => {
    try {
      const [evRes, tkRes, secRes] = await Promise.all([
        api.get(`/events/${eventId}/`),
        api.get(`/tickets/?event=${eventId}`),
        api.get(`/seating/sections/?event=${eventId}`),
      ]);
      setEvent(evRes.data);
      setTickets(tkRes.data.results || tkRes.data);
      setSections(secRes.data.results || secRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [eventId]);

  const handleAddTicket = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tickets/', { ...newTicket, event: eventId });
      setNewTicket({ name: '', tier: 'GENERAL', price: '20.00', total_quantity: 20 });
      fetchData();
    } catch (err) {
      alert(JSON.stringify(err.response?.data || 'Failed to add ticket tier'));
    }
  };

  const handleAddSection = async (e) => {
    e.preventDefault();
    try {
      // 1. Create section
      const secRes = await api.post('/seating/sections/', {
        event: eventId,
        name: newSection.name,
        description: newSection.description,
      });

      // 2. Generate seats
      const rowsArray = newSection.rows.split(',').map((r) => r.trim()).filter(Boolean);
      await api.post(`/seating/sections/${secRes.data.id}/generate-seats/`, {
        rows: rowsArray,
        seats_per_row: parseInt(newSection.seats_per_row),
      });

      fetchData();
      alert(`Created section ${newSection.name} with seats.`);
    } catch (err) {
      alert(JSON.stringify(err.response?.data || 'Failed to create section & seats'));
    }
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="container py-4">
      <div className="mb-4">
        <Link to="/producer/events" className="text-decoration-none text-muted mb-2 d-inline-block">
          <i className="bi bi-arrow-left me-1"></i> Back to Events
        </Link>
        <h2 className="fw-bold">{event?.title}: Inventory & Seating</h2>
        <p className="text-muted">Total Event Capacity: <strong>{event?.capacity}</strong></p>
      </div>

      <div className="row g-4">
        {/* Ticket Management */}
        <div className="col-lg-6">
          <div className="card shadow-sm border-0 p-4 h-100">
            <h4 className="fw-bold mb-3">Ticket Types & Pricing</h4>

            <form onSubmit={handleAddTicket} className="bg-light p-3 rounded mb-4">
              <h6 className="fw-bold mb-3">Add Ticket Tier</h6>
              <div className="mb-2">
                <input
                  type="text"
                  placeholder="Ticket Name (e.g. VIP Pass)"
                  className="form-control form-control-sm"
                  required
                  value={newTicket.name}
                  onChange={(e) => setNewTicket({ ...newTicket, name: e.target.value })}
                />
              </div>
              <div className="row g-2 mb-2">
                <div className="col-4">
                  <select
                    className="form-select form-select-sm"
                    value={newTicket.tier}
                    onChange={(e) => setNewTicket({ ...newTicket, tier: e.target.value })}
                  >
                    <option value="GENERAL">General</option>
                    <option value="VIP">VIP</option>
                    <option value="PREMIUM">Premium</option>
                  </select>
                </div>
                <div className="col-4">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Price ($)"
                    className="form-control form-control-sm"
                    required
                    value={newTicket.price}
                    onChange={(e) => setNewTicket({ ...newTicket, price: e.target.value })}
                  />
                </div>
                <div className="col-4">
                  <input
                    type="number"
                    placeholder="Total Qty"
                    className="form-control form-control-sm"
                    required
                    value={newTicket.total_quantity}
                    onChange={(e) => setNewTicket({ ...newTicket, total_quantity: e.target.value })}
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-sm w-100">Add Ticket Type</button>
            </form>

            <div className="table-responsive">
              <table className="table table-sm align-middle">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Tier</th>
                    <th>Price</th>
                    <th>Sold / Total</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((t) => (
                    <tr key={t.id}>
                      <td className="fw-semibold">{t.name}</td>
                      <td><span className="badge bg-secondary">{t.tier}</span></td>
                      <td>${t.price}</td>
                      <td>{t.sold_quantity} / {t.total_quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Seating Management */}
        <div className="col-lg-6">
          <div className="card shadow-sm border-0 p-4 h-100">
            <h4 className="fw-bold mb-3">Seating Arrangement</h4>

            <form onSubmit={handleAddSection} className="bg-light p-3 rounded mb-4">
              <h6 className="fw-bold mb-3">Add Section & Generate Seats</h6>
              <div className="mb-2">
                <input
                  type="text"
                  placeholder="Section Name (e.g. Balcony Left)"
                  className="form-control form-control-sm"
                  required
                  value={newSection.name}
                  onChange={(e) => setNewSection({ ...newSection, name: e.target.value })}
                />
              </div>
              <div className="row g-2 mb-2">
                <div className="col-6">
                  <input
                    type="text"
                    placeholder="Rows (comma-separated, e.g. A,B,C)"
                    className="form-control form-control-sm"
                    required
                    value={newSection.rows}
                    onChange={(e) => setNewSection({ ...newSection, rows: e.target.value })}
                  />
                </div>
                <div className="col-6">
                  <input
                    type="number"
                    placeholder="Seats per row"
                    className="form-control form-control-sm"
                    required
                    value={newSection.seats_per_row}
                    onChange={(e) => setNewSection({ ...newSection, seats_per_row: e.target.value })}
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-sm w-100">Generate Seating Section</button>
            </form>

            <div>
              <h6 className="fw-bold mb-2">Current Sections:</h6>
              {sections.length === 0 ? (
                <p className="text-muted small">No sections created yet. General admission will apply by default.</p>
              ) : (
                sections.map((s) => (
                  <div key={s.id} className="border p-2 rounded mb-2 d-flex justify-content-between align-items-center">
                    <div>
                      <strong>{s.name}</strong>
                      <span className="text-muted small ms-2">({s.total_seats} total seats, {s.available_seats} available)</span>
                    </div>
                    <span className="badge bg-success">Configured</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
