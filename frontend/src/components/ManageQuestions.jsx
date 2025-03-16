// ManageQuestions.jsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Alert,
  Stack
} from '@mui/material';

function ManageQuestions() {
  const [questions, setQuestions] = useState([]);
  const [alertMsg, setAlertMsg] = useState('');
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const fetchQuestions = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${baseUrl}/api/admin/questions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setQuestions(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${baseUrl}/api/admin/questions/${questionId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setAlertMsg('Question deleted successfully.');
        fetchQuestions();
      } else {
        alert(data.error || 'Error deleting question');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatOptions = (optionsJson) => {
    // Parse the JSON array of objects
    try {
      const arr = JSON.parse(optionsJson); // e.g. [ {text: "Correct", score: 1}, {text: "Wrong", score: 0} ]
      // Return a string like "Correct(1), Wrong(0)"
      return arr.map(o => `${o.text}(${o.score})`).join(', ');
    } catch {
      return optionsJson;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Manage Questions</Typography>
        <Button variant="contained" onClick={() => window.location.assign('/admin/add-question')}>
          Add New Question
        </Button>
      </Stack>
      {alertMsg && <Alert severity="success" sx={{ mb: 2 }}>{alertMsg}</Alert>}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Language</TableCell>
            <TableCell>Question</TableCell>
            <TableCell>Options</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {questions.map((q) => (
            <TableRow key={q.id}>
              <TableCell>{q.id}</TableCell>
              <TableCell>{q.language}</TableCell>
              <TableCell>{q.question_text}</TableCell>
              <TableCell>
                {formatOptions(q.options)}
              </TableCell>
              <TableCell align="right">
                <Button variant="contained" color="error" onClick={() => handleDeleteQuestion(q.id)}>
                  Delete Question
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}

export default ManageQuestions;
