import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';
import {
  BookOpen,
  Users,
  UserCheck,
  UserX,
  BookMarked,
  AlertTriangle,
  IndianRupee,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch admin stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading dynamic dashboard metrics..." />;
  }

  const stats = data?.stats || {};
  const recentMembers = data?.recentMembers || [];
  const recentlyBorrowed = data?.recentlyBorrowed || [];
  const recentlyReturned = data?.recentlyReturned || [];
  const overdueAlerts = data?.overdueAlerts || [];
  const monthlyPayments = data?.monthlyPayments || [];

  return (
    <div className="fade-in">
      {/* 8 Dynamic Stat Cards */}
      <div className="stat-card-grid">
        <StatCard
          title="Total Books"
          value={stats.totalBooks || 0}
          subtext="Catalog inventory titles"
          icon={BookOpen}
          colorScheme="blue"
          onClick={() => navigate('/admin/books')}
        />
        <StatCard
          title="Registered Members"
          value={stats.totalRegisteredMembers || 0}
          subtext="Students & faculty"
          icon={Users}
          colorScheme="indigo"
          onClick={() => navigate('/admin/members')}
        />
        <StatCard
          title="Active Memberships"
          value={stats.activeMemberships || 0}
          subtext="Valid library cards"
          icon={UserCheck}
          colorScheme="emerald"
          onClick={() => navigate('/admin/members?status=Active')}
        />
        <StatCard
          title="Expired Memberships"
          value={stats.expiredMemberships || 0}
          subtext="Requires renewal"
          icon={UserX}
          colorScheme="rose"
          onClick={() => navigate('/admin/members?status=Expired')}
        />
        <StatCard
          title="Currently Borrowed"
          value={stats.currentlyBorrowedBooks || 0}
          subtext="In active circulation"
          icon={BookMarked}
          colorScheme="blue"
          onClick={() => navigate('/admin/borrow?status=Issued')}
        />
        <StatCard
          title="Overdue Books"
          value={stats.overdueBooks || 0}
          subtext="Passed due return date"
          icon={AlertTriangle}
          colorScheme="rose"
          onClick={() => navigate('/admin/reminders')}
        />
        <StatCard
          title="Pending Fines"
          value={`₹${stats.totalPendingFines || 0}`}
          subtext="Unpaid overdue dues"
          icon={IndianRupee}
          colorScheme="amber"
          onClick={() => navigate('/admin/fines?status=Pending')}
        />
        <StatCard
          title="Fine Collections"
          value={`₹${stats.totalCollectedPayments || 0}`}
          subtext="Total revenue received"
          icon={CheckCircle2}
          colorScheme="emerald"
          onClick={() => navigate('/admin/payments')}
        />
      </div>

      {/* Row 1: Overdue Alerts & Monthly Collection */}
      <div className="dashboard-grid-2">
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <div className="dashboard-card-title">
              <AlertTriangle size={18} color="var(--danger)" /> Overdue Circulation Alerts
            </div>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => navigate('/admin/reminders')}
            >
              View Reminders <ArrowRight size={14} />
            </button>
          </div>

          {overdueAlerts.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No overdue items at the moment. All circulating books are on track!
            </p>
          ) : (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Student Member</th>
                    <th>Book Title</th>
                    <th>Due Date</th>
                    <th>Contact</th>
                  </tr>
                </thead>
                <tbody>
                  {overdueAlerts.map((rec) => (
                    <tr key={rec._id}>
                      <td>
                        <strong>{rec.member?.fullName}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {rec.member?.memberId}
                        </div>
                      </td>
                      <td>{rec.book?.title}</td>
                      <td>
                        <span className="badge badge-overdue">
                          {new Date(rec.dueDate).toLocaleDateString()}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8rem' }}>{rec.member?.phone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <div className="dashboard-card-title">
              <TrendingUp size={18} color="var(--primary-600)" /> Fine Collection Summary
            </div>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => navigate('/admin/payments')}
            >
              All Payments <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Total Historical Fines Collected
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#166534' }}>
              ₹{stats.totalCollectedPayments || 0}
            </div>
          </div>

          {monthlyPayments.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No monthly transactions recorded yet.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {monthlyPayments.map((m, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    backgroundColor: '#f8fafc',
                    borderRadius: 8,
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                    Month {m._id.month}/{m._id.year}
                  </span>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontWeight: 700, color: '#166534' }}>₹{m.totalAmount}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 8 }}>
                      ({m.count} txns)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Recent Borrowings & Returns */}
      <div className="dashboard-grid-2">
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <div className="dashboard-card-title">
              <BookMarked size={18} color="var(--primary-600)" /> Recently Borrowed Books
            </div>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => navigate('/admin/borrow')}
            >
              All Records <ArrowRight size={14} />
            </button>
          </div>

          {recentlyBorrowed.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No borrow records yet.</p>
          ) : (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Book</th>
                    <th>Borrower</th>
                    <th>Issue Date</th>
                    <th>Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentlyBorrowed.map((rec) => (
                    <tr key={rec._id}>
                      <td>
                        <strong>{rec.book?.title}</strong>
                      </td>
                      <td>{rec.member?.fullName}</td>
                      <td>{new Date(rec.issueDate).toLocaleDateString()}</td>
                      <td>
                        <span className="badge badge-issued">
                          {new Date(rec.dueDate).toLocaleDateString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <div className="dashboard-card-title">
              <CheckCircle2 size={18} color="var(--success)" /> Recently Returned Books
            </div>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => navigate('/admin/borrow?status=Returned')}
            >
              View All <ArrowRight size={14} />
            </button>
          </div>

          {recentlyReturned.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No return records yet.</p>
          ) : (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Book</th>
                    <th>Returned By</th>
                    <th>Return Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentlyReturned.map((rec) => (
                    <tr key={rec._id}>
                      <td>
                        <strong>{rec.book?.title}</strong>
                      </td>
                      <td>{rec.member?.fullName}</td>
                      <td>{new Date(rec.returnDate).toLocaleDateString()}</td>
                      <td>
                        <span className="badge badge-returned">Returned</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Row 3: Recent Member Registrations */}
      <div className="dashboard-card">
        <div className="dashboard-card-header">
          <div className="dashboard-card-title">
            <Users size={18} color="var(--primary-600)" /> Recent Membership Registrations
          </div>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => navigate('/admin/members')}
          >
            Manage Members <ArrowRight size={14} />
          </button>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Member ID</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Plan</th>
                <th>Registered On</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentMembers.map((m) => (
                <tr key={m._id}>
                  <td>
                    <strong>{m.memberId}</strong>
                  </td>
                  <td>{m.fullName}</td>
                  <td>{m.email}</td>
                  <td>
                    <span className="badge badge-info">{m.plan}</span>
                  </td>
                  <td>{new Date(m.createdAt).toLocaleDateString()}</td>
                  <td>
                    <span
                      className={`badge ${
                        m.status === 'Active'
                          ? 'badge-active'
                          : m.status === 'Expired'
                          ? 'badge-expired'
                          : 'badge-suspended'
                      }`}
                    >
                      {m.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
