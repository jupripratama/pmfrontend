import React from "react";
import { motion } from "framer-motion";
import { Github, Mail, FileText, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Footer: React.FC = () => {
  const navigate = useNavigate();

  const footerLinks = [
    { label: "Panduan", icon: FileText, action: () => navigate("/docs") },
    { label: "Profil", icon: User, action: () => navigate("/profile") },
    { label: "Kontak", icon: Mail, action: () => window.open("mailto:support@pm-dashboard.app", "_blank") },
  ];

  return (
    <footer className="mt-12 border-t border-gray-200 bg-white/70 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between text-sm text-gray-600">
        {/* Left section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center md:text-left"
        >
          <p className="font-semibold text-gray-800">📊 PM Dashboard</p>
          <p className="text-xs text-gray-500">© {new Date().getFullYear()} All rights reserved.</p>
        </motion.div>

        {/* Center links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex space-x-5 mt-3 md:mt-0"
        >
          {footerLinks.map((link, i) => (
            <motion.button
              key={i}
              onClick={link.action}
              whileHover={{ y: -2, scale: 1.05 }}
              className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
            >
              <link.icon className="w-4 h-4 mr-1" />
              {link.label}
            </motion.button>
          ))}
        </motion.div>

        {/* Right section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-3 md:mt-0 flex items-center space-x-3"
        >
          <a
            href=""
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-gray-900 transition-colors"
            title="Source Code"
          >
            <Github className="w-5 h-5" />
          </a>
          <span className="text-xs text-gray-500">v1.0.0</span>
        </motion.div>
      </div>
    </footer>
  );
};

export default React.memo(Footer);
