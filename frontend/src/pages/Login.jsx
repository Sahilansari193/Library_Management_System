import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useToast from '../hooks/useToast';
import { BookOpen, Lock, Mail, ArrowRight, ShieldCheck, User } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await login(email, password);
      showToast('Login Successful', `Welcome back, ${user.name}!`, 'success');
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      console.error(err);
      showToast('Authentication Error', err.response?.data?.message || 'Invalid email or password', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fillAdminCredentials = () => {
    setEmail('admin@college.edu');
    setPassword('Admin@123');
  };

  const fillStudentCredentials = () => {
    setEmail('rahul.sharma@college.edu');
    setPassword('Student@123');
  };

  return (
    <div className="auth-container">
      <div className="auth-card fade-in">
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
              boxShadow: '0 8px 16px rgba(29, 78, 216, 0.25)',
            }}
          >
            <BookOpen size={28} />
          </div>
          <h1>Central College Library</h1>
          <p>Library Membership & Fine Payment Management System</p>
        </div>

        <div className="demo-credentials-box">
          <h5>Quick Demo Credentials:</h5>
          <div className="demo-btn-group">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={fillAdminCredentials}
              style={{ flex: 1 }}
            >
              <ShieldCheck size={14} color="#1d4ed8" /> Fill Admin
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={fillStudentCredentials}
              style={{ flex: 1 }}
            >
              <User size={14} color="#059669" /> Fill Student
            </button>
          </div>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">College Email</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-control"
                placeholder="e.g. name@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ paddingLeft: 38 }}
              />
              <Mail
                size={16}
                color="var(--text-light)"
                style={{ position: 'absolute', left: 12, top: 12 }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingLeft: 38 }}
              />
              <Lock
                size={16}
                color="var(--text-light)"
                style={{ position: 'absolute', left: 12, top: 12 }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 12, padding: '12px' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : <>Sign In to Portal <ArrowRight size={16} /></>}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          New student without membership?{' '}
          <Link to="/register" style={{ color: 'var(--primary-700)', fontWeight: 700 }}>
            Register Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
