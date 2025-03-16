// src/components/AddQuestion.jsx
import React, { useState } from 'react';
import { Box, TextField, Button, Typography, MenuItem, Select, FormControl, InputLabel } from '@mui/material';

function AddQuestion() {
  const [language, setLanguage] = useState('en');
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const optionsArray = options.split(',').map(opt => opt.trim());
    try {
      const res = await fetch('http://localhost:5011/api/admin/add-question', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          language,
          question_text: questionText,
          options: optionsArray,
          image_url: imageUrl
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('Question added successfully');
        // Clear fields
        setQuestionText('');
        setOptions('');
        setImageUrl('');
      } else {
        alert('Failed to add question');
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
      <form onSubmit={handleSubmit}>
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
          label="Options (comma separated)"
          variant="outlined"
          sx={{ mb: 2 }}
          value={options}
          onChange={(e) => setOptions(e.target.value)}
          required
        />
        <TextField
          fullWidth
          label="Image URL (optional)"
          variant="outlined"
          sx={{ mb: 2 }}
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
        <Button variant="contained" type="submit">
          Add Question
        </Button>
      </form>
    </Box>
  );
}

export default AddQuestion;
