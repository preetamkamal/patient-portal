// src/components/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [role, setRole] = useState('patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const endpoint = role === 'admin' ? '/api/admin/login' : '/api/patient/login';
    try {
      const response = await fetch(`http://localhost:5011${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (data.success) {
        // Save the token and the role
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', role);
        // Navigate
        navigate(role === 'admin' ? '/admin' : '/patient');
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Error during login:', error);
      alert('An error occurred during login. Please try again later.');
    }
  };

  return (
    <div style={{ margin: '100px auto', width: 300 }}>
      <h2>Healer Login</h2>
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="patient">Patient</option>
        <option value="admin">Admin</option>
      </select>
      <form onSubmit={handleLogin}>
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          required 
          onChange={(e) => setEmail(e.target.value)} 
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          required 
          onChange={(e) => setPassword(e.target.value)} 
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;
