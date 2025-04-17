import React, { useEffect, useState } from 'react';
import {
  Typography,
  Button,
  Radio,
  RadioGroup,
  FormControl,
  FormControlLabel,
  FormLabel,
  Box,
  Alert,
  Stack,
  Card,
  CardContent
} from '@mui/material';
import PatientInfoForm from './PatientInfoForm';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import dayjs from 'dayjs';
function PatientMCQ() {
  const [mcqs, setMcqs] = useState([]);
  const [language, setLanguage] = useState('en');
  const [responses, setResponses] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [scoreInfo, setScoreInfo] = useState(null);
  const [showPatientForm, setShowPatientForm] = useState(true); 
  const [patientInfo, setPatientInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [previousPatientInfo, setPreviousPatientInfo] = useState(null);

  const patientId = localStorage.getItem('patientId');
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  useEffect(() => {
    const storedPatientInfo = localStorage.getItem('patientInfo');
    if (storedPatientInfo) {
      const parsedInfo = JSON.parse(storedPatientInfo);
      // Convert date strings back to dayjs objects if needed
      if (parsedInfo.dob) parsedInfo.dob = dayjs(parsedInfo.dob);
      if (parsedInfo.testDate) parsedInfo.testDate = dayjs(parsedInfo.testDate);
      setPatientInfo(parsedInfo);
      setShowPatientForm(false);
    }
    
    // Check if there's a submission already
    checkSubmissionStatus().then(() => {
      setIsLoading(false);
    });
  }, []);
  useEffect(() => {
    // Only fetch MCQs if patient info is provided
    if (patientInfo) {
      fetchMCQs(language);
    }
  }, [language, patientInfo]);

  const fetchMCQs = async (lang) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${baseUrl}/api/mcqs?lang=${lang}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setMcqs(data);
    } catch (err) {
      console.error(err);
    }
  };

  const checkSubmissionStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${baseUrl}/api/patient/response-status?patientId=${patientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.submitted) {
        setSubmitted(true);
        setResponses(data.responses.answers || data.responses);
        
        // Also retrieve patient info from response if available
        if (data.responses.patientInfo) {
          setPatientInfo(data.responses.patientInfo);
          setPreviousPatientInfo(data.responses.patientInfo);
          setShowPatientForm(false);
        }
        
        if (data.responses.score !== undefined && data.responses.maxScore !== undefined) {
          setScoreInfo({ score: data.responses.score, maxScore: data.responses.maxScore });
        }
        setCanEdit(data.canEdit);
      }
      return data;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const handleOptionChange = (qId, value) => {
    setResponses({ ...responses, [qId]: value });
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${baseUrl}/api/mcqs/submit`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          patientId, 
          responses,
          patientInfo // Include patient info with the submission
        })
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        if (data.score !== undefined && data.maxScore !== undefined) {
          setScoreInfo({ score: data.score, maxScore: data.maxScore });
        }
      } else {
        alert(data.error || 'Error submitting responses');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = () => {
    if (!canEdit) {
      alert('Editing is disabled by admin.');
      return;
    }
    setSubmitted(false);
  };

  const handleNewTest = () => {
    setSubmitted(false);
    setResponses({});
    setScoreInfo(null);
    setShowPatientForm(true);
  };

  useEffect(() => {
    // Get patient profile data
    fetchPatientProfile();
    // Check submission status as before
    checkSubmissionStatus().then(() => {
      setIsLoading(false);
    });
  }, []);

  const fetchPatientProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${baseUrl}/api/patient/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          // Convert strings to dayjs objects where needed
          const profile = {
            ...data.profile,
            name: data.profile.name || '',
            dob: data.profile.dob ? dayjs(data.profile.dob) : dayjs(),
            doctorAssigned: data.profile.doctor_assigned || '',
            healthWorker: data.profile.health_worker || '',
            healthWorkerType: data.profile.health_worker_type || 'AASHA',
            phoneNumber: data.profile.phone_number || '',
            testLocation: data.profile.test_location || '',
            uid: data.profile.uid || ''
          };
          
          setPreviousPatientInfo(profile);
          setPatientInfo(profile);
          
          // Only show form if profile is incomplete
          if (!profile.name || !profile.doctorAssigned || !profile.healthWorker) {
            setShowPatientForm(true);
          } else {
            setShowPatientForm(false);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching patient profile:", err);
    }
  };
  
  const handlePatientInfoSubmit = async (info) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${baseUrl}/api/patient/profile`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: info.name,
          dob: info.dob.format('YYYY-MM-DD'),
          doctorAssigned: info.doctorAssigned,
          healthWorker: info.healthWorker,
          healthWorkerType: info.healthWorkerType,
          phoneNumber: info.phoneNumber,
          testLocation: info.testLocation,
          uid: info.uid
        })
      });
      
      if (res.ok) {
        setPatientInfo(info);
        setPreviousPatientInfo(info); 
        setShowPatientForm(false);
      } else {
        alert('Failed to save patient information');
      }
    } catch (err) {
      console.error("Error saving patient profile:", err);
      alert('Error saving information');
    }
  };
  
  const exportToExcel = () => {
    // Create worksheet with test results
    const worksheet = XLSX.utils.json_to_sheet([
      { 
        "Patient Name": patientInfo.name,
        "UID": patientInfo.uid || "Not provided",
        "Phone Number": patientInfo.phoneNumber || "Not provided",
        "Date of Birth": patientInfo.dob ? patientInfo.dob.format('MM/DD/YYYY') : "Not provided",
        "Test Date": patientInfo.testDate ? patientInfo.testDate.format('MM/DD/YYYY') : new Date().toLocaleDateString(),
        "Location of Test": patientInfo.testLocation || "Not provided",
        "Doctor Assigned": patientInfo.doctorAssigned,
        "Health Worker Type": patientInfo.healthWorkerType,
        "Health Worker Name": patientInfo.healthWorker,
        "Language": language === 'en' ? 'English' : (language === 'hi' ? 'Hindi' : 'Kannada'),
        "Final Score": scoreInfo ? `${scoreInfo.score}/${scoreInfo.maxScore}` : "Not available"
      }
    ]);
    
    // Add a section for individual answers
    const answersData = Object.keys(responses).map(qId => {
      const question = mcqs.find(q => q.id.toString() === qId.toString());
      return {
        "Question ID": qId,
        "Question": question ? question.question_text : `Question ${qId}`,
        "Answer": responses[qId]
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
    
    // Generate filename with patient name and date
    const fileName = `MSE_Results_${patientInfo.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
    saveAs(data, fileName);
  };
  if (isLoading) {
    return <Box sx={{ p: 3, textAlign: 'center' }}>Loading...</Box>;
  }
  // If we need to collect patient info first, show that form
  if (showPatientForm) {
    return <PatientInfoForm 
      onSubmit={handlePatientInfoSubmit} 
      onCancel={() => window.history.back()}
      previousInfo={previousPatientInfo}
    />;
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" mb={2}>
        MCQ Questionnaire
      </Typography>
      
      {patientInfo && (
        <Box sx={{ mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="subtitle1">
            Patient: {patientInfo.name} | Doctor: {patientInfo.doctorAssigned} | {patientInfo.healthWorkerType}: {patientInfo.healthWorker}
          </Typography>
        </Box>
      )}
      
      <Stack direction="row" spacing={1} mb={2}>
        <Button variant={language === 'en' ? 'contained' : 'outlined'} onClick={() => setLanguage('en')}>
          English
        </Button>
        <Button variant={language === 'hi' ? 'contained' : 'outlined'} onClick={() => setLanguage('hi')}>
          हिंदी
        </Button>
        <Button variant={language === 'kn' ? 'contained' : 'outlined'} onClick={() => setLanguage('kn')}>
          ಕನ್ನಡ
        </Button>
        {submitted && (
          <Button onClick={handleNewTest} variant="contained"
          color="success"  size="large">
          Take New Test
        </Button>
        )}
      </Stack>
      
      {submitted ? (
        <Box>
          <Alert severity="success" sx={{ mb: 2 }}>
            Response already submitted.
            {scoreInfo && (
              <Typography variant="subtitle1" sx={{ mt: 1 }}>
                Your score: {scoreInfo.score} / {scoreInfo.maxScore}
              </Typography>
            )}
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              {canEdit && (
                <Button onClick={handleEdit} variant="outlined" size="small">
                  Edit Response
                </Button>
              )}
              <Button 
                onClick={exportToExcel} 
                variant="outlined" 
                size="small"
              >
                Download Results (Excel)
              </Button>
            </Stack>
          </Alert>
        </Box>
      ) : (
        <Stack spacing={2}>
          {mcqs.map((q) => (
            <Card key={q.id} variant="outlined">
              <CardContent>
                <FormControl component="fieldset" fullWidth>
                  <FormLabel component="legend">{q.question_text}</FormLabel>
                  {q.image_url && (
                    <Box sx={{ mt: 1 }}>
                      <img
                        src={`${baseUrl}${q.image_url}`}
                        alt="Question"
                        style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain', marginTop: '8px' }}
                      />
                    </Box>
                  )}
                  <RadioGroup
                    value={responses[q.id] || ''}
                    onChange={(e) => handleOptionChange(q.id, e.target.value)}
                  >
                    {q.options.map((opt, idx) => (
                      <FormControlLabel key={idx} value={opt.text} control={<Radio />} label={opt.text} />
                    ))}
                  </RadioGroup>
                </FormControl>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
      
      {!submitted && (
        <Button variant="contained" color="primary" onClick={handleSubmit} sx={{ mt: 2 }}>
          Submit Responses
        </Button>
      )}
    </Box>
  );
}

export default PatientMCQ;