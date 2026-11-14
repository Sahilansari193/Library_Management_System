import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useToast from '../hooks/useToast';
import { BookOpen, User, Mail, Lock, Phone, MapPin, ArrowRight } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    plan: 'Annual',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await register(formData);
      showToast('Registration Successful', `Welcome to the library, ${user.name}! Your membership is active.`, 'success');
      navigate('/student/dashboard');
    } catch (err) {
      console.error(err);
      showToast('Registration Error', err.response?.data?.message || 'Failed to create student account', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card fade-in" style={{ maxWidth: 540 }}>
        <div className="auth-header">
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              backgroundColor: 'var(--primary-700)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
            }}
          >
            <BookOpen size={28} />
          </div>
          <h1>Student Registration</h1>
          <p>Activate your library card & access books</p>
        </div>

        <form onSubmit={handleRegister}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder="e.g. Rahul Sharma"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  style={{ paddingLeft: 36 }}
                />
                <User size={15} color="var(--text-light)" style={{ position: 'absolute', left: 12, top: 12 }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">College Email</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="e.g. rahul@college.edu"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  style={{ paddingLeft: 36 }}
                />
                <Mail size={15} color="var(--text-light)" style={{ position: 'absolute', left: 12, top: 12 }} />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  style={{ paddingLeft: 36 }}
                />
                <Lock size={15} color="var(--text-light)" style={{ position: 'absolute', left: 12, top: 12 }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="tel"
                  name="phone"
                  className="form-control"
                  placeholder="+91 98765 00000"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  style={{ paddingLeft: 36 }}
                />
                <Phone size={15} color="var(--text-light)" style={{ position: 'absolute', left: 12, top: 12 }} />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Hostel / Residential Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                name="address"
                className="form-control"
                placeholder="Hostel Block, Room No, Campus Area"
                value={formData.address}
                onChange={handleChange}
                required
                style={{ paddingLeft: 36 }}
              />
              <MapPin size={15} color="var(--text-light)" style={{ position: 'absolute', left: 12, top: 12 }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Select Membership Plan</label>
            <select
              name="plan"
              className="form-control"
              value={formData.plan}
              onChange={handleChange}
            >
              <option value="Annual">Annual Membership (365 Days) - Recommended</option>
              <option value="Quarterly">Quarterly Membership (90 Days)</option>
              <option value="Monthly">Monthly Membership (30 Days)</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 12, padding: '12px' }}
            disabled={loading}
          >
            {loading ? 'Registering...' : <>Complete Registration <ArrowRight size={16} /></>}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary-700)', fontWeight: 700 }}>
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
