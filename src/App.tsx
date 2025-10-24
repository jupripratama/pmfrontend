import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import CallRecordsPage from './components/CallRecordsPage';
import UploadPage from './components/UploadPage';
import ExportPage from './components/ExportPage';
import FleetStatisticsPage from './components/FleetStatisticsPage';
import './App.css';

function AppContent() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const handleUploadBack = () => {
    console.log('Navigating back from upload');
  };

  const handleExportBack = () => {
    console.log('Navigating back from export');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'callrecords':
        return <CallRecordsPage />;
      case 'upload':
        return (
          <UploadPage 
            onBack={handleUploadBack} 
            setActiveTab={setActiveTab}
          />
        );
      case 'export':
        return (
          <ExportPage 
            onBack={handleExportBack}
            setActiveTab={setActiveTab}
          />
        );
      case 'fleet-statistics':
        return <FleetStatisticsPage />;
      default:
        return <Dashboard />;
    }
  };

  // PASTIKAN INI: Gunakan Layout untuk wrap content
  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;