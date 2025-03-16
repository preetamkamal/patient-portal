// src/components/AddQuestion.jsx
import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert
} from '@mui/material';

function AddQuestion() {
  const [language, setLanguage] = useState('en');
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState('["Yes","No"]'); // default example
  const [imageFile, setImageFile] = useState(null);
  const [alertMsg, setAlertMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    // Use FormData for multipart/form-data
    const formData = new FormData();
    formData.append('language', language);
    formData.append('question_text', questionText);
    formData.append('options', options);
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      const res = await fetch('http://localhost:5011/api/admin/add-question', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
          // Do NOT set 'Content-Type' to 'application/json' here, 
          // fetch will set it to multipart/form-data automatically
        },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setAlertMsg('Question added successfully!');
        // Clear form
        setQuestionText('');
        setOptions('["Yes","No"]');
        setImageFile(null);
      } else {
        alert(data.error || 'Error adding question');
      }
    } catch (error) {
      console.error('Error adding question:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Add New Question
      </Typography>
      {alertMsg && <Alert severity="success" sx={{ mb: 2 }}>{alertMsg}</Alert>}
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="language-select-label">Language</InputLabel>
          <Select
            labelId="language-select-label"
            label="Language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <MenuItem value="en">English</MenuItem>
            <MenuItem value="hi">Hindi</MenuItem>
          </Select>
        </FormControl>
        <TextField
          fullWidth
          label="Question Text"
          variant="outlined"
          sx={{ mb: 2 }}
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          required
        />
        <TextField
          fullWidth
          label="Options"
          variant="outlined"
          sx={{ mb: 2 }}
          value={options}
          onChange={(e) => setOptions(e.target.value)}
          required
        />
        <Typography variant="body1" sx={{ mb: 1 }}>
          Optional Image:
        </Typography>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files[0])}
          style={{ marginBottom: '16px' }}
        />
        <Button variant="contained" type="submit">
          Add Question
        </Button>
      </form>
    </Box>
  );
}

export default AddQuestion;
