import React, { useState, useEffect } from 'react';
import { CreditCard, Receipt, Printer, CheckCircle2, AlertTriangle, IndianRupee } from 'lucide-react';
import api from '../../services/api';
import useToast from '../../hooks/useToast';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import DemoPaymentModal from '../../components/DemoPaymentModal';
import ReceiptModal from '../../components/ReceiptModal';

const MyFinesPayments = () => {
  const [fines, setFines] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedFine, setSelectedFine] = useState(null);

  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  const { showToast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [finesRes, paymentsRes] = await Promise.all([
        api.get('/fines/my-fines'),
        api.get('/payments/my-payments'),
      ]);
      if (finesRes.data.success) {
        setFines(finesRes.data.fines);
      }
      if (paymentsRes.data.success) {
        setPayments(paymentsRes.data.payments);
      }
    } catch (err) {
      console.error('Failed to load fines/payments:', err);
      showToast('Error', 'Failed to retrieve your fine records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenPay = (fine) => {
    setSelectedFine(fine);
    setIsPaymentModalOpen(true);
  };

  const handleOpenReceipt = (payment) => {
    setSelectedPayment(payment);
    setIsReceiptModalOpen(true);
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving your fee balances and digital receipts..." />;
  }

  const pendingFines = fines.filter((f) => f.status === 'Pending' || f.status === 'Partially Paid');
  const totalPending = pendingFines.reduce((sum, f) => sum + (f.balanceAmount || 0), 0);
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="fade-in">
      <div className="page-header-actions">
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Library Fines & Payment History</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Pay overdue fines with demo simulation and download official college receipts
          </p>
        </div>
      </div>

      {/* Summary Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        <div
          style={{
            padding: 20,
            borderRadius: 12,
            backgroundColor: totalPending > 0 ? '#fffbeb' : '#f0fdf4',
            border: `1px solid ${totalPending > 0 ? '#fde68a' : '#bbf7d0'}`,
          }}
        >
          <div style={{ fontSize: '0.8rem', color: totalPending > 0 ? '#92400e' : '#166534', fontWeight: 700 }}>
            CURRENT OUTSTANDING DUES
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: totalPending > 0 ? '#b45309' : '#15803d', marginTop: 4 }}>
            ₹{totalPending}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
            {totalPending > 0 ? 'Clear dues to ensure smooth book issuing' : 'All library dues cleared!'}
          </div>
        </div>

        <div
          style={{
            padding: 20,
            borderRadius: 12,
            backgroundColor: '#ffffff',
            border: '1px solid var(--border-color)',
          }}
        >
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>
            TOTAL FINES PAID (LIFETIME)
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-700)', marginTop: 4 }}>
            ₹{totalPaid}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
            {payments.length} digital receipt(s) on file
          </div>
        </div>
      </div>

      {/* Section 1: Outstanding Fines */}
      <div className="dashboard-card" style={{ marginBottom: 28 }}>
        <div className="dashboard-card-header">
          <div className="dashboard-card-title">
            <CreditCard size={18} color="var(--primary-600)" /> Outstanding Overdue Fines
          </div>
        </div>

        {pendingFines.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 10px', color: '#166534' }}>
            <CheckCircle2 size={36} color="var(--success)" style={{ marginBottom: 8 }} />
            <h4 style={{ fontWeight: 700 }}>No Pending Fines</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              You do not have any overdue fines to pay. Keep up the good work!
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Book Title</th>
                  <th>Overdue Duration</th>
                  <th>Fine Rate</th>
                  <th>Total Incurred</th>
                  <th>Balance Payable</th>
                  <th style={{ textAlign: 'right' }}>Payment</th>
                </tr>
              </thead>
              <tbody>
                {pendingFines.map((f) => (
                  <tr key={f._id}>
                    <td>
                      <strong>{f.book?.title}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Txn: {f.borrowRecord?.transactionId || 'N/A'}
                      </div>
                    </td>
                    <td>{f.overdueDays} Day(s) Late</td>
                    <td>₹{f.finePerDay}/day</td>
                    <td>₹{f.totalAmount}</td>
                    <td>
                      <strong style={{ color: 'var(--danger)', fontSize: '1.05rem' }}>
                        ₹{f.balanceAmount || f.totalAmount}
                      </strong>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleOpenPay(f)}
                      >
                        <CreditCard size={14} /> Pay Fine Now
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section 2: Paid Receipts History */}
      <div className="dashboard-card">
        <div className="dashboard-card-header">
          <div className="dashboard-card-title">
            <Receipt size={18} color="var(--primary-600)" /> Payment History & Receipts
          </div>
        </div>

        {payments.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No payment receipts recorded yet.</p>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Receipt #</th>
                  <th>For Book</th>
                  <th>Amount Paid</th>
                  <th>Method</th>
                  <th>Date & Time</th>
                  <th style={{ textAlign: 'right' }}>Digital Receipt</th>
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
                          padding: '4px 6px',
                          borderRadius: 4,
                        }}
                      >
                        {p.receiptNumber}
                      </span>
                    </td>
                    <td>
                      <strong>{p.fine?.book?.title || 'Library Resource'}</strong>
                    </td>
                    <td>
                      <strong style={{ color: '#166534' }}>₹{p.amount}</strong>
                    </td>
                    <td>
                      <span className="badge badge-info">{p.paymentMethod}</span>
                    </td>
                    <td>{new Date(p.paymentDate || p.createdAt).toLocaleString()}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => handleOpenReceipt(p)}
                      >
                        <Printer size={14} /> View / Print
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Demo Payment Modal */}
      <DemoPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        fine={selectedFine}
        onPaymentSuccess={() => fetchData()}
      />

      {/* Printable Receipt Modal */}
      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        payment={selectedPayment}
      />
    </div>
  );
};

export default MyFinesPayments;
