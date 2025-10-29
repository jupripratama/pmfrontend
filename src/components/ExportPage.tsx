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

  // 🎯 Loading state per tombol (independen)
  const [isLoading, setIsLoading] = useState({
    dailyCsv: false,
    dailyExcel: false,
    rangeCsv: false,
    rangeExcel: false,
  });

  const handleBack = () => {
    onBack?.();
    navigate("/callrecords");
  };

  const handleExport = async (
    key: keyof typeof isLoading,
    fn: () => Promise<void>
  ) => {
    setIsLoading((prev) => ({ ...prev, [key]: true }));
    try {
      await fn();
    } finally {
      setIsLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  // 🔄 Reusable spinner component
  const LoadingSpinner = () => (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
      />
    </motion.div>
  );

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
        variants={combinedCardVariants}
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
              {/* CSV */}
              <button
                onClick={() =>
                  handleExport("dailyCsv", () =>
                    callRecordApi.exportDailyCsv(selectedDate)
                  )
                }
                disabled={isLoading.dailyCsv}
                className="bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-70 flex items-center justify-center relative"
              >
                {isLoading.dailyCsv ? (
                  <LoadingSpinner />
                ) : (
                  <>
                    <FileDown className="w-4 h-4 mr-2" />
                    CSV
                  </>
                )}
              </button>

              {/* Excel */}
              <button
                onClick={() =>
                  handleExport("dailyExcel", () =>
                    callRecordApi.exportDailySummaryExcel(selectedDate)
                  )
                }
                disabled={isLoading.dailyExcel}
                className="bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-70 flex items-center justify-center relative"
              >
                {isLoading.dailyExcel ? (
                  <LoadingSpinner />
                ) : (
                  <>
                    <FileDown className="w-4 h-4 mr-2" />
                    Excel
                  </>
                )}
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
              {/* CSV */}
              <button
                onClick={() =>
                  handleExport("rangeCsv", () =>
                    callRecordApi.exportCsv(startDate, endDate)
                  )
                }
                disabled={isLoading.rangeCsv}
                className="bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-70 flex items-center justify-center relative"
              >
                {isLoading.rangeCsv ? (
                  <LoadingSpinner />
                ) : (
                  <>
                    <FileDown className="w-4 h-4 mr-2" />
                    CSV
                  </>
                )}
              </button>

              {/* Excel */}
              <button
                onClick={() =>
                  handleExport("rangeExcel", () =>
                    callRecordApi.exportOverallSummaryExcel(startDate, endDate)
                  )
                }
                disabled={isLoading.rangeExcel}
                className="bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-70 flex items-center justify-center relative"
              >
                {isLoading.rangeExcel ? (
                  <LoadingSpinner />
                ) : (
                  <>
                    <FileDown className="w-4 h-4 mr-2" />
                    Excel
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Info Section */}
      <motion.div
        className="bg-blue-50 rounded-2xl p-6 mt-8 border border-blue-200 shadow-sm"
        variants={combinedCardVariants}
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
