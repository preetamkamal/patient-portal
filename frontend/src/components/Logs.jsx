// src/components/Logs.jsx
import React, { useEffect, useState } from 'react';
import { Box, Typography, List, ListItem, ListItemText } from '@mui/material';

function Logs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5011/api/admin/logs', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setLogs(data);
      } catch (error) {
        console.error('Error fetching logs:', error);
      }
    };
    fetchLogs();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        System Logs
      </Typography>
      <List>
        {logs.map((log) => (
          <ListItem key={log.id}>
            <ListItemText primary={`${log.timestamp} - ${log.action}`} secondary={log.details} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

export default Logs;
