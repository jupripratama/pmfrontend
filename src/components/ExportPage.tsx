import React, { useState } from "react";
import { FileDown, ArrowLeft, Calendar } from "lucide-react";
import { motion, Variants, Transition } from "framer-motion";
import { callRecordApi } from "../services/api";
import { useNavigate } from "react-router-dom";

interface ExportPageProps {
  onBack: () => void;
  setActiveTab?: (tab: string) => void;
}

// 🪶 Animasi masuk halaman
const pageVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};



// 🪄 Animasi tiap kartu (muncul berurutan)
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.4, ease: "easeOut" },
  }),
};

// 🌈 Animasi hover kartu
const spring: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 20,
};

const cardHoverVariants: Variants = {
  rest: { scale: 1, y: 0 },
  hover: {
    scale: 1.03,
    y: -5,
    transition: spring,
  },
};

const combinedCardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.4, ease: "easeOut" },
  }),
  hover: {
    scale: 1.03,
    y: -5,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
    },
  },
};

const ExportPage: React.FC<ExportPageProps> = ({ onBack, setActiveTab }) => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [isExporting, setIsExporting] = useState(false);

  const handleBack = () => {
    onBack?.();
    navigate("/callrecords");
  };

  const handleExport = async (fn: () => Promise<void>) => {
    setIsExporting(true);
    try {
      await fn();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <motion.div
      className="max-w-5xl mx-auto flex-1 mt-10 md:mt-12 px-4"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div
        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8"
        variants={cardVariants}
        custom={0}
        initial="hidden"
        animate="visible"
      >
        <div className="flex items-center justify-between relative">
          <button
            onClick={handleBack}
            className="absolute left-0 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex-1 text-center">
            <h1 className="text-3xl font-bold text-gray-900">Export Data</h1>
            <p className="text-gray-500 mt-2">
              Download call records or summaries in CSV and Excel format
            </p>
          </div>

          <div className="w-9"></div>
        </div>
      </motion.div>

      {/* Export Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Single Date Export */}
        <motion.div
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
         variants={combinedCardVariants}
          custom={1}
          initial="hidden"
          animate="visible"
          whileHover="hover"
          whileTap="hover"
      
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-blue-600" />
            Export for Specific Date
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() =>
                  handleExport(() => callRecordApi.exportDailyCsv(selectedDate))
                }
                disabled={isExporting}
                className="bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                <FileDown className="w-4 h-4 mr-2" />
                {isExporting ? "Exporting..." : "CSV"}
              </button>
              <button
                onClick={() =>
                  handleExport(() =>
                    callRecordApi.exportDailySummaryExcel(selectedDate)
                  )
                }
                disabled={isExporting}
                className="bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                <FileDown className="w-4 h-4 mr-2" />
                {isExporting ? "Exporting..." : "Excel"}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Date Range Export */}
        <motion.div
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
          variants={combinedCardVariants}
          custom={2}
          initial="hidden"
          animate="visible"
          whileHover="hover"
          whileTap="hover"
          
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-blue-600" />
            Export for Date Range
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() =>
                  handleExport(() => callRecordApi.exportCsv(startDate, endDate))
                }
                disabled={isExporting}
                className="bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                <FileDown className="w-4 h-4 mr-2" />
                {isExporting ? "Exporting..." : "CSV"}
              </button>
              <button
                onClick={() =>
                  handleExport(() =>
                    callRecordApi.exportOverallSummaryExcel(startDate, endDate)
                  )
                }
                disabled={isExporting}
                className="bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                <FileDown className="w-4 h-4 mr-2" />
                {isExporting ? "Exporting..." : "Excel"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Info Section */}
      <motion.div
        className="bg-blue-50 rounded-2xl p-6 mt-8 border border-blue-200 shadow-sm"
        variants={cardVariants}
        custom={3}
        initial="hidden"
        animate="visible"
      >
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          Export Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <h4 className="font-semibold mb-2">CSV Export</h4>
            <ul className="space-y-1">
              <li>• Raw call record data</li>
              <li>• Includes all database columns</li>
              <li>• Suitable for external data analysis</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Excel Export</h4>
            <ul className="space-y-1">
              <li>• Pre-formatted summary reports</li>
              <li>• Includes statistics and charts</li>
              <li>• Great for presentations and reporting</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ExportPage;
