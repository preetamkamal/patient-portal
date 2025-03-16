// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Layout from './components/Layout';
import AdminDashboard from './components/AdminDashboard';
import ToggleEdit from './components/ToggleEdit';
import AddQuestion from './components/AddQuestion';
import Logs from './components/Logs';
import PatientMCQ from './components/PatientMCQ';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/" element={<Layout />}>
        {/* Admin routes */}
        <Route path="admin" element={<AdminDashboard />} />
        <Route path="admin/toggle-edit" element={<ToggleEdit />} />
        <Route path="admin/add-question" element={<AddQuestion />} />
        <Route path="admin/logs" element={<Logs />} />

        {/* Patient routes */}
        <Route path="patient" element={<PatientMCQ />} />
      </Route>
    </Routes>
  );
}

export default App;
