import React, { useState, useEffect, useCallback } from 'react';
import { Search, Receipt, Printer, Eye, CreditCard, Banknote, QrCode } from 'lucide-react';
import api from '../../services/api';
import useToast from '../../hooks/useToast';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import Pagination from '../../components/Pagination';
import ReceiptModal from '../../components/ReceiptModal';

const PaymentsList = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPayments, setTotalPayments] = useState(0);

  // Receipt Modal
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const { showToast } = useToast();

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/payments', {
        params: {
          search,
          method: methodFilter,
          page: currentPage,
          limit: 10,
        },
      });
      if (res.data.success) {
        setPayments(res.data.payments);
        setTotalPages(res.data.totalPages);
        setTotalPayments(res.data.total);
      }
    } catch (err) {
      console.error('Failed to load payments:', err);
      showToast('Error', 'Failed to retrieve payment records', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, methodFilter, currentPage, showToast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPayments();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchPayments]);

  const handleViewReceipt = (p) => {
    setSelectedPayment(p);
    setIsReceiptOpen(true);
  };

  const getMethodIcon = (m) => {
    if (m === 'UPI') return <QrCode size={14} color="#2563eb" />;
    if (m === 'Card') return <CreditCard size={14} color="#7c3aed" />;
    return <Banknote size={14} color="#059669" />;
  };

  return (
    <div className="fade-in">
      <div className="page-header-actions">
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Library Revenue & Payment Receipts</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            {totalPayments} completed fine payment transactions
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="form-control"
            placeholder="Search by Receipt #, Txn Ref, or Student Name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <select
          className="filter-select"
          value={methodFilter}
          onChange={(e) => {
            setMethodFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="All">All Payment Methods</option>
          <option value="UPI">UPI / QR Code</option>
          <option value="Card">Debit / Credit Card</option>
          <option value="Cash">Counter Cash</option>
        </select>
      </div>

      {/* Payments Table */}
      {loading ? (
        <LoadingSpinner text="Retrieving payment receipts..." />
      ) : payments.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No Payments Recorded"
          description="There are currently no transactions matching your search filters."
        />
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Receipt #</th>
                <th>Member Information</th>
                <th>Book Title</th>
                <th>Amount (INR)</th>
                <th>Method</th>
                <th>Transaction Ref</th>
                <th>Payment Date</th>
                <th style={{ textAlign: 'right' }}>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p._id}>
                  <td>
                    <span
                      style={{
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        backgroundColor: '#f1f5f9',
                        padding: '4px 8px',
                        borderRadius: 4,
                      }}
                    >
                      {p.receiptNumber}
                    </span>
                  </td>
                  <td>
                    <strong>{p.member?.fullName}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      ID: {p.member?.memberId}
                    </div>
                  </td>
                  <td>
                    <strong>{p.fine?.book?.title || 'Library Resource'}</strong>
                  </td>
                  <td>
                    <strong style={{ color: '#166534', fontSize: '0.95rem' }}>
                      ₹{p.amount}
                    </strong>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {getMethodIcon(p.paymentMethod)}
                      <span>{p.paymentMethod}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.78rem', fontFamily: 'monospace' }}>
                      {p.transactionReference}
                    </span>
                  </td>
                  <td>{new Date(p.paymentDate || p.createdAt).toLocaleString()}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => handleViewReceipt(p)}
                    >
                      <Printer size={14} /> View / Print
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalPayments}
            onPageChange={(p) => setCurrentPage(p)}
          />
        </div>
      )}

      {/* Receipt View & Print Modal */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        payment={selectedPayment}
      />
    </div>
  );
};

export default PaymentsList;
