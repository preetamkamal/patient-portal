import React, { useState } from 'react';
import {
  Box, TextField, Button, Typography, FormControl,
  InputLabel, Select, MenuItem, Paper, Grid
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs'; // Import dayjs directly

function PatientInfoForm({ onSubmit, onCancel, previousInfo }) {
  const [patientInfo, setPatientInfo] = useState({
    name: '',
    dob: dayjs(), // Initialize with dayjs object
    testDate: dayjs(), // Initialize with dayjs object
    doctorAssigned: '',
    healthWorker: '',
    healthWorkerType: 'AASHA',
    phoneNumber: '',
    testLocation: '',
    uid: ''
  });

  // Function to auto-fill form with previous info
  const handleAutoFill = () => {
    if (previousInfo) {
      // Ensure dates are dayjs objects
      const updatedInfo = {
        ...previousInfo,
        dob: previousInfo.dob ? (typeof previousInfo.dob === 'string' ? dayjs(previousInfo.dob) : previousInfo.dob) : dayjs(),
        testDate: dayjs(), // Always use current date for test date
        // Preserve other fields if they exist
        phoneNumber: previousInfo.phoneNumber || '',
        testLocation: previousInfo.testLocation || '',
        uid: previousInfo.uid || ''
      };
      setPatientInfo(updatedInfo);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPatientInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (field, value) => {
    setPatientInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!patientInfo.name || !patientInfo.dob || !patientInfo.doctorAssigned || !patientInfo.healthWorker) {
      alert('Please fill all required fields');
      return;
    }
    onSubmit(patientInfo);
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 2 }}>
      <Typography variant="h5" gutterBottom align="center">
        Patient Information
      </Typography>
      <Typography variant="body2" gutterBottom align="center" sx={{ mb: 3 }}>
        Please provide the following information before starting the test
      </Typography>
      {/* Add auto-fill button if previous info exists */}
      {previousInfo && (
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
          <Button 
            variant="outlined" 
            color="secondary" 
            onClick={handleAutoFill}
            startIcon={<span role="img" aria-label="auto-fill">📋</span>}
          >
            Auto-fill with Previous Info
          </Button>
        </Box>
      )}
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              label="Patient Name"
              name="name"
              value={patientInfo.name}
              onChange={handleChange}
            />
          </Grid>

          {/* UID field */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="UID (Aadhaar Number, etc.)"
              name="uid"
              value={patientInfo.uid}
              onChange={handleChange}
              helperText="Optional unique identifier"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Date of Birth"
                value={patientInfo.dob}
                onChange={(newValue) => handleDateChange('dob', newValue)}
                slotProps={{ textField: { fullWidth: true, required: true } }}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Test Date"
                value={patientInfo.testDate}
                onChange={(newValue) => handleDateChange('testDate', newValue)}
                slotProps={{ textField: { fullWidth: true, required: true } }}
              />
            </LocalizationProvider>
          </Grid>

          {/* Phone Number field */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Phone Number"
              name="phoneNumber"
              value={patientInfo.phoneNumber}
              onChange={handleChange}
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
            />
          </Grid>

          {/* Location of Test field */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Location of Test"
              name="testLocation"
              value={patientInfo.testLocation}
              onChange={handleChange}
              placeholder="e.g., Hospital, Clinic, Home"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              label="Doctor Assigned"
              name="doctorAssigned"
              value={patientInfo.doctorAssigned}
              onChange={handleChange}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Health Worker Type</InputLabel>
              <Select
                name="healthWorkerType"
                value={patientInfo.healthWorkerType}
                onChange={handleChange}
                label="Health Worker Type"
              >
                <MenuItem value="AASHA">AASHA</MenuItem>
                <MenuItem value="KABHI">KABHI</MenuItem>
                <MenuItem value="CHO">CHO</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              label="Health Worker Name"
              name="healthWorker"
              value={patientInfo.healthWorker}
              onChange={handleChange}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Button variant="outlined" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" color="primary">
                Proceed to Test
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
}

export default PatientInfoForm;