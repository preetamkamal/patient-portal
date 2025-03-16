import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Login() {
  const [role, setRole] = useState('patient')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    const endpoint = role === 'admin' ? '/api/admin/login' : '/api/patient/login'
    const response = await fetch('http://localhost:5011' + endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    const data = await response.json()
    if (data.success) {
      navigate(role === 'admin' ? '/admin' : '/patient', { state: data })
    } else {
      alert(data.message || 'Login failed')
    }
  }

  return (
    <div>
      <h2>Login</h2>
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
  )
}

export default Login
