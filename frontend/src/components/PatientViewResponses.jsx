// src/components/PatientViewResponses.jsx
import React, { useEffect, useState } from 'react';
import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Alert } from '@mui/material';

function PatientViewResponses() {
  const [responses, setResponses] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchMyResponses();
  }, []);

  const fetchMyResponses = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5011/api/patient/my-responses', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error('Failed to fetch responses');
      }
      const data = await res.json();
      setResponses(data);
    } catch (err) {
      console.error(err);
      setErrorMsg('Could not fetch your responses.');
    }
  };

  // Convert stored JSON string to something readable
  const formatResponse = (respString) => {
    try {
      const obj = JSON.parse(respString);
      return Object.entries(obj)
        .map(([qId, ans]) => `Q${qId}: ${ans}`)
        .join(' | ');
    } catch (err) {
      return respString;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        My Submitted Responses
      </Typography>
      {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Response ID</TableCell>
            <TableCell>Your Answers</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {responses.map((r) => (
            <TableRow key={r.id}>
              <TableCell>{r.id}</TableCell>
              <TableCell>{formatResponse(r.responses)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}

export default PatientViewResponses;
