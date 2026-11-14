import React, { useState, useEffect } from 'react';
import { BellRing, Send, CheckCircle2, Clock, AlertTriangle, User, Mail, Phone } from 'lucide-react';
import api from '../../services/api';
import useToast from '../../hooks/useToast';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

const DueReminders = () => {
  const [remindersData, setRemindersData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState(null);
  const [activeTab, setActiveTab] = useState('overdue'); // 'overdue' | 'dueToday' | 'dueSoon'

  const { showToast } = useToast();

  const fetchReminders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reminders');
      if (res.data.success) {
        setRemindersData(res.data);
      }
    } catch (err) {
      console.error('Failed to load reminders:', err);
      showToast('Error', 'Failed to retrieve due reminders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const handleSendReminder = async (id, memberName) => {
    setSendingId(id);
    try {
      const res = await api.post(`/reminders/${id}/send`);
      if (res.data.success) {
        showToast('Reminder Dispatched', `In-app notice & reminder sent to ${memberName}`, 'success');
        fetchReminders();
      }
    } catch (err) {
      showToast('Error', err.response?.data?.message || 'Could not send reminder', 'error');
    } finally {
      setSendingId(null);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Checking approaching due dates and overdue records..." />;
  }

  const summary = remindersData?.summary || { totalOverdue: 0, totalDueToday: 0, totalDueSoon: 0 };
  const overdueList = remindersData?.overdue || [];
  const dueTodayList = remindersData?.dueToday || [];
  const dueSoonList = remindersData?.dueSoon || [];

  const currentList =
    activeTab === 'overdue'
      ? overdueList
      : activeTab === 'dueToday'
      ? dueTodayList
      : dueSoonList;

  return (
    <div className="fade-in">
      <div className="page-header-actions">
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Automated Due Date Reminders</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Monitor approaching due dates, send instant reminders, and prevent overdue delays
          </p>
        </div>
      </div>

      {/* Tabs / Summary Chips */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div
          onClick={() => setActiveTab('overdue')}
          style={{
            padding: 16,
            borderRadius: 12,
            backgroundColor: activeTab === 'overdue' ? '#fef2f2' : '#ffffff',
            border: `2px solid ${activeTab === 'overdue' ? 'var(--danger)' : 'var(--border-color)'}`,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--danger)', fontWeight: 700 }}>
            <AlertTriangle size={18} /> Overdue Books
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: 4 }}>
            {summary.totalOverdue}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Accumulating daily late fines
          </div>
        </div>

        <div
          onClick={() => setActiveTab('dueToday')}
          style={{
            padding: 16,
            borderRadius: 12,
            backgroundColor: activeTab === 'dueToday' ? '#fffbeb' : '#ffffff',
            border: `2px solid ${activeTab === 'dueToday' ? 'var(--warning)' : 'var(--border-color)'}`,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--warning)', fontWeight: 700 }}>
            <Clock size={18} /> Due Today
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: 4 }}>
            {summary.totalDueToday}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Must be returned by counter closing
          </div>
        </div>

        <div
          onClick={() => setActiveTab('dueSoon')}
          style={{
            padding: 16,
            borderRadius: 12,
            backgroundColor: activeTab === 'dueSoon' ? '#eff6ff' : '#ffffff',
            border: `2px solid ${activeTab === 'dueSoon' ? 'var(--primary-600)' : 'var(--border-color)'}`,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--primary-700)', fontWeight: 700 }}>
            <BellRing size={18} /> Due Soon (≤ 3 Days)
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: 4 }}>
            {summary.totalDueSoon}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Upcoming return windows
          </div>
        </div>
      </div>

      {/* Active Tab Content */}
      {currentList.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title={`No ${activeTab === 'overdue' ? 'Overdue Books' : activeTab === 'dueToday' ? 'Books Due Today' : 'Upcoming Returns'}`}
          description="Everything in this category is currently in order. Great job!"
        />
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Member Information</th>
                <th>Borrowed Book</th>
                <th>Due Date</th>
                <th>Status / Days</th>
                <th>Last Reminder Sent</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentList.map((rec) => (
                <tr key={rec._id}>
                  <td>
                    <strong>{rec.member?.fullName}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      ID: {rec.member?.memberId}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {rec.member?.email} • {rec.member?.phone}
                    </div>
                  </td>
                  <td>
                    <strong>{rec.book?.title}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Stack: {rec.book?.shelfLocation}
                    </div>
                  </td>
                  <td>
                    <strong>{new Date(rec.dueDate).toLocaleDateString()}</strong>
                  </td>
                  <td>
                    {activeTab === 'overdue' && (
                      <span className="badge badge-overdue">
                        {rec.overdueDays} Days Late
                      </span>
                    )}
                    {activeTab === 'dueToday' && (
                      <span className="badge badge-due-soon">
                        Due Today
                      </span>
                    )}
                    {activeTab === 'dueSoon' && (
                      <span className="badge badge-info">
                        Due in {rec.remainingDays} Day(s)
                      </span>
                    )}
                  </td>
                  <td>
                    {rec.reminderSent ? (
                      <span style={{ fontSize: '0.8rem', color: 'var(--success)' }}>
                        Sent on {new Date(rec.reminderDate).toLocaleDateString()}
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
                        Not sent yet
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => handleSendReminder(rec._id, rec.member?.fullName)}
                      disabled={sendingId === rec._id}
                    >
                      <Send size={14} />{' '}
                      {sendingId === rec._id ? 'Sending...' : 'Send Reminder'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DueReminders;
