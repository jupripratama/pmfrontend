import React from 'react';
import Navbar from './Navbar';

interface LayoutProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ activeTab, setActiveTab, children }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar - Fixed di atas */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
      
      {/* Main Content - Margin top untuk kompensasi navbar fixed */}
      <main className="flex-1 mt-16 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;