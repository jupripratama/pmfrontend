import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
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
      className="sticky top-0 z-[9999] bg-gradient-to-r from-blue-600/40 via-indigo-500/40 to-purple-500/40 backdrop-blur-xl border-b border-white/20 shadow-[0_2px_10px_rgba(0,0,0,0.1)]"
    >
      <div className="relative flex justify-between items-center px-6 h-16 max-w-7xl mx-auto">
        {/* 🌐 Logo */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center cursor-pointer select-none"
          onClick={() => handleMenuClick("dashboard")}
        >
          <BarChart3 className="w-6 h-6 text-white drop-shadow-md" />
          <span className="ml-2 text-lg font-bold text-white tracking-wide">
            Call Analytics
          </span>
        </motion.div>

        {/* 💫 Desktop Menu */}
        <div className="hidden md:flex items-center space-x-4">
          {navItems.map((item) => (
            <motion.button
              whileHover={{ y: -2, scale: 1.05 }}
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === item.id
                  ? "bg-white/20 text-white shadow-inner"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              <item.icon className="w-4 h-4 inline-block mr-1" />
              {item.label}
            </motion.button>
          ))}

          {/* Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <motion.button
              whileHover={{ y: -2 }}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/10"
            >
              <Phone className="w-4 h-4 mr-1" /> Call Records
              <ChevronDown
                className={`w-4 h-4 ml-1 transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </motion.button>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute left-0 mt-2 w-52 bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl shadow-xl py-2 z-[9999]"
              >
                {callRecordsMenu.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleMenuClick(item.id)}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-blue-50 ${
                      activeTab === item.id ? "text-blue-600" : "text-gray-700"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        </div>

        {/* 👤 Profile */}
        <div className="relative" ref={profileRef}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="bg-white/20 backdrop-blur-lg w-9 h-9 flex items-center justify-center rounded-full border border-white/40 shadow-sm text-white font-semibold"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            {user?.fullName?.charAt(0).toUpperCase() || "U"}
          </motion.button>

          {isProfileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute right-0 mt-3 w-56 bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl shadow-xl z-[9999]"
            >
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="font-semibold text-gray-900">{user?.fullName}</p>
                <p className="text-xs text-gray-500">{user?.roleName}</p>
              </div>
              <button
                onClick={() => navigate("/profile")}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
              >
                <User className="w-4 h-4 mr-2" /> Profil Saya
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" /> Logout
              </button>
            </motion.div>
          )}
        </div>

        {/* 📱 Mobile Menu */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden text-white hover:text-blue-200"
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-white/90 backdrop-blur-xl border-t border-gray-200 py-3 space-y-2 px-4 shadow-inner"
        >
          {[...navItems, ...callRecordsMenu].map((item) => (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              className={`flex items-center w-full px-3 py-2 rounded-md text-sm font-medium ${
                activeTab === item.id
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <item.icon className="w-4 h-4 mr-2" /> {item.label}
            </button>
          ))}
        </motion.div>
      )}
    </motion.nav>
  );
};

export default React.memo(Navbar);
