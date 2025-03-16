// src/components/PatientMCQ.jsx
import React, { useEffect, useState } from 'react';
import { Typography, Button, Radio, RadioGroup, FormControl, FormControlLabel, FormLabel, Box, Alert, Stack } from '@mui/material';

function PatientMCQ() {
  const [mcqs, setMcqs] = useState([]);
  const [language, setLanguage] = useState('en');
  const [responses, setResponses] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [canEdit, setCanEdit] = useState(false);

  const patientId = localStorage.getItem('patientId');

  useEffect(() => {
    fetchMCQs(language);
    checkSubmissionStatus();
  }, [language]);

  const fetchMCQs = async (lang) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5011/api/mcqs?lang=${lang}`, {
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
      const res = await fetch(`http://localhost:5011/api/patient/response-status?patientId=${patientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.submitted) {
        setSubmitted(true);
        setResponses(data.responses);
        setCanEdit(data.canEdit);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOptionChange = (qId, value) => {
    setResponses({ ...responses, [qId]: value });
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5011/api/mcqs/submit`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ patientId, responses })
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
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

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" mb={2}>
        MCQ Questionnaire
      </Typography>
      <Stack direction="row" spacing={1} mb={2}>
        <Button variant={language === 'en' ? 'contained' : 'outlined'} onClick={() => setLanguage('en')}>
          English
        </Button>
        <Button variant={language === 'hi' ? 'contained' : 'outlined'} onClick={() => setLanguage('hi')}>
          Hindi
        </Button>
      </Stack>
      {submitted ? (
        <Alert severity="success" sx={{ mb: 2 }}>
          Response already submitted.
          {canEdit && (
            <Button onClick={handleEdit} variant="outlined" size="small" sx={{ ml: 2 }}>
              Edit Response
            </Button>
          )}
        </Alert>
      ) : (
        mcqs.map((q) => (
          <Box key={q.id} sx={{ mb: 3 }}>
            <FormControl component="fieldset" fullWidth>
              <FormLabel component="legend">{q.question_text}</FormLabel>
              {q.image_url && (
                <Box sx={{ mt: 1 }}>
                  <img
                    src={`http://localhost:5011${q.image_url}`}
                    alt="Question"
                    style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }}
                  />
                </Box>
              )}
              <RadioGroup value={responses[q.id] || ''} onChange={(e) => handleOptionChange(q.id, e.target.value)}>
                {q.options.map((opt, idx) => (
                  <FormControlLabel key={idx} value={opt} control={<Radio />} label={opt} />
                ))}
              </RadioGroup>
            </FormControl>
          </Box>
        ))
      )}
      {!submitted && (
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Submit Responses
        </Button>
      )}
    </Box>
  );
}

export default PatientMCQ;
