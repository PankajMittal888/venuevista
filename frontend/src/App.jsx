import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { EventListingPage } from './pages/EventListingPage';
import { EventDetailsPage } from './pages/EventDetailsPage';
import { BookingConfirmationPage } from './pages/BookingConfirmationPage';
import { MyBookingsPage } from './pages/MyBookingsPage';
import { ProfilePage } from './pages/ProfilePage';
import { ManageEventsPage } from './pages/ManageEventsPage';
import { CreateEventPage } from './pages/CreateEventPage';
import { ManageTicketsPage } from './pages/ManageTicketsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="d-flex flex-column min-vh-100 bg-light">
          <Navbar />
          <main className="flex-grow-1">
            <Routes>
              {/* Public */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/events" element={<EventListingPage />} />
              <Route path="/events/:id" element={<EventDetailsPage />} />

              {/* Attendee Protected */}
              <Route
                path="/my-bookings"
                element={
                  <ProtectedRoute allowedRoles={['ATTENDEE', 'PRODUCER', 'ADMIN', 'CONTENT_MANAGER']}>
                    <MyBookingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/booking-confirmation/:id"
                element={
                  <ProtectedRoute allowedRoles={['ATTENDEE', 'PRODUCER', 'ADMIN', 'CONTENT_MANAGER']}>
                    <BookingConfirmationPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute allowedRoles={['ATTENDEE', 'PRODUCER', 'ADMIN', 'CONTENT_MANAGER']}>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Producer & Staff Protected */}
              <Route
                path="/producer/events"
                element={
                  <ProtectedRoute allowedRoles={['PRODUCER', 'CONTENT_MANAGER', 'ADMIN']}>
                    <ManageEventsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/producer/events/create"
                element={
                  <ProtectedRoute allowedRoles={['PRODUCER', 'CONTENT_MANAGER', 'ADMIN']}>
                    <CreateEventPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/producer/events/:eventId/tickets"
                element={
                  <ProtectedRoute allowedRoles={['PRODUCER', 'CONTENT_MANAGER', 'ADMIN']}>
                    <ManageTicketsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute allowedRoles={['PRODUCER', 'ADMIN']}>
                    <AnalyticsPage />
                  </ProtectedRoute>
                }
              />

              {/* Admin Protected */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <footer className="bg-dark text-muted py-4 mt-auto border-top border-secondary">
            <div className="container text-center small">
              <p className="mb-0 text-white-50">© 2026 VenueVista – EventPro Ticketing and Venue Management System.</p>
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
