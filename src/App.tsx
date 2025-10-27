import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

  if (!user) return <Navigate to="/" replace />;

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Login */}
      <Route path="/" element={<Login />} />

      {/* Dashboard dan halaman lain */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout activeTab="dashboard" setActiveTab={() => {}}>
              <Dashboard setActiveTab={() => {}} />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/callrecords"
        element={
          <ProtectedRoute>
            <Layout activeTab="callrecords" setActiveTab={() => {}}>
              <CallRecordsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/upload"
        element={
          <ProtectedRoute>
            <Layout activeTab="upload" setActiveTab={() => {}}>
              <UploadPage setActiveTab={() => {}} onBack={() => {}} />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/export"
        element={
          <ProtectedRoute>
            <Layout activeTab="export" setActiveTab={() => {}}>
              <ExportPage setActiveTab={() => {}} onBack={() => {}} />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/fleet-statistics"
        element={
          <ProtectedRoute>
            <Layout activeTab="fleet-statistics" setActiveTab={() => {}}>
              <FleetStatisticsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/docs"
        element={
          <ProtectedRoute>
            <Layout activeTab="docs" setActiveTab={() => {}}>
              <DocsPage setActiveTab={() => {}} />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}
