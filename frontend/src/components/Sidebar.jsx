import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  LayoutDashboard,
  Users,
  Repeat,
  BellRing,
  CreditCard,
  Receipt,
  BarChart3,
  BookMarked,
  UserCheck,
  Bell,
  LogOut,
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, isAdmin, logout } = useAuth();

  const adminNavItems = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/books', icon: BookOpen, label: 'Book Catalog' },
    { to: '/admin/members', icon: Users, label: 'Memberships' },
    { to: '/admin/borrow', icon: Repeat, label: 'Issue & Return' },
    { to: '/admin/reminders', icon: BellRing, label: 'Due Reminders' },
    { to: '/admin/fines', icon: CreditCard, label: 'Fine Management' },
    { to: '/admin/payments', icon: Receipt, label: 'Payments History' },
    { to: '/admin/reports', icon: BarChart3, label: 'Reports & Analytics' },
  ];

  const studentNavItems = [
    { to: '/student/dashboard', icon: LayoutDashboard, label: 'My Dashboard' },
    { to: '/student/catalog', icon: BookOpen, label: 'Browse Catalog' },
    { to: '/student/my-books', icon: BookMarked, label: 'Borrowed Books' },
    { to: '/student/fines', icon: CreditCard, label: 'Fines & Payments' },
    { to: '/student/notifications', icon: Bell, label: 'Notifications' },
    { to: '/student/profile', icon: UserCheck, label: 'Library Card / Profile' },
  ];

  const navItems = isAdmin ? adminNavItems : studentNavItems;

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <>
      <div
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo-icon">
            <BookOpen size={22} />
          </div>
          <div className="sidebar-logo-text">
            <h1>Central Library</h1>
            <span>{isAdmin ? 'Admin Console' : 'Student Portal'}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-title">
            {isAdmin ? 'Library Operations' : 'Student Menu'}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'active' : ''}`
                }
                onClick={onClose}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="user-badge-mini">
            <div className="user-avatar-initials">{initials}</div>
            <div className="user-info-text">
              <div className="user-name">{user?.name || 'User'}</div>
              <div className="user-role">{user?.role || 'Guest'}</div>
            </div>
            <button
              onClick={logout}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '4px',
              }}
              title="Logout"
              aria-label="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
