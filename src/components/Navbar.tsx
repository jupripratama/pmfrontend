import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  BarChart3, 
  Upload, 
  Download, 
  User, 
  LogOut,
  Phone,
  Menu,
  X,
  Bell,
  Settings,
  Search
} from 'lucide-react';
import '../styles/Navbar.css';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onExport: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onExport }) => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: BarChart3,
    },
    {
      id: 'callrecords',
      label: 'Call Records',
      icon: Phone,
    },
    {
      id: 'upload',
      label: 'Data Upload',
      icon: Upload,
    }
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProfileClick = () => {
    setActiveTab('profile');
    setIsProfileDropdownOpen(false);
  };

  return (
    <>
      {/* Navigation Bar */}
      <nav className="layout-navbar container-xxl navbar navbar-expand-xl navbar-detached align-items-center bg-navbar-theme">
        <div className="layout-menu-toggle navbar-nav align-items-xl-center me-3 me-xl-0 d-xl-none">
          <button 
            className="nav-link nav-link-hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        <div className="navbar-nav-right d-flex align-items-center" id="navbar-collapse">
          {/* Search Bar */}
          <div className="navbar-nav align-items-center">
            <div className="nav-item d-flex align-items-center">
              <div className="input-group input-group-merge">
                <span className="input-group-text">
                  <Search className="w-4 h-4 text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search..."
                  aria-label="Search..."
                />
              </div>
            </div>
          </div>

          <ul className="navbar-nav flex-row align-items-center ms-auto">
            {/* Notification Bell */}
            <li className="nav-item navbar-dropdown dropdown-notifications dropdown">
              <button className="nav-link btn btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow">
                <Bell className="w-4 h-4" />
                <span className="badge bg-danger badge-dot"></span>
              </button>
            </li>

            {/* User Profile Dropdown */}
            <li className="nav-item navbar-dropdown dropdown-user dropdown">
              <div className="nav-link dropdown-toggle hide-arrow" ref={profileDropdownRef}>
                <button 
                  className="btn btn-text-secondary rounded-pill btn-icon dropdown-toggle"
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                >
                  <div className="avatar avatar-online">
                    <div 
                      className="w-8 h-8 rounded-full bg-primary d-flex items-center justify-center text-white font-semibold text-sm"
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        backgroundColor: '#4f46e5',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.875rem'
                      }}
                    >
                      {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div 
                    className="dropdown-menu dropdown-menu-end"
                    style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      background: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                      minWidth: '200px',
                      zIndex: 1000,
                      marginTop: '0.5rem'
                    }}
                  >
                    <div className="dropdown-header">
                      <div className="d-flex">
                        <div className="flex-shrink-0 me-3">
                          <div className="avatar avatar-online">
                            <div 
                              className="w-8 h-8 rounded-full bg-primary d-flex items-center justify-center text-white font-semibold text-sm"
                              style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                backgroundColor: '#4f46e5',
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '0.875rem'
                              }}
                            >
                              {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                            </div>
                          </div>
                        </div>
                        <div className="flex-grow-1">
                          <span className="fw-semibold d-block">{user?.fullName}</span>
                          <small className="text-muted">{user?.roleName}</small>
                        </div>
                      </div>
                    </div>
                    <div className="dropdown-divider"></div>
                    <button 
                      className="dropdown-item"
                      onClick={handleProfileClick}
                    >
                      <User className="w-4 h-4 me-2" />
                      <span>Profile</span>
                    </button>
                    <button className="dropdown-item">
                      <Settings className="w-4 h-4 me-2" />
                      <span>Settings</span>
                    </button>
                    <div className="dropdown-divider"></div>
                    <button 
                      className="dropdown-item"
                      onClick={logout}
                    >
                      <LogOut className="w-4 h-4 me-2" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </li>
          </ul>
        </div>
      </nav>

      {/* Sidebar Navigation */}
      <aside className={`layout-menu menu-vertical menu bg-menu-theme ${isMobileMenuOpen ? 'menu-open' : ''}`}>
        {/* App Brand */}
        <div className="app-brand demo">
          <a href="#" className="app-brand-link">
            <span className="app-brand-logo demo">
              <BarChart3 className="w-6 h-6 text-primary" />
            </span>
            <span className="app-brand-text demo menu-text fw-bolder ms-2">Call Analytics</span>
          </a>
        </div>

        <div className="menu-inner-shadow"></div>

        {/* Navigation Items */}
        <ul className="menu-inner py-1">
          {/* Dashboard */}
          <li className="menu-item">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`menu-link ${activeTab === 'dashboard' ? 'active' : ''}`}
            >
              <BarChart3 className="w-4 h-4 me-2" />
              <div data-i18n="Dashboard">Dashboard</div>
            </button>
          </li>

          {/* Call Records */}
          <li className="menu-item">
            <button
              onClick={() => setActiveTab('callrecords')}
              className={`menu-link ${activeTab === 'callrecords' ? 'active' : ''}`}
            >
              <Phone className="w-4 h-4 me-2" />
              <div data-i18n="Call Records">Call Records</div>
            </button>
          </li>

          {/* Data Upload */}
          <li className="menu-item">
            <button
              onClick={() => setActiveTab('upload')}
              className={`menu-link ${activeTab === 'upload' ? 'active' : ''}`}
            >
              <Upload className="w-4 h-4 me-2" />
              <div data-i18n="Data Upload">Data Upload</div>
            </button>
          </li>

          {/* Export Section */}
          <li className="menu-header small text-uppercase">
            <span className="menu-header-text">Tools</span>
          </li>
          <li className="menu-item">
            <button
              onClick={onExport}
              className="menu-link"
            >
              <Download className="w-4 h-4 me-2" />
              <div data-i18n="Export CSV">Export CSV</div>
            </button>
          </li>
        </ul>
      </aside>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="layout-menu-overlay d-block d-xl-none"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}
    </>
  );
};

export default Navbar;