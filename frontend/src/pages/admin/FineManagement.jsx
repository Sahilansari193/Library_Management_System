import React, { useState, useEffect, useCallback } from 'react';
import { Search, CreditCard, Settings, ShieldCheck, IndianRupee, AlertCircle, Eye } from 'lucide-react';
import api from '../../services/api';
import useToast from '../../hooks/useToast';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import Pagination from '../../components/Pagination';
import DemoPaymentModal from '../../components/DemoPaymentModal';

const FineManagement = () => {
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalFines, setTotalFines] = useState(0);

  // Settings & Waive State
  const [fineRate, setFineRate] = useState(5);
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [newRateInput, setNewRateInput] = useState(5);
  const [rateSubmitting, setRateSubmitting] = useState(false);

  const [isWaiveModalOpen, setIsWaiveModalOpen] = useState(false);
  const [fineToWaive, setFineToWaive] = useState(null);
  const [waiveReason, setWaiveReason] = useState('');
  const [waiveSubmitting, setWaiveSubmitting] = useState(false);

  // Demo Payment Modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentFine, setPaymentFine] = useState(null);

  const { showToast } = useToast();

  const fetchFines = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/fines', {
        params: {
          search,
          status: statusFilter,
          page: currentPage,
          limit: 10,
        },
      });
      if (res.data.success) {
        setFines(res.data.fines);
        setTotalPages(res.data.totalPages);
        setTotalFines(res.data.total);
      }
    } catch (err) {
      console.error('Failed to load fines:', err);
      showToast('Error', 'Failed to retrieve fine records', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, currentPage, showToast]);

  const fetchFineRate = async () => {
    try {
      const res = await api.get('/fines/rate');
      if (res.data.success) {
        setFineRate(res.data.finePerDay);
        setNewRateInput(res.data.finePerDay);
      }
    } catch (err) {
      console.error('Failed to get fine rate:', err);
    }
  };

  useEffect(() => {
    fetchFineRate();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFines();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchFines]);

  // Update Fine Rate
  const handleRateSubmit = async (e) => {
    e.preventDefault();
    setRateSubmitting(true);
    try {
      const res = await api.put('/fines/rate', { finePerDay: newRateInput });
      if (res.data.success) {
        showToast('Setting Saved', res.data.message, 'success');
        setFineRate(newRateInput);
        setIsRateModalOpen(false);
      }
    } catch (err) {
      showToast('Error', err.response?.data?.message || 'Failed to update rate', 'error');
    } finally {
      setRateSubmitting(false);
    }
  };

  // Open Waive Modal
  const handleOpenWaive = (fine) => {
    setFineToWaive(fine);
    setWaiveReason('');
    setIsWaiveModalOpen(true);
  };

  const handleWaiveSubmit = async (e) => {
    e.preventDefault();
    if (!waiveReason.trim()) {
      showToast('Error', 'Please provide a valid justification for waiving this fine', 'error');
      return;
    }
    setWaiveSubmitting(true);
    try {
      const res = await api.put(`/fines/${fineToWaive._id}/waive`, { reason: waiveReason });
      if (res.data.success) {
        showToast('Fine Waived', res.data.message, 'success');
        setIsWaiveModalOpen(false);
        fetchFines();
      }
    } catch (err) {
      showToast('Error', err.response?.data?.message || 'Could not waive fine', 'error');
    } finally {
      setWaiveSubmitting(false);
    }
  };

  // Open Counter Payment Modal
  const handleOpenPayment = (fine) => {
    setPaymentFine(fine);
    setIsPaymentModalOpen(true);
  };

  return (
    <div className="fade-in">
      <div className="page-header-actions">
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Library Overdue Fine Management</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Current System Rate: <strong>₹{fineRate} per overdue day</strong> • {totalFines} total fine records
          </p>
        </div>
        <button className="btn btn-secondary" onClick={() => setIsRateModalOpen(true)}>
          <Settings size={16} /> Configure Fine Rate
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="form-control"
            placeholder="Search fines by student name, member ID, book, or transaction..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="All">All Fines</option>
          <option value="Pending">Pending (Unpaid)</option>
          <option value="Paid">Fully Paid</option>
          <option value="Partially Paid">Partially Paid</option>
          <option value="Waived">Waived</option>
        </select>
      </div>

      {/* Fines Table */}
      {loading ? (
        <LoadingSpinner text="Retrieving fine records..." />
      ) : fines.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No Fine Records"
          description="No library fine records match your current filter settings."
        />
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Member Information</th>
                <th>Overdue Book</th>
                <th>Days Late</th>
                <th>Rate / Day</th>
                <th>Total Fine</th>
                <th>Balance Due</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {fines.map((f) => (
                <tr key={f._id}>
                  <td>
                    <strong>{f.member?.fullName}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      ID: {f.member?.memberId}
                    </div>
                  </td>
                  <td>
                    <strong>{f.book?.title}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Txn: {f.borrowRecord?.transactionId || 'N/A'}
                    </div>
                  </td>
                  <td>{f.overdueDays} Days</td>
                  <td>₹{f.finePerDay}</td>
                  <td>
                    <strong>₹{f.totalAmount}</strong>
                  </td>
                  <td>
                    <strong
                      style={{
                        color:
                          f.status === 'Paid'
                            ? 'var(--success)'
                            : f.status === 'Waived'
                            ? 'var(--text-muted)'
                            : 'var(--danger)',
                      }}
                    >
                      ₹{f.balanceAmount !== undefined ? f.balanceAmount : f.totalAmount}
                    </strong>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        f.status === 'Paid'
                          ? 'badge-paid'
                          : f.status === 'Waived'
                          ? 'badge-waived'
                          : f.status === 'Partially Paid'
                          ? 'badge-partially-paid'
                          : 'badge-pending'
                      }`}
                    >
                      {f.status}
                    </span>
                    {f.status === 'Waived' && f.waivedReason && (
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>
                        Reason: {f.waivedReason}
                      </div>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 6 }}>
                      {(f.status === 'Pending' || f.status === 'Partially Paid') && (
                        <>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleOpenPayment(f)}
                            title="Collect Payment"
                          >
                            <IndianRupee size={14} /> Collect
                          </button>
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => handleOpenWaive(f)}
                            title="Waive Fine with Reason"
                          >
                            <ShieldCheck size={14} /> Waive
                          </button>
                        </>
                      )}
                      {f.status === 'Paid' && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 600 }}>
                          Settled
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalFines}
            onPageChange={(p) => setCurrentPage(p)}
          />
        </div>
      )}

      {/* Configure Fine Rate Modal */}
      <Modal
        isOpen={isRateModalOpen}
        onClose={() => setIsRateModalOpen(false)}
        title="Configure Default Library Fine Rate"
        size="md"
      >
        <form onSubmit={handleRateSubmit}>
          <div className="form-group">
            <label className="form-label">Overdue Fine Rate Per Day (₹ INR)</label>
            <input
              type="number"
              min="0"
              step="1"
              className="form-control"
              value={newRateInput}
              onChange={(e) => setNewRateInput(e.target.value)}
              required
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Any book returned after its 14-day loan window will be charged this daily rate.
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 20 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsRateModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={rateSubmitting}>
              {rateSubmitting ? 'Updating...' : 'Save Configuration'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Waive Fine Modal */}
      <Modal
        isOpen={isWaiveModalOpen}
        onClose={() => setIsWaiveModalOpen(false)}
        title="Waive Library Fine Penalty"
        size="md"
      >
        <form onSubmit={handleWaiveSubmit}>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: 14 }}>
            Waiving fine of <strong>₹{fineToWaive?.balanceAmount || fineToWaive?.totalAmount}</strong> for student{' '}
            <strong>{fineToWaive?.member?.fullName}</strong> ({fineToWaive?.book?.title}).
          </p>

          <div className="form-group">
            <label className="form-label">Official Justification / Reason *</label>
            <textarea
              className="form-control"
              rows="3"
              placeholder="e.g. Official medical leave certified by campus hospital, Dean approval, etc."
              value={waiveReason}
              onChange={(e) => setWaiveReason(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 20 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsWaiveModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={waiveSubmitting}>
              {waiveSubmitting ? 'Waiving...' : 'Confirm Waive'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Demo Payment Modal */}
      <DemoPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        fine={paymentFine}
        onPaymentSuccess={() => fetchFines()}
      />
    </div>
  );
};

export default FineManagement;
