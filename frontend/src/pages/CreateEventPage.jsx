import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export const CreateEventPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'CONCERT',
    venue: '',
    address: '',
    start_time: '',
    end_time: '',
    capacity: 100,
    status: 'PUBLISHED',
    image_url: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/events/', formData);
      navigate('/producer/events');
    } catch (err) {
      setError(JSON.stringify(err.response?.data || 'Failed to create event.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow-sm border-0 p-4">
            <h3 className="fw-bold mb-4">Create New Event</h3>

            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold">Event Title</label>
                <input
                  type="text"
                  name="title"
                  className="form-control"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Summer Rock Fest"
                />
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Category</label>
                  <select name="category" className="form-select" value={formData.category} onChange={handleChange}>
                    <option value="CONCERT">Concert</option>
                    <option value="CONFERENCE">Conference</option>
                    <option value="THEATER">Theater</option>
                    <option value="SPORTS">Sports</option>
                    <option value="WORKSHOP">Workshop</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Status</label>
                  <select name="status" className="form-select" value={formData.status} onChange={handleChange}>
                    <option value="PUBLISHED">Published</option>
                    <option value="DRAFT">Draft</option>
                  </select>
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Venue Name</label>
                  <input
                    type="text"
                    name="venue"
                    className="form-control"
                    required
                    value={formData.venue}
                    onChange={handleChange}
                    placeholder="Grand Arena"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Address / Location</label>
                  <input
                    type="text"
                    name="address"
                    className="form-control"
                    required
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="123 Music Ave, Metro City"
                  />
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Start Time</label>
                  <input
                    type="datetime-local"
                    name="start_time"
                    className="form-control"
                    required
                    value={formData.start_time}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">End Time</label>
                  <input
                    type="datetime-local"
                    name="end_time"
                    className="form-control"
                    required
                    value={formData.end_time}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Total Capacity</label>
                  <input
                    type="number"
                    name="capacity"
                    min="1"
                    className="form-control"
                    required
                    value={formData.capacity}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Banner Image URL (Optional)</label>
                  <input
                    type="url"
                    name="image_url"
                    className="form-control"
                    value={formData.image_url}
                    onChange={handleChange}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold">Description</label>
                <textarea
                  name="description"
                  rows="4"
                  className="form-control"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Provide event details, schedule, or lineup..."
                ></textarea>
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button type="button" onClick={() => navigate(-1)} className="btn btn-outline-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
