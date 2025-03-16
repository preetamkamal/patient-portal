// src/components/AdminDashboard.jsx
import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Alert } from '@mui/material';

function AdminDashboard() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [alertMsg, setAlertMsg] = useState('');
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const handleAddPatient = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${baseUrl}/api/admin/add-patient`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        setAlertMsg(`Patient added successfully (ID: ${data.patientId})`);
        setEmail('');
        setPassword('');
      } else {
        setAlertMsg(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      setAlertMsg('An error occurred adding the patient.');
    }
  };

  return (
    <Box>
      <Typography variant="h4" mb={2}>Admin Dashboard</Typography>
      {/* Existing dashboard content */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6">Add New Patient</Typography>
        {alertMsg && <Alert severity="info" sx={{ my: 2 }}>{alertMsg}</Alert>}
        <form onSubmit={handleAddPatient}>
          <TextField
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Password"
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            sx={{ mb: 2 }}
          />
          <Button type="submit" variant="contained">
            Add Patient
          </Button>
        </form>
      </Box>
    </Box>
  );
}

export default AdminDashboard;
