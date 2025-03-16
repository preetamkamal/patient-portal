// src/components/PatientMCQ.jsx
import React, { useEffect, useState } from 'react';

function PatientMCQ() {
  const [mcqs, setMcqs] = useState([]);
  const [language, setLanguage] = useState('en');
  const [responses, setResponses] = useState({});

  useEffect(() => {
    fetchMCQs(language);
  }, [language]);

  const fetchMCQs = async (lang) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5011/api/mcqs?lang=${lang}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setMcqs(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOptionChange = (qId, opt) => {
    setResponses({ ...responses, [qId]: opt });
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      // If you stored the patient ID somewhere, use that. For example:
      // decode JWT or store in localStorage. For demonstration:
      const patientId = 1; 
      const res = await fetch('http://localhost:5011/api/mcqs/submit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ patientId, responses })
      });
      const data = await res.json();
      if (data.success) {
        alert('Responses submitted successfully!');
      } else {
        alert(data.error || 'Error submitting responses');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Patient MCQ</h2>
      <button onClick={() => setLanguage('en')}>English</button>
      <button onClick={() => setLanguage('hi')}>Hindi</button>
      {mcqs.map((q) => (
        <div key={q.id} style={{ marginTop: 20 }}>
          <p>{q.question}</p>
          {q.image_url && <img src={q.image_url} alt="question" style={{ maxWidth: '100%' }} />}
          {q.options.map((opt, idx) => (
            <label key={idx} style={{ display: 'block' }}>
              <input
                type="radio"
                name={`q_${q.id}`}
                value={opt}
                onChange={() => handleOptionChange(q.id, opt)}
              />
              {opt}
            </label>
          ))}
        </div>
      ))}
      <button onClick={handleSubmit} style={{ marginTop: 20 }}>
        Submit
      </button>
    </div>
  );
}

export default PatientMCQ;
