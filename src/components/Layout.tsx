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
      
      {/* Main Content */}
      <main className="flex-1 mt-16 w-full">
        <div className="w-full px-3 sm:px-4 lg:px-6 py-4 mx-auto max-w-full">
          {/* Container dengan overflow prevention */}
          <div className="w-full max-w-full overflow-hidden">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;