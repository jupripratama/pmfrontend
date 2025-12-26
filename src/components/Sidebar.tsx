import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
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
  ClipboardList,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

interface NavItem {
  name: string;
  path: string;
  icon: any;
  id: string;
  permission?: string;
  forAll?: boolean;
}

const hasPermission = (permission: string): boolean => {
  const permissions = localStorage.getItem("permissions");
  if (!permissions) return false;
  try {
    const permList: string[] = JSON.parse(permissions);
    return permList.includes(permission);
  } catch {
    return false;
  }
};

const navItems: NavItem[] = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
    id: "dashboard",
    permission: "dashboard.view",
  },
  {
    name: "Docs",
    path: "/docs",
    icon: BookOpen,
    id: "docs",
    permission: "docs.view",
  },
  {
    name: "Inspeksi KPC",
    path: "/inspeksi-kpc",
    icon: ClipboardList,
    id: "inspeksi-kpc",
    permission: "inspeksi.temuan-kpc.view",
  },
  {
    name: "Fleet Statistics",
    path: "/fleet-statistics",
    icon: TrendingUp,
    id: "fleet-statistics",
    permission: "callrecord.view",
  },
  {
    name: "NEC History",
    path: "/nec-history",
    icon: TrendingUp,
    id: "nec-history",
    permission: "nec.signal.view",
  },
];

const callRecordsMenu: NavItem[] = [
  {
    name: "View Records",
    path: "/callrecords",
    icon: Phone,
    id: "callrecords",
    permission: "callrecord.view",
  },
  {
    name: "Upload CSV",
    path: "/upload",
    icon: Upload,
    id: "upload",
    permission: "callrecord.import",
  },
  {
    name: "Export Data",
    path: "/export",
    icon: Download,
    id: "export",
    permission: "callrecord.view-any",
  },
];

