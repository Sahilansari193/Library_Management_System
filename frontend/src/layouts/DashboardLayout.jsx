import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const titlesMap = {
  '/admin/dashboard': { title: 'Admin Overview', subtitle: 'Real-time library metrics and circulation tracking' },
  '/admin/books': { title: 'Book Catalog Management', subtitle: 'Manage book inventory, copies, and catalog listings' },
  '/admin/members': { title: 'Library Memberships', subtitle: 'Member records, plans, and subscription lifecycles' },
  '/admin/borrow': { title: 'Book Issue & Return', subtitle: 'Circulation desk, issue processing, and returns' },
  '/admin/reminders': { title: 'Due Date Reminders', subtitle: 'Track approaching returns, due today, and overdue alerts' },
  '/admin/fines': { title: 'Fine Management', subtitle: 'Calculate, review, waive, and track library overdue penalties' },
  '/admin/payments': { title: 'Fine Payments Log', subtitle: 'History of fee collections and printable digital receipts' },
  '/admin/reports': { title: 'Reports & Analytics', subtitle: 'Circulation statistics, trends, and CSV data export' },
  '/student/dashboard': { title: 'Student Portal Dashboard', subtitle: 'Membership status, borrowed books, and quick actions' },
  '/student/catalog': { title: 'Library Book Catalog', subtitle: 'Browse college library repository and check live availability' },
  '/student/my-books': { title: 'My Borrowed Books', subtitle: 'View currently issued titles, due dates, and return history' },
  '/student/fines': { title: 'Fines & Payments', subtitle: 'Outstanding overdue dues and simulated fee clearance' },
  '/student/notifications': { title: 'Library Notifications', subtitle: 'Due reminders, return confirmations, and payment receipts' },
  '/student/profile': { title: 'My Library Card', subtitle: 'Digital identity pass, membership validity, and personal details' },
};

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const currentInfo = titlesMap[location.pathname] || {
    title: 'Library Management System',
    subtitle: 'College Central Circulation & Records System',
  };

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-wrapper">
        <Navbar
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          title={currentInfo.title}
          subtitle={currentInfo.subtitle}
        />
        <main className="content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
