import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, Clock, AlertTriangle, CreditCard, Info } from 'lucide-react';
import api from '../../services/api';
import useToast from '../../hooks/useToast';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

const MyNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const { showToast } = useToast();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      const res = await api.put(`/notifications/${id}/read`);
      if (res.data.success) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, read: true } : n))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await api.put('/notifications/read-all');
      if (res.data.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        showToast('Success', 'All notifications marked as read', 'success');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'Overdue':
        return <AlertTriangle size={20} color="var(--danger)" />;
      case 'DueToday':
      case 'DueSoon':
        return <Clock size={20} color="var(--warning)" />;
      case 'Payment':
        return <CreditCard size={20} color="var(--success)" />;
      default:
        return <Info size={20} color="var(--primary-600)" />;
    }
  };

  if (loading) {
    return <LoadingSpinner text="Checking for updates and alerts..." />;
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="fade-in">
      <div className="page-header-actions">
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Library Notifications & Alerts</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            {unreadCount} unread alert(s) on your library account
          </p>
        </div>

        {unreadCount > 0 && (
          <button className="btn btn-outline btn-sm" onClick={handleMarkAllRead}>
            <CheckCheck size={16} /> Mark All as Read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No Notifications Yet"
          description="You are fully up to date! System notifications for borrowed books, returns, and payment receipts will appear here."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {notifications.map((n) => (
            <div
              key={n._id}
              style={{
                backgroundColor: n.read ? '#ffffff' : '#f0f7ff',
                border: `1px solid ${n.read ? 'var(--border-color)' : 'var(--primary-200)'}`,
                borderRadius: 12,
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 16,
                transition: 'all 0.2s',
              }}
            >
              <div style={{ marginTop: 2 }}>{getNotificationIcon(n.type)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {n.title}
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                  {n.message}
                </p>
              </div>
              {!n.read && (
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => handleMarkAsRead(n._id)}
                  style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                >
                  Mark Read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyNotifications;
