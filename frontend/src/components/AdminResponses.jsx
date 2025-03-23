// src/components/AdminResponses.jsx
// import React, { useEffect, useState } from 'react';
// import {
//   Box,
//   Typography,
//   Table,
//   TableHead,
//   TableRow,
//   TableCell,
//   TableBody,
//   Button,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   TextField,
//   Alert,
//   Stack,
// } from '@mui/material';

// function AdminResponses() {
//   const [responses, setResponses] = useState([]);
//   const [selectedPatientId, setSelectedPatientId] = useState(null);
//   const [editingResponse, setEditingResponse] = useState({});
//   const [openDialog, setOpenDialog] = useState(false);
//   const [alertMsg, setAlertMsg] = useState('');
//   const baseUrl = import.meta.env.VITE_API_BASE_URL;
//   useEffect(() => {
//     fetchResponses();
//   }, []);

//   const fetchResponses = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const res = await fetch(`${baseUrl}/api/admin/responses`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const data = await res.json();
//       setResponses(data);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   // Convert JSON string to "Q1: ... | Q2: ..." format
//   const formatResponse = (responseString) => {
//     try {
//       const obj = JSON.parse(responseString);
//       return Object.entries(obj)
//         .map(([key, value]) => `Q${key}: ${value}`)
//         .join(' | ');
//     } catch (err) {
//       return responseString;
//     }
//   };

//   const handleEditClick = (patientId, currentResponses) => {
//     setSelectedPatientId(patientId);
//     setEditingResponse(JSON.parse(currentResponses));
//     setOpenDialog(true);
//   };

//   const handleDeleteResponse = async (patientId) => {
//     if (!window.confirm('Are you sure you want to delete this response?')) return;
//     try {
//       const token = localStorage.getItem('token');
//       const res = await fetch(`${baseUrl}/api/admin/responses/${patientId}`, {
//         method: 'DELETE',
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const data = await res.json();
//       if (data.success) {
//         setAlertMsg('Response deleted successfully.');
//         fetchResponses();
//       } else {
//         alert(data.error || 'Error deleting response');
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const handleDialogClose = () => {
//     setOpenDialog(false);
//     setSelectedPatientId(null);
//     setEditingResponse({});
//   };

//   const handleAdminUpdate = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const res = await fetch(`${baseUrl}/api/admin/responses/${selectedPatientId}`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({ responses: editingResponse }),
//       });
//       const data = await res.json();
//       if (data.success) {
//         setAlertMsg('Response updated successfully.');
//         fetchResponses();
//         handleDialogClose();
//       } else {
//         alert(data.error || 'Error updating response');
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   return (
//     <Box sx={{ p: 3 }}>
//       <Typography variant="h4" gutterBottom>
//         View Patient Responses
//       </Typography>
//       {alertMsg && <Alert severity="success" sx={{ mb: 2 }}>{alertMsg}</Alert>}
//       <Table>
//         <TableHead>
//           <TableRow>
//             <TableCell>Patient ID</TableCell>
//             <TableCell>Response</TableCell>
//             <TableCell align="right">Actions</TableCell>
//           </TableRow>
//         </TableHead>
//         <TableBody>
//           {responses.map((r) => (
//             <TableRow key={r.id}>
//               <TableCell>{r.patient_id}</TableCell>
//               <TableCell>{formatResponse(r.responses)}</TableCell>
//               <TableCell align="right">
//                 <Stack direction="row" spacing={1}>
//                   <Button
//                     variant="outlined"
//                     onClick={() => handleEditClick(r.patient_id, r.responses)}
//                   >
//                     Edit
//                   </Button>
//                   <Button
//                     variant="contained"
//                     color="error"
//                     onClick={() => handleDeleteResponse(r.patient_id)}
//                   >
//                     Delete Response
//                   </Button>
//                 </Stack>
//               </TableCell>
//             </TableRow>
//           ))}
//         </TableBody>
//       </Table>

//       {/* Dialog for editing response */}
//       <Dialog open={openDialog} onClose={handleDialogClose} fullWidth maxWidth="sm">
//         <DialogTitle>Edit Response for Patient {selectedPatientId}</DialogTitle>
//         <DialogContent>
//           <Typography variant="body2" gutterBottom>
//             Update the responses (modify the JSON as needed):
//           </Typography>
//           <TextField
//             fullWidth
//             multiline
//             rows={6}
//             value={JSON.stringify(editingResponse, null, 2)}
//             onChange={(e) => {
//               try {
//                 const newResp = JSON.parse(e.target.value);
//                 setEditingResponse(newResp);
//               } catch (err) {
//                 // ignore invalid JSON changes
//               }
//             }}
//           />
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleDialogClose}>Cancel</Button>
//           <Button onClick={handleAdminUpdate} variant="contained">
//             Update Response
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   );
// }

