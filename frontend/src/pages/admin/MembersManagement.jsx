import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, RefreshCw, Edit2, Trash2, Users, Calendar, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import useToast from '../../hooks/useToast';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import Pagination from '../../components/Pagination';

const initialNewMember = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  plan: 'Annual',
  password: 'Student@123',
};

const MembersManagement = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [planFilter, setPlanFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMembers, setTotalMembers] = useState(0);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const [formData, setFormData] = useState(initialNewMember);
  const [renewPlan, setRenewPlan] = useState('Annual');
  const [submitting, setSubmitting] = useState(false);

  const { showToast } = useToast();

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/members', {
        params: {
          search,
          status: statusFilter,
          plan: planFilter,
          page: currentPage,
          limit: 10,
        },
      });
      if (res.data.success) {
        setMembers(res.data.members);
        setTotalPages(res.data.totalPages);
        setTotalMembers(res.data.total);
      }
    } catch (err) {
      console.error('Failed to load members:', err);
      showToast('Error', 'Failed to fetch membership records', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, planFilter, currentPage, showToast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMembers();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchMembers]);

  // Handle Add Member
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/members', formData);
      if (res.data.success) {
        showToast('Member Registered', res.data.message, 'success');
        setIsAddModalOpen(false);
        setFormData(initialNewMember);
        fetchMembers();
      }
    } catch (err) {
      showToast('Error', err.response?.data?.message || 'Failed to register member', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Edit Member
  const handleOpenEdit = (m) => {
    setSelectedMember(m);
    setFormData({
      fullName: m.fullName,
      email: m.email,
      phone: m.phone,
      address: m.address,
      status: m.status,
      plan: m.plan,
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.put(`/members/${selectedMember._id}`, formData);
      if (res.data.success) {
        showToast('Updated', 'Member profile updated successfully', 'success');
        setIsEditModalOpen(false);
        fetchMembers();
      }
    } catch (err) {
      showToast('Error', err.response?.data?.message || 'Failed to update member', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Renewal
  const handleOpenRenew = (m) => {
    setSelectedMember(m);
    setRenewPlan(m.plan || 'Annual');
    setIsRenewModalOpen(true);
  };

  const handleRenewSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post(`/members/${selectedMember._id}/renew`, { plan: renewPlan });
      if (res.data.success) {
        showToast('Membership Renewed', res.data.message, 'success');
        setIsRenewModalOpen(false);
        fetchMembers();
      }
    } catch (err) {
      showToast('Error', err.response?.data?.message || 'Renewal failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete
  const handleDelete = async (m) => {
    if (!window.confirm(`Are you sure you want to delete member ${m.fullName} (${m.memberId})?`)) return;
    try {
      const res = await api.delete(`/members/${m._id}`);
      if (res.data.success) {
        showToast('Member Removed', res.data.message, 'success');
        fetchMembers();
      }
    } catch (err) {
      showToast('Action Prohibited', err.response?.data?.message || 'Cannot delete member', 'error');
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header-actions">
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Library Memberships Roster</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Manage {totalMembers} registered students and staff cards
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setFormData(initialNewMember);
            setIsAddModalOpen(true);
          }}
        >
          <Plus size={16} /> Register New Member
        </button>
      </div>

      {/* Filters Bar */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="form-control"
            placeholder="Search by member name, email, ID, or phone..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Expired">Expired</option>
          <option value="Suspended">Suspended</option>
        </select>

        <select
          className="filter-select"
          value={planFilter}
          onChange={(e) => {
            setPlanFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="All">All Plans</option>
          <option value="Annual">Annual</option>
          <option value="Quarterly">Quarterly</option>
          <option value="Monthly">Monthly</option>
        </select>
      </div>

      {/* Members Table */}
      {loading ? (
        <LoadingSpinner text="Retrieving members list..." />
      ) : members.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Members Found"
          description="No member profiles match your current search criteria."
          actionLabel="Register Member"
          onAction={() => setIsAddModalOpen(true)}
        />
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Member ID</th>
                <th>Full Name</th>
                <th>Contact</th>
                <th>Plan</th>
                <th>Start Date</th>
                <th>Expiry Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m._id}>
                  <td>
                    <span
                      style={{
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        backgroundColor: 'var(--primary-50)',
                        color: 'var(--primary-800)',
                        padding: '4px 8px',
                        borderRadius: 4,
                      }}
                    >
                      {m.memberId}
                    </span>
                  </td>
                  <td>
                    <strong>{m.fullName}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.email}</div>
                  </td>
                  <td style={{ fontSize: '0.82rem' }}>
                    <div>{m.phone}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.address}</div>
                  </td>
                  <td>
                    <span className="badge badge-info">{m.plan}</span>
                  </td>
                  <td>{new Date(m.startDate).toLocaleDateString()}</td>
                  <td>
                    <strong
                      style={{
                        color:
                          m.status === 'Expired'
                            ? 'var(--danger)'
                            : 'var(--text-primary)',
                      }}
                    >
                      {new Date(m.expiryDate).toLocaleDateString()}
                    </strong>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        m.status === 'Active'
                          ? 'badge-active'
                          : m.status === 'Expired'
                          ? 'badge-expired'
                          : 'badge-suspended'
                      }`}
                    >
                      {m.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 6 }}>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => handleOpenRenew(m)}
                        title="Renew Membership"
                      >
                        <RefreshCw size={14} /> Renew
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleOpenEdit(m)}
                        title="Edit Info"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(m)}
                        title="Delete Member"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalMembers}
            onPageChange={(p) => setCurrentPage(p)}
          />
        </div>
      )}

      {/* Register New Member Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Library Member"
        size="md"
      >
        <form onSubmit={handleAddSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              className="form-control"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="e.g. Rahul Sharma"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">College Email *</label>
              <input
                type="email"
                className="form-control"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@college.edu"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Phone *</label>
              <input
                type="tel"
                className="form-control"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 00000"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Residential / Hostel Address *</label>
            <input
              type="text"
              className="form-control"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Hostel Block, Room No"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Membership Plan</label>
              <select
                className="form-control"
                value={formData.plan}
                onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
              >
                <option value="Annual">Annual (365 Days)</option>
                <option value="Quarterly">Quarterly (90 Days)</option>
                <option value="Monthly">Monthly (30 Days)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Default Password</label>
              <input
                type="text"
                className="form-control"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 20 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Registering...' : 'Register Member'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Member Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Member Information"
        size="md"
      >
        <form onSubmit={handleEditSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-control"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                className="form-control"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Membership Status</label>
              <select
                className="form-control"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Active">Active</option>
                <option value="Expired">Expired</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Address</label>
            <input
              type="text"
              className="form-control"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 20 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Update Member'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Renew Membership Modal */}
      <Modal
        isOpen={isRenewModalOpen}
        onClose={() => setIsRenewModalOpen(false)}
        title="Renew Library Membership"
        size="md"
      >
        <form onSubmit={handleRenewSubmit}>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
            Renewing membership for <strong>{selectedMember?.fullName}</strong> ({selectedMember?.memberId}).
            Current expiry: {selectedMember?.expiryDate && new Date(selectedMember.expiryDate).toLocaleDateString()}.
          </p>

          <div className="form-group">
            <label className="form-label">Select Renewal Duration / Plan</label>
            <select
              className="form-control"
              value={renewPlan}
              onChange={(e) => setRenewPlan(e.target.value)}
            >
              <option value="Annual">Annual Renewal (+365 Days)</option>
              <option value="Quarterly">Quarterly Renewal (+90 Days)</option>
              <option value="Monthly">Monthly Renewal (+30 Days)</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 20 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsRenewModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Renewing...' : 'Confirm Renewal'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MembersManagement;
