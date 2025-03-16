// src/components/AdminResponses.jsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Stack,
} from '@mui/material';

function AdminResponses() {
  const [responses, setResponses] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [editingResponse, setEditingResponse] = useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  useEffect(() => {
    fetchResponses();
  }, []);

  const fetchResponses = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${baseUrl}/api/admin/responses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setResponses(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Convert JSON string to "Q1: ... | Q2: ..." format
  const formatResponse = (responseString) => {
    try {
      const obj = JSON.parse(responseString);
      return Object.entries(obj)
        .map(([key, value]) => `Q${key}: ${value}`)
        .join(' | ');
    } catch (err) {
      return responseString;
    }
  };

  const handleEditClick = (patientId, currentResponses) => {
    setSelectedPatientId(patientId);
    setEditingResponse(JSON.parse(currentResponses));
    setOpenDialog(true);
  };

  const handleDeleteResponse = async (patientId) => {
    if (!window.confirm('Are you sure you want to delete this response?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${baseUrl}/api/admin/responses/${patientId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setAlertMsg('Response deleted successfully.');
        fetchResponses();
      } else {
        alert(data.error || 'Error deleting response');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedPatientId(null);
    setEditingResponse({});
  };

  const handleAdminUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${baseUrl}/api/admin/responses/${selectedPatientId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ responses: editingResponse }),
      });
      const data = await res.json();
      if (data.success) {
        setAlertMsg('Response updated successfully.');
        fetchResponses();
        handleDialogClose();
      } else {
        alert(data.error || 'Error updating response');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        View Patient Responses
      </Typography>
      {alertMsg && <Alert severity="success" sx={{ mb: 2 }}>{alertMsg}</Alert>}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Patient ID</TableCell>
            <TableCell>Response</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {responses.map((r) => (
            <TableRow key={r.id}>
              <TableCell>{r.patient_id}</TableCell>
              <TableCell>{formatResponse(r.responses)}</TableCell>
              <TableCell align="right">
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    onClick={() => handleEditClick(r.patient_id, r.responses)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleDeleteResponse(r.patient_id)}
                  >
                    Delete Response
                  </Button>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Dialog for editing response */}
      <Dialog open={openDialog} onClose={handleDialogClose} fullWidth maxWidth="sm">
        <DialogTitle>Edit Response for Patient {selectedPatientId}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            Update the responses (modify the JSON as needed):
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={6}
            value={JSON.stringify(editingResponse, null, 2)}
            onChange={(e) => {
              try {
                const newResp = JSON.parse(e.target.value);
                setEditingResponse(newResp);
              } catch (err) {
                // ignore invalid JSON changes
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleAdminUpdate} variant="contained">
            Update Response
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AdminResponses;
