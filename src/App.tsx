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
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!user) {
    return <Login />;
  }

  const handleUploadBack = () => {
    // Fungsi ini bisa kosong atau berisi logika tambahan jika needed
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
            setActiveTab={setActiveTab} // Kirim setActiveTab ke UploadPage
          />
        );
      case 'export':
        return (
          <ExportPage 
            onBack={handleExportBack}
            setActiveTab={setActiveTab} // Juga untuk ExportPage jika needed
          />
        );
      case 'fleet-statistics':
        return <FleetStatisticsPage />;
      default:
        return <Dashboard />;
    }
  };

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