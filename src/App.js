import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    if (token) {
      const adminData = localStorage.getItem('admin');
      if (adminData) {
        setAdmin(JSON.parse(adminData));
      }
    }
  }, [token]);

  const handleLogin = (token, adminData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('admin', JSON.stringify(adminData));
    setToken(token);
    setAdmin(adminData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    setToken('');
    setAdmin(null);
  };

  const handleAdminUpdate = (newToken, newAdminData) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('admin', JSON.stringify(newAdminData));
    setToken(newToken);
    setAdmin(newAdminData);
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/login" 
            element={!token ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} 
          />
          <Route 
            path="/" 
            element={token ? (
              <Dashboard 
                token={token} 
                admin={admin} 
                onLogout={handleLogout}
                onAdminUpdate={handleAdminUpdate}
              />
            ) : (
              <Navigate to="/login" />
            )} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
