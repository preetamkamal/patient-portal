// src/components/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, Typography, TextField, Button, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

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
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', role);
        if (role === 'patient') {
          localStorage.setItem('patientId', data.patient.id);
          navigate('/patient');
        } else {
          navigate('/admin');
        }
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Error during login:', error);
      alert('An error occurred. Please try again later.');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Card sx={{ width: { xs: '100%', sm: 400 }, p: 2 }}>
        <CardContent>
          <Typography variant="h4" textAlign="center" gutterBottom>
            Healer Login
          </Typography>
          <Box component="form" onSubmit={handleLogin} noValidate>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="role-select-label">Role</InputLabel>
              <Select
                labelId="role-select-label"
                value={role}
                label="Role"
                onChange={(e) => setRole(e.target.value)}
              >
                <MenuItem value="patient">Patient</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              type="email"
              label="Email"
              variant="outlined"
              sx={{ mb: 2 }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <TextField
              fullWidth
              type="password"
              label="Password"
              variant="outlined"
              sx={{ mb: 2 }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" variant="contained" fullWidth>
              Login
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default Login;
