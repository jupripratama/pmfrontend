import React from "react";
import { motion, cubicBezier } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  BarChart3,
  Upload,
  TrendingUp,
  FileText,
  HelpCircle,
  ArrowRight,
  Shield,
  Cpu,
  Wifi,
  Sparkles,
  Layers,
} from "lucide-react";
import { Variants } from "framer-motion";

// ✅ Hapus import tidak terpakai (Settings, each, dll.)

interface DashboardProps {
  setActiveTab: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setActiveTab }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const isAdmin = user?.roleId === 1 || user?.roleId === 2;

  // 🎬 Framer Motion Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: cubicBezier(0.25, 0.46, 0.45, 0.94),
      },
    },
  };

 const cardHoverVariants: Variants = {
  rest: {
    scale: 1,
    y: 0,
    rotate: 0,
  },
  hover: {
    scale: 1.05,
    y: -8,
    rotate: 1,
    transition: {
      type: "spring" as const, // ✅ pakai literal, bukan string biasa
      stiffness: 400,
      damping: 10,
    },
  },
};

 const floatingVariants: Variants = {
  float: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

  const glowVariants: Variants = {
  initial: {
    boxShadow:
      "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
  },
  glow: {
    boxShadow: [
      "0 4px 6px -1px rgba(59,130,246,0.1), 0 2px 4px -1px rgba(59,130,246,0.06)",
      "0 10px 15px -3px rgba(59,130,246,0.2), 0 4px 6px -2px rgba(59,130,246,0.1)",
      "0 4px 6px -1px rgba(59,130,246,0.1), 0 2px 4px -1px rgba(59,130,246,0.06)",
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

const questionIconVariants = {
  float: {
    y: [0, -4, 0],
    transition: { duration: 5, repeat: Infinity, ease: "easeInOut" },
  },
};

  const handleActionClick = (tab: string) => {
    setActiveTab(tab);
    navigate(`/${tab}`);
  };

  // 📊 Data definisi aksi & fitur
  const adminActions = [
    {
      icon: Upload,
      title: "Upload Data CSV",
      description: "Unggah file untuk analisis atau integrasi data.",
      color: "from-blue-500 to-cyan-500",
      tab: "upload",
    },
    {
      icon: BarChart3,
      title: "Analisis Data",
      description: "Pantau tren dan insight dari berbagai sumber data.",
      color: "from-purple-500 to-pink-500",
      tab: "callrecords",
    },
  ];

  const userActions = [
    {
      icon: BarChart3,
      title: "Lihat Demo Analytics",
      description: "Jelajahi data contoh dan visualisasi interaktif.",
      color: "from-purple-500 to-pink-500",
      tab: "callrecords",
    },
    {
      icon: FileText,
      title: "Panduan Penggunaan",
      description: "Pelajari cara kerja platform dan format data.",
      color: "from-green-500 to-emerald-500",
      tab: "docs",
    },
  ];

  const platformOverview = [
    {
      icon: Layers,
      title: "3 Modul Aktif",
      desc: "Analytics, Call Records, dan PM Radio",
      color: "bg-indigo-100 text-indigo-700",
    },
    {
      icon: Wifi,
      title: "Koneksi Stabil",
      desc: "Terhubung ke server utama",
      color: "bg-green-100 text-green-700",
    },
    {
      icon: Cpu,
      title: "Kinerja Optimal",
      desc: "Sistem berjalan tanpa hambatan",
      color: "bg-blue-100 text-blue-700",
    },
  ];

  const features = [
    {
      icon: TrendingUp,
      title: "Analisis Trend",
      description: "Temukan pola dan insight data.",
    },
    {
      icon: FileText,
      title: "Export Laporan",
      description: "Download laporan Excel/CSV.",
    },
    {
      icon: Shield,
      title: "Keamanan Data",
      description: "Data tersimpan dengan aman.",
    },
  ];

  const currentActions = isAdmin ? adminActions : userActions;
  const actionTitle = isAdmin ? "Aksi Administrator" : "Mulai Eksplorasi";

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-6"
    >
      {/* 🏁 Banner */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-2xl mb-10 shadow-lg bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 text-white"
      >
        <motion.div
          variants={glowVariants}
          initial="initial"
          animate="glow"
          className="absolute inset-0"
        />
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row justify-between items-center">
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <motion.h1
              variants={itemVariants}
              className="text-3xl md:text-4xl font-bold mb-2 flex items-center"
            >
              <motion.div variants={floatingVariants} animate="float">
                <Sparkles className="w-8 h-8 mr-2 text-yellow-300" />
              </motion.div>
              Selamat Datang, {user?.fullName?.split(" ")[0]}!
            </motion.h1>
            <motion.p variants={itemVariants} className="text-blue-100 max-w-lg">
              {isAdmin
                ? "Kelola, analisis, dan integrasikan data dari berbagai sumber untuk insight terbaik."
                : "Eksplorasi insight dari data operasional Anda dengan visualisasi interaktif dan dinamis."}
            </motion.p>
          </motion.div>

          {/* 🧩 Role Card */}
          <motion.div
            variants={itemVariants}
            whileHover={{ rotate: 3, scale: 1.05 }}
            className="mt-6 md:mt-0 bg-white/20 backdrop-blur-lg rounded-xl p-4 border border-white/30 shadow-inner"
          >
            <p className="text-sm text-white/90 mb-1">Peran Anda</p>
            <div className="px-3 py-1 rounded-lg bg-white/30 font-semibold">
              {isAdmin ? "Administrator" : "Data Viewer"}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* 🔧 Content Section */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Actions */}
          <motion.div
            variants={itemVariants}
            className="backdrop-blur-xl bg-white/70 border border-gray-200 rounded-2xl p-6 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{actionTitle}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {currentActions.map((action, i) => (
                <motion.button
                  key={i}
                  variants={cardHoverVariants}
                  initial="rest"
                  whileHover="hover"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleActionClick(action.tab)}
                  className="p-5 rounded-xl bg-white shadow-sm hover:shadow-md border border-gray-100 text-left transition-all group"
                >
                  <motion.div
                    className={`p-3 rounded-lg inline-flex bg-gradient-to-r ${action.color}`}
                    whileHover={{ rotate: 15 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <action.icon className="w-6 h-6 text-white" />
                  </motion.div>
                  <h4 className="font-semibold text-gray-900 mt-3 mb-1">{action.title}</h4>
                  <p className="text-sm text-gray-600">{action.description}</p>
                  <div className="flex items-center text-blue-600 text-sm font-medium mt-2">
                    Mulai
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Features */}
          <motion.div
            variants={itemVariants}
            className="backdrop-blur-xl bg-white/70 border border-gray-200 rounded-2xl p-6 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Fitur Utama</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -8, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors flex items-start space-x-3"
                >
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <f.icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">{f.title}</h4>
                    <p className="text-xs text-gray-600 mt-1">{f.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Platform Overview */}
          <motion.div
            variants={itemVariants}
            className="backdrop-blur-xl bg-white/70 border border-gray-200 rounded-2xl p-6 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ikhtisar Platform</h3>
            <div className="space-y-3">
              {platformOverview.map((item, i) => (
                <motion.div
                  key={i}
                  whileHover={{ x: 5, backgroundColor: "rgba(243,244,246,0.8)" }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl transition"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${item.color}`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.title}</p>
                      <p className="text-xs text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Help Section */}
          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6"
          >
            
              <HelpCircle className="text-blue-500" />
           
            <h4 className="font-semibold text-gray-900 mb-1">Butuh Bantuan?</h4>
            <p className="text-sm text-gray-600 mb-3">
              {isAdmin
                ? "Pelajari panduan upload dan integrasi data sistem."
                : "Baca panduan penggunaan dashboard dan analytics."}
            </p>
            <button
              onClick={() => handleActionClick("docs")}
              className="w-full bg-white text-blue-600 py-2 rounded-lg font-medium text-sm border border-blue-200 hover:bg-blue-100 transition-colors"
            >
              Buka Panduan
            </button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default React.memo(Dashboard);