export default function Sidebar({
  activeTab,
  setActiveTab,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  isCollapsed,
  setIsCollapsed,
}: SidebarProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isCallRecordsOpen, setIsCallRecordsOpen] = useState(true);

  const filteredNavItems = navItems.filter(
    (item) => !item.permission || hasPermission(item.permission)
  );
  const filteredCallRecords = callRecordsMenu.filter(
    (item) => !item.permission || hasPermission(item.permission)
  );

  const NavLink = ({
    item,
    onClick,
  }: {
    item: NavItem;
    onClick?: () => void;
  }) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.path;
    return (
      <Link
        to={item.path}
        onClick={() => {
          setActiveTab(item.id);
          onClick?.();
        }}
        title={isCollapsed ? item.name : ""}
        className={`flex items-center rounded-xl text-sm font-medium transition-all group relative ${
          isCollapsed ? "justify-center p-3" : "space-x-3 px-4 py-3"
        } ${
          isActive
            ? "bg-white/20 text-white shadow-lg backdrop-blur-md"
            : "text-white/70 hover:bg-white/10 hover:text-white"
        }`}
      >
        <Icon
          className={`${isCollapsed ? "w-6 h-6" : "w-5 h-5"} flex-shrink-0`}
        />
        {!isCollapsed && <span className="truncate">{item.name}</span>}
        {isActive && (
          <motion.div
            layoutId="active-pill"
            className="absolute left-0 w-1 h-6 bg-white rounded-r-full"
          />
        )}
      </Link>
    );
  };

  const SidebarContent = (isMobile: boolean = false) => (
    <div
      className={`flex flex-col h-full py-6 ${
        isCollapsed && !isMobile ? "px-2" : "px-4"
      }`}
    >
      {/* Logo Section */}
      <div
        className={`flex items-center mb-10 relative ${
          isCollapsed && !isMobile ? "justify-center" : "justify-between px-2"
        }`}
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center border border-white/30 shadow-lg flex-shrink-0">
            <LayoutDashboard className="w-6 h-6 text-white" />
          </div>
          {(!isCollapsed || isMobile) && (
            <span className="text-xl font-bold text-white tracking-wide truncate">
              PM Dashboard
            </span>
          )}
        </div>
        {!isMobile && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`absolute -right-7 top-1/2 -translate-y-1/2 z-50 w-6 h-6 bg-white rounded-full flex items-center justify-center text-indigo-900 shadow-xl border border-indigo-100 hover:scale-110 transition-transform cursor-pointer`}
          >
            {isCollapsed ? (
              <ChevronRight className="w-3.5 h-3.5" />
            ) : (
              <ChevronLeft className="w-3.5 h-3.5" />
            )}
          </button>
        )}
      </div>

      {/* Main Nav */}
      <div className="flex-1 space-y-1 overflow-y-auto custom-scrollbar overflow-x-hidden">
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.id}
            item={item}
            onClick={() => isMobile && setIsMobileMenuOpen(false)}
          />
        ))}

        {filteredCallRecords.length > 0 && (
          <div className="mt-6">
            {!isCollapsed || isMobile ? (
              <>
                <button
                  onClick={() => setIsCallRecordsOpen(!isCallRecordsOpen)}
                  className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-white/50 uppercase tracking-wider hover:text-white/80 transition-colors"
                >
                  <span>Call Records</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      isCallRecordsOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {isCallRecordsOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden space-y-1 mt-1"
                    >
                      {filteredCallRecords.map((item) => (
                        <NavLink
                          key={item.id}
                          item={item}
                          onClick={() => isMobile && setIsMobileMenuOpen(false)}
                        />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <div className="h-px bg-white/10 my-4 mx-2" />
            )}
          </div>
        )}

        {hasPermission("role.view") && (
          <div className={isCollapsed && !isMobile ? "mt-2" : "mt-6"}>
            <NavLink
              item={{
                name: "Settings",
                path: "/settings",
                icon: Settings,
                id: "settings",
              }}
              onClick={() => isMobile && setIsMobileMenuOpen(false)}
            />
          </div>
        )}
      </div>

      {/* Footer / User */}
      <div
        className={`mt-auto pt-6 border-t border-white/10 ${
          isCollapsed && !isMobile ? "items-center" : ""
        }`}
      >
        <Link
          to="/profile"
          onClick={() => {
            setActiveTab("profile");
            isMobile && setIsMobileMenuOpen(false);
          }}
          title={isCollapsed ? user?.fullName : ""}
          className={`flex items-center rounded-xl hover:bg-white/10 transition-all group ${
            isCollapsed && !isMobile ? "justify-center p-2" : "space-x-3 p-3"
          }`}
        >
          {user?.photoUrl ? (
            <img
              src={user.photoUrl}
              alt={user.fullName}
              className="w-10 h-10 rounded-full object-cover border border-white/30 group-hover:scale-110 transition-transform flex-shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold border border-white/30 group-hover:scale-110 transition-transform flex-shrink-0">
              {user?.fullName?.[0] || "U"}
            </div>
          )}
          {(!isCollapsed || isMobile) && (
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-semibold text-white truncate">
                {user?.fullName || "User"}
              </p>
              <p className="text-xs text-white/60 truncate">
                {user?.roleName || "Role"}
              </p>
            </div>
          )}
        </Link>
        <button
          onClick={() => {
            logout();
            window.location.href = "/";
          }}
          title={isCollapsed ? "Logout" : ""}
          className={`w-full flex items-center mt-2 rounded-xl text-sm font-medium text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-all ${
            isCollapsed && !isMobile
              ? "justify-center p-3"
              : "space-x-3 px-4 py-3"
          }`}
        >
          <LogOut
            className={`${
              isCollapsed && !isMobile ? "w-6 h-6" : "w-5 h-5"
            } flex-shrink-0`}
          />
          {(!isCollapsed || isMobile) && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col h-screen sticky top-0 bg-gradient-to-b from-indigo-900 via-purple-900 to-blue-900 shadow-2xl border-r border-white/10 transition-all duration-300 ${
          isCollapsed ? "w-20" : "w-72"
        }`}
      >
        {SidebarContent(false)}
      </aside>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          >
            {SidebarContent(true)}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
