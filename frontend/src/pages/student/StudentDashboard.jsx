import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookMarked,
  Clock,
  AlertTriangle,
  IndianRupee,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';
import api from '../../services/api';
import useToast from '../../hooks/useToast';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import DemoPaymentModal from '../../components/DemoPaymentModal';
import ReceiptModal from '../../components/ReceiptModal';

const StudentDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Payment Modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedFine, setSelectedFine] = useState(null);

  // Receipt Modal
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const navigate = useNavigate();
  const { showToast } = useToast();

  const fetchStudentStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/dashboard/student-stats');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load student stats:', err);
      showToast('Error', 'Failed to retrieve your student dashboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentStats();
  }, []);

  const handleOpenPayFine = (fine) => {
    setSelectedFine(fine);
    setIsPaymentModalOpen(true);
  };

  const handleViewReceipt = (payment) => {
    setSelectedReceipt(payment);
    setIsReceiptModalOpen(true);
  };

  if (loading) {
    return <LoadingSpinner text="Loading your library profile and borrowed books..." />;
  }

  const stats = data?.stats || {};
  const borrowedBooks = data?.borrowedBooks || [];
  const fines = data?.fines || [];
  const recentPayments = data?.recentPayments || [];

  const pendingFines = fines.filter((f) => f.status === 'Pending' || f.status === 'Partially Paid');

  return (
    <div className="fade-in">
      {/* Digital Library ID Card Header */}
      <div className="student-id-card">
        <div className="id-card-top">
          <div>
            <div className="id-card-college">Central College Library • Student Pass</div>
            <div className="id-card-title">Digital Library Membership Card</div>
          </div>
          <span
            className={`badge ${
              stats.membershipStatus === 'Active'
                ? 'badge-active'
                : 'badge-expired'
            }`}
            style={{ fontSize: '0.85rem', padding: '6px 14px' }}
          >
            {stats.membershipStatus || 'Active'}
          </span>
        </div>

        <div className="id-card-chip" />
        <div className="id-card-number">{stats.memberId || 'LIB-2026-XXXX'}</div>

        <div className="id-card-bottom">
          <div>
            <div className="id-card-label">Membership Plan</div>
            <div className="id-card-val">{stats.membershipPlan || 'Annual'}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="id-card-label">Valid Thru</div>
            <div className="id-card-val">
              {stats.membershipExpiryDate
                ? new Date(stats.membershipExpiryDate).toLocaleDateString()
                : 'Active'}
            </div>
          </div>
        </div>
      </div>

      {/* Pending Fine Alert Banner */}
      {stats.pendingFineAmount > 0 && (
        <div
          style={{
            backgroundColor: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: 12,
            padding: '16px 20px',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <AlertTriangle size={24} color="#d97706" />
            <div>
              <strong style={{ color: '#92400e', fontSize: '0.95rem' }}>
                You have ₹{stats.pendingFineAmount} in pending library fines!
              </strong>
              <div style={{ fontSize: '0.82rem', color: '#b45309' }}>
                Clear your outstanding dues using our simulated payment gateway to ensure unhindered book borrowing.
              </div>
            </div>
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => handleOpenPayFine(pendingFines[0])}
          >
            <CreditCard size={14} /> Pay ₹{stats.pendingFineAmount} Dues
          </button>
        </div>
      )}

      {/* 5 Dynamic Student Stat Cards */}
      <div className="stat-card-grid">
        <StatCard
          title="Currently Borrowed"
          value={stats.currentlyBorrowedBooks || 0}
          subtext="Books in your possession"
          icon={BookMarked}
          colorScheme="blue"
          onClick={() => navigate('/student/my-books')}
        />
        <StatCard
          title="Due Soon"
          value={stats.upcomingDueDatesCount || 0}
          subtext="Due in ≤ 3 days"
          icon={Clock}
          colorScheme="amber"
          onClick={() => navigate('/student/my-books')}
        />
        <StatCard
          title="Overdue Books"
          value={stats.overdueBooksCount || 0}
          subtext="Late returns accumulating fines"
          icon={AlertTriangle}
          colorScheme="rose"
          onClick={() => navigate('/student/my-books')}
        />
        <StatCard
          title="Pending Dues"
          value={`₹${stats.pendingFineAmount || 0}`}
          subtext="Unpaid overdue fines"
          icon={IndianRupee}
          colorScheme="amber"
          onClick={() => navigate('/student/fines')}
        />
        <StatCard
          title="Total Fine Paid"
          value={`₹${stats.totalFinePaid || 0}`}
          subtext="Historical receipts"
          icon={CheckCircle2}
          colorScheme="emerald"
          onClick={() => navigate('/student/fines')}
        />
      </div>

      {/* Row: Active Borrowed Books */}
      <div className="dashboard-grid-2">
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <div className="dashboard-card-title">
              <BookMarked size={18} color="var(--primary-600)" /> Currently Borrowed Books
            </div>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => navigate('/student/my-books')}
            >
              View All <ArrowRight size={14} />
            </button>
          </div>

          {borrowedBooks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)' }}>
              <BookOpen size={36} color="var(--text-light)" style={{ marginBottom: 8 }} />
              <p style={{ fontSize: '0.9rem' }}>You currently have no borrowed books.</p>
              <button
                className="btn btn-outline btn-sm"
                style={{ marginTop: 12 }}
                onClick={() => navigate('/student/catalog')}
              >
                Browse Library Catalog
              </button>
            </div>
          ) : (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Book</th>
                    <th>Issue Date</th>
                    <th>Due Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {borrowedBooks.map((b) => {
                    const isOverdue = new Date(b.dueDate) < new Date();
                    return (
                      <tr key={b._id}>
                        <td>
                          <strong>{b.book?.title}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            by {b.book?.author}
                          </div>
                        </td>
                        <td>{new Date(b.issueDate).toLocaleDateString()}</td>
                        <td>
                          <strong style={{ color: isOverdue ? 'var(--danger)' : 'var(--text-primary)' }}>
                            {new Date(b.dueDate).toLocaleDateString()}
                          </strong>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              isOverdue ? 'badge-overdue' : 'badge-issued'
                            }`}
                          >
                            {isOverdue ? 'Overdue' : 'Active Loan'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pending Fines / Payments Section */}
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <div className="dashboard-card-title">
              <IndianRupee size={18} color="var(--primary-600)" /> Pending Library Fines
            </div>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => navigate('/student/fines')}
            >
              All Dues <ArrowRight size={14} />
            </button>
          </div>

          {pendingFines.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)' }}>
              <CheckCircle2 size={36} color="var(--success)" style={{ marginBottom: 8 }} />
              <p style={{ fontSize: '0.9rem', color: '#166534', fontWeight: 600 }}>
                No pending fines!
              </p>
              <p style={{ fontSize: '0.8rem' }}>You have zero outstanding dues with the library.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Book</th>
                    <th>Overdue</th>
                    <th>Amount</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingFines.map((f) => (
                    <tr key={f._id}>
                      <td>
                        <strong>{f.book?.title}</strong>
                      </td>
                      <td>{f.overdueDays} days late</td>
                      <td>
                        <strong style={{ color: 'var(--danger)' }}>
                          ₹{f.balanceAmount || f.totalAmount}
                        </strong>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleOpenPayFine(f)}
                        >
                          <CreditCard size={14} /> Pay Fine
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Demo Payment Modal */}
      <DemoPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        fine={selectedFine}
        onPaymentSuccess={() => fetchStudentStats()}
      />

      {/* Printable Receipt Modal */}
      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        payment={selectedReceipt}
      />
    </div>
  );
};

export default StudentDashboard;
