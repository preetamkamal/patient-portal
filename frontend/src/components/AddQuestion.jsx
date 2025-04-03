// src/components/AddQuestion.jsx
import React, { useState } from 'react';
import { Box, TextField, Button, Typography, MenuItem, Select, FormControl, InputLabel, Alert } from '@mui/material';

function AddQuestion() {
  const [language, setLanguage] = useState('en');
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [alertMsg, setAlertMsg] = useState('');
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    // Process options: split by comma, trim, and assign score.
    const optionsArray = options.split(',').map(opt => {
      const trimmed = opt.trim();
      let score = 0;
      if (trimmed.toLowerCase() === 'correct') {
        score = 1;
      } else if (trimmed.toLowerCase() === 'wrong') {
        score = 0;
      } else if (!isNaN(Number(trimmed))) {
        score = Number(trimmed);
      }
      return { text: trimmed, score };
    });
    
    const formData = new FormData();
    formData.append('language', language);
    formData.append('question_text', questionText);
    formData.append('options', JSON.stringify(optionsArray));
    if (imageFile) {
      formData.append('image', imageFile);
    }
    
    try {
      const res = await fetch(`${baseUrl}/api/admin/add-question`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Server error: ${errorText}`);
      }
      const data = await res.json();
      if (data.success) {
        setAlertMsg('Question added successfully!');
        setQuestionText('');
        setOptions('');
        setImageFile(null);
      } else {
        alert(data.error || 'Error adding question');
      }
    } catch (error) {
      console.error('Error adding question:', error);
      alert('Error adding question: ' + error.message);
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
            value={language}
            label="Language"
            onChange={(e) => setLanguage(e.target.value)}
          >
            <MenuItem value="en">English</MenuItem>
            <MenuItem value="hi">Hindi</MenuItem>
            <MenuItem value="kn">Kannada</MenuItem>
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
          label='Options (comma separated; e.g., "Correct, Wrong" or "2,5")'
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
