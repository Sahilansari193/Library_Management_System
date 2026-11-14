import React, { useState, useEffect } from 'react';
import { BookMarked, Calendar, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import api from '../../services/api';
import useToast from '../../hooks/useToast';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

const MyBorrowedBooks = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState('active'); // 'active' | 'returned' | 'all'

  const { showToast } = useToast();

  const fetchMyBorrows = async () => {
    setLoading(true);
    try {
      const res = await api.get('/borrow/my-books');
      if (res.data.success) {
        setRecords(res.data.records);
      }
    } catch (err) {
      console.error('Failed to load my books:', err);
      showToast('Error', 'Failed to retrieve your borrowed books', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBorrows();
  }, []);

  const activeRecords = records.filter((r) => r.status === 'Issued' || r.status === 'Overdue');
  const returnedRecords = records.filter((r) => r.status === 'Returned');

  const displayedRecords =
    filterTab === 'active'
      ? activeRecords
      : filterTab === 'returned'
      ? returnedRecords
      : records;

  if (loading) {
    return <LoadingSpinner text="Retrieving your library loan ledger..." />;
  }

  return (
    <div className="fade-in">
      <div className="page-header-actions">
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>My Borrowed Books History</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            {activeRecords.length} books currently issued • {returnedRecords.length} completed returns
          </p>
        </div>

        {/* Tab Buttons */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className={`btn btn-sm ${filterTab === 'active' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilterTab('active')}
          >
            Currently Borrowed ({activeRecords.length})
          </button>
          <button
            className={`btn btn-sm ${filterTab === 'returned' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilterTab('returned')}
          >
            Past Returns ({returnedRecords.length})
          </button>
          <button
            className={`btn btn-sm ${filterTab === 'all' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilterTab('all')}
          >
            All Ledger ({records.length})
          </button>
        </div>
      </div>

      {displayedRecords.length === 0 ? (
        <EmptyState
          icon={BookMarked}
          title={`No ${filterTab === 'active' ? 'Currently Borrowed Books' : 'Past Returns'}`}
          description="You do not have any records in this view."
        />
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Txn ID</th>
                <th>Book Title & Details</th>
                <th>Issue Date</th>
                <th>Return Due Date</th>
                <th>Return Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {displayedRecords.map((r) => {
                const now = new Date();
                const due = new Date(r.dueDate);
                const isOverdue = r.status === 'Overdue' || (r.status === 'Issued' && due < now);
                const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

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
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <img
                          src={r.book?.coverImage}
                          alt={r.book?.title}
                          style={{
                            width: 36,
                            height: 50,
                            objectFit: 'cover',
                            borderRadius: 4,
                          }}
                        />
                        <div>
                          <strong>{r.book?.title}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            by {r.book?.author} • ISBN: {r.book?.isbn}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{new Date(r.issueDate).toLocaleDateString()}</td>
                    <td>
                      <strong style={{ color: isOverdue ? 'var(--danger)' : 'var(--text-primary)' }}>
                        {new Date(r.dueDate).toLocaleDateString()}
                      </strong>
                      {r.status !== 'Returned' && (
                        <div style={{ fontSize: '0.72rem', marginTop: 2 }}>
                          {diffDays > 0 ? (
                            <span style={{ color: 'var(--text-muted)' }}>{diffDays} days left</span>
                          ) : diffDays === 0 ? (
                            <span style={{ color: 'var(--warning)', fontWeight: 700 }}>Due Today</span>
                          ) : (
                            <span style={{ color: 'var(--danger)', fontWeight: 700 }}>
                              {Math.abs(diffDays)} days overdue
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td>
                      {r.returnDate ? (
                        new Date(r.returnDate).toLocaleDateString()
                      ) : (
                        <span style={{ color: 'var(--text-light)' }}>Active Loan</span>
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
                        {r.status === 'Returned'
                          ? 'Returned'
                          : isOverdue
                          ? 'Overdue'
                          : 'Issued'}
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
  );
};

export default MyBorrowedBooks;