// export default AdminResponses;


import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Card, CardContent, TextField, Button, 
  Accordion, AccordionSummary, AccordionDetails, InputAdornment,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, Divider, Stack, IconButton, Grid
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import dayjs from 'dayjs';

function AdminResponses() {
  const [responses, setResponses] = useState([]);
  const [filteredResponses, setFilteredResponses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
  
  // Fetch all responses
  useEffect(() => {
    const fetchResponses = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${baseUrl}/api/admin/responses`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        
        // Format responses for display
        const formattedResponses = data.map(resp => {
          let respObj = {
            id: resp.id,
            patientId: resp.patient_id,
            patientName: 'Unknown',
            patientEmail: 'Unknown',
            timestamp: new Date(resp.timestamp || Date.now()).toLocaleString(),
            score: 0,
            maxScore: 0,
            answers: {}
          };
          
          try {
            const parsed = JSON.parse(resp.responses);
            respObj.answers = parsed.answers || {};
            respObj.score = parsed.score || 0;
            respObj.maxScore = parsed.maxScore || 0;
            
            // Extract patient info if available
            if (parsed.patientInfo) {
              respObj.patientName = parsed.patientInfo.name || 'Unknown';
              respObj.patientEmail = parsed.patientInfo.email || 'Unknown';
              respObj.patientDOB = parsed.patientInfo.dob || '';
              respObj.doctorAssigned = parsed.patientInfo.doctorAssigned || '';
              respObj.healthWorker = parsed.patientInfo.healthWorker || '';
              respObj.healthWorkerType = parsed.patientInfo.healthWorkerType || '';
              respObj.testDate = parsed.patientInfo.testDate || '';
            }
          } catch (e) {
            console.error("Error parsing response:", e);
          }
          
          return respObj;
        });
        
        setResponses(formattedResponses);
        setFilteredResponses(formattedResponses);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    
    const fetchQuestions = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${baseUrl}/api/mcqs?lang=en`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setQuestions(data);
      } catch (err) {
        console.error(err);
      }
    };
    
    fetchResponses();
    fetchQuestions();
  }, [baseUrl]);
  
  // Handle search
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (term === '') {
      setFilteredResponses(responses);
    } else {
      const filtered = responses.filter(resp => 
        (resp.patientName && resp.patientName.toLowerCase().includes(term)) || 
        (resp.patientEmail && resp.patientEmail.toLowerCase().includes(term))
      );
      setFilteredResponses(filtered);
    }
  };
  
  // Export a single response to Excel
  const exportToExcel = (response) => {
    // Create worksheet with patient info
    const worksheet = XLSX.utils.json_to_sheet([
      { 
        "Patient Name": response.patientName || 'Unknown',
        "Patient Email": response.patientEmail || 'Unknown',
        "Date of Birth": response.patientDOB || 'Not provided',
        "Test Date": response.testDate || response.timestamp,
        "Doctor Assigned": response.doctorAssigned || 'Not provided',
        "Health Worker Type": response.healthWorkerType || 'Not provided',
        "Health Worker Name": response.healthWorker || 'Not provided',
        "Final Score": `${response.score}/${response.maxScore}`
      }
    ]);
    
    // Add responses
    const answersData = Object.keys(response.answers).map(qId => {
      const question = questions.find(q => q.id.toString() === qId.toString());
      return {
        "Question ID": qId,
        "Question": question ? question.question_text : `Question ${qId}`,
        "Answer": response.answers[qId]
      };
    });
    
    // Add answers with a gap
    XLSX.utils.sheet_add_json(worksheet, answersData, { origin: 'A10' });
    
    // Create workbook and add worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Test Results");
    
    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    
    // Generate filename
    const fileName = `MSE_Results_${response.patientName.replace(/\s+/g, '_') || 'Patient'}_${response.patientId}.xlsx`;
    saveAs(data, fileName);
  };
  
  // Handle accordion expansion
  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };
  
  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">Loading patient responses...</Typography>
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" mb={3}>Patient Responses</Typography>
      
      {/* Search Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search by patient name or email"
          value={searchTerm}
          onChange={handleSearch}
          sx={{ mb: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>
      
      {/* Results Count */}
      <Typography variant="subtitle1" sx={{ mb: 2 }}>
        Showing {filteredResponses.length} of {responses.length} responses
      </Typography>
      
      {/* Response List */}
      {filteredResponses.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6">No responses found</Typography>
        </Paper>
      ) : (
        filteredResponses.map((response) => (
          <Accordion 
            key={response.id}
            expanded={expanded === `panel${response.id}`}
            onChange={handleAccordionChange(`panel${response.id}`)}
            sx={{ mb: 2 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1">
                  <strong>{response.patientName || `Patient ID: ${response.patientId}`}</strong> 
                  {response.patientEmail && ` - ${response.patientEmail}`}
                </Typography>
                <Box>
                  <Chip 
                    label={`Score: ${response.score}/${response.maxScore}`}
                    color={response.score / response.maxScore > 0.7 ? "success" : response.score / response.maxScore > 0.4 ? "warning" : "error"}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {response.timestamp}
                  </Typography>
                </Box>
              </Box>
            </AccordionSummary>
            
            <AccordionDetails>
              <Box>
                {/* Patient Information */}
                <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                  <Typography variant="h6" gutterBottom>Patient Information</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="subtitle2">Name:</Typography>
                      <Typography variant="body2" gutterBottom>{response.patientName || 'Not provided'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="subtitle2">Email:</Typography>
                      <Typography variant="body2" gutterBottom>{response.patientEmail || 'Not provided'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="subtitle2">Date of Birth:</Typography>
                      <Typography variant="body2" gutterBottom>{response.patientDOB || 'Not provided'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="subtitle2">Doctor Assigned:</Typography>
                      <Typography variant="body2" gutterBottom>{response.doctorAssigned || 'Not provided'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="subtitle2">Health Worker Type:</Typography>
                      <Typography variant="body2" gutterBottom>{response.healthWorkerType || 'Not provided'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="subtitle2">Health Worker Name:</Typography>
                      <Typography variant="body2" gutterBottom>{response.healthWorker || 'Not provided'}</Typography>
                    </Grid>
                  </Grid>
                </Paper>
                
                {/* Test Information */}
                <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" gutterBottom>Test Results</Typography>
                    <Button 
                      startIcon={<DownloadIcon />} 
                      variant="outlined" 
                      size="small"
                      onClick={() => exportToExcel(response)}
                    >
                      Export
                    </Button>
                  </Box>
                  <Typography variant="subtitle2">
                    Score: <strong>{response.score}</strong> out of <strong>{response.maxScore}</strong>
                    {response.maxScore > 0 && ` (${(response.score / response.maxScore * 100).toFixed(1)}%)`}
                  </Typography>
                  <Typography variant="subtitle2">
                    Test Date: {response.testDate || response.timestamp}
                  </Typography>
                </Paper>
                
                {/* Questions and Answers */}
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>Questions and Answers</Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell width="60%"><strong>Question</strong></TableCell>
                          <TableCell><strong>Answer</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.keys(response.answers).map(qId => {
                          const question = questions.find(q => q.id.toString() === qId.toString());
                          return (
                            <TableRow key={qId}>
                              <TableCell>{question ? question.question_text : `Question ${qId}`}</TableCell>
                              <TableCell>{response.answers[qId]}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Box>
            </AccordionDetails>
          </Accordion>
        ))
      )}
    </Box>
  );
}

export default AdminResponses;