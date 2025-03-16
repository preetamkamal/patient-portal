import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

function PatientMCQ() {
  const location = useLocation()
  const { patient } = location.state || {}
  const [mcqs, setMcqs] = useState([])
  const [language, setLanguage] = useState('en')
  const [responses, setResponses] = useState({})

  useEffect(() => {
    const fetchMCQs = async () => {
      const res = await fetch(`http://localhost:5011/api/mcqs?lang=${language}`)
      const data = await res.json()
      setMcqs(data)
    }
    fetchMCQs()
  }, [language])

  const handleOptionChange = (qId, option) => {
    setResponses({ ...responses, [qId]: option })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const res = await fetch('http://localhost:5011/api/mcqs/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientId: patient.id, responses })
    })
    const data = await res.json()
    if (data.success) {
      alert('Responses submitted successfully')
    } else {
      alert('Error submitting responses')
    }
  }

  return (
    <div>
      <h2>MCQ Questionnaire</h2>
      <div>
        <button onClick={() => setLanguage('en')}>English</button>
        <button onClick={() => setLanguage('hi')}>Hindi</button>
      </div>
      <form onSubmit={handleSubmit}>
        {mcqs.map((q) => (
          <div key={q.id}>
            <p>{q.question}</p>
            {q.options.map((opt, idx) => (
              <label key={idx}>
                <input 
                  type="radio" 
                  name={`q_${q.id}`} 
                  value={opt}
                  onChange={() => handleOptionChange(q.id, opt)}
                  required
                />
                {opt}
              </label>
            ))}
          </div>
        ))}
        <button type="submit">Submit Answers</button>
      </form>
    </div>
  )
}

export default PatientMCQ
