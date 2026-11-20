# VenueVista – EventPro Ticketing and Venue Management System

A production-quality academic full-stack event ticketing and venue management platform built with Django REST Framework, Supabase PostgreSQL, and React (Vite & Bootstrap 5).

---

## Architecture Overview

```text
venuevis/
├── backend/                  # Django REST Framework Backend
│   ├── apps/
│   │   ├── accounts/         # Custom User, Auth, JWT Blacklist, Roles
│   │   ├── events/           # Event Creation, Filters, Permissions
│   │   ├── tickets/          # Tiered Ticket Inventories & Quantities
│   │   ├── seating/          # Sections, Rows, Seats & Generator
│   │   ├── bookings/         # Concurrency-Safe Bookings & Seat Allocation
│   │   └── analytics/        # ORM Sales & Revenue Aggregations
│   ├── config/               # Settings, URLs, WSGI, ASGI
│   ├── pytest.ini            # Pytest configuration
│   └── requirements.txt      # Python dependencies
│
└── frontend/                 # React 19 + Vite Frontend
    ├── src/
    │   ├── api/axios.js      # Centralized Axios with JWT Auto-Refresh
    │   ├── context/          # AuthContext (Login, Register, Logout)
    │   ├── components/       # Navbar, ProtectedRoute
    │   └── pages/            # 11 Dedicated Pages for 4 User Roles
    ├── package.json
    └── vite.config.js
```

---

## Features Implemented

1. **Four User Roles**:
   - `ADMIN`: Global oversight, user administration, and system metrics.
   - `PRODUCER`: Create & edit events, manage ticket inventory, seating sections, and view sales reports.
   - `CONTENT_MANAGER`: Manage event details, ticket information, and seating layouts.
   - `ATTENDEE`: Browse/filter events, pick tickets, interactively select available seats, and manage bookings.

2. **Backend Authentication & Security**:
   - User registration (strictly defaults to `ATTENDEE`).
   - Email + Password login using custom authentication backend.
   - SimpleJWT authentication with access and refresh tokens.
   - Token blacklisting on logout.
   - Role-based DRF permission classes (`IsAdminUserRole`, `IsProducerUserRole`, `IsContentManagerUserRole`, `IsAttendeeUserRole`).

3. **Event Management**:
   - Categories: `CONCERT`, `CONFERENCE`, `THEATER`, `SPORTS`, `WORKSHOP`, `OTHER`.
   - Statuses: `DRAFT`, `PUBLISHED`, `CANCELLED`, `COMPLETED`.
   - Date validation (`end_time > start_time`) and capacity validation.
   - Public attendees only see published events; producers can view their drafts.

4. **Ticket Inventory Management**:
   - Tiers: `GENERAL`, `VIP`, `PREMIUM`.
   - Concurrency-safe stock updates.
   - Validation ensuring sum of ticket allocations never exceeds event capacity.

5. **Interactive Seating Management**:
   - Configurable seating sections (e.g., Orchestra, Balcony, VIP Box).
   - Batch seat generation by row and number.
   - Status tracking (`AVAILABLE`, `RESERVED`, `BOOKED`).
   - Prevents double-booking same seat across concurrent transactions.

6. **Booking Management**:
   - Unique reference codes generated automatically (e.g. `VV-A1B2C3D4`).
   - `select_for_update` database row locks to prevent race conditions.
   - Booking cancellation endpoint releasing ticket stock and restoring seat status.

7. **Sales & Analytics**:
   - Key metrics: Total events, total bookings, tickets sold, gross revenue, and available capacity.
   - Breakdowns: Sales by event, sales by ticket tier, and revenue over time.
   - Visualized with Chart.js on the frontend.

---

## How to Run the Application

### 1. Backend Server

```bash
cd backend

# Ensure virtual environment is active and dependencies installed:
pip install -r requirements.txt

# Run migrations (already applied to Supabase):
python manage.py migrate

# Start the Django development server:
python manage.py runserver 8000
```
Backend will be available at: `http://127.0.0.1:8000/`
Django Admin: `http://127.0.0.1:8000/admin/`

### 2. Frontend Development Server

```bash
cd frontend

# Install dependencies (already installed):
npm install

# Start Vite dev server:
npm run dev
```
Frontend will be accessible at: `http://localhost:5173/`

### 3. Running Backend Tests

```bash
cd backend
pytest
```
All unit tests execute against the configured test database.
