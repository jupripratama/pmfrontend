import React, { useState } from 'react';
// ✅ GANTI INI
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import CallRecordsPage from './components/CallRecordsPage';
import UploadPage from './components/UploadPage';
import ExportPage from './components/ExportPage';
import FleetStatisticsPage from './components/FleetStatisticsPage';
import DocsPage from './components/DocsPage';

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return user ? children : <Navigate to="/" replace />;
}

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user } = useAuth();
  const location = useLocation();

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard setActiveTab={setActiveTab} />} />
        <Route path="/callrecords" element={<CallRecordsPage />} />
        <Route path="/upload" element={<UploadPage setActiveTab={setActiveTab} onBack={() => setActiveTab('dashboard')} />} />
        <Route path="/export" element={<ExportPage setActiveTab={setActiveTab} onBack={() => setActiveTab('dashboard')} />} />
        <Route path="/fleet-statistics" element={<FleetStatisticsPage />} />
        <Route path="/docs" element={<DocsPage setActiveTab={setActiveTab} />} />
        
        {/* Redirect root to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
}

function AppRoutes() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={!user ? <Login /> : <Navigate to="/dashboard" replace />} />
      <Route path="/*" element={user ? <AppContent /> : <Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    // ✅ PAKAI HashRouter
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}