import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BarChart3, Phone, Download, Upload, User, LogOut, Menu, X, ChevronDown, Users } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCallRecordsDropdownOpen, setIsCallRecordsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCallRecordsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const mainMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  ];

  const callRecordsMenuItems = [
    { id: 'callrecords', label: 'View Records', icon: Phone },
    { id: 'upload', label: 'Upload CSV', icon: Upload },
    { id: 'export', label: 'Export Data', icon: Download },
  ];

  // Tambahkan menu Fleet Statistics
  const analyticsMenuItems = [
    { id: 'fleet-statistics', label: 'Fleet Statistics', icon: Users },
  ];

  const handleMenuClick = (menuId: string) => {
    setActiveTab(menuId);
    setIsMobileMenuOpen(false);
    setIsCallRecordsDropdownOpen(false);
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side - Logo and main menu */}
          <div className="flex items-center">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <BarChart3 className="w-8 h-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Call Analytics</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
              {/* Main Menu Items */}
              {mainMenuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.id)}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === item.id
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.label}
                </button>
              ))}

              {/* Call Records Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsCallRecordsDropdownOpen(!isCallRecordsDropdownOpen)}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab.startsWith('callrecords') || activeTab === 'upload' || activeTab === 'export'
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call Records
                  <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${
                    isCallRecordsDropdownOpen ? 'rotate-180' : ''
                  }`} />
                </button>

                {/* Dropdown Menu */}
                {isCallRecordsDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                    {callRecordsMenuItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleMenuClick(item.id)}
                        className={`flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors ${
                          activeTab === item.id ? 'bg-blue-50 text-blue-700' : ''
                        }`}
                      >
                        <item.icon className="w-4 h-4 mr-3" />
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Analytics Menu Items */}
              {analyticsMenuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.id)}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === item.id
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right side - User profile and mobile menu button */}
          <div className="flex items-center">
            {/* User Profile */}
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
                <p className="text-xs text-gray-500">{user?.roleName}</p>
              </div>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {user?.fullName?.charAt(0).toUpperCase() || 'U'}
              </div>
              <button
                onClick={logout}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden ml-4">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-2 bg-white">
            {/* Main Menu Items */}
            {mainMenuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={`flex items-center w-full px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  activeTab === item.id
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </button>
            ))}

            {/* Call Records Menu Items */}
            <div className="border-t border-gray-200 mt-2 pt-2">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Call Records
              </div>
              {callRecordsMenuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.id)}
                  className={`flex items-center w-full px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    activeTab === item.id
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.label}
                </button>
              ))}
            </div>

            {/* Analytics Menu Items */}
            <div className="border-t border-gray-200 mt-2 pt-2">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Analytics
              </div>
              {analyticsMenuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.id)}
                  className={`flex items-center w-full px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    activeTab === item.id
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;