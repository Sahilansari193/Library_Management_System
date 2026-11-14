import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  BookOpen,
  Users,
  CreditCard,
  TrendingUp,
  FileSpreadsheet,
} from 'lucide-react';
import api from '../../services/api';
import useToast from '../../hooks/useToast';
import LoadingSpinner from '../../components/LoadingSpinner';

const ReportsAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const { showToast } = useToast();

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/analytics');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load reports:', err);
      showToast('Error', 'Failed to retrieve analytics data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleExportCSV = async (type) => {
    try {
      setExporting(true);
      const res = await api.get(`/reports/export/${type}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `library_${type}_export_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast('Export Success', `${type.toUpperCase()} report downloaded as CSV`, 'success');
    } catch (err) {
      showToast('Export Failed', 'Could not generate CSV report file', 'error');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Generating analytical charts and intelligence reports..." />;
  }

  const booksByCategory = data?.booksByCategory || [];
  const membershipsByStatus = data?.membershipsByStatus || [];
  const membershipsByPlan = data?.membershipsByPlan || [];
  const mostBorrowedBooks = data?.mostBorrowedBooks || [];
  const monthlyBorrowing = data?.monthlyBorrowing || [];
  const monthlyFineCollections = data?.monthlyFineCollections || [];

  return (
    <div className="fade-in">
      <div className="page-header-actions">
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Library Intelligence & Reports</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Interactive inventory distribution, circulation analytics, and data export
          </p>
        </div>

        {/* CSV Export Button Group */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => handleExportCSV('books')}
            disabled={exporting}
          >
            <Download size={14} /> Books CSV
          </button>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => handleExportCSV('members')}
            disabled={exporting}
          >
            <Download size={14} /> Members CSV
          </button>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => handleExportCSV('borrows')}
            disabled={exporting}
          >
            <Download size={14} /> Borrows CSV
          </button>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => handleExportCSV('fines')}
            disabled={exporting}
          >
            <Download size={14} /> Fines CSV
          </button>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => handleExportCSV('payments')}
            disabled={exporting}
          >
            <Download size={14} /> Payments CSV
          </button>
        </div>
      </div>

      {/* Row 1: Book Inventory by Category & Membership Breakdown */}
      <div className="dashboard-grid-2">
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <div className="dashboard-card-title">
              <BookOpen size={18} color="var(--primary-600)" /> Book Inventory Distribution
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>By Subject Category</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {booksByCategory.map((cat, idx) => {
              const maxCopies = Math.max(...booksByCategory.map((c) => c.totalCopies), 1);
              const pct = Math.round((cat.totalCopies / maxCopies) * 100);

              return (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
                    <span style={{ fontWeight: 600 }}>{cat._id}</span>
                    <span style={{ color: 'var(--text-muted)' }}>
                      {cat.availableCopies} avail / {cat.totalCopies} copies ({cat.totalBooks} titles)
                    </span>
                  </div>
                  <div style={{ width: '100%', height: 8, backgroundColor: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        backgroundColor: 'var(--primary-600)',
                        borderRadius: 4,
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <div className="dashboard-card-title">
              <Users size={18} color="var(--primary-600)" /> Membership Plans & Card Status
            </div>
          </div>

          <h5 style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 10 }}>Plan Subscriptions</h5>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
            {membershipsByPlan.map((p, idx) => (
              <div
                key={idx}
                style={{
                  padding: 14,
                  backgroundColor: '#f8fafc',
                  border: '1px solid var(--border-color)',
                  borderRadius: 10,
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  {p._id}
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: 4 }}>
                  {p.count}
                </div>
              </div>
            ))}
          </div>

          <h5 style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 10 }}>Validity Status</h5>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {membershipsByStatus.map((s, idx) => (
              <div
                key={idx}
                style={{
                  padding: 14,
                  backgroundColor:
                    s._id === 'Active'
                      ? 'var(--success-bg)'
                      : s._id === 'Expired'
                      ? 'var(--danger-bg)'
                      : '#f1f5f9',
                  border: `1px solid ${
                    s._id === 'Active'
                      ? 'var(--success-border)'
                      : s._id === 'Expired'
                      ? 'var(--danger-border)'
                      : 'var(--border-color)'
                  }`,
                  borderRadius: 10,
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    fontSize: '0.75rem',
                    color:
                      s._id === 'Active'
                        ? 'var(--success-text)'
                        : s._id === 'Expired'
                        ? 'var(--danger-text)'
                        : 'var(--text-muted)',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                  }}
                >
                  {s._id}
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: 4 }}>
                  {s.count}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Top 10 Most Borrowed Books */}
      <div className="dashboard-card" style={{ marginBottom: 28 }}>
        <div className="dashboard-card-header">
          <div className="dashboard-card-title">
            <TrendingUp size={18} color="var(--primary-600)" /> Top 10 Most Borrowed Curriculum Books
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Circulation Frequency</span>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Book Title</th>
                <th>Author</th>
                <th>Category</th>
                <th>ISBN</th>
                <th style={{ textAlign: 'right' }}>Total Times Issued</th>
              </tr>
            </thead>
            <tbody>
              {mostBorrowedBooks.map((b, idx) => (
                <tr key={b._id}>
                  <td>
                    <span
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        backgroundColor: idx < 3 ? 'var(--primary-100)' : '#f1f5f9',
                        color: idx < 3 ? 'var(--primary-700)' : 'var(--text-secondary)',
                        fontWeight: 800,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.8rem',
                      }}
                    >
                      {idx + 1}
                    </span>
                  </td>
                  <td>
                    <strong>{b.title}</strong>
                  </td>
                  <td>{b.author}</td>
                  <td>
                    <span className="badge badge-info">{b.category}</span>
                  </td>
                  <td>{b.isbn}</td>
                  <td style={{ textAlign: 'right' }}>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--primary-700)' }}>
                      {b.borrowCount} times
                    </strong>
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

export default ReportsAnalytics;
