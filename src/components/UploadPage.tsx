import React, { useState } from "react";
import {
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { callRecordApi } from "../services/api";
import { UploadCsvResponse } from "../types/callRecord";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, cubicBezier } from "framer-motion";

interface UploadPageProps {
  onBack: () => void;
  setActiveTab?: (tab: string) => void;
}

const UploadPage: React.FC<UploadPageProps> = ({ onBack, setActiveTab }) => {
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadCsvResponse | null>(
    null
  );

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
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

  const cardHoverVariants = {
    rest: {
      scale: 1,
      y: 0,
    },
    hover: {
      scale: 1.02,
      y: -4,
      transition: {
        duration: 0.3,
        ease: cubicBezier(0.25, 0.46, 0.45, 0.94),
      },
    },
  };

  const pulseVariants = {
    pulse: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,

        ease: cubicBezier(0.4, 0, 0.6, 1),
      },
    },
  };

  const handleBack = () => {
    onBack?.();
    navigate("/callrecords");
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setIsUploading(true);
    setSelectedFile(file);
    setUploadResult(null);

    try {
      const response = await callRecordApi.importCsv(file);
      setUploadResult(response);
    } catch (error: any) {
      console.error("Upload error:", error);
      alert(error.response?.data?.message || "Error uploading file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-5xl mx-auto flex-1 mt-10 md:mt-12 px-4"
    >
      {/* Header */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8"
      >
        <div className="flex items-center justify-between relative">
          <motion.button
            whileHover={{ scale: 1.05, x: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBack}
            className="absolute left-0 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>

          <div className="flex-1 text-center">
            <motion.h1
              className="text-3xl font-bold text-gray-900"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Upload Data File
            </motion.h1>
            <motion.p
              className="text-gray-500 mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Import data (CSV format) untuk dianalisis dalam sistem
            </motion.p>
          </div>

          <div className="w-9"></div>
        </div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* Upload Area */}
        <div className="lg:col-span-2">
          <motion.div
            variants={cardHoverVariants}
            initial="rest"
            whileHover="hover"
            whileTap={{ scale: 0.98 }}
            className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-200 ${
              dragOver
                ? "border-blue-500 bg-blue-50 shadow-md"
                : "border-gray-300 bg-white hover:border-gray-400"
            } ${isUploading ? "opacity-50" : ""}`}
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onClick={() =>
              !isUploading && document.getElementById("file-input")?.click()
            }
          >
            <input
              id="file-input"
              type="file"
              accept=".csv,.txt"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isUploading}
            />

            <AnimatePresence mode="wait">
              {isUploading ? (
                <motion.div
                  key="uploading"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex flex-col items-center"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="rounded-full h-16 w-16 border-b-2 border-blue-500 mb-4 flex items-center justify-center"
                  >
                    <Loader2 className="w-8 h-8 text-blue-500" />
                  </motion.div>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-lg font-medium text-gray-700"
                  >
                    Uploading...
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-sm text-gray-500 mt-2"
                  >
                    Processing {selectedFile?.name}
                  </motion.p>
                </motion.div>
              ) : (
                <motion.div
                  key="ready"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex flex-col items-center"
                >
                  <motion.div
                    variants={pulseVariants}
                    animate="pulse"
                    className="mb-4"
                  >
                    <Upload className="w-16 h-16 text-blue-400" />
                  </motion.div>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-xl font-semibold text-gray-700 mb-2"
                  >
                    Drag & Drop File
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-gray-500 mb-4"
                  >
                    or click to browse and upload your CSV
                  </motion.p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                  >
                    Select File
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Upload Results */}
          <AnimatePresence>
            {uploadResult && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className={`mt-8 p-6 rounded-2xl border shadow-sm ${
                  uploadResult.records.successfulRecords > 0
                    ? "bg-green-50 border-green-200"
                    : "bg-red-50 border-red-200"
                }`}
              >
                <motion.h3
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className={`text-lg font-semibold mb-4 ${
                    uploadResult.records.successfulRecords > 0
                      ? "text-green-800"
                      : "text-red-800"
                  }`}
                >
                  {uploadResult.records.successfulRecords > 0
                    ? "Upload Successful!"
                    : "Upload Completed with Issues"}
                </motion.h3>

                <motion.div
                  className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, staggerChildren: 0.1 }}
                >
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-green-100 text-green-800 p-3 rounded-lg"
                  >
                    <div className="font-semibold">Successful</div>
                    <div className="text-2xl font-bold">
                      {uploadResult.records.successfulRecords.toLocaleString()}
                    </div>
                  </motion.div>
                  {uploadResult.records.failedRecords > 0 && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="bg-red-100 text-red-800 p-3 rounded-lg"
                    >
                      <div className="font-semibold">Failed</div>
                      <div className="text-2xl font-bold">
                        {uploadResult.totalTimeMs}ms
                      </div>
                    </motion.div>
                  )}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="bg-blue-100 text-blue-800 p-3 rounded-lg"
                  >
                    <div className="font-semibold">Total</div>
                    <div className="text-2xl font-bold">
                      {(
                        uploadResult.records.successfulRecords +
                        uploadResult.records.failedRecords
                      ).toLocaleString()}
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* File Requirements */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
        >
          <motion.h3
            className="text-lg font-semibold text-gray-900 mb-4 flex items-center"
            whileHover={{ x: 5 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <FileText className="w-5 h-5 mr-2" /> File Guidelines
          </motion.h3>
          <motion.ul className="space-y-3 text-sm">
            {[
              {
                text: "CSV format with comma separator",
                icon: CheckCircle,
                color: "text-green-600",
              },
              {
                text: "Max file size: 100MB",
                icon: CheckCircle,
                color: "text-green-600",
              },
              {
                text: "File will be validated before import",
                icon: AlertCircle,
                color: "text-amber-600",
              },
            ].map((item, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="flex items-center"
              >
                <item.icon className={`w-4 h-4 mr-2 ${item.color}`} />
                <span className={item.color}>{item.text}</span>
              </motion.li>
            ))}
          </motion.ul>

          <AnimatePresence>
            {selectedFile && !isUploading && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-5 p-4 bg-blue-50 rounded-lg border border-blue-200 flex items-center justify-between overflow-hidden"
              >
                <div className="flex items-center">
                  <FileText className="w-5 h-5 text-blue-600 mr-3" />
                  <div>
                    <p className="font-medium text-blue-900">
                      {selectedFile.name}
                    </p>
                    <p className="text-sm text-blue-700">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500 }}
                >
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default UploadPage;
