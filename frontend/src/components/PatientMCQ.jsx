// src/components/PatientMCQ.jsx
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

function PatientMCQ() {
  const [mcqs, setMcqs] = useState([]);
  const [language, setLanguage] = useState('en');
  const [responses, setResponses] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [scoreInfo, setScoreInfo] = useState(null);

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
        // If scoring is used, the API might store answers in data.responses.answers
        setResponses(data.responses.answers || data.responses);
        if (data.responses.score !== undefined && data.responses.maxScore !== undefined) {
          setScoreInfo({ score: data.responses.score, maxScore: data.responses.maxScore });
        }
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

  return (
    <Box className="oxygen-regular" sx={{ p: 2 }}>
      <Typography variant="h4" mb={2} className="oxygen-bold">
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
          Response submitted.
          {scoreInfo && (
            <Typography variant="subtitle1" sx={{ mt: 1 }}>
              Your score: {scoreInfo.score} / {scoreInfo.maxScore}
            </Typography>
          )}
          {canEdit && (
            <Button onClick={handleEdit} variant="outlined" size="small" sx={{ ml: 2 }}>
              Edit Response
            </Button>
          )}
        </Alert>
      ) : (
        <Stack spacing={2}>
          {mcqs.map((q) => (
            <Card key={q.id} variant="outlined">
              <CardContent>
                <FormControl component="fieldset" fullWidth>
                  <FormLabel component="legend" className="oxygen-bold">
                    {q.question_text}
                  </FormLabel>
                  {q.image_url && (
                    <Box sx={{ mt: 1 }}>
                      <img
                        src={`http://localhost:5011${q.image_url}`}
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
                      <FormControlLabel
                        key={idx}
                        value={opt.text}
                        control={<Radio />}
                        label={opt.text}
                        className="oxygen-light"
                      />
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
