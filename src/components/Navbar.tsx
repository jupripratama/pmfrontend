// components/Navbar.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  Phone,
  Upload,
  Download,
  TrendingUp,
  BookOpen,
  Settings,
  User,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import '../styles/Navbar.css';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get user initials
  const getUserInitials = () => {
    if (!user?.fullName) return 'U';
    const names = user.fullName.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return names[0][0].toUpperCase();
  };

  // Check if user is Super Admin
  const isSuperAdmin = user?.roleName === 'Super Admin';

  const navItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      id: 'dashboard',
    },
    {
      name: 'Call Records',
      path: '/callrecords',
      icon: Phone,
      id: 'callrecords',
    },
    {
      name: 'Upload',
      path: '/upload',
      icon: Upload,
      id: 'upload',
    },
    {
      name: 'Export',
      path: '/export',
      icon: Download,
      id: 'export',
    },
    {
      name: 'Fleet Statistics',
      path: '/fleet-statistics',
      icon: TrendingUp,
      id: 'fleet-statistics',
    },
    {
      name: 'Docs',
      path: '/docs',
      icon: BookOpen,
      id: 'docs',
    },
  ];

  // Add Settings menu for Super Admin
  if (isSuperAdmin) {
    navItems.push({
      name: 'Settings',
      path: '/settings',
      icon: Settings,
      id: 'settings',
    });
  }

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-8">
            <Link
              to="/dashboard"
              className="flex items-center space-x-2"
              onClick={() => setActiveTab('dashboard')}
            >
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">PM</span>
              </div>
              <span className="text-xl font-bold text-gray-800 hidden sm:block">
                Dashboard
              </span>
            </Link>

            {/* Navigation Items */}
            <div className="hidden md:flex space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* User Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors"
            >
              {/* Avatar */}
              {user?.photoUrl ? (
                <img
                  src={user.photoUrl}
                  alt={user.fullName}
                  className="w-9 h-9 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                  {getUserInitials()}
                </div>
              )}

              {/* User Info (hidden on mobile) */}
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-gray-800">
                  {user?.fullName || 'User'}
                </p>
                <p className="text-xs text-gray-500">{user?.roleName || 'Role'}</p>
              </div>

              <ChevronDown
                className={`w-4 h-4 text-gray-500 transition-transform ${
                  isProfileOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                {/* User Info in Dropdown (mobile) */}
                <div className="px-4 py-3 border-b border-gray-200 sm:hidden">
                  <p className="text-sm font-semibold text-gray-800">
                    {user?.fullName || 'User'}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                  <p className="text-xs text-blue-600 mt-1">{user?.roleName}</p>
                </div>

                <Link
                  to="/profile"
                  onClick={() => {
                    setIsProfileOpen(false);
                    setActiveTab('profile');
                  }}
                  className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>Profile Saya</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200">
          <div className="flex overflow-x-auto py-2 space-x-1 px-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}