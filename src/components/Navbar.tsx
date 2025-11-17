// components/Navbar.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

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
  Menu,
  X,
  ClipboardList, // <-- Tambah icon
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

// === TAMBAHKAN INTERFACE NAV ITEM ===
interface NavItem {
  name: string;
  path: string;
  icon: any;
  id: string;
  forAll?: boolean;
  permission?: string;
}

export default function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  const { user: authUser, logout } = useAuth(); // <-- Ganti nama: user → authUser
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(authUser);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCallRecordsOpen, setIsCallRecordsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);

  // === UPDATE currentUser saat authUser berubah ===
  useEffect(() => {
    setCurrentUser(authUser);
  }, [authUser]);

  // === LISTEN LOCALSTORAGE (photo update, dll) ===
  useEffect(() => {
    const handleStorageChange = () => {
      const updatedUser = localStorage.getItem('user');
      if (updatedUser) {
        try {
          const parsedUser = JSON.parse(updatedUser);
          setCurrentUser(parsedUser);
        } catch (error) {
          console.error('Error parsing user from localStorage:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(() => {
      const storageUser = localStorage.getItem('user');
      if (storageUser) {
        try {
          const parsedStorageUser = JSON.parse(storageUser);
          if (JSON.stringify(parsedStorageUser) !== JSON.stringify(currentUser)) {
            setCurrentUser(parsedStorageUser);
          }
        } catch (error) {
          console.error('Error parsing user from localStorage:', error);
        }
      }
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [currentUser]);

  // === REFRESH PROFILE ON MOUNT ===
  useEffect(() => {
    const refreshUserData = async () => {
      try {
        const freshUserData = await authApi.getProfile();
        setCurrentUser(freshUserData);
      } catch (error) {
        console.error('Failed to refresh user data:', error);
      }
    };
    refreshUserData();
  }, []);

  // === CLICK OUTSIDE ===
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (mobileDropdownRef.current && !mobileDropdownRef.current.contains(event.target as Node)) {
        setIsCallRecordsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // === HELPER: GET INITIALS ===
  const getUserInitials = () => {
    if (!currentUser?.fullName) return 'U';
    const names = currentUser.fullName.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return names[0][0].toUpperCase();
  };

  // === ROLE & PERMISSION CHECK ===
  const isSuperAdmin = currentUser?.roleName === 'Super Admin';
  const isAdmin = currentUser?.roleId === 1 || currentUser?.roleId === 2;

  // === PERMISSION HELPER ===
  const hasPermission = (perm: string) => {
    const permissions = localStorage.getItem('permissions');
    if (!permissions) return false;
    try {
      return JSON.parse(permissions).includes(perm);
    } catch {
      return false;
    }
  };

  // === ROLE-BASED ACCESS: Super Admin, Admin, supvkpc ===
  const allowedRoles = ['Super Admin', 'Admin', 'supvkpc'];
  const isAllowedRole = currentUser && allowedRoles.includes(currentUser.roleName);

  // === NAV ITEMS ===
  const navItems: NavItem[] = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      id: 'dashboard',
      forAll: true,
    },
    {
      name: 'Fleet Statistics',
      path: '/fleet-statistics',
      icon: TrendingUp,
      id: 'fleet-statistics',
      forAll: false,
    },
    {
      name: 'Docs',
      path: '/docs',
      icon: BookOpen,
      id: 'docs',
      forAll: true,
    },
    // === MENU BARU: INSPEKSI KPC ===
    {
      name: 'Inspeksi KPC',
      path: '/inspeksi-kpc',
      icon: ClipboardList,
      id: 'inspeksi-kpc',
      permission: 'inspeksi.temuan-kpc.view',
    },
  ];

  // === CALL RECORDS MENU ===
  const callRecordsMenu = [
    {
      name: 'View Records',
      path: '/callrecords',
      icon: Phone,
      id: 'callrecords',
      forAll: true,
    },
    {
      name: 'Upload CSV',
      path: '/upload',
      icon: Upload,
      id: 'upload',
      forAll: false,
    },
    {
      name: 'Export Data',
      path: '/export',
      icon: Download,
      id: 'export',
      forAll: false,
    },
  ];

  // === FILTER NAV ITEMS ===
  const filteredNavItems = navItems.filter(item => {
    if (item.forAll) return true;
    if (item.id === 'inspeksi-kpc') return isAllowedRole; // <-- LANGSUNG CEK ROLE
    if (item.permission) return hasPermission(item.permission);
    return isAdmin;
  });

  const filteredCallRecords = callRecordsMenu.filter(item => item.forAll || isAdmin);

  // === ADD SETTINGS FOR SUPERADMIN ===
  if (isSuperAdmin) {
    filteredNavItems.push({
      name: 'Settings',
      path: '/settings',
      icon: Settings,
      id: 'settings',
      forAll: false,
    });
  }

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-50 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 shadow-lg border-b border-white/20 backdrop-blur-xl"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/dashboard" onClick={() => setActiveTab('dashboard')} className="flex items-center space-x-2 group">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-10 h-10 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center border border-white/30 shadow-lg group-hover:shadow-xl"
            >
              <LayoutDashboard className="w-6 h-6 text-white" />
            </motion.div>
            <span className="text-xl font-bold text-white hidden sm:block tracking-wide">
              Call Analytics
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-2">
            {filteredNavItems.filter(item => item.id !== 'settings').map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-white/25 text-white shadow-lg backdrop-blur-lg'
                      : 'text-white/80 hover:bg-white/15 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            {/* Call Records Dropdown */}
            <div className="relative" ref={mobileDropdownRef}>
              <button
                onClick={() => setIsCallRecordsOpen(!isCallRecordsOpen)}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium text-white/80 hover:bg-white/15 hover:text-white transition-all"
              >
                <Phone className="w-4 h-4" />
                <span>Call Records</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isCallRecordsOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isCallRecordsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute left-0 mt-2 w-56 bg-white/95 backdrop-blur-xl border border-gray-200 rounded-xl shadow-2xl py-2 overflow-hidden"
                  >
                    {filteredCallRecords.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.path;

                      return (
                        <Link
                          key={item.id}
                          to={item.path}
                          onClick={() => {
                            setActiveTab(item.id);
                            setIsCallRecordsOpen(false);
                          }}
                          className={`flex items-center space-x-3 px-4 py-3 text-sm transition-colors ${
                            isActive ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span>{item.name}</span>
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Settings */}
            {isSuperAdmin && (
              <Link
                to="/settings"
                onClick={() => setActiveTab('settings')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  location.pathname === '/settings'
                    ? 'bg-white/25 text-white shadow-lg backdrop-blur-lg'
                    : 'text-white/80 hover:bg-white/15 hover:text-white'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </Link>
            )}
          </div>

          {/* Profile + Mobile */}
          <div className="flex items-center space-x-3">
            {/* Desktop Profile */}
            <div className="hidden md:block relative" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-3 hover:bg-white/15 rounded-xl px-3 py-2 transition-all group"
              >
                {currentUser?.photoUrl ? (
                  <motion.img
                    key={currentUser.photoUrl}
                    whileHover={{ scale: 1.1 }}
                    src={currentUser.photoUrl}
                    alt={currentUser.fullName}
                    className="w-9 h-9 rounded-full object-cover border-2 border-white/40 shadow-lg"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                ) : (
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-lg flex items-center justify-center text-white font-semibold text-sm border-2 border-white/40 shadow-lg"
                  >
                    {getUserInitials()}
                  </motion.div>
                )}

                <div className="hidden lg:block text-left">
                  <p className="text-sm font-semibold text-white">{currentUser?.fullName || 'User'}</p>
                  <p className="text-xs text-white/70">{currentUser?.roleName || 'Role'}</p>
                </div>

                <ChevronDown className={`w-4 h-4 text-white/70 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown */}
              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-xl border border-gray-200 rounded-xl shadow-2xl overflow-hidden"
                  >
                    <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
                      <div className="flex items-center space-x-3">
                        {currentUser?.photoUrl ? (
                          <img
                            key={currentUser.photoUrl}
                            src={currentUser.photoUrl}
                            alt={currentUser.fullName}
                            className="w-12 h-12 rounded-full object-cover border-2 border-blue-200"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                            {getUserInitials()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{currentUser?.fullName}</p>
                          <p className="text-xs text-gray-600 truncate">{currentUser?.email}</p>
                          <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded-lg bg-blue-100 text-blue-700 text-xs font-medium">
                            {currentUser?.roleName}
                          </div>
                        </div>
                      </div>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => { setIsProfileOpen(false); setActiveTab('profile'); }}
                      className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                    >
                      <User className="w-5 h-5 text-blue-600" />
                      <span>Profile Saya</span>
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-200"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Logout</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-white hover:bg-white/15 p-2 rounded-xl transition-all"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* === MOBILE MENU (SUDAH TERMASUK INSPEKSI) === */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white/95 backdrop-blur-xl border-t border-gray-200 rounded-b-2xl shadow-xl overflow-hidden mb-2"
            >
              <div className="py-3 space-y-1 px-4 max-h-[calc(100vh-5rem)] overflow-y-auto">
                {/* User Info */}
                <div className="mb-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                  <div className="flex items-center space-x-3">
                    {currentUser?.photoUrl ? (
                      <img
                        key={currentUser.photoUrl}
                        src={currentUser.photoUrl}
                        alt={currentUser.fullName}
                        className="w-12 h-12 rounded-full object-cover border-2 border-blue-200"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                        {getUserInitials()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{currentUser?.fullName}</p>
                      <p className="text-xs text-gray-600 truncate">{currentUser?.email}</p>
                      <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-medium">
                        {currentUser?.roleName}
                      </div>
                    </div>
                  </div>
                </div>

                {/* === NAV ITEMS (SUDAH TERMASUK INSPEKSI) === */}
                {filteredNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;

                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-blue-100 text-blue-700 shadow-sm'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}

                {/* Call Records */}
                <div className="pt-2 border-t border-gray-200">
                  <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Call Records</p>
                  {filteredCallRecords.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;

                    return (
                      <Link
                        key={item.id}
                        to={item.path}
                        onClick={() => {
                          setActiveTab(item.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                          isActive ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>

                {/* Profile & Logout */}
                <div className="pt-2 mt-2 border-t border-gray-200 space-y-1">
                  <Link
                    to="/profile"
                    onClick={() => { setActiveTab('profile'); setIsMobileMenuOpen(false); }}
                    className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all"
                  >
                    <User className="w-5 h-5 text-blue-600" />
                    <span>Profile Saya</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}