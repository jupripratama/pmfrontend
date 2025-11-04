import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  BarChart3,
  Phone,
  Upload,
  Download,
  Users,
  LogOut,
  User,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";

const Navbar: React.FC<{ activeTab: string; setActiveTab: (tab: string) => void }> = ({
  activeTab,
  setActiveTab,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const hasFullAccess = user?.roleId === 1 || user?.roleId === 2;

  useEffect(() => {
    const path = location.pathname.replace("/", "") || "dashboard";
    setActiveTab(path);
  }, [location.pathname, setActiveTab]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      )
        setIsDropdownOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node))
        setIsProfileOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMenuClick = (tab: string) => {
    navigate(`/${tab}`);
    setActiveTab(tab);
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    ...(hasFullAccess
      ? [{ id: "fleet-statistics", label: "Fleet Statistics", icon: Users }]
      : []),
  ];

  const callRecordsMenu = [
    { id: "callrecords", label: "View Records", icon: Phone },
    ...(hasFullAccess
      ? [
          { id: "upload", label: "Upload CSV", icon: Upload },
          { id: "export", label: "Export Data", icon: Download },
        ]
      : []),
  ];

  return (
    <motion.nav
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="sticky top-0 z-50 bg-gradient-to-r from-blue-600/95 via-indigo-500/95 to-purple-500/95 backdrop-blur-xl border-b border-white/20 shadow-lg"
    >
      <div className="relative flex justify-between items-center px-4 sm:px-6 h-16 max-w-7xl mx-auto">
        {/* 🌐 Logo */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center cursor-pointer select-none shrink-0"
          onClick={() => handleMenuClick("dashboard")}
        >
          <BarChart3 className="w-6 h-6 text-white drop-shadow-md" />
          <span className="ml-2 text-base sm:text-lg font-bold text-white tracking-wide">
            Call Analytics
          </span>
        </motion.div>

        {/* 💫 Desktop Menu */}
        <div className="hidden lg:flex items-center space-x-2 xl:space-x-4">
          {navItems.map((item) => (
            <motion.button
              whileHover={{ y: -2, scale: 1.05 }}
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              className={`px-3 xl:px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
                activeTab === item.id
                  ? "bg-white/20 text-white shadow-inner"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span className="hidden xl:inline">{item.label}</span>
            </motion.button>
          ))}

          {/* Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <motion.button
              whileHover={{ y: -2 }}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center px-3 xl:px-4 py-2 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all"
            >
              <Phone className="w-4 h-4" />
              <span className="hidden xl:inline ml-1">Call Records</span>
              <ChevronDown
                className={`w-4 h-4 ml-1 transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </motion.button>
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-0 mt-2 w-52 bg-white/95 backdrop-blur-xl border border-gray-200 rounded-xl shadow-xl py-2 z-50"
                >
                  {callRecordsMenu.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleMenuClick(item.id)}
                      className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors ${
                        activeTab === item.id
                          ? "bg-blue-50 text-blue-600 font-medium"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Section: Profile + Mobile Menu */}
        <div className="flex items-center gap-3">
          {/* 👤 Profile - Hidden on small screens, visible on md+ */}
          <div className="hidden md:block relative" ref={profileRef}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white/20 backdrop-blur-lg w-10 h-10 flex items-center justify-center rounded-full border-2 border-white/40 shadow-lg text-white font-semibold text-base hover:bg-white/30 transition-all"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              {user?.fullName?.charAt(0).toUpperCase() || "U"}
            </motion.button>

            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-xl border border-gray-200 rounded-xl shadow-2xl overflow-hidden z-50"
                >
                  <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                    <p className="font-semibold text-gray-900 truncate">
                      {user?.fullName}
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {user?.roleName}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      handleMenuClick("profile");
                      setIsProfileOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                  >
                    <User className="w-4 h-4 mr-3 text-blue-600" />
                    <span>Profil Saya</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    <span>Logout</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 📱 Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden text-white hover:text-blue-200 p-2 rounded-lg hover:bg-white/10 transition-all"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </motion.button>
        </div>
      </div>

      {/* 📱 Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-inner overflow-hidden"
          >
            <div className="py-3 space-y-1 px-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
              {/* User Info in Mobile Menu */}
              <div className="md:hidden mb-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                <p className="font-semibold text-gray-900 text-sm truncate">
                  {user?.fullName}
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  {user?.roleName}
                </p>
              </div>

              {[...navItems, ...callRecordsMenu].map((item) => (
                <motion.button
                  key={item.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleMenuClick(item.id)}
                  className={`flex items-center w-full px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    activeTab === item.id
                      ? "bg-blue-100 text-blue-700 shadow-sm"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.label}
                </motion.button>
              ))}

              {/* Profile & Logout in Mobile Menu */}
              <div className="md:hidden pt-2 mt-2 border-t border-gray-200 space-y-1">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleMenuClick("profile")}
                  className="flex items-center w-full px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all"
                >
                  <User className="w-5 h-5 mr-3 text-blue-600" />
                  Profil Saya
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Logout
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default React.memo(Navbar);