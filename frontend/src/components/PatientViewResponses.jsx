// src/components/PatientViewResponses.jsx
import React, { useEffect, useState } from 'react';
import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Alert, Card, CardContent } from '@mui/material';

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
      // If you want *all* questions from both languages, remove ?lang=...
      // Or call it twice if needed. For simplicity, let's call once with no lang filter
      const res = await fetch(`${baseUrl}/api/mcqs?lang=en`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dataEn = await res.json();

      const res2 = await fetch(`${baseUrl}/api/mcqs?lang=hi`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dataHi = await res2.json();

      // Combine them
      const allQuestions = [...dataEn, ...dataHi];

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
                <Typography variant="h6" gutterBottom>
                  Response ID: {r.id}
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
