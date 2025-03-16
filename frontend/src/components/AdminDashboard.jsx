import React, { useState, useEffect } from 'react'

function AdminDashboard() {
  const [responses, setResponses] = useState([])
  const [newPatientEmail, setNewPatientEmail] = useState('')
  const [newPatientPassword, setNewPatientPassword] = useState('')

  const fetchResponses = async () => {
    const res = await fetch('http://localhost:5011/api/admin/responses')
    const data = await res.json()
    setResponses(data)
  }

  useEffect(() => {
    fetchResponses()
  }, [])

  const handleAddPatient = async (e) => {
    e.preventDefault()
    const res = await fetch('http://localhost:5011/api/admin/add-patient', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: newPatientEmail, password: newPatientPassword })
    })
    const data = await res.json()
    if (data.success) {
      alert('New patient added')
      setNewPatientEmail('')
      setNewPatientPassword('')
    } else {
      alert('Error adding patient')
    }
  }

  return (
    <div>
      <h2>Admin Dashboard</h2>
      <h3>Patient Responses</h3>
      <ul>
        {responses.map((r) => (
          <li key={r.id}>
            Patient ID: {r.patient_id} – Responses: {r.responses}
          </li>
        ))}
      </ul>
      <h3>Add New Patient</h3>
      <form onSubmit={handleAddPatient}>
        <input 
          type="email" 
          placeholder="Patient Email" 
          value={newPatientEmail}
          onChange={(e) => setNewPatientEmail(e.target.value)}
          required
        />
        <input 
          type="text" 
          placeholder="Patient Password" 
          value={newPatientPassword}
          onChange={(e) => setNewPatientPassword(e.target.value)}
          required
        />
        <button type="submit">Add Patient</button>
      </form>
    </div>
  )
}

export default AdminDashboard
