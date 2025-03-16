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
import ManageQuestions from './components/ManageQuestions';
import AdminResponses from './components/AdminResponses';
import DeleteUsers from './components/DeleteUsers';
import PatientViewResponses from './components/PatientViewResponses';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/" element={<Layout />}>
        {/* Admin routes */}
        <Route path="admin" element={<AdminDashboard />} />
        <Route path="admin/manage-questions" element={<ManageQuestions />} />
        <Route path="admin/toggle-edit" element={<ToggleEdit />} />
        <Route path="admin/responses" element={<AdminResponses />} />
        <Route path="admin/delete-users" element={<DeleteUsers />} />
        <Route path="admin/logs" element={<Logs />} />
        <Route path="admin/add-question" element={<AddQuestion />} />
        {/* Patient route */}
        <Route path="patient" element={<PatientMCQ />} />
        <Route path="patient/my-responses" element={<PatientViewResponses />} />

      </Route>
    </Routes>
  );
}

export default App;
