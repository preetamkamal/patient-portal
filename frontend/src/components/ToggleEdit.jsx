// src/components/ToggleEdit.jsx
import React, { useEffect, useState } from 'react';
import { Box, Typography, Switch, FormControlLabel } from '@mui/material';

function ToggleEdit() {
  const [allowEdit, setAllowEdit] = useState(true);
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const fetchSetting = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${baseUrl}/api/settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setAllowEdit(data.allow_edit === '1');
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchSetting();
  }, []);

  const handleToggle = async (event) => {
    const newValue = event.target.checked;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${baseUrl}/api/admin/toggle-edit`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ allow_edit: newValue }),
      });
      const data = await res.json();
      if (data.success) {
        setAllowEdit(newValue);
      } else {
        alert('Failed to toggle edit setting');
      }
    } catch (error) {
      console.error(error);
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
        label={allowEdit ? 'Editing is enabled' : 'Editing is disabled'}
      />
    </Box>
  );
}

export default ToggleEdit;
