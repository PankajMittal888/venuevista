import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [phone, setPhone] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/auth/profile/')
      .then((res) => {
        setProfile(res.data);
        setPhone(res.data.phone || '');
        setFirstName(res.data.first_name || '');
        setLastName(res.data.last_name || '');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await api.put('/auth/profile/', {
        phone,
        first_name: firstName,
        last_name: lastName,
      });
      setProfile(res.data);
      setMessage('Profile updated successfully.');
    } catch (err) {
      setMessage('Failed to update profile.');
    }
  };

  if (loading) {
    return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-sm border-0 p-4">
            <h3 className="fw-bold mb-4">User Profile</h3>

            {message && <div className="alert alert-info py-2">{message}</div>}

            <form onSubmit={handleUpdate}>
              <div className="mb-3">
                <label className="form-label text-muted small">Username</label>
                <input type="text" className="form-control bg-light" value={profile?.username || ''} disabled />
              </div>
              <div className="mb-3">
                <label className="form-label text-muted small">Email</label>
                <input type="email" className="form-control bg-light" value={profile?.email || ''} disabled />
              </div>
              <div className="mb-3">
                <label className="form-label text-muted small">Role</label>
                <div>
                  <span className="badge bg-primary fs-6">{profile?.role}</span>
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-6">
                  <label className="form-label fw-semibold">First Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label fw-semibold">Last Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold">Phone</label>
                <input
                  type="text"
                  className="form-control"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary w-100 py-2">
                Save Changes
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
