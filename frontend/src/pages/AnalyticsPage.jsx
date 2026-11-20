import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export const AnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/dashboard/')
      .then((res) => setData(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;

  const metrics = data?.metrics || {};

  // Chart 1: Revenue by Event
  const eventLabels = (data?.sales_by_event || []).map((e) => e.event__title);
  const eventRevenues = (data?.sales_by_event || []).map((e) => parseFloat(e.revenue));
  const eventBarData = {
    labels: eventLabels.length > 0 ? eventLabels : ['No events yet'],
    datasets: [
      {
        label: 'Revenue ($)',
        data: eventRevenues.length > 0 ? eventRevenues : [0],
        backgroundColor: 'rgba(13, 110, 253, 0.7)',
      },
    ],
  };

  // Chart 2: Sales by Tier
  const tierLabels = (data?.sales_by_tier || []).map((t) => t.tier);
  const tierTickets = (data?.sales_by_tier || []).map((t) => t.tickets_sold);
  const tierPieData = {
    labels: tierLabels.length > 0 ? tierLabels : ['No tickets sold'],
    datasets: [
      {
        label: 'Tickets Sold',
        data: tierTickets.length > 0 ? tierTickets : [0],
        backgroundColor: ['#0d6efd', '#ffc107', '#198754', '#6c757d'],
      },
    ],
  };

  return (
    <div className="container py-4">
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Sales & Platform Analytics</h2>
        <p className="text-muted">Real-time performance indicators, revenue, and ticket turnover</p>
      </div>

      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card shadow-sm border-0 p-3 bg-primary text-white">
            <span className="small text-uppercase opacity-75">Total Revenue</span>
            <h3 className="fw-bold mt-1 mb-0">${(metrics.total_revenue || 0).toFixed(2)}</h3>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-0 p-3 bg-success text-white">
            <span className="small text-uppercase opacity-75">Tickets Sold</span>
            <h3 className="fw-bold mt-1 mb-0">{metrics.total_tickets_sold || 0}</h3>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-0 p-3 bg-info text-white">
            <span className="small text-uppercase opacity-75">Total Bookings</span>
            <h3 className="fw-bold mt-1 mb-0">{metrics.total_bookings || 0}</h3>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-0 p-3 bg-dark text-white">
            <span className="small text-uppercase opacity-75">Available Tickets</span>
            <h3 className="fw-bold mt-1 mb-0">{metrics.available_tickets || 0}</h3>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="row g-4 mb-4">
        <div className="col-lg-8">
          <div className="card shadow-sm border-0 p-4 h-100">
            <h5 className="fw-bold mb-3">Revenue by Event</h5>
            <Bar data={eventBarData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card shadow-sm border-0 p-4 h-100">
            <h5 className="fw-bold mb-3">Sales by Ticket Tier</h5>
            <Pie data={tierPieData} options={{ responsive: true }} />
          </div>
        </div>
      </div>
    </div>
  );
};
