// src/components/ToggleEdit.jsx
import React, { useState, useEffect } from 'react';
import { Box, Typography, Switch, FormControlLabel } from '@mui/material';

function ToggleEdit() {
  const [allowEdit, setAllowEdit] = useState(true);

  // Function to fetch current setting (if you have such an endpoint)
  const fetchAllowEdit = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5011/api/settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setAllowEdit(data.allow_edit === '1');
    } catch (error) {
      console.error('Error fetching setting:', error);
    }
  };

  useEffect(() => {
    fetchAllowEdit();
  }, []);

  const handleToggle = async (event) => {
    const newValue = event.target.checked;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5011/api/admin/toggle-edit', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ allow_edit: newValue })
      });
      const data = await response.json();
      if (data.success) {
        setAllowEdit(newValue);
      } else {
        alert('Failed to toggle edit setting');
      }
    } catch (error) {
      console.error('Error toggling edit:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Toggle Edit Setting
      </Typography>
      <FormControlLabel
        control={
          <Switch
            checked={allowEdit}
            onChange={handleToggle}
            color="primary"
          />
        }
        label="Allow Edit"
      />
    </Box>
  );
}

export default ToggleEdit;
