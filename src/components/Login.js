import React, { useState } from 'react';
import { login } from '../services/api';
import './Login.css';

function Login({ onLogin }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(username, password);
      
      if (data.success) {
        onLogin(data.token, data.admin);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Connection error. Check if server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="logo">🔐</div>
        <h1>VenkatSecurity</h1>
        <p className="subtitle">Admin Portal</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              disabled={loading}
            />
          </div>
          
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? <span className="spinner"></span> : 'Login'}
          </button>
          
          {error && <p className="error-message">{error}</p>}
        </form>
        
        <p className="info-text">
          First time? Default username: <strong>admin</strong>, password: <strong>your ADMIN_KEY</strong>
        </p>
      </div>
    </div>
  );
}

export default Login;

