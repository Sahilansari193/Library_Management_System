import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import useToast from '../../hooks/useToast';
import { User, Phone, MapPin, Mail, Calendar, ShieldCheck, Save } from 'lucide-react';

const StudentProfile = () => {
  const { user, updateUserProfile } = useAuth();
  const { showToast } = useToast();

  const membership = user?.membership || {};

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || membership.phone || '',
    address: membership.address || '',
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUserProfile(formData);
      showToast('Profile Updated', 'Your contact details have been successfully updated', 'success');
    } catch (err) {
      showToast('Error', err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fade-in" style={{ maxWidth: 800 }}>
      {/* Digital Library ID Card Pass */}
      <div className="student-id-card">
        <div className="id-card-top">
          <div>
            <div className="id-card-college">Central College Library • Student Pass</div>
            <div className="id-card-title">{user?.name}</div>
          </div>
          <span
            className={`badge ${
              membership.status === 'Active' ? 'badge-active' : 'badge-expired'
            }`}
            style={{ fontSize: '0.85rem', padding: '6px 14px' }}
          >
            {membership.status || 'Active'}
          </span>
        </div>

        <div className="id-card-chip" />
        <div className="id-card-number">{membership.memberId || 'LIB-2026-0000'}</div>

        <div className="id-card-bottom">
          <div>
            <div className="id-card-label">Registered Plan</div>
            <div className="id-card-val">{membership.plan || 'Annual'}</div>
          </div>
          <div>
            <div className="id-card-label">Issue Date</div>
            <div className="id-card-val">
              {membership.startDate
                ? new Date(membership.startDate).toLocaleDateString()
                : new Date().toLocaleDateString()}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="id-card-label">Expiry Date</div>
            <div className="id-card-val">
              {membership.expiryDate
                ? new Date(membership.expiryDate).toLocaleDateString()
                : 'Lifetime'}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Form */}
      <div className="dashboard-card">
        <div className="dashboard-card-header">
          <div className="dashboard-card-title">
            <User size={18} color="var(--primary-600)" /> Update Contact & Hostel Information
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-control"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                style={{ paddingLeft: 36 }}
              />
              <User size={16} color="var(--text-light)" style={{ position: 'absolute', left: 12, top: 12 }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">College Email (Institutional)</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="form-control"
                  value={user?.email || ''}
                  disabled
                  style={{ paddingLeft: 36, backgroundColor: '#f1f5f9', cursor: 'not-allowed' }}
                />
                <Mail size={16} color="var(--text-light)" style={{ position: 'absolute', left: 12, top: 12 }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Contact Phone</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="tel"
                  className="form-control"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  style={{ paddingLeft: 36 }}
                />
                <Phone size={16} color="var(--text-light)" style={{ position: 'absolute', left: 12, top: 12 }} />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Hostel Block & Room / Residence Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-control"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
                style={{ paddingLeft: 36 }}
              />
              <MapPin size={16} color="var(--text-light)" style={{ position: 'absolute', left: 12, top: 12 }} />
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <Save size={16} /> {saving ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentProfile;
