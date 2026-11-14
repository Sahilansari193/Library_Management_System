import React, { useState, useEffect } from 'react';
import { Menu, Bell, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Navbar = ({ onToggleSidebar, title, subtitle }) => {
  const { user, logout, isStudent } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchUnread = async () => {
      try {
        const res = await api.get('/notifications');
        if (res.data.success && isMounted) {
          setUnreadCount(res.data.unreadCount || 0);
        }
      } catch (err) {
        // quiet error on notification fetch
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 30000); // 30 sec poll
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button
          className="mobile-toggle-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
        >
          <Menu size={22} />
        </button>
        <div className="page-breadcrumb">
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>

      <div className="navbar-right">
        {isStudent && (
          <button
            className="nav-notification-btn"
            onClick={() => navigate('/student/notifications')}
            title="Notifications"
            aria-label="View notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </button>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              backgroundColor: 'var(--primary-100)',
              color: 'var(--primary-700)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.85rem',
            }}
          >
            <User size={18} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {user?.name}
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
              {user?.role}
            </span>
          </div>
        </div>

        <button
          className="btn btn-outline btn-sm"
          onClick={logout}
          style={{ marginLeft: 8 }}
          title="Sign out"
        >
          <LogOut size={14} /> Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;
