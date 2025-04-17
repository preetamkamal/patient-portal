// src/components/PatientViewResponses.jsx
import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Table, 
  TableHead, 
  TableRow, 
  TableCell, 
  TableBody, 
  Alert, 
  Card, 
  CardContent,
  Button,
  Stack
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import dayjs from 'dayjs';

function PatientViewResponses() {
  const [responses, setResponses] = useState([]); // array of DB rows
  const [questionMap, setQuestionMap] = useState({}); // { [questionId]: "Question text" }
  const [errorMsg, setErrorMsg] = useState('');
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetchAllQuestions();
    fetchMyResponses();
  }, []);

  // 1) Fetch all questions (both languages, or just both "en" & "hi"?)
  const fetchAllQuestions = async () => {
    try {
      const token = localStorage.getItem('token');
      // Fetch English questions
      const res = await fetch(`${baseUrl}/api/mcqs?lang=en`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dataEn = await res.json();

      // Fetch Hindi questions
      const res2 = await fetch(`${baseUrl}/api/mcqs?lang=hi`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dataHi = await res2.json();
      
      // Fetch Kannada questions
      const res3 = await fetch(`${baseUrl}/api/mcqs?lang=kn`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dataKn = await res3.json();

      // Combine all languages
      const allQuestions = [...dataEn, ...dataHi, ...dataKn];

      // Build a map: questionId -> questionText
      const qMap = {};
      allQuestions.forEach(q => {
        qMap[q.id] = q.question_text;
      });
      setQuestionMap(qMap);
    } catch (err) {
      console.error('Error fetching questions:', err);
    }
  };

  // 2) Fetch the patient's submitted responses
  const fetchMyResponses = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${baseUrl}/api/patient/my-responses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error('Failed to fetch responses');
      }
      const data = await res.json();
      setResponses(data); // each row has {id, patient_id, responses}
    } catch (err) {
      console.error(err);
      setErrorMsg('Could not fetch your responses.');
    }
  };

  // Helper to parse a single "responses" JSON
  const parseResponse = (respString) => {
    try {
      return JSON.parse(respString); // e.g. { answers: {1: "Correct", 2: "Wrong"}, score: X, maxScore: Y }
    } catch {
      return null;
    }
  };

  // Export a single response to Excel
  const exportToExcel = (response) => {
    const parsed = parseResponse(response.responses);
    if (!parsed) return;
    
    const answersObj = parsed.answers || parsed;
    const score = parsed.score !== undefined ? parsed.score : null;
    const maxScore = parsed.maxScore !== undefined ? parsed.maxScore : null;
    const patientInfo = parsed.patientInfo || {};
    
    // Create worksheet with test results
    const worksheet = XLSX.utils.json_to_sheet([
      { 
        "Test Date": response.timestamp ? new Date(response.timestamp).toLocaleDateString() : "Unknown",
        "Patient Name": patientInfo.name || "Not provided",
        "UID": patientInfo.uid || "Not provided",
        "Phone Number": patientInfo.phoneNumber || "Not provided",
        "Date of Birth": patientInfo.dob ? new Date(patientInfo.dob).toLocaleDateString() : "Not provided",
        "Location of Test": patientInfo.testLocation || "Not provided",
        "Doctor Assigned": patientInfo.doctorAssigned || "Not provided",
        "Health Worker Type": patientInfo.healthWorkerType || "Not provided",
        "Health Worker Name": patientInfo.healthWorker || "Not provided",
        "Score": score !== null && maxScore !== null ? `${score}/${maxScore}` : "Not available"
      }
    ]);
    
    // Add a section for individual answers
    const answersData = Object.keys(answersObj).map(qId => {
      return {
        "Question ID": qId,
        "Question": questionMap[qId] || `Question ${qId}`,
        "Answer": answersObj[qId]
      };
    });
    
    // Add answers with a 2-row gap
    XLSX.utils.sheet_add_json(worksheet, answersData, { origin: 'A10' });
    
    // Create workbook and add worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Test Results");
    
    // Generate Excel file and download
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    
    // Generate filename with date
    const testDate = response.timestamp ? new Date(response.timestamp).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    const fileName = `MSE_Results_${testDate}.xlsx`;
    saveAs(data, fileName);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        My Submitted Responses
      </Typography>
      {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}
      {responses.length === 0 ? (
        <Typography>No responses found.</Typography>
      ) : (
        responses.map((r) => {
          const parsed = parseResponse(r.responses); // { answers: {...}, score, maxScore }
          if (!parsed) return null;

          const answersObj = parsed.answers || parsed; 
          const score = parsed.score !== undefined ? parsed.score : null;
          const maxScore = parsed.maxScore !== undefined ? parsed.maxScore : null;

          // We'll display each response in a Card
          return (
            <Card key={r.id} variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Response ID: {r.id}
                  </Typography>
                  <Button 
                    startIcon={<DownloadIcon />} 
                    variant="outlined" 
                    size="small"
                    onClick={() => exportToExcel(r)}
                  >
                    Download Results
                  </Button>
                </Box>
                
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Submitted: {new Date(r.timestamp || Date.now()).toLocaleString()}
                </Typography>
                
                {score !== null && maxScore !== null && (
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    Score: {score} / {maxScore}
                  </Typography>
                )}
                {/* Show each question+answer pair */}
                {Object.entries(answersObj).map(([qId, ans]) => {
                  const qText = questionMap[qId] || `Question #${qId}`;
                  return (
                    <Box key={qId} sx={{ mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        Q{qId}: {qText}
                      </Typography>
                      <Typography variant="body2">
                        You answered: {ans}
                      </Typography>
                    </Box>
                  );
                })}
              </CardContent>
            </Card>
          );
        })
      )}
    </Box>
  );
}

export default PatientViewResponses;
