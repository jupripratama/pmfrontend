import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import { useAuth } from "../contexts/AuthContext";
import { Menu } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  activeTab,
  setActiveTab,
}) => {
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - Desktop selalu muncul, Mobile controlled */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-4 h-16 bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">PM</span>
            </div>
            <span className="font-bold text-gray-900">PM Dashboard</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        {/* Main content area */}
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default Layout;
