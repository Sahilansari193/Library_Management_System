import React, { useState } from 'react';
import Modal from './Modal';
import { QrCode, CreditCard, Banknote, ShieldAlert, CheckCircle2, Lock } from 'lucide-react';
import api from '../services/api';
import useToast from '../hooks/useToast';

const DemoPaymentModal = ({
  isOpen,
  onClose,
  fine,
  onPaymentSuccess,
}) => {
  const { showToast } = useToast();
  const [method, setMethod] = useState('UPI');
  const [upiId, setUpiId] = useState('student@oksbi');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8821');
  const [expiry, setExpiry] = useState('08/28');
  const [cvv, setCvv] = useState('321');
  const [loading, setLoading] = useState(false);

  if (!fine) return null;

  const payableAmount = fine.balanceAmount !== undefined ? fine.balanceAmount : fine.totalAmount;

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const txnRef =
        method === 'UPI'
          ? `SIM-UPI-${Math.floor(100000 + Math.random() * 900000)}`
          : method === 'Card'
          ? `SIM-CARD-${Math.floor(100000 + Math.random() * 900000)}`
          : `SIM-CASH-${Math.floor(100000 + Math.random() * 900000)}`;

      const res = await api.post('/payments/pay', {
        fineId: fine._id,
        amount: payableAmount,
        paymentMethod: method,
        transactionReference: txnRef,
        notes: `Simulated ${method} fine payment settlement`,
      });

      if (res.data.success) {
        showToast('Payment Completed', res.data.message, 'success');
        if (onPaymentSuccess) {
          onPaymentSuccess(res.data.payment);
        }
        onClose();
      }
    } catch (err) {
      console.error('Payment error:', err);
      showToast('Payment Failed', err.response?.data?.message || 'Transaction could not be processed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Library Fine Payment Gateway (Demo Simulation)"
      size="md"
    >
      <div className="demo-banner">
        <ShieldAlert size={18} />
        <div>
          <strong>Educational Demonstration Mode:</strong> No actual financial transactions or bank transfers take place.
        </div>
      </div>

      <div className="gateway-box">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Fine For Book:</span>
          <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{fine.book?.title}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Overdue Duration:</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{fine.overdueDays} Day(s) @ ₹{fine.finePerDay || 5}/day</span>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            paddingTop: 10,
            borderTop: '1px solid var(--border-color)',
            alignItems: 'center',
          }}
        >
          <span style={{ fontWeight: 700 }}>Total Payable Amount:</span>
          <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-700)' }}>
            ₹{payableAmount}
          </span>
        </div>
      </div>

      <div className="method-tabs">
        <button
          type="button"
          className={`method-tab-btn ${method === 'UPI' ? 'active' : ''}`}
          onClick={() => setMethod('UPI')}
        >
          <QrCode size={18} /> UPI / QR
        </button>
        <button
          type="button"
          className={`method-tab-btn ${method === 'Card' ? 'active' : ''}`}
          onClick={() => setMethod('Card')}
        >
          <CreditCard size={18} /> Credit/Debit Card
        </button>
        <button
          type="button"
          className={`method-tab-btn ${method === 'Cash' ? 'active' : ''}`}
          onClick={() => setMethod('Cash')}
        >
          <Banknote size={18} /> Counter Cash
        </button>
      </div>

      <form onSubmit={handleProcessPayment}>
        {method === 'UPI' && (
          <div className="fade-in">
            <div style={{ textAlign: 'center', margin: '12px 0 16px' }}>
              <div
                style={{
                  display: 'inline-block',
                  padding: 12,
                  background: '#ffffff',
                  border: '1px solid var(--border-color)',
                  borderRadius: 12,
                }}
              >
                {/* SVG Mock QR Code */}
                <svg width="140" height="140" viewBox="0 0 100 100" fill="#0f172a">
                  <path d="M0,0 h30 v30 h-30 z M10,10 h10 v10 h-10 z" />
                  <path d="M70,0 h30 v30 h-30 z M80,10 h10 v10 h-10 z" />
                  <path d="M0,70 h30 v30 h-30 z M10,80 h10 v10 h-10 z" />
                  <rect x="40" y="10" width="10" height="20" />
                  <rect x="10" y="40" width="20" height="10" />
                  <rect x="40" y="40" width="20" height="20" />
                  <rect x="70" y="40" width="10" height="15" />
                  <rect x="85" y="40" width="15" height="10" />
                  <rect x="40" y="70" width="15" height="20" />
                  <rect x="65" y="70" width="25" height="10" />
                  <rect x="75" y="85" width="15" height="15" />
                </svg>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  Scan with GPay / PhonePe / Paytm
                </div>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Or Pay via UPI VPA / ID</label>
              <input
                type="text"
                className="form-control"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="username@bank"
                required
              />
            </div>
          </div>
        )}

        {method === 'Card' && (
          <div className="fade-in">
            <div className="form-group">
              <label className="form-label">Card Number</label>
              <input
                type="text"
                className="form-control"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="4532 0000 0000 0000"
                required
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Valid Thru (MM/YY)</label>
                <input
                  type="text"
                  className="form-control"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  placeholder="MM/YY"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">CVV</label>
                <input
                  type="password"
                  className="form-control"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  maxLength={4}
                  placeholder="•••"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {method === 'Cash' && (
          <div className="fade-in" style={{ padding: '10px 0' }}>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Cash fine payment will be recorded as physically collected at the library circulation desk. A digital receipt will be automatically generated.
            </p>
          </div>
        )}

        <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              'Processing Demo Payment...'
            ) : (
              <>
                <Lock size={16} /> Pay ₹{payableAmount} Now
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default DemoPaymentModal;
