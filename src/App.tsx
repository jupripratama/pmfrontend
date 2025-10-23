import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import CallRecordsPage from './components/CallRecordsPage';
import UploadPage from './components/UploadPage';
import ExportPage from './components/ExportPage';
import FleetStatisticsPage from './components/FleetStatisticsPage'; // Import komponen baru
import './App.css';

function AppContent() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!user) {
    return <Login />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'callrecords':
        return <CallRecordsPage />;
      case 'upload':
        return <UploadPage onBack={function (): void {
          throw new Error('Function not implemented.');
        } } />;
      case 'export':
        return <ExportPage onBack={function (): void {
          throw new Error('Function not implemented.');
        } } />;
      case 'fleet-statistics': // Tambahkan case baru
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