import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Login from './components/Login'
import AdminDashboard from './components/AdminDashboard'
import PatientMCQ from './components/PatientMCQ'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/patient" element={<PatientMCQ />} />
    </Routes>
  )
}

export default App
