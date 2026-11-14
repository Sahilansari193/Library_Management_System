import React from 'react';
import Modal from './Modal';
import { Printer, Download, CheckCircle2 } from 'lucide-react';

const ReceiptModal = ({ isOpen, onClose, payment }) => {
  if (!payment) return null;

  const handlePrint = () => {
    window.print();
  };

  const member = payment.member || {};
  const fine = payment.fine || {};
  const book = fine.book || {};
  const borrowRecord = fine.borrowRecord || {};

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Official Library Payment Receipt"
      size="md"
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button className="btn btn-primary" onClick={handlePrint}>
            <Printer size={16} /> Print Receipt
          </button>
        </>
      }
    >
      <div className="receipt-paper" id="printable-receipt">
        <div className="receipt-header">
          <h2>Central College Library</h2>
          <p>Autonomous College of Engineering & Technology</p>
          <p style={{ fontSize: '0.75rem', marginTop: 4 }}>
            Circulation Department • Digital Payment Voucher
          </p>
        </div>

        <div className="receipt-details-grid">
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Receipt Number:</div>
            <strong style={{ fontSize: '0.95rem' }}>{payment.receiptNumber}</strong>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Date & Time:</div>
            <strong>{new Date(payment.paymentDate || payment.createdAt).toLocaleString()}</strong>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Member ID:</div>
            <strong>{member.memberId || 'N/A'}</strong>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Student Name:</div>
            <strong>{member.fullName || 'Student'}</strong>
          </div>
        </div>

        <div style={{ margin: '16px 0', borderTop: '1px solid #e2e8f0', paddingTop: 12 }}>
          <div className="receipt-row">
            <span>Book Title:</span>
            <strong>{book.title || 'Library Resource'}</strong>
          </div>
          {borrowRecord.transactionId && (
            <div className="receipt-row">
              <span>Borrow Transaction ID:</span>
              <span>{borrowRecord.transactionId}</span>
            </div>
          )}
          <div className="receipt-row">
            <span>Payment Method:</span>
            <strong>{payment.paymentMethod} (Simulated)</strong>
          </div>
          <div className="receipt-row">
            <span>Payment Reference:</span>
            <span>{payment.transactionReference}</span>
          </div>
        </div>

        <div className="receipt-total-box">
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Status:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: '#16a34a' }}>
              <CheckCircle2 size={16} /> Payment Verified
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Amount Paid:</span>
            <h4>₹{payment.amount}</h4>
          </div>
        </div>

        <div className="receipt-footer-stamp">
          <div>
            <div>Computer-generated digital voucher.</div>
            <div>Valid for university clearance and library no-dues.</div>
          </div>
          <div>
            <div className="stamp-box">OFFICIALLY PAID</div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ReceiptModal;
