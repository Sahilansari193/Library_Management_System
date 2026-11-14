import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, RotateCcw, BookMarked, CheckCircle2, AlertTriangle, Calendar } from 'lucide-react';
import api from '../../services/api';
import useToast from '../../hooks/useToast';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import Pagination from '../../components/Pagination';

const BorrowManagement = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Issue Book Modal State
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [availableBooks, setAvailableBooks] = useState([]);
  const [activeMembers, setActiveMembers] = useState([]);
  const [selectedBookId, setSelectedBookId] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [borrowDays, setBorrowDays] = useState(14);
  const [submitting, setSubmitting] = useState(false);

  // Return Book Confirmation Modal
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [recordToReturn, setRecordToReturn] = useState(null);
  const [returnSubmitting, setReturnSubmitting] = useState(false);

  const { showToast } = useToast();

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/borrow', {
        params: {
          search,
          status: statusFilter,
          page: currentPage,
          limit: 10,
        },
      });
      if (res.data.success) {
        setRecords(res.data.records);
        setTotalPages(res.data.totalPages);
        setTotalRecords(res.data.total);
      }
    } catch (err) {
      console.error('Failed to load borrow records:', err);
      showToast('Error', 'Failed to retrieve borrow records', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, currentPage, showToast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRecords();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchRecords]);

  // Load books and members for Issue Modal
  const handleOpenIssueModal = async () => {
    try {
      const [booksRes, membersRes] = await Promise.all([
        api.get('/books?limit=100&availability=available'),
        api.get('/members?limit=100&status=Active'),
      ]);
      if (booksRes.data.success) {
        setAvailableBooks(booksRes.data.books);
        if (booksRes.data.books.length > 0) {
          setSelectedBookId(booksRes.data.books[0]._id);
        }
      }
      if (membersRes.data.success) {
        setActiveMembers(membersRes.data.members);
        if (membersRes.data.members.length > 0) {
          setSelectedMemberId(membersRes.data.members[0]._id);
        }
      }
      setIsIssueModalOpen(true);
    } catch (err) {
      showToast('Error', 'Failed to prepare issue book form', 'error');
    }
  };

  const handleIssueSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBookId || !selectedMemberId) {
      showToast('Warning', 'Please select both a book and an active member', 'warning');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/borrow/issue', {
        bookId: selectedBookId,
        memberId: selectedMemberId,
        customBorrowDays: borrowDays,
      });
      if (res.data.success) {
        showToast('Book Issued', res.data.message, 'success');
        setIsIssueModalOpen(false);
        fetchRecords();
      }
    } catch (err) {
      showToast('Issue Denied', err.response?.data?.message || 'Could not issue book', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenReturnModal = (rec) => {
    setRecordToReturn(rec);
    setIsReturnModalOpen(true);
  };

  const handleConfirmReturn = async () => {
    if (!recordToReturn) return;
    setReturnSubmitting(true);
    try {
      const res = await api.put(`/borrow/return/${recordToReturn._id}`);
      if (res.data.success) {
        showToast('Book Returned', res.data.message, 'success');
        setIsReturnModalOpen(false);
        setRecordToReturn(null);
        fetchRecords();
      }
    } catch (err) {
      showToast('Error', err.response?.data?.message || 'Return operation failed', 'error');
    } finally {
      setReturnSubmitting(false);
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header-actions">
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Book Borrowing & Returns Desk</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            {totalRecords} circulation transaction records
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenIssueModal}>
          <Plus size={16} /> Issue Book to Member
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="form-control"
            placeholder="Search by Txn ID, Member ID, Student Name, or Book Title..."
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
          <option value="All">All Statuses</option>
          <option value="Issued">Currently Issued</option>
          <option value="Overdue">Overdue</option>
          <option value="Returned">Returned</option>
        </select>
      </div>

      {/* Borrow Table */}
      {loading ? (
        <LoadingSpinner text="Retrieving circulation records..." />
      ) : records.length === 0 ? (
        <EmptyState
          icon={BookMarked}
          title="No Borrow Records Found"
          description="There are currently no transactions matching your search filters."
          actionLabel="Issue a Book"
          onAction={handleOpenIssueModal}
        />
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Txn ID</th>
                <th>Member</th>
                <th>Book Title</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Return Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => {
                const isOverdue =
                  r.status === 'Overdue' ||
                  (r.status === 'Issued' && new Date(r.dueDate) < new Date());

                return (
                  <tr key={r._id}>
                    <td>
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          backgroundColor: '#f1f5f9',
                          padding: '4px 6px',
                          borderRadius: 4,
                        }}
                      >
                        {r.transactionId}
                      </span>
                    </td>
                    <td>
                      <strong>{r.member?.fullName || 'Member'}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {r.member?.memberId}
                      </div>
                    </td>
                    <td>
                      <strong>{r.book?.title}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        ISBN: {r.book?.isbn}
                      </div>
                    </td>
                    <td>{new Date(r.issueDate).toLocaleDateString()}</td>
                    <td>
                      <strong
                        style={{
                          color: isOverdue ? 'var(--danger)' : 'var(--text-primary)',
                        }}
                      >
                        {new Date(r.dueDate).toLocaleDateString()}
                      </strong>
                    </td>
                    <td>
                      {r.returnDate ? (
                        new Date(r.returnDate).toLocaleDateString()
                      ) : (
                        <span style={{ color: 'var(--text-light)' }}>Not returned</span>
                      )}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          r.status === 'Returned'
                            ? 'badge-returned'
                            : isOverdue
                            ? 'badge-overdue'
                            : 'badge-issued'
                        }`}
                      >
                        {r.status === 'Returned' ? 'Returned' : isOverdue ? 'Overdue' : 'Issued'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {r.status !== 'Returned' ? (
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => handleOpenReturnModal(r)}
                        >
                          <RotateCcw size={14} /> Return Book
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--success)' }}>
                          Completed
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalRecords}
            onPageChange={(p) => setCurrentPage(p)}
          />
        </div>
      )}

      {/* Issue Book Modal */}
      <Modal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        title="Issue Book to Member"
        size="md"
      >
        <form onSubmit={handleIssueSubmit}>
          <div className="form-group">
            <label className="form-label">Select Book (In Stock) *</label>
            {availableBooks.length === 0 ? (
              <p style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>
                No books currently have available copies in stock.
              </p>
            ) : (
              <select
                className="form-control"
                value={selectedBookId}
                onChange={(e) => setSelectedBookId(e.target.value)}
                required
              >
                {availableBooks.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.title} (Available: {b.availableCopies} copies)
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Select Active Member *</label>
            {activeMembers.length === 0 ? (
              <p style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>
                No active members found. Members with expired cards cannot borrow books.
              </p>
            ) : (
              <select
                className="form-control"
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                required
              >
                {activeMembers.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.fullName} ({m.memberId}) — {m.plan} Plan
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Borrowing Period (Days)</label>
            <input
              type="number"
              min="1"
              max="90"
              className="form-control"
              value={borrowDays}
              onChange={(e) => setBorrowDays(e.target.value)}
              required
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Due date will be automatically set to{' '}
              {new Date(Date.now() + Number(borrowDays) * 24 * 60 * 60 * 1000).toLocaleDateString()}.
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 20 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsIssueModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || availableBooks.length === 0 || activeMembers.length === 0}
            >
              {submitting ? 'Issuing...' : 'Confirm Issue'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Return Book Confirmation Modal */}
      <Modal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        title="Confirm Book Return"
        size="md"
      >
        {recordToReturn && (
          <div>
            <p style={{ fontSize: '0.9rem', marginBottom: 14 }}>
              Are you sure you want to mark this book as returned to circulation?
            </p>

            <div
              style={{
                backgroundColor: '#f8fafc',
                padding: 14,
                borderRadius: 8,
                border: '1px solid var(--border-color)',
                marginBottom: 16,
              }}
            >
              <div><strong>Book:</strong> {recordToReturn.book?.title}</div>
              <div><strong>Borrower:</strong> {recordToReturn.member?.fullName} ({recordToReturn.member?.memberId})</div>
              <div><strong>Issue Date:</strong> {new Date(recordToReturn.issueDate).toLocaleDateString()}</div>
              <div><strong>Due Date:</strong> {new Date(recordToReturn.dueDate).toLocaleDateString()}</div>
            </div>

            {new Date() > new Date(recordToReturn.dueDate) && (
              <div
                style={{
                  backgroundColor: 'var(--danger-bg)',
                  border: '1px solid var(--danger-border)',
                  color: 'var(--danger-text)',
                  padding: 12,
                  borderRadius: 8,
                  fontSize: '0.85rem',
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <AlertTriangle size={18} />
                <div>
                  <strong>Overdue Book:</strong> Returning this book will automatically calculate and charge a late fine at ₹5/day.
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsReturnModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleConfirmReturn}
                disabled={returnSubmitting}
              >
                {returnSubmitting ? 'Recording...' : 'Confirm Return'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BorrowManagement;
