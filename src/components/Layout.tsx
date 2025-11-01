import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const { user } = useAuth();

  if (!user) {
    return null; // atau spinner loading
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Main content area — flex-1 supaya dorong footer ke bawah */}
      <main className="flex-1 px-4 md:px-8 py-6">
        {children}
      </main>
      
      <Footer />
    </div>
  );
};

export default Layout;
