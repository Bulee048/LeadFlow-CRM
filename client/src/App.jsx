import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import LeadDetail from './pages/LeadDetail';
import CreateLead from './pages/CreateLead';
import EditLead from './pages/EditLead';
import Profile from './pages/Profile';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" toastOptions={{
          style: {
            borderRadius: '12px',
            background: '#333',
            color: '#fff',
          },
        }} />
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout children={<Navigate to="/dashboard" />} />}>
              {/* This is just a shell for protected routes with layout */}
            </Route>
            
            <Route path="/" element={<Layout><Dashboard /></Layout>} />
            <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
            <Route path="/leads" element={<Layout><Leads /></Layout>} />
            <Route path="/leads/new" element={<Layout><CreateLead /></Layout>} />
            <Route path="/leads/:id" element={<Layout><LeadDetail /></Layout>} />
            <Route path="/leads/:id/edit" element={<Layout><EditLead /></Layout>} />
            <Route path="/profile" element={<Layout><Profile /></Layout>} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
